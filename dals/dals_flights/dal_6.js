
const knex = require('knex')
const config = require('config')

const connectedKnex = knex({
    client: 'pg',
    version: '15',
    connection: {
        host: config.db_cloud.host,
        user: config.db_cloud.user,
        password: config.db_cloud.password,
        database: config.db_cloud.database,
        ssl: true
    }
})

async function create_table_if_not_exist() {
    const tableExists = await connectedKnex.schema.hasTable('tickets');

    if (!tableExists) {
        await connectedKnex.schema.createTable('tickets', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
        table.bigInteger('customer_id').unsigned().notNullable(); // Unsigned for FK
        table.unique(['flight_id', 'customer_id']); // Unique composite index
        table.foreign('customer_id').references('customers').on('id');
        // Add other necessary columns here
        });
    }
}

async function delete_all() {
    // db.run('update tickets ....')
    const result = await connectedKnex('tickets').del()
    await connectedKnex.raw('ALTER SEQUENCE "tickets_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from tickets')
    const messages = await connectedKnex('tickets').select('*')

    return messages
}

async function get_by_id(id) {
    // db.run('select * from tickets where id=?')
    const message = await connectedKnex('tickets').select('*').where('id', id).first()
    return message
}

async function new_message(new_mes) {
    // db.run('insert into tickets ....')
    // result[0] will be the new ID given by the SQL
    // Insert into tickets values(....)
    const result = await connectedKnex('tickets').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_message(id, updated_message) {
    // db.run('update tickets ....')
    const result = await connectedKnex('tickets').where('id', id).update(updated_message)
    return updated_message
}

async function delete_message(id) {
    // db.run('update tickets ....')
    const result = await connectedKnex('tickets').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_message, update_message, delete_message,
    delete_all, create_table_if_not_exist
}