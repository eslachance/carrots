const { sep, resolve } = require("path");
const marked = require("marked");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

app.get("/", (req, res) => {
  res.render(resolve(`${templateDir}${sep}index.ejs`), { path: req.originalUrl, articles: db.getArticles(true), auth: req.session });
});

app.get("/view/:id", (req, res) => {
  res.render(resolve(`${templateDir}${sep}post.ejs`), { path: req.originalUrl, article: db.getArticle(req.params.id), auth: req.session });
});

module.exports = app;
