
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
    const tableExists = await connectedKnex.schema.hasTable('users');

    if (!tableExists) {
        await connectedKnex.schema.createTable('users', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
            table.string('username').notNullable();
            table.string('password').notNullable();
            table.string('email').notNullable();
        });
    }
}

async function delete_all() {
    // db.run('update users ....')
    const result = await connectedKnex('users').del()
    await connectedKnex.raw('ALTER SEQUENCE "users_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from users')
    const users = await connectedKnex('users')
    .select('users.*', 'roles.role_name')
    .from('users')
    .join('roles', 'users.role_id', 'roles.id');
  

    return users
}

async function get_by_id(id) {
    // db.run('select * from users where id=?')
    const user = await connectedKnex('users').select('*').where('id', id).first()
    return user
}

async function new_user(new_mes) {
    // db.run('insert into users ....')
    // result[0] will be the new ID given by the SQL
    // Insert into users values(....)
    const result = await connectedKnex('users').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_user(id, updated_user) {
    // db.run('update users ....')
    const result = await connectedKnex('users').where('id', id).update(updated_user)
    return updated_user
}

async function delete_user(id) {
    // db.run('update users ....')
    const result = await connectedKnex('users').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_user, update_user, delete_user,
    delete_all, create_table_if_not_exist
}