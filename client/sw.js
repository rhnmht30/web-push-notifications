function receiveNotification(event) {
	console.log("Push Notification Received.");
	console.log("Event: ", event);

	const { image, tag, url, title, text } = event.data.json();

	const options = {
		data: url,
		body: text,
		icon: image,
		vibrate: [400, 200, 400],
		tag: tag,
		image: image,
		badge: "https://rhnmht30.dev/icons/favicon_io/android-chrome-192x192.png",
		actions: [
			{
				action: "Visit",
				title: "Visit",
				icon:
					"https://images.unsplash.com/profile-1617890649276-291acb785881image?dpr=1&auto=format&fit=crop&w=32&h=32&q=60&crop=faces&bg=fff",
			},
		],
	};
	event.waitUntil(self.registration.showNotification(title, options));
}

function onNotificationClick(event) {
	console.log("Push Notification click", event);

	event.notification.close();
	event.waitUntil(clients.openWindow(event.notification.data));
}

self.addEventListener("push", receiveNotification);
self.addEventListener("notificationclick", onNotificationClick);
