const fs = require("fs");
const { sep, resolve } = require("path");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const express = require("express");
const db = require("../db.js");
const config = require("../config.json");

const app = express.Router(); //make a router
app.use(express.json());

app.get("/", (req, res, next) => {
  /*db.logs.set(db.logs.autonum, {
    time: Date.now(),
    agent: req.headers['user-agent']
  });*/
  const articles = db.articles.filter(a=>!!a.title).array();
  articles.forEach(a => a.user = db.users.get(a.user));
  res.render(resolve(`${templateDir}${sep}index.ejs`), {path: req.path, articles, auth: req.session});
});

app.get("/view/:id", (req, res, next) => {
  const article = db.articles.get(req.params.id);
  const user = db.users.get(article.user);
  res.render(resolve(`${templateDir}${sep}post.ejs`), {path: req.path, article, user, auth: req.session});
});

app.get("/user/:user", (req, res, next) => {
  const user = db.users.get(req.params.user);
  res.render(resolve(`${templateDir}${sep}user.ejs`), {path: req.path, user, auth: req.session});
})

module.exports = app;