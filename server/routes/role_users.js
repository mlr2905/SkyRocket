const express = require('express');
const router = express.Router();
const Log = require('../logger/logManager');
const usersController = require('../controllers/usersController');
const { protect } = require('../middleware/authMiddleware'); 

const FILE = 'routes/role_users';

Log.info(FILE, 'init', null, 'Role Users Router initialized');

// --- Generic and appropriate paths (Auth) ---
router.get('/ip', usersController.ip);
router.get('/email', usersController.email);
router.get('/users/search', usersController.usersSearch);

router.post('/authcode', usersController.authCode);
router.post('/validation', usersController.validation);
router.post('/loginwebauthn', usersController.loginWebAuthn);
router.post('/signupwebauthn', protect, usersController.signupWebAuthn);
router.post('/login', usersController.login);
router.post('/signup', usersController.signup);
router.post('/users', usersController.createUser);

// --- Public search paths (anyone can search for flights) ---
router.get('/flights/search', usersController.getFilteredFlights);
router.get('/countries/origins', usersController.getAllOriginCountries);
router.get('/countries/destinations', usersController.getDestinationsFromOrigin);
router.get('/flights', usersController.get_all_flights);
router.get('/flights/:id', usersController.getFlightById);

// --- Protected paths (require login - protect) ---

// Path to the personal area
router.get('/me', protect, usersController.getMyDetails);
router.get('/my-tickets', protect, usersController.getMyTickets);

// User management paths (update and delete personal account)
router.get('/users/:id', protect, usersController.usersById);
router.put('/users/:id', protect, usersController.updateUser);
router.delete('/me', protect, usersController.deleteMe); 

// Customer paths (customer details related to logged in user)
router.get('/customers/:id', protect, usersController.customersById);
router.post('/customers/verify-cvv', protect, usersController.verifyCustomerCvv);
router.post('/customers', protect, usersController.createCustomer);
router.put('/customers/:id', protect, usersController.updateCustomer);

// Order creation paths (passengers, tickets, seats)
router.post('/chairs', protect, usersController.createChairAssignment);
router.post('/tickets', protect, usersController.createTicket);
router.delete('/my-tickets/:id', protect, usersController.deleteMyTicket);
router.post('/passengers', protect, usersController.createPassenger);

// Order-specific information reading paths
router.get('/chairs/:id', protect, usersController.getAllChairsByFlightId);
router.get('/passengers/:id', protect, usersController.PassengerById);

module.exports = router;