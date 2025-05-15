const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./logger/my_logger');

function setupMiddleware(app) {
    // הגדרת session, passport
    app.use(session({ secret: 'keyboard', resave: true, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());
    logger.debug('Session and passport middleware initialized');

    app.use(cors());
    logger.debug('CORS middleware initialized');
    
    app.use(bodyParser.json());
    app.use(express.static(path.join('.', '/static/')));
    
    logger.debug('All middleware configured');
}

module.exports = setupMiddleware;