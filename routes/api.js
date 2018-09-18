const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

app.get("/genkey", (req, res) => {
  if (!req.session.logged) return res.redirect("/login");
  db.generateToken(req.session.username);
  return res.redirect("/me");
});

app.use((req, res, next) => {
  if (!req.headers.authorization) return res.status(400).send("Missing authorization:token header.");
  const user = db.users.find("apiToken", req.headers.authorization);
  if (!user) {
    console.log(`Attempted API access with ${req.headers.authorization} refused because the token was invalid.`);
    return res.status(403).send("Invalid Token");
  }
  req.user = user;
  return next();
});

app.post("/newarticle", (req, res) => {
  console.log(req.body);
  const article = req.body;
  // (title, content, user, published = false)
  if (!article.title || !article.content) {
    return res.status(400).send("Invalid Form Body: Missing title or content");
  }
  const data = Object.assign({ user: req.user.username }, article);
  const id = db.addArticle(data.title, data.content, data.user, data.published == null ? false : data.published);
  return res.json({
    id,
    url: `/view/${id}`
  });
});

app.get("*", (req, res) => {
  res.send("Not Implemented Yet");
});

app.post("*", (req, res) => {
  res.send("Not Implemented Yet");
});

module.exports = app;
