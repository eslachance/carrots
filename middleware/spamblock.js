const statuscodes = {
  420: "Calm your tits and gtfo",
  406: "This is... Unacceptable. http://favoritememes.com/_nw/88/39598762.jpg",
  418: "I'm a little teapot short and stout. Here is my banhammer here is my BLOCK."
};

const banned = [
  "/login.cgi",
  "/wp_admin",
  "/testget",
  "/phpMyAdmin",
  "/manager"
];

const bannedSet = new Set();

module.exports = (req, res, next) => {
  if (bannedSet.has(req.clientIp)) {
    return res.redirect(301, "http://www.silverraven.com/fy.htm");
  }
  if (banned.some(p => req.originalUrl.includes(p))) {
    const codes = Object.entries(statuscodes);
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    bannedSet.add(req.clientIp);
    return res.status(randomCode[0]).send(randomCode[1]);
  }
  return next();
};
