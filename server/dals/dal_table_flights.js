const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_flights';

Log.info(FILE, 'init', null, 'Flights DAL module initialized');

// ---------------All types of users can activate---------------

async function flights_records_tables(v) {
    const func = 'flights_records_tables';
    Log.info(FILE, func, null, 'Checking flights records tables');
    Log.debug(FILE, func, null, `Parameters: ${JSON.stringify(v)}`);
    
    try {
        const check = await connectedKnex.raw(`SELECT flights_records_tables(${v.airline_id},${v.origin_country_id},${v.destination_country_id},${v.plane_id})`);
        Log.debug(FILE, func, null, `Result: ${check.rows[0].flights_records_tables}`);
        return check.rows[0].flights_records_tables;
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error checking flights records tables', error);
        return error;
    }
}

async function check_flight_existence(v) {
    const func = 'check_flight_existence';
    Log.info(FILE, func, null, 'Checking flight existence');
    Log.debug(FILE, func, null, `Parameters: ${JSON.stringify(v)}`);
    
    try {
        const check = await connectedKnex.raw(`SELECT check_flight_existence(${v.airline_id},${v.origin_country_id},${v.destination_country_id},'${v.departure_time}','${v.landing_time}')`);
        const exists = check.rows[0].check_flight_existence;
        
        if (exists) {
            Log.debug(FILE, func, null, 'Flight already exists with these parameters');
        } else {
            Log.debug(FILE, func, null, 'No existing flight with these parameters');
        }
        
        return exists;
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error checking flight existence', error);
        return error;
    }
}

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all flights');
    
    try {
        const flights = await connectedKnex.raw(`SELECT get_all_flights();`);
        const flightsCount = flights.rows[0].get_all_flights ? flights.rows[0].get_all_flights.length : 0;
        Log.debug(FILE, func, null, `Retrieved ${flightsCount} flights successfully`);
        return flights.rows[0].get_all_flights;
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all flights', error);
        throw error;
    }
}

// ---------------User functions only and admin---------------

async function update_remaining_tickets(id) {
    const func = 'update_remaining_tickets';
    Log.info(FILE, func, id, 'Updating remaining tickets');
    
    try {
        const result = await connectedKnex.raw(`CALL update_remaining_tickets(${id})`);
        if (result.error) {
            Log.warn(FILE, func, id, `Error updating remaining tickets: ${result.error}`);
            return null;
        } else {
            Log.info(FILE, func, id, 'Successfully updated remaining tickets');
            return result;
        }
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error updating remaining tickets', error);
        throw error;
    }
}

// ---------------airline_User functions only and admin---------------

async function new_flight(new_flight) {
    const func = 'new_flight';
    Log.info(FILE, func, null, 'Creating new flight');
    Log.debug(FILE, func, null, `New flight data: ${JSON.stringify(new_flight)}`);
    
    try {
        const result = await connectedKnex('flights').insert(new_flight).returning('*');
        Log.info(FILE, func, result[0].id, 'Flight created successfully');
        Log.debug(FILE, func, result[0].id, `Created flight details: ${JSON.stringify(result[0])}`);
        return result[0];
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error creating new flight', error);
        throw error;
    }
}

async function get_destinations_from_origin(origin_id) {
    const func = 'get_destinations_from_origin';
    Log.info(FILE, func, origin_id, 'Retrieving all unique destinations');
    
    try {
        const destinations = await connectedKnex('flights')
            .distinct('flights.destination_country_id as id', 'dest_countries.country_name as name')
            .join('countries as dest_countries', 'flights.destination_country_id', 'dest_countries.id')
            .where('flights.origin_country_id', origin_id)
            .orderBy('name', 'ASC');
        
        Log.debug(FILE, func, origin_id, `Found ${destinations.length} unique destinations`);
        return destinations;
    } catch (error) {
        Log.error(FILE, func, origin_id, 'Error retrieving destinations', error);
        throw error;
    }
}

async function get_all_origin_countries() {
    const func = 'get_all_origin_countries';
    Log.info(FILE, func, null, 'Retrieving all unique origin countries');
    
    try {
        const countries = await connectedKnex('flights')
            .distinct('flights.origin_country_id as id', 'origin_countries.country_name as name')
            .join('countries as origin_countries', 'flights.origin_country_id', 'origin_countries.id')
            .orderBy('name', 'ASC');
        
        Log.debug(FILE, func, null, `Found ${countries.length} unique origin countries`);
        return countries;
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving origin countries', error);
        throw error;
    }
}

