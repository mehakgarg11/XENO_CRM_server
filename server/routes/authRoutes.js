const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth_controller");

// Email/Password
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Google OAuth
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  authController.googleCallback
);

module.exports = router;
