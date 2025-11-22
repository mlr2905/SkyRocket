const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_airlines';

Log.info(FILE, 'init', null, 'Airlines DAL module initialized');

async function new_airline(newAirline) {
    const func = 'new_airline';
    Log.info(FILE, func, null, 'Creating new airline');
    Log.debug(FILE, func, null, `Data: ${JSON.stringify(newAirline)}`);
    
    try {
        const result = await connectedKnex('airlines').insert(newAirline).returning('*');
        Log.info(FILE, func, result[0].id, `Airline created: ${result[0].name}`);
        return result[0];
    } catch (error) {
        Log.error(FILE, func, null, 'Failed to add new airline', error);
        throw new Error(`Failed to add new airline: ${error.message}`);
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up airline by ID');
    
    try {
        const airline = await connectedKnex('airlines')
            .select('airlines.*', 'countries.country_name', 'users.username as user_name')
            .leftJoin('users', 'users.id', '=', 'airlines.user_id')
            .leftJoin('countries', 'countries.id', '=', 'airlines.country_id')
            .where('airlines.id', id)
            .first();
        
        if (airline) {
            Log.debug(FILE, func, id, `Airline found: ${airline.name}`);
            return airline;
        } else {
            Log.debug(FILE, func, id, 'No airline found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Failed to fetch airline', error);
        throw new Error(`Failed to fetch airline by ID: ${error.message}`);
    }
}

async function update_airline(id, updatedAirline) {
    const func = 'update_airline';
    Log.info(FILE, func, id, 'Updating airline');
    Log.debug(FILE, func, id, `Update data: ${JSON.stringify(updatedAirline)}`);

    try {
        const airline = await connectedKnex('airlines').select('id', 'name').where('id', id).first();
        
        if (!airline) {
            Log.warn(FILE, func, id, 'Airline update failed - airline not found');
            return 0;
        }
        
        const result = await connectedKnex('airlines').where('id', id).update(updatedAirline);
        
        if (result) {
            Log.info(FILE, func, id, `Airline updated successfully`);
            return result;
        } else {
            Log.warn(FILE, func, id, 'Airline update failed - no rows affected');
            return 0;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Failed to update airline', error);
        throw new Error(`Failed to update airline: ${error.message}`);
    }
}

async function delete_airline(id) {
    const func = 'delete_airline';
    Log.info(FILE, func, id, 'Deleting airline');
    
    try {
        const airline = await connectedKnex('airlines').select('id', 'name').where('id', id).first();
        
        if (!airline) {
            Log.warn(FILE, func, id, 'Airline deletion failed - not found');
            return 0;
        }
        
        const result = await connectedKnex('airlines').where('id', id).del();
        
        if (result) {
            Log.info(FILE, func, id, 'Airline deleted successfully');
            return result;
        } else {
            Log.warn(FILE, func, id, 'Deletion failed - no rows affected');
            return 0;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Failed to delete airline', error);
        throw new Error(`Failed to delete airline: ${error.message}`);
    }
}

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all airlines');
    
    try {
        const result = await connectedKnex.raw(`SELECT get_all_airlines();`);
        const airlinesCount = result.rows[0].get_all_airlines ? result.rows[0].get_all_airlines.length : 0;
        Log.debug(FILE, func, null, `Retrieved ${airlinesCount} airlines successfully`);
        return result.rows[0].get_all_airlines;
    } catch (error) {
        Log.error(FILE, func, null, 'Failed to retrieve airlines', error);
        throw new Error(`Failed to retrieve airlines: ${error.message}`);
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all airlines (admin only)');
    
    try {
        const result = await connectedKnex('airlines').del();
        Log.debug(FILE, func, null, `Deleted ${result} airlines`);
        
        await connectedKnex.raw('ALTER SEQUENCE "airlines_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset airline ID sequence to 1');
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Failed to delete all airlines', error);
        throw new Error(`Failed to delete all airlines: ${error.message}`);
    }
}

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting airline ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE airlines_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset airline ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Failed to set sequence id', error);
        throw new Error(`Failed to set sequence id: ${error.message}`);
    }
}

async function get_by_name(name) {
    const func = 'get_by_name';
    Log.debug(FILE, func, name, 'Looking up airline by name');
    
    try {
        const airline = await connectedKnex('airlines').select('*').where('name', name).first();
        
        if (airline) {
            Log.debug(FILE, func, airline.id, `Airline found: ${name}`);
            return airline;
        } else {
            Log.debug(FILE, func, name, 'No airline found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, name, 'Failed to get airline by name', error);
        throw new Error(`Failed to get airline by name: ${error.message}`);
    }
}

async function get_by_id_type(type, id) {
    const func = 'get_by_id_type';
    Log.debug(FILE, func, id, `Looking up airline by ${type}`);
    
    try {
        const airline = await connectedKnex('airlines').select('*').where(type, id).first();
        
        if (airline) {
            Log.debug(FILE, func, id, `Airline found: ${airline.name}`);
            return airline;
        } else {
            Log.debug(FILE, func, id, 'No airline found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, `Failed to get airline by ${type}`, error);
        throw new Error(`Failed to get airline by ${type}: ${error.message}`);
    }
}

async function get_by_airline_id_test(id) {
    const func = 'get_by_airline_id_test';
    Log.debug(FILE, func, id, 'Test function: Looking up flights');
    
    try {
        const result = await connectedKnex.raw(`SELECT get_flights_by_airline(${id})`);
        Log.debug(FILE, func, id, 'Test function result retrieved');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error in test function', error);
        throw error;
    }
}

module.exports = { 
    get_all, 
    get_by_id, 
    get_by_id_type, 
    new_airline, 
    update_airline, 
    delete_airline, 
    set_id, 
    get_by_name, 
    delete_all,
    get_by_airline_id_test 
};