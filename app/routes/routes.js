module.exports = app => {
  const web = require("../controllers/WebController.js")

  app.post('/web-scraping', web.index)
};
