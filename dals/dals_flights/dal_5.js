
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
    const tableExists = await connectedKnex.schema.hasTable('flights');

    if (!tableExists) {
        await connectedKnex.schema.createTable('flights', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
            table.bigInteger('airline_id').unsigned().notNullable(); // Unsigned for FK
            table.foreign('airline_id').references('airlines').on('id');
            table.integer('origin_country_id').unsigned().notNullable(); // Unsigned for FK
            table.foreign('origin_country_id').references('countries').on('id');
            table.integer('destination_country_id').unsigned().notNullable(); // Unsigned for FK
            table.foreign('destination_country_id').references('countries').on('id');
            table.timestamp('departure_time').notNullable(); // Corrected typo
            table.timestamp('landing_time').notNullable();
            table.integer('remaining_tickets').notNullable();
        });
    }
}

async function delete_all() {
    // db.run('update flights ....')
    const result = await connectedKnex('flights').del()
    await connectedKnex.raw('ALTER SEQUENCE "flights_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from flights')
    const messages = await connectedKnex('flights').select('*')

    return messages
}

async function get_by_id(id) {
    // db.run('select * from flights where id=?')
    const message = await connectedKnex('flights').select('*').where('id', id).first()
    return message
}

async function new_message(new_mes) {
    // db.run('insert into flights ....')
    // result[0] will be the new ID given by the SQL
    // Insert into flights values(....)
    const result = await connectedKnex('flights').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_message(id, updated_message) {
    // db.run('update flights ....')
    const result = await connectedKnex('flights').where('id', id).update(updated_message)
    return updated_message
}

async function delete_message(id) {
    // db.run('update flights ....')
    const result = await connectedKnex('flights').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_message, update_message, delete_message,
    delete_all, create_table_if_not_exist
}