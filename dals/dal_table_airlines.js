const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------User airline functions only and admin---------------

/**
 * Added a new airline number to the database.
 * @param {object} newAirline - the details of the new company to be added to the database.
 * @returns {Promise<object>} The new company entered into the database.
 */
async function new_airline(newAirline) { //addNewAirline
    try {
        const result = await connectedKnex('airlines').insert(newAirline).returning('*');
        return result[0];
    } catch (error) {
        throw new Error(`Failed to add new airline: ${error.message}`);
    }
}

/**
 * Finding an airline by the ID from the database.
 * @param {number} id - the ID of the requested company.
 * @returns {Promise<object|null>} information about the company if it exists, otherwise null.
 */
async function get_by_id(id) { //getAirlineById
    try {
        const airline = await connectedKnex('airlines')
            .select('airlines.*', 'countries.country_name', 'users.username as user_name')
            .leftJoin('users', 'users.id', '=', 'airlines.user_id')
            .leftJoin('countries', 'countries.id', '=', 'airlines.country_id')
            .where('airlines.id', id)
            .first();
        
        return airline;
    } catch (error) {
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

    try {
        const result = await connectedKnex('airlines').where('id', id).update(updatedAirline);
        return result

    } catch (error) {
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
    try {
        const result = await connectedKnex('airlines').where('id', id).del();
        return result;
    } catch (error) {
        throw new Error(`Failed to delete airline: ${error.message}`);
    }
}

/**
 * Gets all the airlines from the database.
 * @returns {Promise<Array>} an array of all airlines.
 * @throws {Error} Error while getting data.
 */
async function get_all() { //getAllAirlines
    try {
        const result = await connectedKnex.raw(`SELECT get_all_airlines();`);
        return result.rows[0].get_all_airlines;
    } catch (error) {
        throw new Error(`Failed to retrieve airlines: ${error.message}`);
    }
}


/**
 * Deleting all airlines from the database and resetting the sequence of identifiers.
 * @returns {Promise<number>} The number of rows deleted from the 'airlines' table.
 * @throws {Error} Error during deletion or reset.
 */
async function delete_all() { //deleteAllAirlines
    try {
        const result = await connectedKnex('airlines').del();
        await connectedKnex.raw('ALTER SEQUENCE "airlines_id_seq" RESTART WITH 1');
        return result;
    } catch (error) {
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
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE airlines_id_seq RESTART WITH ${id}`);
        return result;
    } catch (error) {
        throw new Error(`Failed to set sequence id: ${error.message}`);
    }
}

/**
 * Gets the airline information from the database by company name.
 * @param {string} name - the name of the company to search in the database.
 * @returns {Promise<object|null>} Company details if found, or an empty value if not found.
 * @throws {Error} An error occurred during the query.
 */
async function get_by_name(name) { //getAirlineByName
    try {
        const airline = await connectedKnex('airlines').select('*').where('name', name).first();
        return airline;
    } catch (error) {
        throw new Error(`Failed to get airline by name: ${error.message}`);
    }
}

async function get_by_id_type(type,id) { //getAirlineByName
    try {
        const airline = await connectedKnex('airlines').select('*').where(`${type}`, id).first();
        return airline;
    } catch (error) {
        throw new Error(`Failed to get airline by name: ${error.message}`);
    }
}

async function get_by_airline_id_test(id) {
    // db.run('select * from flights where id=?')
    
    const result = await connectedKnex.raw(`SELECT get_flights_by_airline(${id})`);

    return result
}

module.exports = { get_all, get_by_id, get_by_id_type, new_airline, update_airline, delete_airline, set_id, get_by_name, delete_all,get_by_airline_id_test }