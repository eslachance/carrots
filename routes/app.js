const fs = require("fs");

const express = require("express");
const db = require("../db.js");
const config = require("../config.json");

const app = express.Router(); //make a router
app.use(express.json());

app.get("/", (req, res, next) => {
  db.logs.set(db.logs.autonum, {
    time: Date.now(),
    agent: req.headers['user-agent']
  })
  res.json(db.articles.filter(a=>!!a.title).array());
});

module.exports = app;