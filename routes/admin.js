const express = require("express");
const db = require("../db.js");
const { resolve, sep } = require("path");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const app = express.Router();
app.use(express.json());

app.get("/", (req, res) => {
  const articles = db.articles.filter(a => !!a.title).array();
  articles.forEach(a => { a.user = db.users.get(a.user); });
  res.render(resolve(`${templateDir}${sep}admin${sep}index.ejs`), { path: req.path, articles, auth: req.session });
});

app.get("/logs", (req, res) => {
  res.json(db.logs.filter(log => !!log.time).array());
});

app.get("/add", (req, res) => {
  res.render(resolve(`${templateDir}${sep}admin${sep}addpost.ejs`), { path: req.path, auth: req.session });
});

app.post("/add", (req, res) => {
  const id = db.articles.autonum;
  db.articles.set(id, {
    id, content: req.body.content,
    title: req.body.title,
    published: false,
    date: Date.now(),
    user: req.session.username
  });
  res.send("ok");
});

app.get("/adduser", (req, res) => {
  db.newuser("evie", "Evelyne", "abc123");
  res.send("ok");
});

app.get("/publish/:id", (req, res) => {
  db.articles.set(req.params.id, true, "published");
  res.redirect("/admin");
});

app.get("/unpublish/:id", (req, res) => {
  db.articles.set(req.params.id, false, "published");
  res.redirect("/admin");
});

app.get("/edit/:id", (req, res) => {
  const article = db.articles.get(req.params.id);
  res.render(resolve(`${templateDir}${sep}admin${sep}editpost.ejs`), { path: req.path, article, auth: req.session });
});

app.post("/edit/", (req, res) => {
  const article = db.articles.get(req.body.id);
  article.published = !!req.body.published;
  article.content = req.body.content;
  article.title = req.body.title;
  db.articles.set(req.body.id, article);
  // db.articles.set(req.params.id, "Edited Title", "title");
  res.redirect(`/admin/edit/${req.body.id}`);
});

module.exports = app;
