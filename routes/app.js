const { sep, resolve } = require("path");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

app.get("/", (req, res) => {
  res.render(resolve(`${templateDir}${sep}index.ejs`), { path: req.originalUrl, auth: req.session, settings: req.settings, articles: db.getArticles(true) });
});

app.get("/view/:id", (req, res) => {
  res.render(resolve(`${templateDir}${sep}post.ejs`), { path: req.originalUrl, auth: req.session, settings: req.settings, article: db.getArticle(req.params.id) });
});

app.get("/random", (req, res) => {
  const rand = db.articles.randomKey();
  res.render(resolve(`${templateDir}${sep}post.ejs`), { path: req.originalUrl, auth: req.session, settings: req.settings, article: db.getArticle(rand) });
});

module.exports = app;
