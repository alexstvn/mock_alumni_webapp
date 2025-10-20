
module.exports = {
    respondIndex: (req, res) => {
      res.render("index");
    },
    showAbout: (req, res) => {
        res.render("about");
    },
    showContact: (req, res) => {
        res.render("contact");
    },
    chat: (req, res) => {
      res.render("chat");
    },
  };