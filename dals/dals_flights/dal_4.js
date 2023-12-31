
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
    const tableExists = await connectedKnex.schema.hasTable('customers');

    if (!tableExists) {
        await connectedKnex.schema.createTable('customers', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
            table.string('name', 255).notNullable(); // Use string for VARCHAR
            table.integer('country_id').unsigned(); // Ensure unsigned for FK
            table.foreign('country_id').references('countries').on('id');
            table.bigInteger('user_id').unique().unsigned(); // Unsigned for FK
            table.foreign('user_id').references('users').on('id');
        });
    }
}

async function delete_all() {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').del()
    await connectedKnex.raw('ALTER SEQUENCE "cusstomers_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from customers')
    const messages = await connectedKnex('customers').select('*')

    return messages
}

async function get_by_id(id) {
    // db.run('select * from customers where id=?')
    const message = await connectedKnex('customers').select('*').where('id', id).first()
    return message
}

async function new_message(new_mes) {
    // db.run('insert into customers ....')
    // result[0] will be the new ID given by the SQL
    // Insert into customers values(....)
    const result = await connectedKnex('customers').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_message(id, updated_message) {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').where('id', id).update(updated_message)
    return updated_message
}

async function delete_message(id) {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_message, update_message, delete_message,
    delete_all, create_table_if_not_exist
}