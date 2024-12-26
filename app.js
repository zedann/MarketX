const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

require("./config/passport");

app.get("/profile", (req, res) => {
  if (req.user) {
    console.log(req.user);
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

module.exports = app;
