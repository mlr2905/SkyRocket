
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

// ---------------User functions only---------------

//new_user
async function sp_i_users(name, email, password) {
    const new_user = await connectedKnex.raw(`CALL sp_i_users('${name}','${email}','${password}');`)
    return new_user
}
//new_user (Automatically generates a password)
async function sp_pass_users(name, email) {
    const new_user = await connectedKnex.raw(`CALL sp_pass_users('${name}','${email}','');`)
    return new_user 
}

async function update_user(id, emall, password) {
    try {
        if (emall === null) {
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, ${emall}, '${password}');`)
            return update 
        }
        if (password === null) {
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${emall}', ${password});`)
            return update
        }
    }
    catch (e) {
        throw     console.error('Not carried out:', e);
        ; // Re-throw the error for further handling
    }
}

async function get_by_id(id) {
    // db.run('select * from users where id=?')
    const user = await connectedKnex('users')
    .select('users.*', 'roles.role_name')
    .join('roles', 'users.role_id', 'roles.id')
    .where('users.id', id)
    .first();

    return user
}

async function delete_user(id) {
    // db.run('update users ....')
    const result = await connectedKnex('users').where('id', id).del()
    return result
}

// ---------------Admin permission only---------------
async function get_all() {
    // db.run('select * from users')
    const users = await connectedKnex('users')
        .select('users.*', 'roles.role_name')
        .from('users')
        .join('roles', 'users.role_id', 'roles.id');

    return users
}
async function delete_all() {
    // db.run('update users ....')
    const result = await connectedKnex('users').del()
    await connectedKnex.raw('ALTER SEQUENCE "users_id_seq" RESTART WITH 1');
    return result
}

// ---------------Test functions only---------------

async function get_next_user_id() {
    try {
        let result = await connectedKnex.raw(`SELECT get_next_user_id()`);
        return result

    } catch (e) {
        throw    console.error('Error fetching next user ID:', e);

    }
}

async function set_id_user(id) {
    try {
        const result = await connectedKnex.raw(`CALL reset_id_user(${id})`);
        return result;

    } catch (e) {
        throw    console.error('Error fetching next user ID:', e);

    }
}
// async function create_table_if_not_exist() {
//     const tableExists = await connectedKnex.schema.hasTable('users');

//     if (!tableExists) {
//         await connectedKnex.schema.createTable('users', (table) => {
//             table.increments('id').primary(); // This creates a SERIAL column
//             table.string('username').notNullable();
//             table.string('password').notNullable();
//             table.string('email').notNullable();
//         });
//     }
// }

module.exports = {
    get_all, get_by_id, update_user, delete_user,
    delete_all, sp_i_users, sp_pass_users, get_next_user_id, set_id_user
    // ,create_table_if_not_exist
}