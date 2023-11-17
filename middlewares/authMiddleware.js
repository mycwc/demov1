const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require("passport-jwt");

const dotenv = require("dotenv");

const authHelper = require("../helpers/authHelper");
const Admin = require("../model/Admin");
const User = require("../model/User");

dotenv.config({ path: ".env" });

passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

passport.deserializeUser((id, done) => {
  Admin.findById(id, (err, admin) => {
    done(err, admin);
  });
});

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET_KEY;

passport.use("userJWT",
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  })
);

passport.use("adminJWT",
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await Admin.findById(payload.id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  })
);

passport.use("adminLocal", new LocalStrategy({ usernameField: 'email' },
  (email, password, done) => {
    Admin.findOne({ email: email.toLowerCase() }, (err, admin) => {
      if (err) { return done(err); }
      if (!admin) { return done(null, false, { msg: `Email not found.` }); }
      if (!authHelper.validatePassword(password, admin.password)) { return done(null, false, { msg: 'Invalid email or password.' }); }
      return done(null, admin);
    });
  }
));