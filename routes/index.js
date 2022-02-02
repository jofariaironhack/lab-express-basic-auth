const router = require("express").Router();
const { isLoggedIn } = require("../middleware/route-guard");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// Get main
router.get("/main", isLoggedIn, (req, res, next) => {
  res.render("protected/main");
});

// Get private
router.get("/private", isLoggedIn, (req, res, next) => {
  res.render("protected/private");
});

module.exports = router;
