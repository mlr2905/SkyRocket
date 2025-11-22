const dal_0 = require('../dals/dal_all_tables');
const dal_1 = require('../dals/dal_table_users');
const dal_3 = require('../dals/dal_table_airlines');
const dal_4 = require('../dals/dal_table_customers');
const dal_5 = require('../dals/dal_table_flights');
const dal_6 = require('../dals/dal_table_tickets');
const dal_7 = require('../dals/dal_table_passengers');
const Log = require('../logger/logManager');

const FILE = 'bl_role_admins';

Log.info(FILE, 'init', null, 'Role Admins BL module initialized');

// --- Users Functions ---

async function create_user_role1(user) {
    const func = 'create_user_role1';
    Log.info(FILE, func, user.username, 'Attempting to create user with role 1');

    const user_name = await dal_1.get_by_name(user.username);
    if (user_name === undefined) {
        try {
            Log.info(FILE, func, user.username, 'Username is available, proceeding with creation (role 1)');
            const new_user = await dal_1.new_user_role1(user);
            
            if (new_user.length === 8) {
                Log.info(FILE, func, user.username, 'User created successfully with generated password');
                return { 'OK': `'${user.username}' successfully created, This is the generated password, '${new_user}'` };
            }
            if (new_user === true) {
                Log.info(FILE, func, user.username, 'User created successfully');
                return { 'OK': `'${user.username}' successfully created` };
            }
            
            Log.warn(FILE, func, user.username, 'Unexpected result when creating user');
            return new_user;
        }
        catch (error) {
            Log.error(FILE, func, user.username, 'Error creating user', error);
            return error;
        }
    }
    else {
        Log.warn(FILE, func, user.username, 'Username already exists, creation rejected');
        return 'rejected';
    }
}

async function create_user_role2(user) {
    const func = 'create_user_role2';
    Log.info(FILE, func, user.username, 'Attempting to create user with role 2');

    const user_name = await dal_1.get_by_name(user.username);
    if (user_name === undefined) {
        try {
            Log.info(FILE, func, user.username, 'Username is available, proceeding with creation (role 2)');
            const new_user = await dal_1.new_user_role2(user);
            
            if (new_user.length === 8) {
                Log.info(FILE, func, user.username, 'User created successfully with generated password');
                return { 'OK': `'${user.username}' successfully created, This is the generated password, '${new_user}'` };
            }
            if (new_user === true) {
                Log.info(FILE, func, user.username, 'User created successfully');
                return { 'OK': `'${user.username}' successfully created` };
            }
            
            Log.warn(FILE, func, user.username, 'Unexpected result when creating user');
            return new_user;
        }
        catch (error) {
            Log.error(FILE, func, user.username, 'Error creating user', error);
            return error;
        }
    }
    else {
        Log.warn(FILE, func, user.username, 'Username already exists, creation rejected');
        return 'rejected';
    }
}

