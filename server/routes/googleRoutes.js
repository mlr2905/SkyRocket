const express = require('express');
const passport = require('passport');
const { handleGoogleLogin } = require('../controllers/googleAuth');

const router = express.Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
    handleGoogleLogin
);

module.exports = router;
