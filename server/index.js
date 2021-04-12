const express = require("express");
const compression = require("compression");
const cors = require("cors");
const { subscribeToNotification, sendNotification } = require("./subscription");

const app = express();

app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/subscribe", subscribeToNotification);
app.get("/send/:userSubscribtionId", sendNotification);

// initialize server
const port = process.env.PORT || 3000;

// Launch Node.js server
const server = app.listen(port, () => {
	console.log(`Server is listening on http://localhost:${port}/`);
});
