const { sep, resolve } = require("path");
const marked = require("marked");

const dataDir = resolve(`${process.cwd()}${sep}`);
const templateDir = resolve(`${dataDir}${sep}pages`);

const express = require("express");
const db = require("../db.js");

const app = express.Router();
app.use(express.json());

app.get("*", (req, res) => {
  res.send("Not Implemented Yet");
});

module.exports = app;
