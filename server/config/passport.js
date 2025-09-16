const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const CALLBACK_URL = `${process.env.SERVER_URL}/api/auth/google/callback`; // <- ONLY server URL

console.log("--- DEBUGGING GOOGLE STRATEGY ---");
console.log("SERVER_URL from .env:", process.env.SERVER_URL);
console.log("Complete Callback URL:", CALLBACK_URL);
console.log("---------------------------------");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,  
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const googleId = profile.id;
        const name = profile.displayName || "Google User";

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name,
            email,
            provider: "google",
            googleId,
          });
        } else if (!user.googleId) {
          user.googleId = googleId;
          user.provider = "google";
          await user.save();
        }
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const u = await User.findById(id).lean();
    done(null, u);
  } catch (e) {
    done(e);
  }
});

module.exports = passport;
