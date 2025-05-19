const express = require('express')
const router = express.Router()
const adminsController = require('../controllers/adminsController');

router.get('/users/search', adminsController.usersSearch);

router.get('/users/:id', adminsController.userById);

router.post('/users_role1', adminsController.CreatUser);

router.post('/users_role2', adminsController.CreatUserAirline);

router.put('/users/:id', adminsController.updateUser);

router.delete('/users/:id', adminsController.deleteUser);

router.post('/airlines', adminsController.createAirline);

router.get('/airlines/:id', adminsController.airlineById);

router.put('/airlines/:id', adminsController.updateAirline);

router.get('/customers/:id', adminsController.customersById);

router.post('/customers', adminsController.createCustomer);

router.put('/customers/:id', adminsController.updateCustomer);

router.get('/flights', adminsController.get_all_flights);

router.get('/airline_id/:id', adminsController.flightByAirline_id);

router.get('/flights/:id', adminsController.flightById);

router.post('/flights', adminsController.createFlight);

router.put('/flights/:id', adminsController.updateFlight);

router.delete('/flights/:id', adminsController.deleteFlight);

router.post('/tickets', adminsController.createTicket);

router.post('/passengers', adminsController.createPassenger);

router.get('/passengers/:id', adminsController.PassengerById);

module.exports = router