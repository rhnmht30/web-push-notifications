//global variables

let userPushId;
const isSupported = isPushNotificationSupported();
const applicationServerKey =
	"BJT9biAQP8prCecgJ6TDlhJcUa29BhGBtuBOEu-HGo7iGaJiit0hPoSvNtOC1vK-SFiNN16XBzx7UXOBxlAuogM";

const grantPermisstionButton = document.getElementById("grant");
const subcriptionButton = document.getElementById("subscribe");
const receiveNotificationButton = document.getElementById("receive");
const status = document.getElementById("status");

if (isSupported) {
	// checking for initial permissions
	updateStatus("checking permissions...");
	updatePermsission(Notification.permission);

	// register the service worker
	navigator.serviceWorker.register("/sw.js").then(function (swRegistration) {});

	// register click event listeners
	grantPermisstionButton.addEventListener("click", (e) => {
		Notification.requestPermission((result) => result).then(updatePermsission);
	});

	subcriptionButton.addEventListener("click", (e) => {
		createSubscription().then((subscription) => {
			sendSubscriptionToServer(subscription);
		});
	});

	receiveNotificationButton.addEventListener("click", receiveNotification);
} else {
	updateStatus("Push notification not supported on this device");
}

// adds status list dom elements
function updateStatus(task) {
	let node = document.createElement("LI");
	let textnode = document.createTextNode(task);
	node.appendChild(textnode);
	status.appendChild(node);
}

// check browser compatibility
function isPushNotificationSupported() {
	return "serviceWorker" in navigator && "PushManager" in window;
}

function updatePermsission(permission) {
	if (permission === "granted") {
		updateStatus("Permission Granted");
		grantPermisstionButton.disabled = true;

		//check for previous subscriptions
		navigator.serviceWorker.ready
			.then((serviceWorker) => {
				updateStatus("getting subscriptions...");
				return serviceWorker.pushManager.getSubscription();
			})
			.then((subscription) => {
				if (!subscription) {
					updateStatus("No subscriptions found! Create One.");
					subcriptionButton.disabled = false;
				} else {
					updateStatus("Subscription found!");
					sendSubscriptionToServer(subscription);
				}
			});
	} else {
		updateStatus("waiting for permission...");
		grantPermisstionButton.disabled = false;
		subcriptionButton.disabled = true;
		receiveNotificationButton.disabled = true;
	}
}

// send subscription object to application server
function sendSubscriptionToServer(subscription) {
	updateStatus("sending subscription to server...");

	fetch(`https://push-notification-star-server.herokuapp.com/subscribe`, {
		credentials: "omit",
		headers: {
			"content-type": "application/json",
			"sec-fetch-mode": "cors",
		},
		body: JSON.stringify(subscription),
		method: "POST",
		mode: "cors",
	})
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			userPushId = data.userSubscribtionId;
			receiveNotificationButton.disabled = false;
			updateStatus("subscription sent! ready to receive notification");
		});
}

function createSubscription() {
	return navigator.serviceWorker.ready.then(function (serviceWorker) {
		updateStatus("creating subscription...");
		return serviceWorker.pushManager
			.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			})
			.then(function (subscription) {
				updateStatus("Subscription Created!");
				subcriptionButton.disabled = true;
				return subscription;
			});
	});
}

// mock notification
function receiveNotification() {
	fetch(
		`https://push-notification-star-server.herokuapp.com/send/${userPushId}`,
		{
			credentials: "omit",
			headers: {
				"content-type": "application/json",
				"sec-fetch-mode": "cors",
			},
			method: "GET",
			mode: "cors",
		}
	)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			updateStatus(data.message);
		});
}

function mockNotification() {
	const img = "/images/demo.jpg";
	const text = "Visit his profile to see more.";
	const title = "Damien Schnorhk posted a new image";
	const options = {
		body: text,
		icon: "/images/demo.jpg",
		vibrate: [200, 100, 200],
		tag: "new-photo",
		image: img,
		badge: "https://rhnmht30.dev/icons/favicon_io/android-chrome-192x192.png",
		actions: [
			{
				action: "visit",
				title: "Visit",
				icon:
					"https://images.unsplash.com/profile-1617890649276-291acb785881image?dpr=1&auto=format&fit=crop&w=32&h=32&q=60&crop=faces&bg=fff",
			},
		],
	};
	navigator.serviceWorker.ready.then(function (serviceWorker) {
		serviceWorker.showNotification(title, options);
	});
}
