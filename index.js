const fs = require("fs");
const http = require("http");
const https = require("https");

const express = require("express");

const db = require("./db.js");
const config = require("./config.json");

const root = require("./routes/app.js");
const admin = require("./routes/admin.js");

const app = express();
app.use(express.json());

app.use("/", root);
app.use("/admin", admin);

http.createServer(app).listen(config.port);
if (config.https) {
	https.createServer({
		key: fs.readFileSync(config.https.key, "utf8"),
		cert: fs.readFileSync(config.https.cert, "utf8")
	}).listen(config.https.port);
}
