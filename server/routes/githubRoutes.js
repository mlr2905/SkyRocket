const express = require('express');
const passport = require('passport');
const Log = require('../logger/logManager');
const { handleGitHubLogin } = require('../controllers/githubAuth');
const router = express.Router();

const FILE = 'routes/githubRoutes';

Log.info(FILE, 'init', null, 'github Router initialized');

router.get('/git',
    passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
    handleGitHubLogin
);

module.exports = router;
