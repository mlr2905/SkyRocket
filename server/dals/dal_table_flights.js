const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Flights DAL module initialized')

// ---------------All types of users can activate---------------

async function flights_records_tables(v) {
    logger.info('Checking flights records tables')
    logger.debug(`Flight records check parameters: ${JSON.stringify(v)}`)
    
    try {
        const check = await connectedKnex.raw(`SELECT flights_records_tables(${v.airline_id},${v.origin_country_id},${v.destination_country_id},${v.plane_id})`)
        logger.debug(`Flight records check result: ${check.rows[0].flights_records_tables}`)
        return check.rows[0].flights_records_tables
    }
    catch (error) {
        logger.error('Error checking flights records tables:', error)
        return error
    }
}

async function check_flight_existence(v) {
    logger.info('Checking flight existence')
    logger.debug(`Flight existence check parameters: ${JSON.stringify(v)}`)
    
    try {
        const check = await connectedKnex.raw(`SELECT check_flight_existence(${v.airline_id},${v.origin_country_id},${v.destination_country_id},'${v.departure_time}','${v.landing_time}')`)
        const exists = check.rows[0].check_flight_existence
        
        if (exists) {
            logger.debug(`Flight already exists with these parameters`)
        } else {
            logger.debug(`No existing flight with these parameters`)
        }
        
        return exists
    }
    catch (error) {
        logger.error('Error checking flight existence:', error)
        return error
    }
}

async function get_all() {
    logger.info('Retrieving all flights')
    
    try {
        const flights = await connectedKnex.raw(`SELECT get_all_flights();`)
        const flightsCount = flights.rows[0].get_all_flights ? flights.rows[0].get_all_flights.length : 0
        logger.debug(`Retrieved ${flightsCount} flights successfully`)
        return flights.rows[0].get_all_flights
    }
    catch (error) {
        logger.error('Error retrieving all flights:', error)
        throw error
    }
}

// ---------------User functions only and admin---------------

async function update_remaining_tickets(id) {
    logger.info(`Updating remaining tickets for flight ID: ${id}`)
    
    try {
        const result = await connectedKnex.raw(`CALL update_remaining_tickets(${id})`)
        if (result.error) {
            logger.warn(`Error updating remaining tickets for flight ${id}: ${result.error}`)
            return null
        } else {
            logger.info(`Successfully updated remaining tickets for flight ${id}`)
            return result
        }
    }
    catch (error) {
        logger.error(`Error updating remaining tickets for flight ${id}:`, error)
        throw error
    }
}

// ---------------airline_User functions only and admin---------------

