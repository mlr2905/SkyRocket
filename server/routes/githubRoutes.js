const express = require('express');
const passport = require('passport');
const { handleGitHubLogin } = require('../controllers/githubAuth');

const router = express.Router();

router.get('/git',
    passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
    handleGitHubLogin
);

module.exports = router;
