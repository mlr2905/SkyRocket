const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_passengers';

Log.info(FILE, 'init', null, 'Passengers DAL module initialized');

// ---------------User functions only and admin---------------

async function new_passenger(new_passenger) {
    const func = 'new_passenger';
    Log.info(FILE, func, null, 'Creating new passenger');
    Log.debug(FILE, func, null, `New passenger data: ${JSON.stringify(new_passenger)}`);
    
    try {
        const result = await connectedKnex('passengers').insert(new_passenger).returning('*');
        Log.info(FILE, func, result[0].id, 'Passenger created successfully');
        Log.debug(FILE, func, result[0].id, `Created passenger details: ${JSON.stringify(result[0])}`);
        return result[0];
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating new passenger', error);
        throw error;
    }
}

async function get_by_id_passenger(id) {
    const func = 'get_by_id_passenger';
    Log.debug(FILE, func, id, 'Looking up passenger by ID');
    
    try {
        const passenger = await connectedKnex('passengers').select('*').where('id', id).first();
        
        if (passenger) {
            Log.debug(FILE, func, id, 'Passenger found');
            return passenger;
        } else {
            Log.debug(FILE, func, id, 'No passenger found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up passenger', error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function update_passenger(id, updated_passenger) {
    const func = 'update_passenger';
    Log.info(FILE, func, id, 'Updating passenger');
    Log.debug(FILE, func, id, `Update data: ${JSON.stringify(updated_passenger)}`);
    
    try {
        const passenger = await connectedKnex('passengers').select('id').where('id', id).first();
        
        if (!passenger) {
            Log.warn(FILE, func, id, 'Passenger update failed - passenger not found');
            return null;
        }
        
        const result = await connectedKnex('passengers').where('id', id).update(updated_passenger);
        Log.info(FILE, func, id, 'Passenger updated successfully');
        return updated_passenger;
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating passenger', error);
        throw error;
    }
}

async function delete_passenger(id) {
    const func = 'delete_passenger';
    Log.info(FILE, func, id, 'Deleting passenger');
    
    try {
        const passenger = await connectedKnex('passengers').select('id').where('id', id).first();
        
        if (!passenger) {
            Log.warn(FILE, func, id, 'Passenger deletion failed - passenger not found');
            return 0;
        }
        
        const result = await connectedKnex('passengers').where('id', id).del();
        Log.info(FILE, func, id, 'Passenger deleted successfully');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting passenger', error);
        throw error;
    }
}

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all passengers (admin only)');
    
    try {
        const passengers = await connectedKnex.raw(`SELECT get_all_passengers();`);
        const passengersCount = passengers.rows[0].get_all_passengers ? passengers.rows[0].get_all_passengers.length : 0;
        Log.debug(FILE, func, null, `Retrieved ${passengersCount} passengers successfully`);
        return passengers.rows[0].get_all_passengers;
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all passengers', error);
        throw error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up passenger by ID (duplicate function)');
    
    try {
        const passenger = await connectedKnex('passengers').select('*').where('id', id).first();
        
        if (passenger) {
            Log.debug(FILE, func, id, 'Passenger found');
            return passenger;
        } else {
            Log.debug(FILE, func, id, 'No passenger found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up passenger', error);
        throw error;
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all passengers (admin only)');
    Log.warn(FILE, func, null, 'This operation will delete ALL passengers from the database');
    
    try {
        const result = await connectedKnex('passengers').del();
        Log.debug(FILE, func, null, `Deleted ${result} passengers`);
        
        await connectedKnex.raw('ALTER SEQUENCE "passengers_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset passenger ID sequence to 1');
        
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting all passengers', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting passenger ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE passengers_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset passenger ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error setting passenger ID sequence', error);
        throw error;
    }
}

async function get_by_passport_number(passport_number) {
    const func = 'get_by_passport_number';
    Log.debug(FILE, func, passport_number, 'Looking up passenger by passport number');
    
    try {
        const passenger = await connectedKnex('passengers')
                              .select('*')
                              .where('passport_number', passport_number)
                              .first();
        
        if (passenger) {
            Log.debug(FILE, func, passenger.id, `Passenger found (Passport: ${passport_number})`);
            return passenger;
        } else {
            Log.debug(FILE, func, passport_number, 'No passenger found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, passport_number, 'Error looking up passenger by passport', error);
        throw error;
    }
}

module.exports = {
    get_all, 
    get_by_id, 
    new_passenger, 
    update_passenger, 
    delete_passenger,
    delete_all, 
    get_by_id_passenger, 
    set_id, 
    get_by_passport_number
};