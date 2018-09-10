const { sep, resolve } = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");

const express = require("express");

const session = require("express-session");
const MemoryStore = require("memorystore")(session)
const helmet = require("helmet");
const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const db = require("./db.js");
const config = require("./config.json");

const root = require("./routes/app.js");
const admin = require("./routes/admin.js");

const app = express();
app.use(express.json());
app.use("/public", express.static(resolve(`${dataDir}${sep}public`)));
app.use(session({
  store: new MemoryStore({ checkPeriod: 86400000 }),
  secret: "thissecretismine",
  resave: false,
  saveUninitialized: false,
}));

app.use(helmet());
var bodyParser = require("body-parser");
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const requestIp = require('request-ip');
app.use(requestIp.mw())

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use((req, res, next) => {
  // General Logging Task
  console.log(`${req.clientIp} : ${req.url} : ${Date.now()}`);
  fs.writeFileSync("./req.json", require("util").inspect(req));
  fs.writeFileSync("./res.json", require("util").inspect(res));
  next();
})

app.use("/", root);
app.use("/admin", admin);

app.get("/login", (req, res, next) => {
  res.render(resolve(`${templateDir}${sep}login.ejs`), {path: req.path, auth: req.session});
});

app.post("/login", async (req, res, next) => {
  if(!req.body.username || !req.body.password) res.status(400).send("Missing Username or Password");
  const success = await db.login(req.body.username, req.body.password);
  if(success) {
    const user = db.users.get(req.body.username);
    req.session.logged = true;
    req.session.username = req.body.username;
    req.session.admin = user.admin;
    req.session.avatar = user.avatar;
    req.session.name = user.name;
    req.session.save();
    console.log("User authenticated");
    res.redirect('/');
  } else {
    console.log("Authentication Failed");
    res.status(403).send("Nope. Not allowed, mate.");
  }
});

app.get("/logout", (req, res, next) => {
  req.session.destroy(function(err) {
    res.redirect("/");
  })
})

http.createServer(app).listen(8080);