const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Airlines DAL module initialized')

// ---------------User airline functions only and admin---------------

/**
 * Added a new airline number to the database.
 * @param {object} newAirline - the details of the new company to be added to the database.
 * @returns {Promise<object>} The new company entered into the database.
 */
async function new_airline(newAirline) { //addNewAirline
    logger.info('Creating new airline')
    logger.debug(`New airline data: ${JSON.stringify(newAirline)}`)
    
    try {
        const result = await connectedKnex('airlines').insert(newAirline).returning('*');
        logger.info(`Airline created successfully with ID: ${result[0].id}, name: ${result[0].name}`)
        return result[0];
    } catch (error) {
        logger.error(`Failed to add new airline: ${error.message}`, error)
        throw new Error(`Failed to add new airline: ${error.message}`);
    }
}

/**
 * Finding an airline by the ID from the database.
 * @param {number} id - the ID of the requested company.
 * @returns {Promise<object|null>} information about the company if it exists, otherwise null.
 */
async function get_by_id(id) { //getAirlineById
    logger.debug(`Looking up airline by ID: ${id}`)
    
    try {
        const airline = await connectedKnex('airlines')
            .select('airlines.*', 'countries.country_name', 'users.username as user_name')
            .leftJoin('users', 'users.id', '=', 'airlines.user_id')
            .leftJoin('countries', 'countries.id', '=', 'airlines.country_id')
            .where('airlines.id', id)
            .first();
        
        if (airline) {
            logger.debug(`Airline found by ID: ${id}, name: ${airline.name}`)
            return airline;
        } else {
            logger.debug(`No airline found with ID: ${id}`)
            return null;
        }
    } catch (error) {
        logger.error(`Failed to fetch airline by ID ${id}: ${error.message}`, error)
        throw new Error(`Failed to fetch airline by ID: ${error.message}`);
    }
}

/**
 * Updating airline details in the database according to the given ID.
 * @param {number} id - the ID of the company to be updated.
 * @param {object} updatedAirline - the updated information to be updated in the company.
 * @returns {Promise<object>} The successfully updated company.
 */
