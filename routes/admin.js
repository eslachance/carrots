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
  res.render(resolve(`${templateDir}${sep}admin${sep}index.ejs`), { path: req.originalUrl, articles, auth: req.session });
});

app.get("/logs", (req, res) => {
  res.json(db.logs.filter(log => !!log.time).array());
});

app.get("/add", (req, res) => {
  res.render(resolve(`${templateDir}${sep}admin${sep}addpost.ejs`), { path: req.originalUrl, auth: req.session });
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
  res.redirect(`/admin/edit/${id}`);
});

app.get("/adduser", (req, res) => {
  res.render(resolve(`${templateDir}${sep}admin${sep}adduser.ejs`), { path: req.originalUrl, auth: req.session });
});

app.post("/adduser", (req, res) => {
  db.newuser(req.body.username, req.body.name, req.body.password, req.body.admin === "on");
  res.redirect("/admin");
});

app.get("/users", (req, res) => {
  res.json(db.users.values());
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
  res.render(resolve(`${templateDir}${sep}admin${sep}editpost.ejs`), { path: req.originalUrl, article, auth: req.session });
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
