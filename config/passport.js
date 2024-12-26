const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user");
const pool = require("../config/db");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await userModel.findByGoogleId(profile.id);

        if (!user) {
          // Create new user
          user = await userModel.createUser({
            googleId: profile.id,
            fullname: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
            userType: "user",
            isActive: true,
          });
          return cb(null, user);
        }

        // Update first login status and last login time
        await userModel.updateFirstLoginStatus(user.id);
        await userModel.updateLastLogin(user.id);

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});
