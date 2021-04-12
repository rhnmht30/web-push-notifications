const crypto = require("crypto");
const webpush = require("web-push");

const vapidKeys = {
	publicKey:
		"BJT9biAQP8prCecgJ6TDlhJcUa29BhGBtuBOEu-HGo7iGaJiit0hPoSvNtOC1vK-SFiNN16XBzx7UXOBxlAuogM",
	privateKey: "OMPZl_KHAkBSizhihPlIx3QcN0xpH2gShBOvG5rEFmY",
};

webpush.setVapidDetails(
	"mailto:example@yourdomain.org",
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

// runtime memory, can be replaced by DB
const subscriptions = {};

function createHash(input) {
	const md5sum = crypto.createHash("md5");
	md5sum.update(Buffer.from(input));
	return md5sum.digest("hex");
}

const subscribeToNotification = (req, res) => {
	const userSubscribtionId = createHash(JSON.stringify(req.body));
	subscriptions[userSubscribtionId] = req.body;

	res.status(201).json({ userSubscribtionId });
};

const sendNotification = (req, res) => {
	const { userSubscribtionId } = req.params;
	const subscription = subscriptions[userSubscribtionId];

	webpush
		.sendNotification(
			subscription,
			JSON.stringify({
				title: "Damien Schnorhk posted a new image",
				text: "Visit his profile to see more.",
				image: "/images/demo.jpg",
				tag: "new-photo",
				url: "https://unsplash.com/@damienschnorhk",
			})
		)
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: "Internal Server Error", err });
		});

	res.status(202).json({ message: "User Notified" });
};

module.exports = { subscribeToNotification, sendNotification };
