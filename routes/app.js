const { sep, resolve } = require("path");
const marked = require("marked");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

app.get("/", (req, res) => {
  const articles = db.articles.filter(a => !!a.title && a.published).array();
  articles.forEach(a => {
    a.user = db.users.get(a.user);
    a.content = marked(a.content);
  });
  res.render(resolve(`${templateDir}${sep}index.ejs`), { path: req.path, articles, auth: req.session });
});

app.get("/view/:id", (req, res) => {
  const article = db.articles.get(req.params.id);
  article.content = marked(article.content);
  const user = db.users.get(article.user);
  res.render(resolve(`${templateDir}${sep}post.ejs`), { path: req.path, article, user, auth: req.session });
});

app.get("/user/:user", (req, res) => {
  const user = db.users.get(req.params.user);
  res.render(resolve(`${templateDir}${sep}user.ejs`), { path: req.path, user, auth: req.session });
});

module.exports = app;
