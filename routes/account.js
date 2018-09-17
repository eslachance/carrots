const { sep, resolve } = require("path");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

// Login/Logout Features

app.get(["/user/:id", "/user"], (req, res) => {
  const user = db.users.get(req.params.id || req.session.username);
  if (!user) return res.redirect("/login");
  const comments = db.comments.filter(comment => !!comment.id && comment.user === user.username);
  const articles = db.articles.filter(article => !!article.id && article.user === user.username);
  res.render(resolve(`${templateDir}${sep}user.ejs`), { path: req.path, user, articles, comments, auth: req.session });
});

app.get("/register", (req, res) => {
  res.render(resolve(`${templateDir}${sep}register.ejs`), { path: req.path, auth: req.session });
});

app.post("/register", (req, res) => {
  db.newuser(req.body.username, req.body.name, req.body.password, req.body.admin === "on");
  res.redirect(req.session.back || "/");
});

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
    res.redirect(req.session.back || "/");
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

// Initial Install Features

app.get("/install", (req, res, next) => {
  if (db.settings.count > 0 || db.users.count > 0) {
    res.status(403).send("ALREADY INITIALIZED, GO AWAY PUNY HUMAN!");
    return next();
  }
  res.render(resolve(`${templateDir}${sep}install.ejs`), { path: req.path, auth: req.session });
  return next();
});

app.post("/install", (req, res, next) => {
  if (db.settings.count > 0 || db.users.count > 0) {
    res.status(403).send("ALREADY INITIALIZED, GO AWAY PUNY HUMAN!");
    return next();
  }
  console.log(req.body);
  const checks = ["username", "password", "title", "description", "author"];
  if (checks.some(field => req.body[field].length < 3)) {
    return res.status(400).send("Field information missing to create the site.");
  }
  checks.slice(2).forEach(field => {
    db.settings.set(field, req.body[field]);
  });
  db.settings.set("init", true);
  db.settings.set("commentsEnabled", req.body.enableComments === "on");
  db.settings.set("registrationEnabled", req.body.enableRegistration === "on");

  db.newuser(req.body.username, req.body.name, req.body.password, true);

  if (req.body.examples) {
    const one = db.articles.autonum;
    db.articles.set(one, {
      id: one,
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam imperdiet iaculis nulla quis malesuada. Phasellus feugiat sed ipsum vel fermentum. Nullam efficitur volutpat lectus. Vestibulum elementum porta sem nec luctus. Integer mauris felis, placerat a volutpat ut, sollicitudin quis est. Nulla a elit placerat dolor pulvinar euismod sit amet laoreet mauris. Fusce ac odio vitae diam ultricies accumsan pulvinar ornare ex. Nunc enim dui, pellentesque vel nibh ut, lacinia eleifend magna. Aenean ac orci est. Donec aliquam urna tellus, et mollis velit fermentum vitae. Aliquam porttitor nisl ut lacus fringilla dictum. Pellentesque blandit metus risus, vitae commodo magna sollicitudin at.",
      title: "This is a test post because who wants an empty page?",
      published: true,
      date: Date.now(),
      user: req.body.username
    });
    const cmt = db.comments.autonum;
    db.comments.set(cmt, {
      id: cmt,
      parent: one,
      content: "FUN FACT! : 'Lorem ipsum dolor sit amet' translates to 'Lorem ipsum carrots' on Google Translate!",
      user: req.body.username,
      date: Date.now()
    });
  }
  return res.send("ok");
});

module.exports = app;
