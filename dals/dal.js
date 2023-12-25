
const knex = require('knex')
const config = require('config')

// const connectedKnex = knex({
//     client: 'pg',
//     version: '13',
//     connection: {
//         host: '127.0.0.1',
//         user: 'postgres',
//         password: 'admin',
//         database: 'postgres'
//     }
// })

const connectedKnex = knex({
    client: 'pg',
    version: '13',
    connection: {
        host: config.db_cloud.host,
        user: config.db_cloud.user,
        password: config.db_cloud.password,
        database: config.db_cloud.database,
        ssl: true
    }
})

async function create_table_if_not_exist() {
    const tableExists = await connectedKnex.schema.hasTable('CHATSTORAGE');

    if (!tableExists) {
      await connectedKnex.schema.createTable('CHATSTORAGE', (table) => {
        table.increments('ID').primary(); // This creates a SERIAL column
        table.string('NAME').notNullable();
        table.string('TEXT').notNullable();
           
      });
    }

}

async function delete_all() {
    // db.run('update CHATSTORAGE ....')
    const result = await connectedKnex('CHATSTORAGE').del()
    await connectedKnex.raw('ALTER SEQUENCE "CHATSTORAGE_ID_seq" RESTART WITH 1');
    return result    
}

async function get_all() {
    // db.run('select * from CHATSTORAGE')
    const messages = await connectedKnex('CHATSTORAGE').select('*')
    return messages
}

async function get_by_id(id) {
    // db.run('select * from CHATSTORAGE where id=?')
    const message = await connectedKnex('CHATSTORAGE').select('*').where('ID', id).first()
    return message
}

async function new_message(new_mes) {
    // db.run('insert into CHATSTORAGE ....')
    // result[0] will be the new ID given by the SQL
    // Insert into CHATSTORAGE values(....)
    const result = await connectedKnex('CHATSTORAGE').insert(new_mes)
    return { ...new_mes, ID: result[0] }
}

async function update_message(id, updated_message) {
    // db.run('update CHATSTORAGE ....')
    const result = await connectedKnex('CHATSTORAGE').where('ID', id).update(updated_message)
    return updated_message
}

async function delete_message(id) {
    // db.run('update CHATSTORAGE ....')
    const result = await connectedKnex('CHATSTORAGE').where('ID', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_message, update_message, delete_message, 
    delete_all, create_table_if_not_exist
}
