const { sep, resolve } = require("path");
const http = require("http");
// const https = require("https");

const express = require("express");

const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const helmet = require("helmet");
const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const db = require("./db.js");
const config = require("./config.json");

const root = require("./routes/app.js");
const admin = require("./routes/admin.js");
const account = require("./routes/account.js");
const json = require("./routes/json.js");
const api = require("./routes/api.js");

const app = express();
app.use(express.json());
app.use("/public", express.static(resolve(`${dataDir}${sep}public`)));

app.use(session({
  store: new SQLiteStore({
    dir: "./data"
  }),
  secret: config.secret,
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: false
}));

app.use(helmet());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const requestIp = require("request-ip");
app.use(requestIp.mw());

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Custom botnet check
app.use(require("./middleware/spamblock.js"));

// Attach Settings to Req
app.use(async (req, res, next) => {
  await db.settings.defer;
  let settings = {};
  if (db.settings.has("title")) {
    for (const [key, value] of db.settings) {
      settings[key] = value;
    }
  } else {
    settings = {
      title: "Blog Title",
      description: "A blog full of pure awesomeness",
      author: "Your Name Here",
      init: false
    };
    if (!req.originalUrl.includes("/install")) {
      req.settings = settings;
      return res.redirect("/install");
    }
  }
  req.settings = settings;
  return next();
});

// General Logging Task
app.use((req, res, next) => {
  console.log(`${db.formatDate(Date.now())} | ${req.clientIp} | ${req.originalUrl}`);
  console.log(`User is admin? ${req.session && req.session.admin}`);
  db.logs.set(db.logs.autonum, {
    time: db.formatDate(Date.now()),
    agent: req.headers["user-agent"],
    ip: req.clientIp,
    page: req.originalUrl
  });
  // Set "previous" URL to session (for after logging)
  const notsaved = ["/includes", "/register", "/adduser", "/favicon.ico"];
  if (!notsaved.some(path => req.originalUrl.includes(path))) {
    req.session.back = req.url;
  }
  next();
});

app.use("/", root);
app.use("/", account);
app.use("/json", json);
app.use("/api", api);

const checkAdmin = (req, res, next) => {
  if (!req.session.admin) {
    res.redirect("/");
  }
  next();
};

app.use("/admin", checkAdmin, admin);

// Handle 404
app.use((req, res) => {
  res.render(resolve(`${templateDir}${sep}404.ejs`), { path: req.originalUrl, auth: req.session });
});

// Handle 500
app.use((error, req, res) => {
  res.send("500: Internal Server Error", 500);
});

http.createServer(app).listen(config.port);
