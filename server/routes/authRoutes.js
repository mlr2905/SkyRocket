const express = require('express');
const router = express.Router();
const Log = require('../logger/logManager');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController'); 

const FILE = 'routes/authRoutes';

Log.info(FILE, 'init', null, 'auth Router initialized');

router.post('/logout',protect, authController.logout); 
router.use(authController.rootHandler);
module.exports = router;