async function get_by_id_user(type, id) {
    const func = 'get_by_id_user';
    Log.info(FILE, func, id, `Getting user by ${type ? type : 'id'}`);
    
    try {
        let user_id = null;
        if (id === undefined) {
            Log.warn(FILE, func, null, 'Called with undefined id');
            user_id = await dal_1.get_by_id(id);
        }
        else {
            user_id = await dal_1.get_by_id_type(type, id);
        }

        if (user_id) {
            if (user_id.role_id === 2) {
                Log.info(FILE, func, user_id.id, 'Successfully retrieved user');
                return user_id;
            }
            else {
                Log.warn(FILE, func, user_id.id, `User has invalid role_id: ${user_id.role_id}, status: Postponed`);
                return 'Postponed';
            }
        }
        else {
            Log.warn(FILE, func, id, 'No user found');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving user', error);
        return error;
    }
}

async function get_qr(id) {
    const func = 'get_qr';
    Log.info(FILE, func, id, 'Getting QR');
    
    try {
        const user_id = await dal_0.get_qr(id);
        if (user_id) {
            Log.info(FILE, func, id, 'Successfully retrieved QR');
        } else {
            Log.warn(FILE, func, id, 'No QR found');
        }
        return user_id;
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving QR', error);
        return error;
    }
}

async function update_user(id, user) {
    const func = 'update_user';
    Log.info(FILE, func, id, 'Attempting to update user');
    
    try {
        const user_id = await dal_1.get_by_id('id', id);
        if (user_id) {
            Log.info(FILE, func, id, `Found user ${user_id.username}, proceeding with update`);
            const update_user = await dal_1.update_user(id, user);
            Log.info(FILE, func, id, `User ${user_id.username} updated successfully`);
            return { 'ok': `${user_id.username}${update_user}` };
        }
        else {
            Log.warn(FILE, func, id, 'No user found, update aborted');
            return user_id;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating user', error);
        return error;
    }
}

async function delete_account(id) {
    const func = 'delete_account';
    Log.info(FILE, func, id, 'Attempting to delete account');
    
    try {
        const user_id = await dal_1.get_by_id('id', id);
        if (user_id) {
            Log.info(FILE, func, id, `Found user ${user_id.username}, proceeding with deletion`);
            const delete_user = await dal_1.delete_user(id);
            Log.info(FILE, func, id, `User ${user_id.username} deleted successfully`);
            return `User '${user_id.username}' deleted successfully `;
        }
        else {
            Log.warn(FILE, func, id, 'No user found, deletion aborted');
            return `The ID ${id} you specified does not exist`;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting account', error);
        return error;
    }
}

// --- Airline Functions ---

async function create_airline(airline) {
    const func = 'create_airline';
    Log.info(FILE, func, null, `Attempting to create airline: ${airline.name}`);
    
    try {
        const user_name = await dal_3.get_by_name(airline.name);
        if (user_name === undefined) {
            Log.info(FILE, func, null, `Airline name ${airline.name} is available, proceeding`);
            const new_user = await dal_3.new_airline(airline);
            Log.info(FILE, func, new_user.id, `Airline ${airline.name} created successfully`);
            return new_user;
        }
        else {
            Log.warn(FILE, func, null, `Airline name ${airline.name} already exists, creation rejected`);
            return 'rejected';
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating airline', error);
        return error;
    }
}

async function get_by_id_airline(id) {
    const func = 'get_by_id_airline';
    Log.info(FILE, func, id, 'Getting airline by id');
    
    try {
        const user_id = await dal_3.get_by_id(id);
        if (user_id) {
            Log.info(FILE, func, id, 'Successfully retrieved airline');
        } else {
            Log.warn(FILE, func, id, 'No airline found');
        }
        return user_id;
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving airline', error);
        return error;
    }
}

async function update_airline(id, update_airline_data) {
    const func = 'update_airline';
    Log.info(FILE, func, id, 'Attempting to update airline');
    
    try {
        const user_id = await dal_3.get_by_id(id);
        if (user_id) {
            Log.info(FILE, func, id, `Found airline ${user_id.name}, proceeding with update`);
            const update_user = await dal_3.update_airline(id, update_airline_data);
            Log.info(FILE, func, id, `Airline ${user_id.name} updated successfully`);
            return `${user_id.name}${update_user}`;
        }
        else {
            Log.error(FILE, func, id, 'The airline ID does not exist');
            return { error: 'The ID you specified does not exist' };
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating airline', error);
        return error;
    }
}

// --- Customer Functions ---

async function new_customer(new_cus) {
    const func = 'new_customer';
    const cardLast4 = new_cus.credit_card_no ? new_cus.credit_card_no.substring(0, 4) + 'XXXX' : 'N/A';
    Log.info(FILE, func, null, `Attempting to create new customer with credit card: ${cardLast4}`);
    
    try {
        const Credit_check = await dal_4.credit_check(new_cus.credit_card_no);
        if (!Credit_check) {
            Log.info(FILE, func, null, 'Credit card validated, proceeding');
            const new_customer = await dal_4.new_customer(new_cus);
            if (new_customer) {
                Log.info(FILE, func, new_customer.id, 'Customer created successfully');
                return new_cus;
            } else {
                Log.warn(FILE, func, null, 'Failed to create customer');
                return false;
            }
        }
        else {
            Log.warn(FILE, func, null, `Invalid credit card number ${cardLast4}, creation rejected`);
            return `Invalid credit card number ${new_cus.credit_card_no} `;
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating new customer', error);
        return error;
    }
}

async function get_by_id_customer(id) {
    const func = 'get_by_id_customer';
    Log.info(FILE, func, id, 'Getting customer by id');
    
    try {
        const user_id = await dal_4.get_by_id(id);
        if (user_id) {
            Log.info(FILE, func, id, 'Successfully retrieved customer');
        } else {
            Log.warn(FILE, func, id, 'No customer found');
        }
        return user_id;
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving customer', error);
        return error;
    }
}

async function update_customer(id, update) {
    const func = 'update_customer';
    Log.info(FILE, func, id, 'Attempting to update customer');
    
    try {
        const get_by_id = await dal_4.get_by_id(id);
        if (get_by_id) {
            Log.info(FILE, func, id, 'Found customer, proceeding with update');
            const update_customer = await dal_4.update_customer(id, update);
            Log.info(FILE, func, id, 'Customer updated successfully');
            return `${get_by_id.id}${update_customer}`;
        }
        else {
            Log.error(FILE, func, id, 'The customer ID does not exist');
            return { error: 'Customer not found' };
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating customer', error);
        return error;
    }
}

// --- Flights Functions ---

async function get_all_flights(id) {
    const func = 'get_all_flights';
    Log.info(FILE, func, id, `Getting all flights${id ? ' for id' : ''}`);
    
    try {
        const flights = await dal_5.get_all(id);
        Log.info(FILE, func, id, `Successfully retrieved ${flights ? flights.length : 0} flights`);
        return flights;
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error retrieving all flights', error);
        return error;
    }
}

async function get_by_id_flights(id) {
    const func = 'get_by_id_flights';
    Log.info(FILE, func, id, 'Getting flight by id');
    
    try {
        const get_by_id = await dal_5.get_by_id(id);
        if (get_by_id) {
            Log.info(FILE, func, id, 'Successfully retrieved flight');
            return get_by_id;
        } else {
            Log.warn(FILE, func, id, 'No flight found');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving flight', error);
        return error;
    }
}

async function get_flight_by_airline_id(id) {
    const func = 'get_flight_by_airline_id';
    Log.info(FILE, func, id, 'Getting flights by airline id');
    
    try {
        const get_by_id = await dal_5.get_flight_by_airline_id(id);
        if (get_by_id) {
            Log.info(FILE, func, id, 'Successfully retrieved flights');
            return get_by_id;
        } else {
            Log.error(FILE, func, id, 'No flights found for airline id');
            return { error: 'The hand does not exist in Bella' };
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving flights', error);
        return error;
    }
}

async function check_flight_existence(v) {
    const func = 'check_flight_existence';
    Log.info(FILE, func, null, `Checking flight existence: ${JSON.stringify(v)}`);
    
    try {
        const result = await dal_5.check_flight_existence(v);
        Log.info(FILE, func, null, `Flight existence check result: ${result}`);
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error checking flight existence', error);
        return error;
    }
}

async function flights_records_tables(v) {
    const func = 'flights_records_tables';
    Log.info(FILE, func, null, `Validating flight records: ${JSON.stringify(v)}`);
    
    try {
        const result = await dal_5.flights_records_tables(v);
        Log.info(FILE, func, null, `Flight records validation result: ${JSON.stringify(result)}`);
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error validating flight records', error);
        return error;
    }
}

async function create_new_flight(flights) {
    const func = 'create_new_flight';
    Log.info(FILE, func, null, `Attempting to create new flight: ${JSON.stringify(flights)}`);
    
    try {
        const check = await dal_5.flights_records_tables(flights);
        Log.info(FILE, func, null, `Validation check: ${JSON.stringify(check)}`);
        
        if (check.status === "correct") {
            Log.info(FILE, func, null, "Flight validation passed, proceeding with creation");
            const new_flights = await dal_5.new_flight(flights);
            Log.info(FILE, func, new_flights.id, 'Flight created successfully');
            return new_flights;
        }
        else if (check.status !== "correct") {
            Log.warn(FILE, func, null, `Flight validation failed: ${JSON.stringify(check)}`);
            return check;
        }
        else {
            Log.error(FILE, func, null, `Unexpected validation result: ${check}`);
            return { "error": `${check}` };
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating new flight', error);
        return error;
    }
}

async function update_flight(id, v) {
    const func = 'update_flight';
    Log.info(FILE, func, id, `Attempting to update flight: ${JSON.stringify(v)}`);
    
    try {
        const check1 = await dal_5.check_flight_existence(v);
        Log.info(FILE, func, id, `Existence check: ${check1}`);
        
        const check2 = await dal_5.flights_records_tables(v);
        Log.info(FILE, func, id, `Records validation: ${JSON.stringify(check2)}`);
        
        if (check1 === false && check2.status === "correct") {
            Log.info(FILE, func, id, "Validation passed, proceeding with update");
            const update = await dal_5.update_flight(id, v);
            
            if (update.airline_id > 0) {
                Log.info(FILE, func, id, 'Flight updated successfully');
                return { "status": "OK" };
            }
            else {
                Log.error(FILE, func, id, `Failed to update flight: ${JSON.stringify(update)}`);
                return { "error": `Please refer to the following error:${update}` };
            }
        }
        else if (check1 === true) {
            Log.warn(FILE, func, id, 'Flight already exists, update rejected');
            return { "status": "exists" };
        }
        else if (check2.status !== "correct") {
            Log.warn(FILE, func, id, `Flight validation failed: ${JSON.stringify(check2)}`);
            return check2;
        }
        else {
            Log.error(FILE, func, id, `Multiple validation issues: ${check1} and ${check2}`);
            return { "error": `${check1} and${check2}` };
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating flight', error);
        return error;
    }
}

async function delete_flight(id) {
    const func = 'delete_flight';
    Log.info(FILE, func, id, 'Attempting to delete flight');
    
    try {
        const delete_flight = await dal_5.delete_flight(id);
        if (delete_flight) {
            Log.info(FILE, func, id, 'Flight deleted successfully');
            return true;
        }
        else {
            Log.warn(FILE, func, id, 'Failed to delete flight');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting flight', error);
        return error;
    }
}

// --- Tickets Functions ---

async function get_by_id_ticket(id) {
    const func = 'get_by_id_ticket';
    Log.info(FILE, func, id, 'Getting ticket by id');
    
    try {
        const user_id = await dal_6.get_by_id(id);
        if (user_id) {
            Log.info(FILE, func, id, 'Successfully retrieved ticket');
        } else {
            Log.warn(FILE, func, id, 'No ticket found');
        }
        return user_id;
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving ticket', error);
        return error;
    }
}

// --- Passenger Functions ---

async function new_passenger(new_p) {
    const func = 'new_passenger';
    Log.info(FILE, func, null, `Attempting to create new passenger: ${JSON.stringify(new_p)}`);
    
    try {
        const new_passenger = await dal_7.new_passenger(new_p);
        Log.info(FILE, func, new_passenger.id, 'Passenger created successfully');
        return new_passenger;
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error creating new passenger', error);
        return error;
    }
}

async function get_by_id_passenger(id) {
    const func = 'get_by_id_passenger';
    Log.info(FILE, func, id, 'Getting passenger by id');
    
    try {
        const passenger_id = await dal_7.get_by_id_passenger(id);
        if (passenger_id) {
            Log.info(FILE, func, id, 'Successfully retrieved passenger');
        } else {
            Log.warn(FILE, func, id, 'No passenger found');
        }
        return passenger_id;
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving passenger', error);
        return error;
    }
}

async function purchase_ticket(new_ticket, test) {
    const func = 'purchase_ticket';
    Log.info(FILE, func, new_ticket.flight_id, `Attempting to purchase ticket (Test mode: ${test !== undefined})`);
    
    try {
        const flight = await dal_5.get_by_id(new_ticket.flight_id);
        if (flight) {
            Log.info(FILE, func, flight.id, `Found flight with ${flight.remaining_tickets} remaining tickets`);
            
            if (flight.remaining_tickets > 0) {
                const id = parseInt(flight.id);
                if (test === undefined) {
                    Log.info(FILE, func, id, 'Updating remaining tickets count');
                    await dal_5.update_remaining_tickets(id);
                } else {
                    Log.info(FILE, func, id, 'Test mode: skipping ticket count update');
                }
                
                const result = await dal_6.new_ticket(new_ticket);
                Log.info(FILE, func, id, 'Ticket purchased successfully');
                return result;
            }
            else {
                Log.warn(FILE, func, flight.id, 'No tickets left, purchase rejected');
                return Error('no tickets left');
            }
        }
        else {
            Log.error(FILE, func, new_ticket.flight_id, 'Flight does not exist, purchase rejected');
            throw Error('flight does not exist');
        }
    }
    catch (error) {
        Log.error(FILE, func, new_ticket.flight_id, 'Error purchasing ticket', error);
        return error;
    }
}

module.exports = {
    purchase_ticket,
    create_user_role1, 
    create_user_role2, 
    get_by_id_flights, 
    get_all_flights, 
    update_user, 
    get_by_id_user,
    delete_account, 
    new_customer, 
    get_by_id_customer, 
    update_customer, 
    get_by_id_ticket, 
    get_by_id_passenger, 
    new_passenger, 
    get_qr,
    get_by_id_user, 
    update_user, 
    create_airline, 
    get_by_id_airline, 
    flights_records_tables, 
    update_airline, 
    get_flight_by_airline_id,
    get_by_id_flights, 
    check_flight_existence, 
    create_new_flight, 
    update_flight, 
    delete_flight
};