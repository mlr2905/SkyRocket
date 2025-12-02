const bl = require('../bl/bl_role_airlines');
const Log = require('../logger/logManager');

const FILE = 'airlinesController';

exports.userAirlineBySearch = async (req, res) => {
    const func = 'userAirlineBySearch';
    const query = req.query;
    const email = query.email;
    const username = query.username;
    const password = query.password;
    const id = query.id;
    let search = email ? email : username ? username : password ? password : id;
    let type = search !== undefined ? (search === email ? "email" : search === username ? "username" : search === password ? "password" : "id") : undefined;

    Log.info(FILE, func, search, `User search request by ${type}`);
    Log.debug(FILE, func, search, `Query parameters: ${JSON.stringify(query)}`);

    try {
        const user = await bl.get_by_id_user(type, search);
        if (user) {
            Log.info(FILE, func, user.id, 'User found');
            res.status(200).json(user);
        }
        else {
            Log.warn(FILE, func, search, 'User not found');
            res.status(404).json({ "error": `The id ${search} you specified does not exist in the system` });
        }
    } catch (error) {
        Log.error(FILE, func, search, 'Error searching user', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.userAirlineById = async (req, res) => {
    const func = 'userAirlineById';
    const user_id = parseInt(req.params.id);
    Log.info(FILE, func, user_id, 'User details request');

    try {
        const user = await bl.get_by_id_user('id', user_id);
        if (user) {
            if (user !== 'Postponed') {
                Log.info(FILE, func, user_id, 'User details found');
                res.status(200).json(user);
            }
            else {
                Log.warn(FILE, func, user_id, 'Access denied (Postponed)');
                res.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id ${user_id}` });
            }
        }
        else {
            Log.warn(FILE, func, user_id, 'User not found');
            res.status(404).json({ "error": `cannot find user with id '${user_id}'` });
        }
    }
    catch (error) {
        Log.error(FILE, func, user_id, 'Error fetching user', error);
        res.status(503).json({ "error": `The request failed, try again later '${error}'` });
    }
};

exports.createUserAirline = async (req, res) => {
    const func = 'createUserAirline';
    const new_user = req.body;
    const userIdentifier = new_user.username || new_user.email;
    
    Log.info(FILE, func, userIdentifier, 'Creating new user Airline');
    Log.debug(FILE, func, userIdentifier, `New user data: ${JSON.stringify(new_user)}`);

    try {
        const result = await bl.create_user(new_user);
        if (result.ok) {
            Log.info(FILE, func, userIdentifier, 'User Airline created successfully');
            res.status(201).json(result.ok);
        }
        else if (result === 'rejected') {
            Log.warn(FILE, func, userIdentifier, 'User Airline creation rejected - duplicate user');
            res.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` });
        }
        else {
            Log.error(FILE, func, userIdentifier, 'User Airline creation failed with unknown error');
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    } catch (error) {
        Log.error(FILE, func, userIdentifier, 'Error creating user Airline', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.updateUserAirline = async (req, res) => {
    const func = 'updateUserAirline';
    const id = req.params.id;
    Log.info(FILE, func, id, 'Updating user Airline');

    try {
        const user = await bl.get_by_id_user('id', id);
        if (user) {
            const updated = req.body;
            Log.debug(FILE, func, id, `Update data: ${JSON.stringify(updated)}`);

            const result = await bl.update_user(id, updated);
            if (result) {
                Log.info(FILE, func, id, `User Airline updated successfully with email: ${updated.email}`);
                res.status(201).json(`email ${updated.email} successfully updated`);
            }
            else {
                Log.warn(FILE, func, id, `User Airline update failed - email already exists: ${updated.email}`);
                res.status(409).json({ "error": `${updated.email} already exists` });
            }
        }
        else {
            Log.warn(FILE, func, id, 'User Airline update failed - user not found');
            res.status(404).json({ "error": `No user found with this handle '${id}'` });
        }
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error updating user Airline', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.createAirline = async (req, res) => {
    const func = 'createAirline';
    const new_airline = req.body;
    Log.info(FILE, func, null, `Creating new airline: ${new_airline.name}`);
    Log.debug(FILE, func, null, `New airline data: ${JSON.stringify(new_airline)}`);

    try {
        const result = await bl.create_airline(new_airline);
        if (result.id) {
            Log.info(FILE, func, result.id, 'Airline created successfully');
            res.status(201).json(result);
        }
        else if (result === 'rejected') {
            Log.warn(FILE, func, null, `Airline creation rejected - duplicate name or user_id: ${new_airline.name}`);
            res.status(409).json({ "error": `name ${new_airline.name} or user_id ${new_airline.user_id} exist in the system` });
        }
        else {
            Log.error(FILE, func, null, 'Airline creation failed with unknown error');
            res.status(503).json({ "error": `The request failed, try again later ${result}` });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating airline', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.airlineById = async (req, res) => {
    const func = 'airlineById';
    const airline_id = parseInt(req.params.id);
    Log.info(FILE, func, airline_id, 'Airline details request');

    try {
        const airline = await bl.get_by_id_airline(airline_id);
        if (airline) {
            Log.info(FILE, func, airline_id, 'Airline details found');
            res.status(200).json(airline);
        }
        else {
            Log.warn(FILE, func, airline_id, 'Airline not found');
            res.status(404).json({ "error": `The id ${airline_id} you specified does not exist in the system` });
        }
    } catch (error) {
        Log.error(FILE, func, airline_id, 'Error fetching airline', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.updateAirline = async (req, res) => {
    const func = 'updateAirline';
    const airline_id = parseInt(req.params.id);
    Log.info(FILE, func, airline_id, 'Updating airline');

    try {
        const airline = await bl.get_by_id_airline(airline_id);
        if (airline) {
            const updated_airline_req = req.body;
            Log.debug(FILE, func, airline_id, `Update data: ${JSON.stringify(updated_airline_req)}`);

            const result = await bl.update_airline(airline_id, updated_airline_req);
            Log.info(FILE, func, airline_id, 'Airline updated successfully');
            res.status(201).json(result);
        }
        else {
            Log.warn(FILE, func, airline_id, 'Airline update failed - airline not found');
            res.status(404).json({ "error": `The id ${airline_id} you specified does not exist in the system` });
        }
    }
    catch (error) {
        Log.error(FILE, func, airline_id, 'Error updating airline', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.flightByAirline_id = async (req, res) => {
    const func = 'flightByAirline_id';
    const airline_id = parseInt(req.params.id);
    Log.info(FILE, func, airline_id, 'Retrieving flights by airline ID');

    try {
        const flights = await bl.get_flight_by_airline_id(airline_id);
        if (flights) {
            Log.info(FILE, func, airline_id, 'Flights found');
            Log.debug(FILE, func, airline_id, `Retrieved ${flights.length} flights`);
            res.status(200).json(flights);
        }
        else {
            Log.warn(FILE, func, airline_id, 'No flights found');
            res.status(404).json({ "error": `cannot find flights for airline id ${airline_id}` });
        }
    }
    catch (error) {
        Log.error(FILE, func, airline_id, 'Error retrieving flights', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.flightById = async (req, res) => {
    const func = 'flightById';
    const flight_id = parseInt(req.params.id);
    Log.info(FILE, func, flight_id, 'Flight details request');

    try {
        const flight = await bl.get_by_id_flights(flight_id);
        if (flight) {
            Log.info(FILE, func, flight_id, 'Flight details found');
            res.status(200).json(flight);
        }
        else {
            Log.warn(FILE, func, flight_id, 'Flight not found');
            res.status(404).json({ "error": `cannot find flight with id ${flight_id}` });
        }
    } catch (error) {
        Log.error(FILE, func, flight_id, 'Error fetching flight', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.createFlight = async (req, res) => {
    const func = 'createFlight';
    const new_flight = req.body;
    Log.info(FILE, func, null, 'Creating new flight');
    Log.debug(FILE, func, null, `New flight data: ${JSON.stringify(new_flight)}`);

    try {
        const check_flight_existence = await bl.check_flight_existence(new_flight);
        Log.debug(FILE, func, null, `Flight existence check result: ${check_flight_existence}`);

        if (!check_flight_existence) {
            const result = await bl.create_new_flight(new_flight);
            if (result.id > 0) {
                Log.info(FILE, func, result.id, 'Flight created successfully');
                res.status(201).json(result);
            }
            else {
                const id = result.status === "airline_id" ? new_flight.airline_id :
                    result.status === "origin_country_id" ? new_flight.origin_country_id :
                        result.status === "destination_country_id" ? new_flight.destination_country_id :
                            result.status === "plane_id" ? new_flight.plane_id : null;

                Log.warn(FILE, func, id, `Flight creation failed - invalid ${result.status}`);
                res.status(404).json({ "error": `The ${id} you specified does not exist in the ${result.status}` });
            }
        }
        else {
            Log.warn(FILE, func, null, 'Flight creation failed - duplicate flight');
            res.status(409).json({ "error": "The flight you want already exists" });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating flight', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.updateFlight = async (req, res) => {
    const func = 'updateFlight';
    const flight_id = parseInt(req.params.id);
    Log.info(FILE, func, flight_id, 'Updating flight');

    try {
        const flight = await bl.get_by_id_flights(flight_id);
        const update_flight = req.body;
        Log.debug(FILE, func, flight_id, `Update data: ${JSON.stringify(update_flight)}`);

        let result = null;
        if (flight) {
            result = await bl.update_flight(flight_id, update_flight);
            Log.debug(FILE, func, flight_id, `Flight update result status: ${result.status}`);

            if (result.status === "OK") {
                Log.info(FILE, func, flight_id, 'Flight updated successfully');
                res.status(200).json({ id: flight_id, ...update_flight });
            }
            else if (result.status === "some") {
                Log.warn(FILE, func, flight_id, `Flight update failed - invalid data: ${JSON.stringify(update_flight)}`);
                res.status(404).json({ "error": `The id ${update_flight} you specified does not exist in the ${result.status}` });
            }
            else if (["plane_id", "origin_country_id", "destination_country_id", "airline_id"].includes(result.status)) {
                let id = result.status === "plane_id" ? update_flight.plane_id :
                    result.status === "origin_country_id" ? update_flight.origin_country_id :
                        result.status === "destination_country_id" ? update_flight.destination_country_id :
                            result.status === "airline_id" ? update_flight.airline_id : null;

                Log.warn(FILE, func, id, `Flight update failed - invalid ${result.status}`);
                res.status(404).json({ "error": `The id ${id} you specified does not exist in the ${result.status}` });
            }
            else if (result.status == "exists") {
                Log.warn(FILE, func, flight_id, 'Flight update failed - duplicate flight');
                res.status(409).json({ "error": "The flight you want already exists" });
            }
        }
        else {
            Log.warn(FILE, func, flight_id, 'Flight update failed - flight not found');
            res.status(404).json({ "error": `The id ${flight_id} you specified does not exist in the system` });
        }
    }
    catch (error) {
        Log.error(FILE, func, flight_id, 'Error updating flight', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.deleteFlight = async (req, res) => {
    const func = 'deleteFlight';
    const flight_id = parseInt(req.params.id);
    Log.info(FILE, func, flight_id, 'Deleting flight');

    try {
        const flight = await bl.get_by_id_flights(flight_id);
        Log.debug(FILE, func, flight_id, `Flight existence check: ${!!flight}`);

        if (flight) {
            const result = await bl.delete_flight(flight_id);
            Log.info(FILE, func, flight_id, 'Flight deleted successfully');
            res.status(204).json(`flight id: ${flight_id} deleted successfully`);
        }
        else {
            Log.warn(FILE, func, flight_id, 'Flight deletion failed - flight not found');
            res.status(404).json({ "error": `The ID ${flight_id} you specified does not exist` });
        }
    }
    catch (error) {
        Log.error(FILE, func, flight_id, 'Error deleting flight', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};