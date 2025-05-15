const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Passengers DAL module initialized')

// ---------------User functions only and admin---------------

async function new_passenger(new_passenger) {
    logger.info('Creating new passenger')
    logger.debug(`New passenger data: ${JSON.stringify(new_passenger)}`)
    
    try {
        const result = await connectedKnex('passengers').insert(new_passenger).returning('*');
        logger.info(`Passenger created successfully with ID: ${result[0].id}`)
        logger.debug(`Created passenger details: ${JSON.stringify(result[0])}`)
        return result[0]
    } catch (error) {
        logger.error('Error creating new passenger:', error)
        throw error
    }
}

async function get_by_id_passenger(id) {
    logger.debug(`Looking up passenger by ID: ${id}`)
    
    try {
        const passenger = await connectedKnex('passengers').select('*').where('id', id).first()
        
        if (passenger) {
            logger.debug(`Passenger found by ID: ${id}`)
            return passenger
        } else {
            logger.debug(`No passenger found with ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up passenger by ID ${id}:`, error)
        throw error
    }
}

// ---------------Admin permission only---------------

async function update_passenger(id, updated_passenger) {
    logger.info(`Updating passenger with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(updated_passenger)}`)
    
    try {
        // תחילה בדוק אם הנוסע קיים
        const passenger = await connectedKnex('passengers').select('id').where('id', id).first()
        
        if (!passenger) {
            logger.warn(`Passenger update failed - passenger not found: ${id}`)
            return null
        }
        
        const result = await connectedKnex('passengers').where('id', id).update(updated_passenger)
        logger.info(`Passenger ${id} updated successfully`)
        return updated_passenger
    } catch (error) {
        logger.error(`Error updating passenger ${id}:`, error)
        throw error
    }
}

async function delete_passenger(id) {
    logger.info(`Deleting passenger with ID: ${id}`)
    
    try {
        // תחילה בדוק אם הנוסע קיים
        const passenger = await connectedKnex('passengers').select('id').where('id', id).first()
        
        if (!passenger) {
            logger.warn(`Passenger deletion failed - passenger not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('passengers').where('id', id).del()
        logger.info(`Passenger ${id} deleted successfully`)
        return result
    } catch (error) {
        logger.error(`Error deleting passenger ${id}:`, error)
        throw error
    }
}

async function get_all() {
    logger.info('Retrieving all passengers (admin only function)')
    
    try {
        const passengers = await connectedKnex.raw(`SELECT get_all_passengers();`)
        const passengersCount = passengers.rows[0].get_all_passengers ? passengers.rows[0].get_all_passengers.length : 0
        logger.debug(`Retrieved ${passengersCount} passengers successfully`)
        return passengers.rows[0].get_all_passengers
    } catch (error) {
        logger.error('Error retrieving all passengers:', error)
        throw error
    }
}

async function get_by_id(id) {
    // הערה: פונקציה זו נראית זהה ל-get_by_id_passenger
    // יתכן שצריך לאחד אותן או להשתמש רק באחת מהן
    logger.debug(`Looking up passenger by ID (duplicate function): ${id}`)
    
    try {
        const passenger = await connectedKnex('passengers').select('*').where('id', id).first()
        
        if (passenger) {
            logger.debug(`Passenger found by ID: ${id}`)
            return passenger
        } else {
            logger.debug(`No passenger found with ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up passenger by ID ${id}:`, error)
        throw error
    }
}

async function delete_all() {
    logger.info('Deleting all passengers (admin only function)')
    logger.warn('This operation will delete ALL passengers from the database')
    
    try {
        const result = await connectedKnex('passengers').del()
        logger.debug(`Deleted ${result} passengers from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "passengers_id_seq" RESTART WITH 1');
        logger.info('Reset passenger ID sequence to 1')
        
        return result
    } catch (error) {
        logger.error('Error deleting all passengers:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting passenger ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE passengers_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset passenger ID sequence to ${id}`)
        return result
    } catch (error) {
        logger.error(`Error setting passenger ID sequence to ${id}:`, error)
        throw error
    }
}

async function get_by_passport_number(passport_number) {
    logger.debug(`Looking up passenger by passport number: ${passport_number}`)
    
    try {
        const passenger = await connectedKnex('passengers')
                              .select('*')
                              .where('passport_number', passport_number)
                              .first()
        
        if (passenger) {
            logger.debug(`Passenger found by passport number: ${passport_number}`)
            return passenger
        } else {
            logger.debug(`No passenger found with passport number: ${passport_number}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up passenger by passport number ${passport_number}:`, error)
        throw error
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
}