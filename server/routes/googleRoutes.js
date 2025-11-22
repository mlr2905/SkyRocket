const express = require('express');
const passport = require('passport');
const Log = require('../logger/logManager');
const { handleGoogleLogin } = require('../controllers/googleAuth');
const router = express.Router();

const FILE = 'routes/googleRoutes';

Log.info(FILE, 'init', null, 'google Router initialized');


router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
    handleGoogleLogin
);

module.exports = router;
