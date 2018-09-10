const Enmap = require("../enmap");
const bcrypt = require("bcrypt");
const config = require("./config.json");

exports.users = new Enmap({name: "users"});
exports.articles = new Enmap({name: "articles"});
exports.comments = new Enmap({name: "comments"});
exports.logs = new Enmap({name: "logs"});

exports.login = (username, password) => {
  const user = this.users.get(username);
  if (!user) return new Promise(r=>r(false));
  return bcrypt.compare(password, user.password)
};

exports.newuser = (username, name, plainpw) => {
  if (this.users.has(username)) throw Error(`User ${username} already exists!`);
  bcrypt.hash(plainpw, config.saltRounds || 10, (err, password) => {
    if (err) throw err;
    this.users.set(username, {
      username, name, password
    });
  });
}
