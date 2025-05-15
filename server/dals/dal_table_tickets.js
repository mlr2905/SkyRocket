const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Tickets DAL module initialized')

// ---------------User functions only and admin---------------

async function new_ticket(new_t) {
    logger.info('Creating new ticket')
    logger.debug(`New ticket data: ${JSON.stringify(new_t)}`)
    
    try {
        const result = await connectedKnex('tickets').insert(new_t).returning('*');
        logger.info(`Ticket created successfully with ID: ${result[0].id}`)
        logger.debug(`Created ticket details: ${JSON.stringify(result[0])}`)
        return result[0]
    } catch (error) {
        logger.error('Error creating new ticket:', error)
        throw error
    }
}

async function get_by_id(id) {
    logger.debug(`Looking up ticket by ID: ${id}`)
    
    try {
        const ticket = await connectedKnex('tickets').select('*').where('id', id).first()
        
        if (ticket) {
            logger.debug(`Ticket found by ID: ${id}`)
            return ticket
        } else {
            logger.debug(`No ticket found with ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up ticket by ID ${id}:`, error)
        throw error
    }
}

async function delete_ticket(id) {
    logger.info(`Deleting ticket with ID: ${id}`)
    
    try {
        // תחילה בדוק אם הכרטיס קיים
        const ticket = await connectedKnex('tickets').select('id').where('id', id).first()
        
        if (!ticket) {
            logger.warn(`Ticket deletion failed - ticket not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('tickets').where('id', id).del()
        logger.info(`Ticket ${id} deleted successfully`)
        return result
    } catch (error) {
        logger.error(`Error deleting ticket ${id}:`, error)
        throw error
    }
}

// ---------------Admin permission only---------------

async function update_ticket(id, updated_ticket) {
    logger.info(`Updating ticket with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(updated_ticket)}`)
    
    try {
        // תחילה בדוק אם הכרטיס קיים
        const ticket = await connectedKnex('tickets').select('id').where('id', id).first()
        
        if (!ticket) {
            logger.warn(`Ticket update failed - ticket not found: ${id}`)
            return 0
        }
        
        const result = await connectedKnex('tickets').where('id', id).update(updated_ticket)
        logger.info(`Ticket ${id} updated successfully`)
        return result
    } catch (error) {
        logger.error(`Error updating ticket ${id}:`, error)
        throw error
    }
}

async function get_all() {
    logger.info('Retrieving all tickets (admin only function)')
    
    try {
        const tickets = await connectedKnex.raw(`SELECT get_all_tickets();`)
        const ticketsCount = tickets.rows[0].get_all_tickets ? tickets.rows[0].get_all_tickets.length : 0
        logger.debug(`Retrieved ${ticketsCount} tickets successfully`)
        return tickets.rows[0].get_all_tickets
    } catch (error) {
        logger.error('Error retrieving all tickets:', error)
        throw error
    }
}

async function delete_all() {
    logger.info('Deleting all tickets (admin only function)')
    logger.warn('This operation will delete ALL tickets from the database')
    
    try {
        const result = await connectedKnex('tickets').del()
        logger.debug(`Deleted ${result} tickets from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "tickets_id_seq" RESTART WITH 1');
        logger.info('Reset ticket ID sequence to 1')
        
        return result
    } catch (error) {
        logger.error('Error deleting all tickets:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting ticket ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE tickets_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset ticket ID sequence to ${id}`)
        return result
    } catch (error) {
        logger.error(`Error setting ticket ID sequence to ${id}:`, error)
        throw error
    }
}

async function get_by_ticket_code(code) {
    logger.debug(`Looking up ticket by code: ${code}`)
    
    try {
        const ticket = await connectedKnex('tickets').select('*').where('ticket_code', code).first()
        
        if (ticket) {
            logger.debug(`Ticket found by code: ${code}`)
            return ticket
        } else {
            logger.debug(`No ticket found with code: ${code}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up ticket by code ${code}:`, error)
        throw error
    }
}

module.exports = { 
    get_all, 
    get_by_id, 
    new_ticket, 
    update_ticket, 
    delete_ticket, 
    set_id, 
    delete_all, 
    get_by_ticket_code 
}