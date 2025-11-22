const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_countries';

Log.info(FILE, 'init', null, 'Countries DAL module initialized');

// ---------------Admin permission only---------------

async function new_countrie(new_mes) {
    const func = 'new_countrie';
    Log.info(FILE, func, null, 'Creating new country');
    Log.debug(FILE, func, null, `Data: ${JSON.stringify(new_mes)}`);
    
    try {
        const result = await connectedKnex('countries').insert(new_mes).returning('*');
        Log.info(FILE, func, result[0].id, `Country created successfully: ${result[0].country_name}`);
        return result[0];
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating new country', error);
        throw error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up country by ID');
    
    try {
        const countrie = await connectedKnex('countries')
            .select('countries.*', 'continents.*')
            .leftJoin('continents', 'continents.id', '=', 'countries.continent_id')
            .where('countries.id', id)
            .first();
            
        if (countrie) {
            Log.debug(FILE, func, id, `Country found: ${countrie.country_name}`);
            return countrie;
        } else {
            Log.debug(FILE, func, id, 'No country found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up country', error);
        throw error;
    }
}

async function get_by_name(name) {
    const func = 'get_by_name';
    Log.debug(FILE, func, name, 'Looking up country by name');
    
    try {
        const country_name = await connectedKnex('countries').select('*').where('country_name', name).first();
        
        if (country_name) {
            Log.debug(FILE, func, name, `Country found (ID: ${country_name.id})`);
            return country_name;
        } else {
            Log.debug(FILE, func, name, 'No country found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, name, 'Error looking up country', error);
        throw error;
    }
}

async function update_countrie(id, updated_countrie) {
    const func = 'update_countrie';
    Log.info(FILE, func, id, 'Updating country');
    Log.debug(FILE, func, id, `Update data: ${JSON.stringify(updated_countrie)}`);
    
    try {
        const country = await connectedKnex('countries').select('id', 'country_name').where('id', id).first();
        
        if (!country) {
            Log.warn(FILE, func, id, 'Country update failed - country not found');
            return null;
        }
        
        const result = await connectedKnex('countries').where('id', id).update(updated_countrie);
        
        if (result) {
            Log.info(FILE, func, id, `Country updated successfully: ${country.country_name} -> ${updated_countrie.country_name || country.country_name}`);
            return updated_countrie;
        } else {
            Log.warn(FILE, func, id, 'Country update failed - no rows affected');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating country', error);
        throw error;
    }
}

async function delete_countrie(id) {
    const func = 'delete_countrie';
    Log.info(FILE, func, id, 'Deleting country');
    
    try {
        const country = await connectedKnex('countries').select('id', 'country_name').where('id', id).first();
        
        if (!country) {
            Log.warn(FILE, func, id, 'Country deletion failed - country not found');
            return 0;
        }
        
        const result = await connectedKnex('countries').where('id', id).del();
        
        if (result) {
            Log.info(FILE, func, id, `Country deleted successfully: ${country.country_name}`);
            return result;
        } else {
            Log.warn(FILE, func, id, 'Country deletion failed - no rows affected');
            return 0;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting country', error);
        throw error;
    }
}

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all countries');
    
    try {
        const countries = await connectedKnex.raw(`SELECT get_all_countries();`);
        const countriesCount = countries.rows[0].get_all_countries ? countries.rows[0].get_all_countries.length : 0;
        Log.debug(FILE, func, null, `Retrieved ${countriesCount} countries successfully`);
        return countries.rows[0].get_all_countries;
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all countries', error);
        throw error;
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all countries (admin only)');
    Log.warn(FILE, func, null, 'This operation will delete ALL countries from the database');
    
    try {
        const result = await connectedKnex('countries').del();
        Log.debug(FILE, func, null, `Deleted ${result} countries`);
        
        await connectedKnex.raw('ALTER SEQUENCE "countries_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset country ID sequence to 1');
        
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting all countries', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting country ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE countries_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset country ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error setting country ID sequence', error);
        throw error;
    }
}

module.exports = { 
    get_all, 
    get_by_id, 
    get_by_name, 
    new_countrie, 
    update_countrie, 
    delete_countrie, 
    delete_all, 
    set_id 
};