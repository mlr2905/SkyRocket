const express = require('express');
const router = express.Router();
const { activation, logout, rootHandler } = require('../controllers/sessionController');

router.get('/activation', activation);
router.get('/logout', logout);
router.get('/', rootHandler);

module.exports = router;
