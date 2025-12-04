const express = require('express');
const router = express.Router();
const Log = require('../logger/logManager');
const usersController = require('../controllers/usersController');
const { protect } = require('../middleware/authMiddleware'); 

const FILE = 'routes/role_users';

Log.info(FILE, 'init', null, 'Role Users Router initialized');

// VALIDATION (Public)
router.get('/ip', usersController.ip);
router.get('/email', usersController.email); // Email validation
router.get('/users/search', usersController.usersSearch); // Check if user exists

// CONNECTION (Public)
router.post('/authcode', usersController.authCode);
router.post('/validation', usersController.validation);
router.post('/login', usersController.login);
router.post('/signup', usersController.signup);

// WebAuthn
router.post('/loginwebauthn', usersController.loginWebAuthn); // Public
router.post('/signupwebauthn', protect, usersController.signupWebAuthn); // Protected

// COUNTRIES (Public)
router.get('/countries/origins', usersController.getAllOriginCountries);
router.get('/countries/destinations', usersController.getDestinationsFromOrigin);

// FLIGHT (Public)
router.get('/flights', usersController.get_all_flights);
router.get('/flights/search', usersController.getFilteredFlights);
router.get('/flights/:id', usersController.getFlightById);

// USER (Protected)
router.get('/me', protect, usersController.getMyDetails);
router.delete('/me', protect, usersController.deleteMe);

// CUSTOMER (Protected)
router.get('/customers/me', protect, usersController.customersById);
router.post('/customers', protect, usersController.createCustomer);
router.put('/customers/me', protect, usersController.updateCustomer);
router.post('/customers/verify-cvv', protect, usersController.verifyCustomerCvv);

// TICKETS (Protected)
router.get('/my-tickets', protect, usersController.getMyTickets);
router.post('/tickets', protect, usersController.createTicket);
router.delete('/my-tickets/:id', protect, usersController.deleteMyTicket);

// Passengers (Protected)
router.post('/passengers', protect, usersController.createPassenger);
router.get('/passengers/:id', protect, usersController.PassengerById);

// Chairs / Seats (Protected)
router.get('/chairs/:id', protect, usersController.getAllChairsByFlightId);
router.post('/chairs', protect, usersController.createChairAssignment);

module.exports = router;