const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');
const connectedKnex = db.connect();
const FILE = 'dal_table_tickets';

Log.info(FILE, 'init', null, 'Tickets DAL module initialized');

// ---------------User functions only and admin---------------

async function get_tickets_by_user_id(user_id) {
    const func = 'get_tickets_by_user_id';
    Log.info(FILE, func, user_id, 'Fetching all tickets for user');
    
    try {
        const tickets = await connectedKnex('tickets as t')
            .join('passengers as p', 't.passenger_id', 'p.id')
            .join('flights as f', 't.flight_id', 'f.id')
            .join('airlines as a', 'f.airline_id', 'a.id')
            .join('countries as origin_c', 'f.origin_country_id', 'origin_c.id')
            .join('countries as dest_c', 'f.destination_country_id', 'dest_c.id')
            .select(
                't.id as ticket_id',
                't.ticket_code',
                't.chair_id', 
                'p.first_name',
                'p.last_name',
                'f.departure_time',
                'f.landing_time',
                'f.plane_id', 
                'a.name as airline_name',
                'origin_c.country_name as origin_country',
                'dest_c.country_name as destination_country'
            )
            .where('t.user_id', user_id)
            .orderBy('f.departure_time', 'desc');

        Log.debug(FILE, func, user_id, `Found ${tickets.length} tickets`);
        return tickets;

    } catch (error) {
        Log.error(FILE, func, user_id, 'Error fetching tickets', error);
        throw error;
    }
}


async function new_ticket(newTicketData) {
    const func = 'new_ticket';
    Log.info(FILE, func, newTicketData.user_id, 'Creating new ticket');
    Log.debug(FILE, func, newTicketData.user_id, `Ticket data: ${JSON.stringify(newTicketData)}`);

    const dataToInsert = {
        flight_id: newTicketData.flight_id,
        customer_id: newTicketData.customer_id,
        passenger_id: newTicketData.passenger_id,
        user_id: newTicketData.user_id,
        chair_id: newTicketData.chair_id
    };

    try {
        const result = await connectedKnex('tickets')
            .insert(dataToInsert)
            .returning('*');
        Log.info(FILE, func, newTicketData.user_id, `Ticket created successfully (ID: ${result[0].id})`);
        Log.debug(FILE, func, newTicketData.user_id, `Created details: ${JSON.stringify(result[0])}`);
        return result[0];
    } catch (error) {
        Log.error(FILE, func, newTicketData.user_id, 'Error creating ticket', error);
        throw error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up ticket by ID');
    
    try {
        const ticket = await connectedKnex('tickets').select('*').where('id', id).first();
        
        if (ticket) {
            Log.debug(FILE, func, id, 'Ticket found');
            return ticket;
        } else {
            Log.debug(FILE, func, id, 'No ticket found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up ticket', error);
        throw error;
    }
}

async function delete_ticket(id) {
    const func = 'delete_ticket';
    Log.info(FILE, func, id, 'Deleting ticket');
    
    try {
        const ticket = await connectedKnex('tickets').select('id').where('id', id).first();
        
        if (!ticket) {
            Log.warn(FILE, func, id, 'Ticket deletion failed - ticket not found');
            return 0;
        }
        
        const result = await connectedKnex('tickets').where('id', id).del();
        Log.info(FILE, func, id, 'Ticket deleted successfully');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting ticket', error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function update_ticket(id, updated_ticket) {
    const func = 'update_ticket';
    Log.info(FILE, func, id, 'Updating ticket');
    Log.debug(FILE, func, id, `Update data: ${JSON.stringify(updated_ticket)}`);
    
    try {
        const ticket = await connectedKnex('tickets').select('id').where('id', id).first();
        
        if (!ticket) {
            Log.warn(FILE, func, id, 'Ticket update failed - ticket not found');
            return 0;
        }
        
        const result = await connectedKnex('tickets').where('id', id).update(updated_ticket);
        Log.info(FILE, func, id, 'Ticket updated successfully');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating ticket', error);
        throw error;
    }
}

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all tickets (admin only)');
    
    try {
        const tickets = await connectedKnex.raw(`SELECT get_all_tickets();`);
        const ticketsCount = tickets.rows[0].get_all_tickets ? tickets.rows[0].get_all_tickets.length : 0;
        Log.debug(FILE, func, null, `Retrieved ${ticketsCount} tickets successfully`);
        return tickets.rows[0].get_all_tickets;
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all tickets', error);
        throw error;
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all tickets (admin only)');
    Log.warn(FILE, func, null, 'This operation will delete ALL tickets from the database');
    
    try {
        const result = await connectedKnex('tickets').del();
        Log.debug(FILE, func, null, `Deleted ${result} tickets`);
        
        await connectedKnex.raw('ALTER SEQUENCE "tickets_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset ticket ID sequence to 1');
        
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting all tickets', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting ticket ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE tickets_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset ticket ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error setting ticket ID sequence', error);
        throw error;
    }
}

async function get_by_ticket_code(code) {
    const func = 'get_by_ticket_code';
    Log.debug(FILE, func, code, 'Looking up ticket by code');
    
    try {
        const ticket = await connectedKnex('tickets').select('*').where('ticket_code', code).first();
        
        if (ticket) {
            Log.debug(FILE, func, ticket.id, 'Ticket found');
            return ticket;
        } else {
            Log.debug(FILE, func, code, 'No ticket found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, code, 'Error looking up ticket by code', error);
        throw error;
    }
}

module.exports = { 
    get_tickets_by_user_id,
    get_all, 
    get_by_id, 
    new_ticket, 
    update_ticket, 
    delete_ticket, 
    set_id, 
    delete_all, 
    get_by_ticket_code 
};