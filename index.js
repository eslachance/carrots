const { sep, resolve } = require("path");
const http = require("http");
// const https = require("https");

const express = require("express");

const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const helmet = require("helmet");
const dataDir = resolve(`${process.cwd()}${sep}`);

const db = require("./db.js");
const config = require("./config.json");

const root = require("./routes/app.js");
const admin = require("./routes/admin.js");
const account = require("./routes/account.js");

const app = express();
app.use(express.json());
app.use("/public", express.static(resolve(`${dataDir}${sep}public`)));

app.use(express.session({
  store: new SQLiteStore,
  secret: config.secret,
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }
}));


app.use(helmet());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const requestIp = require("request-ip");
app.use(requestIp.mw());

// Custom botnet check
app.use(require("./middleware/spamblock.js"));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use((req, res, next) => {
  // General Logging Task
  console.log(`${req.clientIp} : ${req.originalUrl} : ${Date.now()}`);
  db.logs.set(db.logs.autonum, {
    time: Date.now(),
    agent: req.headers["user-agent"],
    ip: req.clientIp,
    page: req.originalUrl
  });
  // Set "previous" URL to session (for after logging)
  if (!req.originalUrl.includes("/login") && !req.originalUrl.includes("/register") && !req.originalUrl.includes("/adduser")) {
    req.session.back = req.url;
  }
  next();
});

app.use("/", root);
app.use("/", account);

const checkAdmin = (req, res, next) => {
  if (!req.session.admin) {
    res.redirect("/");
  }
  next();
};

app.use("/admin", checkAdmin, admin);


http.createServer(app).listen(config.port);
