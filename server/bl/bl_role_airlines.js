const dal_0 = require('../dals/dal_all_tables');
const dal_1 = require('../dals/dal_table_users');
const dal_3 = require('../dals/dal_table_airlines');
const dal_5 = require('../dals/dal_table_flights');
const Log = require('../logger/logManager');

const FILE = 'bl_role_airlines';

Log.info(FILE, 'init', null, 'Role Airlines BL module initialized');

// --- Users Functions ---

async function create_user(user) {
    const func = 'create_user';
    Log.info(FILE, func, user.username, 'Attempting to create user');

    try {
        const user_name = await dal_1.get_by_name(user.username);
        
        if (user_name === undefined) {
            Log.info(FILE, func, user.username, 'Username is available, proceeding with creation');
            
            const new_user = await dal_1.new_user_role2(user);
            
            if (typeof new_user === 'string' && new_user.length === 8) {
                Log.info(FILE, func, user.username, 'User created successfully with generated password');
                return { 'OK': `'${user.username}' successfully created, This is the generated password, '${new_user}'` };
            }
            
            if (new_user === true) {
                Log.info(FILE, func, user.username, 'User created successfully');
                return { 'OK': `'${user.username}' successfully created` };
            }
            
            Log.warn(FILE, func, user.username, 'Unexpected result when creating user');
            return new_user;
        } else {
            Log.warn(FILE, func, user.username, 'Username already exists, creation rejected');
            return 'rejected';
        }
    } catch (error) {
        Log.error(FILE, func, user.username, 'Error creating user', error);
        return error;
    }
}

async function get_by_id_user(type, id) {
    const func = 'get_by_id_user';
    Log.info(FILE, func, id, `Getting user by ${type ? 'type (' + type + ') and' : ''} id`);
    
    let user_id = null;
    try {
        if (id === undefined) {
            Log.warn(FILE, func, null, 'Called with undefined id');
            user_id = await dal_1.get_by_id(id);
        } else {
            user_id = await dal_1.get_by_id_type(type, id);
        }

        if (user_id) {
            if (user_id.role_id === 2) {
                Log.info(FILE, func, user_id.id, 'Successfully retrieved user');
                return user_id;
            } else {
                Log.warn(FILE, func, user_id.id, `User has invalid role_id: ${user_id.role_id}, status: Postponed`);
                return 'Postponed';
            }
        } else {
            Log.warn(FILE, func, id, 'No user found');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving user', error);
        return error;
    }
}

async function update_user(id, user) {
    const func = 'update_user';
    Log.info(FILE, func, id, 'Attempting to update user');
    
    try {
        const result = await dal_1.update_user(id, user);
        Log.info(FILE, func, id, 'User updated successfully');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating user', error);
        return;
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
        } else {
            Log.warn(FILE, func, null, `Airline name ${airline.name} already exists, creation rejected`);
            return 'rejected';
        }
    } catch (error) {
        Log.error(FILE, func, null, `Error creating airline ${airline.name}`, error);
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
        } else {
            Log.error(FILE, func, id, 'The airline ID does not exist');
            // removed console.error to stick to Log pattern
            return { error: 'The ID you specified does not exist' };
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating airline', error);
        return error;
    }
}

// --- Flights Functions ---

async function get_by_id_flights(id) {
    const func = 'get_by_id_flights';
    Log.info(FILE, func, id, 'Getting flight by id');
    
    try {
        const flight = await dal_5.get_by_id(id);
        if (flight) {
            Log.info(FILE, func, id, 'Successfully retrieved flight');
            return flight;
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
        const flights = await dal_5.get_flight_by_airline_id(id);
        if (flights) {
            Log.info(FILE, func, id, 'Successfully retrieved flights');
            return flights;
        } else {
            Log.error(FILE, func, id, 'No flights found for airline id');
            return { error: 'The hand does not exist in Bella' }; 
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving flights for airline id', error);
        return error;
    }
}

async function check_flight_existence(v) {
    const func = 'check_flight_existence';
    Log.info(FILE, func, null, `Checking flight existence for: ${JSON.stringify(v)}`);
    
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
            Log.info(FILE, func, new_flights.id, `Flight created successfully`);
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
            } else {
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
        const result = await dal_5.delete_flight(id);
        if (result) {
            Log.info(FILE, func, id, 'Flight deleted successfully');
            return true;
        } else {
            Log.warn(FILE, func, id, 'Failed to delete flight');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting flight', error);
        return error;
    }
}

module.exports = {
    create_user, 
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