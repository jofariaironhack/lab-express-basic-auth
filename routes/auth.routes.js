const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isLoggedOut, isLoggedIn } = require("../middleware/route-guard");

const User = require("../models/User.model");

router.get("/auth/signup", isLoggedOut, (req, res, next) => {
  res.render("auth/signup");
});

router.post("/auth/signup", (req, res, next) => {
  // console.log("Body", req.body);
  //   res.render("auth/signup");
  const { username, password, email } = req.body;

  if (username === "" || email === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Please enter username, email and password.",
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (regex.test(password)) {
    User.find({ email }).then((userFromDB) => {
      // []
      if (!userFromDB.length) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        User.create({ username, password: hashedPassword, email })
          .then((responseFromDB) => {
            req.session.user = responseFromDB;
            res.render("user/profile", responseFromDB);
          })
          .catch((err) => {
            console.log(err);
            if (err.code === 11000) {
              res.render("auth/signup", {
                errorMessage: "Hey that username is already taken",
              });
            } else {
              res.render("auth/signup", {
                errorMessage: err.message,
              });
            }
          });
      } else {
        res.render("auth/signup", {
          errorMessage: "Hey that email is already taken",
        });
      }
    });
  } else {
    res.render("auth/signup", {
      errorMessage:
        "Please make sure the password has min 6 characters, at least one lower, Upper and numeric",
    });
  }
});

router.get("/auth/login", (req, res, next) => {
  console.log("Our session:", req.session);
  if (req.session && req.session.user) {
    // req.session?.user
    res.render("user/profile", req.session.user);
  } else {
    res.render("auth/login");
  }
});

router.post("/auth/login", (req, res, next) => {
  // console.log("body content:", req.body);
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both username and password",
    });
  }
  User.findOne({ username }).then((userFromDB) => {
    // {} null
    if (!userFromDB) {
      // for the sake of security we will have a generic message
      res.status(500).render("auth/login", {
        errorMessage: "Incorrect data",
      });
    } else if (bcrypt.compareSync(password, userFromDB.password)) {
      // console.log(req.session.user);
      req.session.user = userFromDB;
      res.status(200).render("user/profile", userFromDB);
    } else {
      res.status(500).render("auth/login", {
        errorMessage: "Incorrect data",
      });
    }
  });
});

router.post("/logout", isLoggedIn, (req, res) => {
  // with the middleware, this uses callbacks, not promises
  req.session.destroy((err) => {
    if (err) {
      return res.render("error");
    }

    res.redirect("/");
  });
});

module.exports = router;
