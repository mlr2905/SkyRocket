const express = require('express')
const router = express.Router()
const bl = require('../bl/bl_role_airlines')
const logger = require('../logger/my_logger')
const airlinesController = require('../controllers/airlinesController');

router.get('/users/search', airlinesController.userAirlineBySearch);

router.get('/users/:id', airlinesController.userAirlineById);

router.post('/users', airlinesController.createUserAirline);

router.put('/users/:id', airlinesController.updateUserAirline);

router.post('/airlines', airlinesController.createAirline);

router.get('/airlines/:id', airlinesController.airlineById);

router.put('/airlines/:id', airlinesController.updateAirline);

router.get('/airline_id/:id', airlinesController.flightByAirline_id);

router.get('/flights/:id', airlinesController.flightById);

router.post('/flights', airlinesController.createFlight);

router.put('/flights/:id', airlinesController.updateFlight);

router.delete('/flights/:id', airlinesController.deleteFlight);

module.exports = router