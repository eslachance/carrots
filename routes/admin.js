const fs = require("fs");

const express = require("express");
const db = require("../db.js");
const config = require("../config.json");

const app = express.Router(); //make a router
app.use(express.json());

app.get("/", (req, res, next) => {
  res.json(db.articles.filter(a=>!!a.title).array());
});

app.get("/logs", (req, res, next) => {
  res.json(db.logs.filter(l=>!!l.time).array());
})

app.get("/add", (req, res, next) => {
  const id = db.articles.autonum;
  db.articles.set(id, {
    id, content: "This is test content", title: "Article Title", date: Date.now(), user: 1
  });
  res.send("ok");
})

app.get("/edit/:id", (req, res, next) => {
  db.articles.set(req.params.id, "Edited Title", "title");
  res.send("ok");
})

module.exports = app;