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
    a.commentCount = db.comments.filter(c => !!c.id && c.parent === a.id).size;
  });
  res.render(resolve(`${templateDir}${sep}index.ejs`), { path: req.originalUrl, articles, auth: req.session });
});

app.get("/view/:id", (req, res) => {
  const article = db.articles.get(req.params.id);
  article.user = db.users.get(article.user);
  article.commentCount = db.comments.filter(c => !!c.id && c.parent === article.id).size;
  const comments = db.comments.filter(comment => comment.parent === article.id);
  res.render(resolve(`${templateDir}${sep}post.ejs`), { path: req.originalUrl, article, comments, auth: req.session });
});

module.exports = app;