async function new_flight(new_flight) {
    logger.info('Creating new flight')
    logger.debug(`New flight data: ${JSON.stringify(new_flight)}`)
    
    try {
        const result = await connectedKnex('flights').insert(new_flight).returning('*');
        logger.info(`Flight created successfully with ID: ${result[0].id}`)
        logger.debug(`Created flight details: ${JSON.stringify(result[0])}`)
        return result[0]
    }
    catch (error) {
        logger.error('Error creating new flight:', error)
        throw error
    }
}
// פונקציה חדשה להוספה ל-dal_table_flights.js
async function get_destinations_from_origin(origin_id) {
    logger.info(`Retrieving all unique destinations from origin ID: ${origin_id}`);
    try {
        const destinations = await connectedKnex('flights')
            // בחר ID ושם ייחודיים
            .distinct('flights.destination_country_id as id', 'dest_countries.country_name as name')
            // בצע צירוף (join) לטבלת המדינות כדי לקבל את שם היעד
            .join('countries as dest_countries', 'flights.destination_country_id', 'dest_countries.id')
            // סנן לפי מדינת המוצא שנבחרה
            .where('flights.origin_country_id', origin_id)
            .orderBy('name', 'ASC'); // מיין לפי שם
        
        logger.debug(`Found ${destinations.length} unique destinations for origin ${origin_id}`);
        // הפונקציה תחזיר מערך של אובייקטים, למשל:
        // [{ id: 10, name: "Greece" }, { id: 12, name: "Italy" }]
        return destinations;
    } catch (error) {
        logger.error(`Error retrieving destinations for origin ${origin_id}:`, error);
        throw error;
    }
}
// פונקציה חדשה להוספה ל-dal_table_flights.js
async function get_all_origin_countries() {
    logger.info('Retrieving all unique origin countries from flights');
    try {
        const countries = await connectedKnex('flights')
            // בחר רק ID ושם ייחודיים
            .distinct('flights.origin_country_id as id', 'origin_countries.country_name as name')
            // בצע צירוף (join) לטבלת המדינות כדי לקבל את השם
            .join('countries as origin_countries', 'flights.origin_country_id', 'origin_countries.id')
            .orderBy('name', 'ASC'); // מיין לפי שם
        
        logger.debug(`Found ${countries.length} unique origin countries`);
        // הפונקציה תחזיר מערך של אובייקטים, למשל:
        // [{ id: 5, name: "Israel" }, { id: 10, name: "Greece" }]
        return countries;
    } catch (error) {
        logger.error('Error retrieving origin countries:', error);
        throw error;
    }
}
async function get_filtered_flights(filters = {}) {
    const { origin_country_id, destination_country_id, date } = filters;

    logger.info('Retrieving filtered flights');
    logger.debug(`Filter parameters: ${JSON.stringify(filters)}`);

    try {
        let query = connectedKnex('flights')
            .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
            .leftJoin('countries as origin_countries', 'origin_countries.id', 'flights.origin_country_id')
            .leftJoin('countries as destination_countries', 'destination_countries.id', 'flights.destination_country_id')
            .leftJoin('planes', 'planes.id', 'flights.plane_id')
            .select('flights.*', 'airlines.name as airline_name', 'origin_countries.country_name as origin_country_name', 
                    'destination_countries.country_name as destination_country_name', 'planes.seat as Total_tickets');

        // 1. סינון לפי מדינת מוצא
        if (origin_country_id) {
            query.where('flights.origin_country_id', origin_country_id);
        }

        // 2. סינון לפי מדינת יעד
        if (destination_country_id) {
            query.where('flights.destination_country_id', destination_country_id);
        }

        // 3. סינון לפי תאריך (הלוגיקה שביקשת)
        if (date) {
            // מקרה א': המשתמש בחר תאריך ספציפי
            // אנו משווים רק את התאריך (ללא השעה) של הטיסה
            // שימוש ב-whereRaw בטוח מפני SQL Injection כאשר משתמשים ב-'?'
            query.whereRaw('flights.departure_time::date = ?', [date]);
        } else {
            // מקרה ב': המשתמש לא בחר תאריך
            // הצג אוטומטית טיסות מהיום והלאה ("תאריך קרוב")
            query.whereRaw('flights.departure_time::date >= CURRENT_DATE');
        }
        
        // --- סוף סינונים ---

        // מיון התוצאות - תמיד נציג את הטיסות הקרובות ביותר קודם
        query.orderBy('flights.departure_time', 'ASC');

        // בצע את השאילתה
        const flights = await query;

        logger.debug(`Found ${flights.length} flights matching criteria`);
        return flights;

    } catch (error) {
        logger.error('Error retrieving filtered flights:', error);
        throw error; // זרוק את השגיאה כדי שהקוד שקרא לפונקציה יטפל בה
    }
}
async function get_by_id(id) {
    logger.debug(`Looking up flight by ID: ${id}`)
    
    try {
        const flight = await connectedKnex('flights')
            .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
            .leftJoin('countries as origin_countries', 'origin_countries.id', 'flights.origin_country_id')
            .leftJoin('countries as destination_countries', 'destination_countries.id', 'flights.destination_country_id')
            .leftJoin('planes', 'planes.id', 'flights.plane_id')
            .select('flights.*', 'airlines.name as airline_name', 'origin_countries.country_name as origin_country_name', 
                    'destination_countries.country_name as destination_country_name', 'planes.seat as Total_tickets')
            .where('flights.id', id).first()
            
        if (flight) {
            logger.debug(`Flight found by ID: ${id}`)
            return flight
        } else {
            logger.debug(`No flight found with ID: ${id}`)
            return null
        }
    }
    catch (error) {
        logger.error(`Error looking up flight by ID ${id}:`, error)
        throw error
    }
}

