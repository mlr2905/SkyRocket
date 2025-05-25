const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController');

router.get('/ip', usersController.ip);

router.get('/email', usersController.email);

router.get('/users/search', usersController.usersSearch);

router.get('/users/:id', usersController.usersById);

router.post('/authcode', usersController.authCode);

router.post('/validation', usersController.validation);

router.post('/loginwebauthn', usersController.loginWebAuthn);

router.post('/signupwebauthn', usersController.signupWebAuthn);

router.post('/login', usersController.login);

router.post('/signup', usersController.signup);

router.post('/users', usersController.createUser);

router.put('/users/:id', usersController.updateUser);

router.delete('/users/:id', usersController.deleteUser);

router.get('/customers/:id', usersController.customersById);

router.post('/customers', usersController.createCustomer);

router.put('/customers/:id', usersController.updateCustomer);

router.get('/flights', usersController.get_all_flights);

router.get('/flights/:id', usersController.getFlightById);

router.post('/tickets', usersController.createTicket);

router.get('/chairs/:id', usersController.getAllChairsByFlightId);

router.post('/passengers', usersController.createPassenger);

router.get('/passengers/:id', usersController.PassengerById);

module.exports = router