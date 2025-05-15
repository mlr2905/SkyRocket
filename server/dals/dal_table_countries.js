const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Countries DAL module initialized')

// ---------------Admin permission only---------------

async function new_countrie(new_mes) {
    logger.info('Creating new country')
    logger.debug(`New country data: ${JSON.stringify(new_mes)}`)
    
    try {
        const result = await connectedKnex('countries').insert(new_mes).returning('*')
        logger.info(`Country created successfully with ID: ${result[0].id}, name: ${result[0].country_name}`)
        return result[0]
    } catch (error) {
        logger.error('Error creating new country:', error)
        throw error
    }
}

async function get_by_id(id) {
    logger.debug(`Looking up country by ID: ${id}`)
    
    try {
        const countrie = await connectedKnex('countries')
            .select('countries.*', 'continents.*')
            .leftJoin('continents', 'continents.id', '=', 'countries.continent_id')
            .where('countries.id', id)
            .first();
            
        if (countrie) {
            logger.debug(`Country found by ID: ${id}, name: ${countrie.country_name}`)
            return countrie
        } else {
            logger.debug(`No country found with ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up country by ID ${id}:`, error)
        throw error
    }
}

async function get_by_name(name) {
    logger.debug(`Looking up country by name: ${name}`)
    
    try {
        const country_name = await connectedKnex('countries').select('*').where('country_name', name).first()
        
        if (country_name) {
            logger.debug(`Country found by name: ${name}, ID: ${country_name.id}`)
            return country_name
        } else {
            logger.debug(`No country found with name: ${name}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up country by name ${name}:`, error)
        throw error
    }
}

async function update_countrie(id, updated_countrie) {
    logger.info(`Updating country with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(updated_countrie)}`)
    
    try {
        // תחילה בדוק אם המדינה קיימת
        const country = await connectedKnex('countries').select('id', 'country_name').where('id', id).first()
        
        if (!country) {
            logger.warn(`Country update failed - country not found: ${id}`)
            return null
        }
        
        const result = await connectedKnex('countries').where('id', id).update(updated_countrie)
        
        if (result) {
            logger.info(`Country ${id} updated successfully: ${country.country_name} -> ${updated_countrie.country_name || country.country_name}`)
            return updated_countrie
        } else {
            logger.warn(`Country ${id} update failed - no rows affected`)
            return null
        }
    } catch (error) {
        logger.error(`Error updating country ${id}:`, error)
        throw error
    }
}

async function delete_countrie(id) {
    logger.info(`Deleting country with ID: ${id}`)
    
    try {
        // תחילה בדוק אם המדינה קיימת
        const country = await connectedKnex('countries').select('id', 'country_name').where('id', id).first()
        
        if (!country) {
            logger.warn(`Country deletion failed - country not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('countries').where('id', id).del()
        
        if (result) {
            logger.info(`Country ${id} deleted successfully: ${country.country_name}`)
            return result
        } else {
            logger.warn(`Country ${id} deletion failed - no rows affected`)
            return 0
        }
    } catch (error) {
        logger.error(`Error deleting country ${id}:`, error)
        throw error
    }
}

async function get_all() {
    logger.info('Retrieving all countries')
    
    try {
        const countries = await connectedKnex.raw(`SELECT get_all_countries();`)
        const countriesCount = countries.rows[0].get_all_countries ? countries.rows[0].get_all_countries.length : 0
        logger.debug(`Retrieved ${countriesCount} countries successfully`)
        return countries.rows[0].get_all_countries
    } catch (error) {
        logger.error('Error retrieving all countries:', error)
        throw error
    }
}

async function delete_all() {
    logger.info('Deleting all countries (admin only function)')
    logger.warn('This operation will delete ALL countries from the database')
    
    try {
        const result = await connectedKnex('countries').del()
        logger.debug(`Deleted ${result} countries from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "countries_id_seq" RESTART WITH 1');
        logger.info('Reset country ID sequence to 1')
        
        return result
    } catch (error) {
        logger.error('Error deleting all countries:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting country ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE countries_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset country ID sequence to ${id}`)
        return result
    } catch (error) {
        logger.error(`Error setting country ID sequence to ${id}:`, error)
        throw error
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
}