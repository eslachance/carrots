const Enmap = require("../enmap");
const bcrypt = require("bcrypt");

exports.users = new Enmap({ name: "users" });
exports.articles = new Enmap({ name: "articles" });
exports.comments = new Enmap({ name: "comments" });
exports.logs = new Enmap({ name: "logs" });
exports.settings = new Enmap({ name: "settings" });

exports.login = (username, password) => {
  const user = this.users.get(username);
  if (!user) return new Promise(resp => resp(false));
  return bcrypt.compare(password, user.password);
};

exports.newuser = (username, name, plainpw, admin = false) => {
  if (this.users.has(username)) throw Error(`User ${username} already exists!`);
  const score = scorePassword(plainpw);
  if (score < 30) throw new Error(`Your password is too weak, and cannot be used.`);
  bcrypt.hash(plainpw, 10, (err, password) => {
    if (err) throw err;
    this.users.set(username, {
      username, name, password, admin, avatar: null, created: Date.now()
    });
  });
};

// https://stackoverflow.com/questions/948172/password-strength-meter
function scorePassword(pass) {
  let score = 0;
  if (!pass) {
    return score;
  }

  // award every unique letter until 5 repetitions
  const letters = {};
  for (let i = 0; i < pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
    score += 5.0 / letters[pass[i]];
  }

  // bonus points for mixing it up
  const variations = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass)
  };

  let variationCount = 0;
  for (var check in variations) {
    variationCount += (variations[check] == true) ? 1 : 0;
  }
  score += (variationCount - 1) * 10;

  return parseInt(score);
}
