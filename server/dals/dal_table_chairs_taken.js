const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Chairs DAL module initialized')

// ---------------User functions only and admin---------------

async function new_chair(new_t) {
    logger.info('Creating new chair assignment')
    logger.debug(`New chair assignment data: ${JSON.stringify(new_t)}`)
    
    try {
        const result = await connectedKnex('chairs_taken').insert(new_t).returning('*');
        logger.info(`Chair assignment created successfully with ID: ${result[0].id}`)
        logger.debug(`Created chair assignment details: Flight: ${result[0].flight_id}, Chair: ${result[0].char_id}, Passenger: ${result[0].passenger_id}`)
        return result[0]
    } catch (error) {
        logger.error('Error creating new chair assignment:', error)
        throw error
    }
}

// ---------------Admin permission only---------------

async function get_by_id(id) {
    logger.debug(`Looking up chair assignment by user ID: ${id}`)
    
    try {
        const chair = await connectedKnex('chairs_taken').select('*').where('user_id', id).first()
        
        if (chair) {
            logger.debug(`Chair assignment found for user ID: ${id}`)
            return chair
        } else {
            logger.debug(`No chair assignment found for user ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up chair assignment by user ID ${id}:`, error)
        throw error
    }
}

async function delete_chair(id) {
    logger.info(`Deleting chair assignment with ID: ${id}`)
    
    try {
        // תחילה בדוק אם ההקצאה קיימת
        const chair = await connectedKnex('chairs_taken').select('*').where('id', id).first()
        
        if (!chair) {
            logger.warn(`Chair assignment deletion failed - assignment not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('chairs_taken').where('id', id).del()
        
        if (result) {
            logger.info(`Chair assignment ${id} deleted successfully (Flight: ${chair.flight_id}, Chair: ${chair.char_id})`)
            return result
        } else {
            logger.warn(`Chair assignment ${id} deletion failed - no rows affected`)
            return 0
        }
    } catch (error) {
        logger.error(`Error deleting chair assignment ${id}:`, error)
        throw error
    }
}

async function update_chair(id, updated_chair) {
    logger.info(`Updating chair assignment with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(updated_chair)}`)
    
    try {
        // תחילה בדוק אם ההקצאה קיימת
        const chair = await connectedKnex('chairs_taken').select('*').where('id', id).first()
        
        if (!chair) {
            logger.warn(`Chair assignment update failed - assignment not found: ${id}`)
            return null
        }
        
        const result = await connectedKnex('chairs_taken').where('id', id).update(updated_chair)
        
        if (result) {
            logger.info(`Chair assignment ${id} updated successfully`)
            const updatedChairInfo = { ...chair, ...updated_chair }
            logger.debug(`Updated chair assignment details: Flight: ${updatedChairInfo.flight_id}, Chair: ${updatedChairInfo.char_id}, Passenger: ${updatedChairInfo.passenger_id}`)
            return updated_chair
        } else {
            logger.warn(`Chair assignment ${id} update failed - no rows affected`)
            return null
        }
    } catch (error) {
        logger.error(`Error updating chair assignment ${id}:`, error)
        throw error
    }
}

async function get_all_chairs_by_flight(id) {
    logger.info(`Retrieving all chair assignments for flight ID: ${id}`)
    
    try {
        // --- שינוי ---
        // שימוש ב-Knex בצורה בטוחה (Parameterized Query)
        const chairs_taken = await connectedKnex('chairs_taken')
            .select('id', 'flight_id', 'char_id', 'passenger_id', 'user_id')
            .where('flight_id', id);
        // --- סוף שינוי ---

        const chairsCount = chairs_taken ? chairs_taken.length : 0
        logger.debug(`Retrieved ${chairsCount} chair assignments for flight ${id}`)
        
        return chairs_taken // מחזיר ישירות את המערך
    } catch (error) {
        logger.error(`Error retrieving chair assignments for flight ${id}:`, error)
        throw error
    }
}

async function delete_all() {
    logger.info('Deleting all chair assignments (admin only function)')
    logger.warn('This operation will delete ALL chair assignments from the database')
    
    try {
        const result = await connectedKnex('chairs_taken').del()
        logger.debug(`Deleted ${result} chair assignments from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "chairs_id_seq" RESTART WITH 1');
        logger.info('Reset chair assignment ID sequence to 1')
        
        return result
    } catch (error) {
        logger.error('Error deleting all chair assignments:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting chair assignment ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE chairs_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset chair assignment ID sequence to ${id}`)
        return result
    } catch (error) {
        logger.error(`Error setting chair assignment ID sequence to ${id}:`, error)
        throw error
    }
}

module.exports = { 
    get_all_chairs_by_flight, 
    get_by_id, 
    new_chair, 
    update_chair, 
    delete_chair, 
    set_id, 
    delete_all 
}