async function get_filtered_flights(filters = {}) {
    const func = 'get_filtered_flights';
    const { origin_country_id, destination_country_id, date } = filters;

    Log.info(FILE, func, null, 'Retrieving filtered flights');
    Log.debug(FILE, func, null, `Filter parameters: ${JSON.stringify(filters)}`);

    try {
        let query = connectedKnex('flights')
            .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
            .leftJoin('countries as origin_countries', 'origin_countries.id', 'flights.origin_country_id')
            .leftJoin('countries as destination_countries', 'destination_countries.id', 'flights.destination_country_id')
            .leftJoin('planes', 'planes.id', 'flights.plane_id')
            .select('flights.*', 'airlines.name as airline_name', 'origin_countries.country_name as origin_country_name', 
                    'destination_countries.country_name as destination_country_name', 'planes.seat as Total_tickets');

        if (origin_country_id) {
            query.where('flights.origin_country_id', origin_country_id);
        }

        if (destination_country_id) {
            query.where('flights.destination_country_id', destination_country_id);
        }

        if (date) {
            query.whereRaw('flights.departure_time::date = ?', [date]);
        } else {
            query.whereRaw('flights.departure_time::date >= CURRENT_DATE');
        }
        
        query.orderBy('flights.departure_time', 'ASC');

        const flights = await query;

        Log.debug(FILE, func, null, `Found ${flights.length} flights matching criteria`);
        return flights;

    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving filtered flights', error);
        throw error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up flight by ID');
    
    try {
        const flight = await connectedKnex('flights')
            .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
            .leftJoin('countries as origin_countries', 'origin_countries.id', 'flights.origin_country_id')
            .leftJoin('countries as destination_countries', 'destination_countries.id', 'flights.destination_country_id')
            .leftJoin('planes', 'planes.id', 'flights.plane_id')
            .select('flights.*', 'airlines.name as airline_name', 'origin_countries.country_name as origin_country_name', 
                    'destination_countries.country_name as destination_country_name', 'planes.seat as Total_tickets')
            .where('flights.id', id).first();
            
        if (flight) {
            Log.debug(FILE, func, id, 'Flight found');
            return flight;
        } else {
            Log.debug(FILE, func, id, 'No flight found');
            return null;
        }
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error looking up flight', error);
        throw error;
    }
}

async function get_flight_by_airline_id(id) {
    const func = 'get_flight_by_airline_id';
    Log.debug(FILE, func, id, 'Looking up flights by airline ID');
    
    try {
        const result = await connectedKnex.raw(`SELECT get_flight_details_by_airline(${id})`);
        const flightsCount = result.rows[0].get_flight_details_by_airline ? 
                             result.rows[0].get_flight_details_by_airline.length : 0;
        
        if (flightsCount > 0) {
            Log.debug(FILE, func, id, `Found ${flightsCount} flights`);
        } else {
            Log.debug(FILE, func, id, 'No flights found');
        }
        
        return result.rows[0].get_flight_details_by_airline;
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error looking up flights', error);
        throw error;
    }
}

async function update_flight(id, updated_flight) {
    const func = 'update_flight';
    Log.info(FILE, func, id, 'Updating flight');
    Log.debug(FILE, func, id, `Update data: ${JSON.stringify(updated_flight)}`);
    
    try {
        const flight = await connectedKnex('flights').select('id').where('id', id).first();
        
        if (!flight) {
            Log.warn(FILE, func, id, 'Flight update failed - flight not found');
            return null;
        }
        
        const result = await connectedKnex('flights').where('id', id).update(updated_flight);
        Log.info(FILE, func, id, 'Flight updated successfully');
        return updated_flight;
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error updating flight', error);
        throw error;
    }
}

async function delete_flight(id) {
    const func = 'delete_flight';
    Log.info(FILE, func, id, 'Deleting flight');
    
    try {
        const flight = await connectedKnex('flights').select('id').where('id', id).first();
        
        if (!flight) {
            Log.warn(FILE, func, id, 'Flight deletion failed - flight not found');
            return null;
        }
        
        const result = await connectedKnex.raw(`CALL delete_flight(${id})`);
        Log.info(FILE, func, id, 'Flight deleted successfully');
        return result;
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error deleting flight', error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all flights (admin only)');
    Log.warn(FILE, func, null, 'This operation will delete ALL flights from the database');
    
    try {
        const result = await connectedKnex('flights').del();
        Log.debug(FILE, func, null, `Deleted ${result} flights`);
        
        await connectedKnex.raw('ALTER SEQUENCE "flights_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset flight ID sequence to 1');
        
        return result;
    }
    catch (error) {
        Log.error(FILE, func, null, 'Error deleting all flights', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting flight ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE flights_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset flight ID sequence');
        return result;
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error setting flight ID sequence', error);
        throw error;
    }
}

async function get_by_flight_code(code) {
    const func = 'get_by_flight_code';
    Log.debug(FILE, func, code, 'Looking up flight by code');
    
    try {
        const flight = await connectedKnex('flights').select('*').where('flight_code', code).first();
        
        if (flight) {
            Log.debug(FILE, func, flight.id, 'Flight found');
            return flight;
        } else {
            Log.debug(FILE, func, code, 'No flight found');
            return null;
        }
    }
    catch (error) {
        Log.error(FILE, func, code, 'Error looking up flight by code', error);
        throw error;
    }
}

async function get_flight_by_airline_id_test(id) {
    const func = 'get_flight_by_airline_id_test';
    Log.debug(FILE, func, id, 'Test function: Looking up flights by airline ID');
    
    try {
        const result = await connectedKnex.raw(`SELECT get_flights_by_airline(${id})`);
        Log.debug(FILE, func, id, `Test function result: ${JSON.stringify(result.rows)}`);
        return result;
    }
    catch (error) {
        Log.error(FILE, func, id, 'Error in test function', error);
        throw error;
    }
}

module.exports = { 
    flights_records_tables, 
    check_flight_existence,
    get_all, 
    get_by_id, 
    get_flight_by_airline_id, 
    new_flight, 
    update_flight, 
    update_remaining_tickets, 
    delete_flight, 
    delete_all, 
    get_by_flight_code, 
    set_id, 
    get_flight_by_airline_id_test,
    get_filtered_flights,
    get_all_origin_countries,
    get_destinations_from_origin
};