async function update_airline(id, updatedAirline) { //updateAirline
    logger.info(`Updating airline with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(updatedAirline)}`)

    try {
        // תחילה בדוק אם חברת התעופה קיימת
        const airline = await connectedKnex('airlines').select('id', 'name').where('id', id).first()
        
        if (!airline) {
            logger.warn(`Airline update failed - airline not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('airlines').where('id', id).update(updatedAirline);
        
        if (result) {
            logger.info(`Airline ${id} updated successfully: ${airline.name}`)
            return result
        } else {
            logger.warn(`Airline ${id} update failed - no rows affected`)
            return 0
        }
    } catch (error) {
        logger.error(`Failed to update airline ${id}: ${error.message}`, error)
        throw new Error(`Failed to update airline: ${error.message}`);
    }
}

// ---------------Admin permission only---------------

/**
 * Deleting an airline from the database according to its unique identifier.
 * @param {number} id - the unique identifier of the company in the database to be deleted.
 * @returns {Promise<number>} The number of rows deleted from the database.
 * @throws {Error} Error during the delete operation.
 */
async function delete_airline(id) { //deleteAirline
    logger.info(`Deleting airline with ID: ${id}`)
    
    try {
        // תחילה בדוק אם חברת התעופה קיימת
        const airline = await connectedKnex('airlines').select('id', 'name').where('id', id).first()
        
        if (!airline) {
            logger.warn(`Airline deletion failed - airline not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('airlines').where('id', id).del();
        
        if (result) {
            logger.info(`Airline ${id} deleted successfully: ${airline.name}`)
            return result;
        } else {
            logger.warn(`Airline ${id} deletion failed - no rows affected`)
            return 0
        }
    } catch (error) {
        logger.error(`Failed to delete airline ${id}: ${error.message}`, error)
        throw new Error(`Failed to delete airline: ${error.message}`);
    }
}

/**
 * Gets all the airlines from the database.
 * @returns {Promise<Array>} an array of all airlines.
 * @throws {Error} Error while getting data.
 */
async function get_all() { //getAllAirlines
    logger.info('Retrieving all airlines')
    
    try {
        const result = await connectedKnex.raw(`SELECT get_all_airlines();`);
        const airlinesCount = result.rows[0].get_all_airlines ? result.rows[0].get_all_airlines.length : 0
        logger.debug(`Retrieved ${airlinesCount} airlines successfully`)
        return result.rows[0].get_all_airlines;
    } catch (error) {
        logger.error(`Failed to retrieve airlines: ${error.message}`, error)
        throw new Error(`Failed to retrieve airlines: ${error.message}`);
    }
}

/**
 * Deleting all airlines from the database and resetting the sequence of identifiers.
 * @returns {Promise<number>} The number of rows deleted from the 'airlines' table.
 * @throws {Error} Error during deletion or reset.
 */
async function delete_all() { //deleteAllAirlines
    logger.info('Deleting all airlines (admin only function)')
    logger.warn('This operation will delete ALL airlines from the database')
    
    try {
        const result = await connectedKnex('airlines').del();
        logger.debug(`Deleted ${result} airlines from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "airlines_id_seq" RESTART WITH 1');
        logger.info('Reset airline ID sequence to 1')
        
        return result;
    } catch (error) {
        logger.error(`Failed to delete all airlines: ${error.message}`, error)
        throw new Error(`Failed to delete all airlines: ${error.message}`);
    }
}

// ---------------Test functions only---------------

/**
 * Defining a new value for the identifier sequence of the 'airlines' table.
 * @param {number} id - the new value to define the sequence.
 * @returns {Promise<any>} The result of the operation of changing the value of the sequence.
 * @throws {Error} An error occurred during the change of the sequence value.
 */
async function set_id(id) {  //setSequenceId
    logger.info(`Setting airline ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE airlines_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset airline ID sequence to ${id}`)
        return result;
    } catch (error) {
        logger.error(`Failed to set sequence id to ${id}: ${error.message}`, error)
        throw new Error(`Failed to set sequence id: ${error.message}`);
    }
}

/**
 * Gets the airline information from the database by company name.
 * @param {string} name - the name of the company to search in the database.
 * @returns {Promise<object|null>} Company details if found, or an empty value if not found.
 * @throws {Error} An error occurred during the query.
 */
async function get_by_name(name) {
    logger.debug(`Looking up airline by name: ${name}`)
    
    try {
        const airline = await connectedKnex('airlines').select('*').where('name', name).first();
        
        if (airline) {
            logger.debug(`Airline found by name: ${name}, ID: ${airline.id}`)
            return airline;
        } else {
            logger.debug(`No airline found with name: ${name}`)
            return null;
        }
    } catch (error) {
        logger.error(`Failed to get airline by name ${name}: ${error.message}`, error)
        throw new Error(`Failed to get airline by name: ${error.message}`);
    }
}

/**
 * Gets the airline information from the database by a specified field.
 * @param {string} type - the field to search by.
 * @param {any} id - the value to search for.
 * @returns {Promise<object|null>} Airline details if found, or null if not found.
 * @throws {Error} An error occurred during the query.
 */
async function get_by_id_type(type, id) { //getAirlineByName
    logger.debug(`Looking up airline by ${type}: ${id}`)
    
    try {
        const airline = await connectedKnex('airlines').select('*').where(type, id).first();
        
        if (airline) {
            logger.debug(`Airline found by ${type}: ${id}, name: ${airline.name}`)
            return airline;
        } else {
            logger.debug(`No airline found with ${type}: ${id}`)
            return null;
        }
    } catch (error) {
        logger.error(`Failed to get airline by ${type} ${id}: ${error.message}`, error)
        throw new Error(`Failed to get airline by ${type}: ${error.message}`);
    }
}

/**
 * Gets flights by airline ID (test function).
 * @param {number} id - the airline ID to look up flights for.
 * @returns {Promise<object>} Raw query results.
 */
async function get_by_airline_id_test(id) {
    logger.debug(`Test function: Looking up flights by airline ID: ${id}`)
    
    try {
        const result = await connectedKnex.raw(`SELECT get_flights_by_airline(${id})`);
        logger.debug(`Test function result for airline ID ${id} retrieved`)
        return result
    } catch (error) {
        logger.error(`Error in test function for airline ID ${id}: ${error.message}`, error)
        throw error
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
}