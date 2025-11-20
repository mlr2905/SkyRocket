const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController'); 

router.post('/logout',protect, authController.logout); 
router.use(authController.rootHandler);
module.exports = router;