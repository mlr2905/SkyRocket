
const knex = require('knex')
const config = require('config')

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
    const tableExists = await connectedKnex.schema.hasTable('ALLCHAT');

    if (!tableExists) {
      await connectedKnex.schema.createTable('ALLCHAT', (table) => {
        table.increments('ID').primary(); // This creates a SERIAL column
        table.string('NAME').notNullable();
        table.string('TEXT').notNullable();
        table.timestamp('TIME').notNullable();
        table.integer('SUPER-ID').notNullable();
    
      });
    }

}

async function delete_all() {
    // db.run('update ALLCHAT ....')
    const result = await connectedKnex('ALLCHAT').del()
    await connectedKnex.raw('ALTER SEQUENCE "ALLCHAT_ID_seq" RESTART WITH 1');
    return result    
}

async function get_all() {
    // db.run('select * from ALLCHAT')
    const data = await connectedKnex('ALLCHAT').select('*')
    return data
}

async function get_by_id(id) {
    // db.run('select * from ALLCHAT where id=?')
    const data = await connectedKnex('ALLCHAT').select('*').where('ID', id).first()
    return data
}

async function new_data(new_emp) {
    // db.run('insert into ALLCHAT ....')
    // result[0] will be the new ID given by the SQL
    // Insert into ALLCHAT values(....)
    const result = await connectedKnex('ALLCHAT').insert(new_emp)
    return { ...new_emp, ID: result[0] }
}

async function update_data(id, updated_data) {
    // db.run('update ALLCHAT ....')
    const result = await connectedKnex('ALLCHAT').where('ID', id).update(updated_data)
    return updated_data
}

async function delete_data(id) {
    // db.run('update ALLCHAT ....')
    const result = await connectedKnex('ALLCHAT').where('ID', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_data, update_data, delete_data, 
    delete_all, create_table_if_not_exist
}
