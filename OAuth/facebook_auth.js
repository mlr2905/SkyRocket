const express = require('express');
const axios = require('axios');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');

// קונפיגורציה
const facebook_appId = '1156854418774447';
const facebook_appSecret = '7bd06b4a0356ba8fba5ef8365f37e718'; // החלף במפתח הסודי שלך

function facebook_auth(app) {

  passport.use(new FacebookStrategy({
      clientID: facebook_appId,
      clientSecret: facebook_appSecret,
      callbackURL: 'https://skyrocket.onrender.com/facebook/callback',
      profileFields: ['id', 'displayName', 'name', 'first_name', 'last_name', 'middle_name', 'short_name', 'gender',
        'email', 'birthday', 'friends', 'hometown', 'location', 'link', 'locale', 'timezone', 'photos',
        'picture.type(large)', 'cover', 'updated_time', 'verified'
      ]
    },
    function(accessToken, refreshToken, profile, done) {
      console.log('User Profile:', profile); // הדפסת המידע בקונסול
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
  app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

  // הגדרת Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // הגדרת מסלולים לאימות
  app.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'user_birthday', 'user_friends', 'user_gender', 'user_hometown', 'user_location', 'user_likes',
    'user_photos', 'user_posts', 'user_videos']
  }));

  app.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
      // Authentication successful
      res.redirect('/');
    });
}

module.exports = facebook_auth;
