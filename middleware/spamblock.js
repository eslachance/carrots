const statuscodes = {
  420: "Calm your tits and gtfo",
  406: "This is... Unacceptable. http://favoritememes.com/_nw/88/39598762.jpg",
  418: "I'm a little teapot short and stout. Here is my banhammer here is my BLOCK."
};

const banned = [
  "/login.cgi",
  "/wp_admin",
  "/wp-includes/",
  "/testget",
  "/phpMyAdmin",
  "/manager",
  "/wp-login.php",
  "/.git/HEAD",
  "/wallet.dat",
];

const bannedSet = new Set();

module.exports = (req, res, next) => {
  if (bannedSet.has(req.clientIp)) {
    return res.redirect(301, "https://imgur.com/gallery/KS9w4");
  }
  if (banned.some(p => req.originalUrl.includes(p))) {
    const codes = Object.entries(statuscodes);
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    bannedSet.add(req.clientIp);
    return res.status(randomCode[0]).send(randomCode[1]);
  }
  return next();
};
