const express = require('express');
const axios = require('axios');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');

const qs = require('qs');


// קונפיגורציה
const facebook_appId = '1156854418774447';
const facebook_appSecret = '7bd06b4a0356ba8fba5ef8365f37e718';

function facebook_auth(app) {
  passport.use(new FacebookStrategy({
      clientID: facebook_appId,
      clientSecret: facebook_appSecret,
      callbackURL:'https://skyrocket.onrender.com/facebook'
    },
    function(accessToken, refreshToken, profile, done) {
      // כאן תוכל לשמור את פרטי המשתמש במסד הנתונים שלך
      return done(null, profile);
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  // הגדרת סשנים
  app.use(require('express-session')({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

  // הגדרת Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // הגדרת מסלולים לאימות
  app.get('/facebook', passport.authenticate('facebook'));

  app.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
      // Authentication successful
      res.redirect('/');
    });
}

module.exports = facebook_auth;