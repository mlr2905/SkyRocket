const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------User functions only and admin---------------

async function new_ticket(new_t) {
    // db.run('insert into tickets ....')
    // result[0] will be the new ID given by the SQL
    // Insert into tickets values(....)
    const result = await connectedKnex('tickets').insert(new_t).returning('*');
    return result[0]

}

async function get_by_id(id) {
    // db.run('select * from tickets where user_id=?')
    const ticket = await connectedKnex('tickets').select('*').where('id', id).first()
    return ticket
}

async function delete_ticket(id) {
    // db.run('update tickets ....')
    const result = await connectedKnex('tickets').where('id', id).del()
    return result
}

// ---------------Admin permission only---------------

async function update_ticket(id, updated_ticket) {
    // db.run('update tickets ....')
    const result = await connectedKnex('tickets').where('id', id).update(updated_ticket)
    return result
} 
async function get_all() {
    // db.run('select * from tickets')
    const tickets = await connectedKnex.raw(`SELECT get_all_tickets();`)
    return tickets.rows[0].get_all_tickets
}

async function delete_all() {
    // db.run('update tickets ....')
    const result = await connectedKnex('tickets').del()
    await connectedKnex.raw('ALTER SEQUENCE "tickets_id_seq" RESTART WITH 1');
    return result
}

// ---------------Test functions only---------------


async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE tickets_id_seq RESTART WITH ${id}`);
        return result;

    } catch (e) {
        throw console.error('Error fetching next user ID:', e);

    }
}

async function get_by_ticket_code(code) {

    const get_by_ticket_code = await connectedKnex('tickets').select('*').where('ticket_code', code).first()

    return get_by_ticket_code
}

module.exports = {
    get_all, get_by_id, new_ticket, update_ticket, delete_ticket, set_id, delete_all,get_by_ticket_code
}