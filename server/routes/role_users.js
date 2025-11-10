const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController');
const { protect } = require('../middleware/authMiddleware'); 

// --- נתיבים ציבוריים (לא דורשים התחברות) ---
router.get('/ip', usersController.ip);
router.get('/email', usersController.email);
router.get('/users/search', usersController.usersSearch); // הערה: אולי כדאי לאבטח גם את זה
router.post('/authcode', usersController.authCode);
router.post('/validation', usersController.validation);
router.post('/loginwebauthn', usersController.loginWebAuthn);
router.post('/signupwebauthn', usersController.signupWebAuthn);
router.post('/login', usersController.login);
router.post('/signup', usersController.signup);
router.post('/users', usersController.createUser); // יצירת משתמש (הרשמה) צריכה להיות ציבורית

// --- נתיבי חיפוש ציבוריים (כל אחד יכול לחפש טיסות) ---
router.get('/flights/search', usersController.getFilteredFlights);
router.get('/countries/origins', usersController.getAllOriginCountries);
router.get('/countries/destinations', usersController.getDestinationsFromOrigin);
router.get('/flights', usersController.get_all_flights);
router.get('/flights/:id', usersController.getFlightById);


// --- נתיבים מאובטחים (דורשים התחברות - הוספנו 'protect') ---

// נתיב לאזור האישי
router.get('/me', protect, usersController.getMyDetails);

// נתיבי ניהול משתמש (עדכון ומחיקה של החשבון האישי)
router.get('/users/:id', protect, usersController.usersById);
router.put('/users/:id', protect, usersController.updateUser);
router.delete('/me', protect, usersController.deleteMe); 
// נתיבי לקוחות (פרטי לקוח קשורים למשתמש מחובר)
router.get('/customers/:id', protect, usersController.customersById);
router.post('/customers/verify-cvv', protect, usersController.verifyCustomerCvv);
router.post('/customers', protect, usersController.createCustomer);
router.put('/customers/:id', protect, usersController.updateCustomer);

// נתיבי יצירת הזמנה (נוסעים, כרטיסים, כיסאות)
router.post('/chairs', protect, usersController.createChairAssignment);
router.post('/tickets', protect, usersController.createTicket);
router.post('/passengers', protect, usersController.createPassenger);

// נתיבי קריאת מידע ספציפי להזמנה
router.get('/chairs/:id', protect, usersController.getAllChairsByFlightId);
router.get('/passengers/:id', protect, usersController.PassengerById);

module.exports = router