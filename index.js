const { sep, resolve } = require("path");
const http = require("http");
// const https = require("https");

const express = require("express");

const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const helmet = require("helmet");
const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const db = require("./db.js");
db.init();
const config = require("./config.json");

const root = require("./routes/app.js");
const admin = require("./routes/admin.js");

const app = express();
app.use(express.json());
app.use("/public", express.static(resolve(`${dataDir}${sep}public`)));
app.use(session({
  store: new MemoryStore({ checkPeriod: 86400000 }),
  secret: config.secret,
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

app.use((req, res, next) => {
  // General Logging Task
  console.log(`${req.clientIp} : ${req.url} : ${Date.now()}`);
  /* db.logs.set(db.logs.autonum, {
    time: Date.now(),
    agent: req.headers['user-agent'],
    ip: req.clientIp
  });*/
  next();
});

app.use("/", root);

const checkAdmin = (req, res, next) => {
  if (!req.session.admin) {
    res.redirect("/");
  }
  next();
};

app.use("/admin", checkAdmin, admin);

app.get("/login", (req, res) => {
  res.render(resolve(`${templateDir}${sep}login.ejs`), { path: req.path, auth: req.session });
});

app.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password) res.status(400).send("Missing Username or Password");
  const success = await db.login(req.body.username, req.body.password);
  if (success) {
    const user = db.users.get(req.body.username);
    req.session.logged = true;
    req.session.username = req.body.username;
    req.session.admin = user.admin;
    req.session.avatar = user.avatar;
    req.session.name = user.name;
    req.session.save();
    console.log("User authenticated");
    res.redirect("/");
  } else {
    console.log("Authentication Failed");
    res.status(403).send("Nope. Not allowed, mate.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(`Error destroying session: ${err}`);
    res.redirect("/");
  });
});

http.createServer(app).listen(config.port);
