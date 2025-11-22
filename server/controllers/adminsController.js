const bl = require('../bl/bl_role_admins');
const Log = require('../logger/logManager'); // שינוי: שימוש במנהל הלוגים

const FILE = 'adminsController';

exports.usersSearch = async (req, res) => {
    const func = 'usersSearch';
    const query = req.query;
    const email = query.email;
    const username = query.username;
    const password = query.password;
    const id = query.id;
    let search = email ? email : username ? username : password ? password : id;
    let type = search !== undefined ? (search === email ? "email" : search === username ? "username" : search === password ? "password" : "id") : undefined;
    
    Log.info(FILE, func, search, `Admin user search request by ${type}`);
    Log.debug(FILE, func, search, `Query parameters: ${JSON.stringify(query)}`);

    try {
        const user = await bl.get_by_id_user(type, search);
        if (user) {
            if (user !== 'Postponed') {
                Log.info(FILE, func, user.id, `User found for ${type}`);
                res.status(200).json(user);
            }
            else {
                Log.warn(FILE, func, search, 'Access denied (Postponed)');
                res.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id` });
            }
        }
        else {
            Log.warn(FILE, func, search, 'User not found');
            res.status(404).json({ "error": `Cannot find user with ${type}: ${search}` });
        }
    }
    catch (error) {
        Log.error(FILE, func, search, 'Error searching user', error);
        res.status(503).json({ "error": `The request failed, try again later '${error}'` });
    }
};

exports.userById = async (req, res) => {
    const func = 'userById';
    const user_id = parseInt(req.params.id);
    Log.info(FILE, func, user_id, 'Admin user details request');
    
    try {
        const user = await bl.get_by_id_user('id', user_id);
        if (user) {
            if (user !== 'Postponed') {
                Log.info(FILE, func, user_id, 'User details found');
                res.status(200).json(user);
            }
            else {
                Log.warn(FILE, func, user_id, 'Access denied (Postponed)');
                res.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id '${user_id}'` });
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

exports.CreatUser  = async (req, res) => {
    const func = 'CreatUser';
    const new_user = req.body;
    Log.info(FILE, func, null, 'Creating new user with role 1');
    Log.debug(FILE, func, null, `New user data: ${JSON.stringify(new_user)}`);
    
    try {
        const result = await bl.create_user_role1(new_user);
        if (result.ok) {
            Log.info(FILE, func, null, `Role 1 user created successfully: ${new_user.username || new_user.email}`);
            res.status(201).json(result);
        }
        else if (result === 'rejected') {
            Log.warn(FILE, func, null, `Role 1 user creation rejected - duplicate user: ${new_user.username || new_user.email}`);
            res.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` });
        }
        else {
            Log.error(FILE, func, null, 'Role 1 user creation failed with unknown error');
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating role 1 user', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.CreatUserAirline = async (req, res) => {
    const func = 'CreatUserAirline';
    const new_user = req.body;
    Log.info(FILE, func, null, 'Creating new user with role 2');
    Log.debug(FILE, func, null, `New user data: ${JSON.stringify(new_user)}`);
    
    try {
        const result = await bl.create_user_role2(new_user);
        if (result.ok) {
            Log.info(FILE, func, null, `Role 2 user created successfully: ${new_user.username || new_user.email}`);
            res.status(201).json(result.ok);
        }
        else if (result === 'rejected') {
            Log.warn(FILE, func, null, `Role 2 user creation rejected - duplicate user: ${new_user.username || new_user.email}`);
            res.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` });
        }
        else {
            Log.error(FILE, func, null, 'Role 2 user creation failed with unknown error');
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating role 2 user', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.updateUser = async (req, res) => {
    const func = 'updateUser';
    const user_id = parseInt(req.params.id);
    Log.info(FILE, func, user_id, 'Updating user');
    
    try {
        const user = await bl.get_by_id_user('id', user_id);
        if (user) {
            const updated_user_req = req.body;
            Log.debug(FILE, func, user_id, `Update data: ${JSON.stringify(updated_user_req)}`);
            
            const result = await bl.update_user(user_id, updated_user_req);
            if (result) {
                Log.info(FILE, func, user_id, 'User updated successfully');
                res.status(201).json(result);
            }
            else {
                Log.warn(FILE, func, user_id, `User update failed - email already exists: ${updated_user_req.email}`);
                res.status(409).json({ "error": `${updated_user_req.email} already exists` });
            }
        }
        else {
            Log.warn(FILE, func, user_id, 'User update failed - user not found');
            res.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` });
            return;
        }
    }
    catch (error) {
        Log.error(FILE, func, user_id, 'Error updating user', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.deleteUser = async (req, res) => {
    const func = 'deleteUser';
    const user_id = parseInt(req.params.id);
    Log.info(FILE, func, user_id, 'Deleting user');
    
    try {
        const user = await bl.get_by_id_user(user_id);
        
        if (user) {
            Log.debug(FILE, func, user_id, 'User found for deletion');
            const result = await bl.delete_account(user_id);
            Log.info(FILE, func, user_id, 'User deleted successfully');
            res.status(204).json({ result });
        }
        else {
            Log.warn(FILE, func, user_id, 'User deletion failed - user not found');
            res.status(404).json({ "error": `The ID ${user_id} you specified does not exist ` });
        }
    }
    catch (error) {
        Log.error(FILE, func, user_id, 'Error deleting user', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.createAirline = async (req, res) => {
    const func = 'createAirline';
    const new_airline = req.body;
    Log.info(FILE, func, null, 'Admin creating new airline');
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
    Log.info(FILE, func, airline_id, 'Admin airline details request');
    
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
    Log.info(FILE, func, airline_id, 'Admin updating airline');
    
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

exports.customersById = async (req, res) => {
    const func = 'customersById';
    const customer_id = parseInt(req.params.id);
    Log.info(FILE, func, customer_id, 'Admin customer details request');
    
    try {
        const customer = await bl.get_by_id_customer(customer_id);
        if (customer) {
            Log.info(FILE, func, customer_id, 'Customer details found');
            res.status(200).json(customer);
        }
        else {
            Log.warn(FILE, func, customer_id, 'Customer not found');
            res.status(404).json({ "error": `cannot find customer with id ${customer_id}` });
        }
    }
    catch (error) {
        Log.error(FILE, func, customer_id, 'Error fetching customer', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.createCustomer = async (req, res) => {
    const func = 'createCustomer';
    const new_customer = req.body;
    Log.info(FILE, func, null, 'Admin creating new customer');
    Log.debug(FILE, func, null, `New customer data: ${JSON.stringify(new_customer)}`);
    
    try {
        const result = await bl.new_customer(new_customer);
        if (result) { 
            Log.info(FILE, func, null, 'Customer created successfully');
            res.status(201).json(result);
        }
        else {
            Log.warn(FILE, func, null, 'Customer creation failed - duplicate customer');
            res.status(409).json({ "error": `There is a customer with the details I mentioned` });
        }
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error creating customer', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.updateCustomer = async (req, res) => {
    const func = 'updateCustomer';
    const customer_id = parseInt(req.params.id);
    Log.info(FILE, func, customer_id, 'Admin updating customer');
    
    try {
        const updated_customer_req = req.body;
        Log.debug(FILE, func, customer_id, `Update data: ${JSON.stringify(updated_customer_req)}`);
        
        const result = await bl.update_customer(customer_id, updated_customer_req);
        Log.info(FILE, func, customer_id, 'Customer updated successfully');
        res.json(updated_customer_req);
    }
    catch (error) {
        Log.error(FILE, func, customer_id, 'Error updating customer', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.get_all_flights = async (req, res) => {
    const func = 'get_all_flights';
    Log.info(FILE, func, null, 'Admin retrieving all flights');
    
    try {
        const flights = await bl.get_all_flights();
        Log.debug(FILE, func, null, `Retrieved ${flights.length} flights`);
        res.json(flights);
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all flights', error);
        res.json({ 'error': JSON.stringify(error) });
    }
};

exports.flightByAirline_id = async (req, res) => {
    const func = 'flightByAirline_id';
    const airline_id = parseInt(req.params.id);
    Log.info(FILE, func, airline_id, 'Admin retrieving flights by airline ID');
    
    try {
        const flights = await bl.get_flight_by_airline_id(airline_id);
        if (flights) {
            Log.info(FILE, func, airline_id, 'Flights found');
            Log.debug(FILE, func, airline_id, `Retrieved ${flights.length} flights`);
            res.status(200).json(flights);
        }
        else {
            Log.warn(FILE, func, airline_id, 'No flights found');
            res.status(404).json({ "error": `Cannot find flights for airline id ${airline_id}` });
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
    Log.info(FILE, func, flight_id, 'Admin flight details request');
    
    try {
        const flight = await bl.get_by_id_flights(flight_id);
        if (flight) {
            Log.info(FILE, func, flight_id, 'Flight details found');
            res.status(200).json(flight);
        }
        else {
            Log.warn(FILE, func, flight_id, 'Flight not found');
            res.status(404).json({ "error": `Cannot find flight with id ${flight_id}` });
        }
    } catch (error) {
        Log.error(FILE, func, flight_id, 'Error fetching flight', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.createFlight = async (req, res) => {
    const func = 'createFlight';
    const new_flight = req.body;
    Log.info(FILE, func, null, 'Admin creating new flight');
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
    Log.info(FILE, func, flight_id, 'Admin updating flight');
    
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
    Log.info(FILE, func, flight_id, 'Admin deleting flight');
    
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

exports.createTicket = async (req, res) => {
    const func = 'createTicket';
    const new_ticket = req.body;
    Log.info(FILE, func, null, 'Admin creating new ticket');
    Log.debug(FILE, func, null, `New ticket data: ${JSON.stringify(new_ticket)}`);
    
    try {
        const result = await bl.purchase_ticket(new_ticket);
        Log.info(FILE, func, null, 'Ticket purchased successfully');
        res.status(201).json(result);
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error purchasing ticket', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.createPassenger = async (req, res) => {
    const func = 'createPassenger';
    const new_passenger = req.body;
    Log.info(FILE, func, null, 'Admin creating new passenger');
    Log.debug(FILE, func, null, `New passenger data: ${JSON.stringify(new_passenger)}`);
    
    try {
        const result = await bl.new_passenger(new_passenger);
        Log.info(FILE, func, null, 'Passenger created successfully');
        res.status(201).json(result);
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error creating passenger', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.PassengerById = async (req, res) => {
    const func = 'PassengerById';
    const passenger_id = parseInt(req.params.id);
    Log.info(FILE, func, passenger_id, 'Admin passenger details request');
    
    try {
        const passenger = await bl.get_by_id_passenger(passenger_id);
        if (passenger) {
            Log.info(FILE, func, passenger_id, 'Passenger details found');
            res.status(200).json(passenger);
        }
        else {
            Log.warn(FILE, func, passenger_id, 'Passenger not found');
            res.status(404).json({ "error": `cannot find passenger with id ${passenger_id}` });
        }
    }
    catch (error) {
        Log.error(FILE, func, passenger_id, 'Error fetching passenger', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};