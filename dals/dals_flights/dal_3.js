
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
    const tableExists = await connectedKnex.schema.hasTable('airlines');

    if (!tableExists) {
        await connectedKnex.schema.createTable('airlines', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
            table.integer('country_id').notNullable();
            table.integer('user_id').notNullable();
            table.foreign('country_id').references('countries').on('id');
            table.foreign('user_id').references('users').on('id');
        });
    }
}

async function delete_all() {
    // db.run('update airlines ....')
    const result = await connectedKnex('airlines').del()
    await connectedKnex.raw('ALTER SEQUENCE "airlines_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from airlines')
    const messages = await connectedKnex('airlines').select('*')

    return messages
}

async function get_by_id(id) {
    // db.run('select * from airlines where id=?')
    const message = await connectedKnex('airlines').select('*').where('id', id).first()
    return message
}

async function new_message(new_mes) {
    // db.run('insert into airlines ....')
    // result[0] will be the new ID given by the SQL
    // Insert into airlines values(....)
    const result = await connectedKnex('airlines').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_message(id, updated_message) {
    // db.run('update airlines ....')
    const result = await connectedKnex('airlines').where('id', id).update(updated_message)
    return updated_message
}

async function delete_message(id) {
    // db.run('update airlines ....')
    const result = await connectedKnex('airlines').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_message, update_message, delete_message,
    delete_all, create_table_if_not_exist
}