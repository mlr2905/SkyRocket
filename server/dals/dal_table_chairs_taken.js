const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_chairs_taken';

Log.info(FILE, 'init', null, 'Chairs DAL module initialized');

// ---------------User functions only and admin---------------

async function new_chair(new_t) {
    const func = 'new_chair';
    Log.info(FILE, func, new_t.user_id, 'Creating new chair assignment');
    Log.debug(FILE, func, new_t.user_id, `Data: ${JSON.stringify(new_t)}`);
    
    try {
        const result = await connectedKnex('chairs_taken').insert(new_t).returning('*');
        Log.info(FILE, func, new_t.user_id, `Chair assignment created (ID: ${result[0].id})`);
        return result[0];
    } catch (error) {
        Log.error(FILE, func, new_t.user_id, 'Error creating chair assignment', error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up chair assignment by user ID');
    
    try {
        const chair = await connectedKnex('chairs_taken').select('*').where('user_id', id).first();
        
        if (chair) {
            Log.debug(FILE, func, id, 'Chair assignment found');
            return chair;
        } else {
            Log.debug(FILE, func, id, 'No chair assignment found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up chair assignment', error);
        throw error;
    }
}

async function delete_chair(id) {
    const func = 'delete_chair';
    Log.info(FILE, func, id, 'Deleting chair assignment');
    
    try {
        const chair = await connectedKnex('chairs_taken').select('*').where('id', id).first();
        
        if (!chair) {
            Log.warn(FILE, func, id, 'Deletion failed - assignment not found');
            return 0;
        }
        
        const result = await connectedKnex('chairs_taken').where('id', id).del();
        Log.info(FILE, func, id, 'Chair assignment deleted successfully');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting chair assignment', error);
        throw error;
    }
}

async function update_chair(id, updated_chair) {
    const func = 'update_chair';
    Log.info(FILE, func, id, 'Updating chair assignment');
    
    try {
        const chair = await connectedKnex('chairs_taken').select('*').where('id', id).first();
        
        if (!chair) {
            Log.warn(FILE, func, id, 'Update failed - assignment not found');
            return null;
        }
        
        const result = await connectedKnex('chairs_taken').where('id', id).update(updated_chair);
        Log.info(FILE, func, id, 'Chair assignment updated successfully');
        return updated_chair;
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating chair assignment', error);
        throw error;
    }
}

async function get_all_chairs_by_flight(id) {
    const func = 'get_all_chairs_by_flight';
    Log.info(FILE, func, id, 'Retrieving chair assignments for flight');
    
    try {
        const chairs_taken = await connectedKnex('chairs_taken')
            .select('id', 'flight_id', 'char_id', 'passenger_id', 'user_id')
            .where('flight_id', id);

        const chairsCount = chairs_taken ? chairs_taken.length : 0;
        Log.debug(FILE, func, id, `Retrieved ${chairsCount} chair assignments`);
        return chairs_taken;
    } catch (error) {
        Log.error(FILE, func, id, 'Error retrieving chair assignments', error);
        throw error;
    }
}

async function delete_chair_assignment(flight_id, chair_id) {
    const func = 'delete_chair_assignment';
    Log.info(FILE, func, null, `Deleting chair assignment (Flight: ${flight_id}, Chair: ${chair_id})`);
    try {
        const result = await connectedKnex('chairs_taken')
            .where('flight_id', flight_id)
            .andWhere('char_id', chair_id) 
            .del();
        
        Log.debug(FILE, func, null, `Deleted ${result} assignment(s)`);
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting chair assignment', error);
        throw error;
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all chair assignments (admin only)');
    
    try {
        const result = await connectedKnex('chairs_taken').del();
        Log.debug(FILE, func, null, `Deleted ${result} assignments`);
        
        await connectedKnex.raw('ALTER SEQUENCE "chairs_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset chair assignment ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting all chair assignments', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting chair assignment ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE chairs_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error setting ID sequence', error);
        throw error;
    }
}

module.exports = { 
    get_all_chairs_by_flight, 
    get_by_id, 
    new_chair, 
    update_chair, 
    delete_chair, 
    set_id,
    delete_chair_assignment, 
    delete_all 
};