async function get_flight_by_airline_id(id) {
    logger.debug(`Looking up flights by airline ID: ${id}`)
    
    try {
        const result = await connectedKnex.raw(`SELECT get_flight_details_by_airline(${id})`);
        const flightsCount = result.rows[0].get_flight_details_by_airline ? 
                             result.rows[0].get_flight_details_by_airline.length : 0
        
        if (flightsCount > 0) {
            logger.debug(`Found ${flightsCount} flights for airline ID: ${id}`)
        } else {
            logger.debug(`No flights found for airline ID: ${id}`)
        }
        
        return result.rows[0].get_flight_details_by_airline
    }
    catch (error) {
        logger.error(`Error looking up flights by airline ID ${id}:`, error)
        throw error
    }
}

async function update_flight(id, updated_flight) {
    logger.info(`Updating flight with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(updated_flight)}`)
    
    try {
        // תחילה בדוק אם הטיסה קיימת
        const flight = await connectedKnex('flights').select('id').where('id', id).first()
        
        if (!flight) {
            logger.warn(`Flight update failed - flight not found: ${id}`)
            return null
        }
        
        const result = await connectedKnex('flights').where('id', id).update(updated_flight)
        logger.info(`Flight ${id} updated successfully`)
        return updated_flight
    }
    catch (error) {
        logger.error(`Error updating flight ${id}:`, error)
        throw error
    }
}

async function delete_flight(id) {
    logger.info(`Deleting flight with ID: ${id}`)
    
    try {
        // תחילה בדוק אם הטיסה קיימת
        const flight = await connectedKnex('flights').select('id').where('id', id).first()
        
        if (!flight) {
            logger.warn(`Flight deletion failed - flight not found: ${id}`)
            return null
        }
        
        const result = await connectedKnex.raw(`CALL delete_flight(${id})`);
        logger.info(`Flight ${id} deleted successfully`)
        return result
    }
    catch (error) {
        logger.error(`Error deleting flight ${id}:`, error)
        throw error
    }
}

// ---------------Admin permission only---------------

async function delete_all() {
    logger.info('Deleting all flights (admin only function)')
    logger.warn('This operation will delete ALL flights from the database')
    
    try {
        const result = await connectedKnex('flights').del()
        logger.debug(`Deleted ${result} flights from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "flights_id_seq" RESTART WITH 1');
        logger.info('Reset flight ID sequence to 1')
        
        return result
    }
    catch (error) {
        logger.error('Error deleting all flights:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting flight ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE flights_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset flight ID sequence to ${id}`)
        return result
    }
    catch (error) {
        logger.error(`Error setting flight ID sequence to ${id}:`, error)
        throw error
    }
}

async function get_by_flight_code(code) {
    logger.debug(`Looking up flight by flight code: ${code}`)
    
    try {
        const flight = await connectedKnex('flights').select('*').where('flight_code', code).first()
        
        if (flight) {
            logger.debug(`Flight found by flight code: ${code}`)
            return flight
        } else {
            logger.debug(`No flight found with flight code: ${code}`)
            return null
        }
    }
    catch (error) {
        logger.error(`Error looking up flight by flight code ${code}:`, error)
        throw error
    }
}

async function get_flight_by_airline_id_test(id) {
    logger.debug(`Test function: Looking up flights by airline ID: ${id}`)
    
    try {
        const result = await connectedKnex.raw(`SELECT get_flights_by_airline(${id})`);
        logger.debug(`Test function result for airline ID ${id}: ${JSON.stringify(result.rows)}`)
        return result
    }
    catch (error) {
        logger.error(`Error in test function for airline ID ${id}:`, error)
        throw error
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
}