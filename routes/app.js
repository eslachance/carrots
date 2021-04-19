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

app.get("/enmap/:tracking", (req, res) => {
  const tracking = req.params.tracking || 'none';
  db.referals.set(db.referals.autonum, {
    time: db.formatDate(Date.now()),
    agent: req.headers["user-agent"],
    ip: req.clientIp,
    page: req.get('Referrer'),
    referal: tracking,
  });
  console.log(`[REFERAL] [${tracking}]: ${db.formatDate(Date.now())} | ${req.clientIp} | ${req.originalUrl}`);
  res.send(`
 <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="refresh" content="0;URL='https://enmap.evie.dev/'" />
  </head>
  <body>
    <p>Click <a href="https://enmap.evie.dev/">here</a> to reach the enmap documentation.</p>
  </body>
</html>
`);
});

module.exports = app;
