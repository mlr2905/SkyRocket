const knex = require('knex')
const db = require('../../a_db/db')
const connectedKnex = db.connect()

async function create_table_if_not_exist() {
    const tableExists = await connectedKnex.schema.hasTable('connected');

    if (!tableExists) {
        await connectedKnex.schema.createTable('connected', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
            table.string('user').notNullable();
            table.time('time', { precision: 0 });
        });
    }

}

async function delete_all() {
    // db.run('update connected ....')
    const result = await connectedKnex('connected').del()
    await connectedKnex.raw('ALTER SEQUENCE "connected_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from connected')
    const messages = await connectedKnex('connected').select('*')
    return messages
}

async function get_by_id(id) {
    // db.run('select * from connected where id=?')
    const message = await connectedKnex('connected').select('*').where('id', id).first()
    return message
}

async function new_message(new_mes) {
    // db.run('insert into connected ....')
    // result[0] will be the new ID given by the SQL
    // Insert into connected values(....)
    const result = await connectedKnex('connected').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_message(id, updated_message) {
    // db.run('update connected ....')
    const result = await connectedKnex('connected').where('id', id).update(updated_message)
    return updated_message
}

async function delete_message(id) {
    // db.run('update connected ....')
    const result = await connectedKnex('connected').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_message, update_message, delete_message,
    delete_all, create_table_if_not_exist
}