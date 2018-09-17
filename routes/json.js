const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

app.get("/articles", (req, res) => {
  res.json(db.getArticles());
});

app.get("/article/:id", (req, res) => {
  res.json(db.getArticle(req.params.id));
});

app.get("/comments/:postid", (req, res) => {
  res.json(db.getComments(req.params.postid));
});

app.get("/users", (req, res) => {
  res.json(db.getUsers());
});

app.get("/user/:id", (req, res) => {
  res.json(db.getCleanUser(req.params.id));
});

module.exports = app;
