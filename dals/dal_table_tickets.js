const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------User functions only and admin---------------

async function new_ticket(new_t) {
    // db.run('insert into tickets ....')
    // result[0] will be the new ID given by the SQL
    // Insert into tickets values(....)
    const result = await connectedKnex('tickets').insert(new_t)
    return { ...new_t, id: result[0] }

}

async function get_by_id(id) {
    // db.run('select * from tickets where user_id=?')
    const ticket = await connectedKnex('tickets').select('*').where('user_id', id).first()
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
    return updated_ticket
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

async function get_next_ticket_id() {
    try {
        const result = await connectedKnex.raw(`SELECT nextval('tickets_id_seq')`);
        return result;

    } catch (e) {
        throw console.error( e);

    }
}

async function set_id_ticket(id) {
    try {
        const result = await connectedKnex.raw(`CALL reset_id_tickets(${id})`);
        return result;

    } catch (e) {
        throw console.error('Error fetching next user ID:', e);

    }
}

// async function create_table_if_not_exist() {
//     const tableExists = await connectedKnex.schema.hasTable('tickets');

//     if (!tableExists) {
//         await connectedKnex.schema.createTable('tickets', (table) => {
//             table.increments('id').primary();
//             table.integer('flight_id').notNullable().references('flights.id');
//             table.integer('customer_id').unique().notNullable().references('customers.id');
//             table.integer('passenger_id').unique().notNullable().references('passengers.id');
//                 });
//     }
// }

module.exports = {
    get_all, get_by_id, new_ticket, update_ticket, delete_ticket, get_next_ticket_id, set_id_ticket, delete_all
    // , create_table_if_not_exist
}