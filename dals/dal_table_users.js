const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------User functions only and admin---------------

async function checkPassword (username,password) {
    // db.run('select * from users where id=?')
    const user = await connectedKnex.raw('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
    return user
}

async function get_by_name(name) {
    // db.run('select * from users where id=?')
    const user = await connectedKnex.raw('users').select('*').where('username', name).first()
    return user
}

//new_user
async function sp_i_users_airlines(user) {
    const new_user = await connectedKnex.raw(`CALL sp_i_users_airlines('${user.username}','${user.email}','${user.password}');`)
    return new_user
}

//new_user (Automatically generates a password)
async function sp_pass_users_airlines(user) {
    const new_user = await connectedKnex.raw(`CALL sp_pass_users_airlines('${user.username}','${user.email}','');`)
    return new_user
}

async function sp_i_users(user) {
    const new_user = await connectedKnex.raw(`CALL sp_i_users('${user.username}','${user.email}','${user.password}');`)
    return new_user
}

//new_user (Automatically generates a password)
async function sp_pass_users(user) {
    const Result = await connectedKnex.raw(`CALL sp_pass_users('${user.username}','${user.email}','');`)
    return Result.rows[0]._generated_password
}

async function update_user(id, user) {
    try {
        // if (user.password !== "null" && user.password !== "null") {
        //     const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${user.email}', '${user.password}');`)
        //     return update
        // }
        // else {
            if (user.email === 'null') {
                const update = await connectedKnex.raw(`CALL update_user_info(${id}, ${user.email}, '${user.password}');`)
                return update
            }
            if (user.password === 'null') {
                const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${user.email}', ${user.password});`)
                return update
            }
            return { error: 'The fields are not registered well' }
        // }
    }
    catch (e) {
        throw console.error('Not carried out:', e);
    }
}

async function get_by_id(type,id) {
    // db.run('select * from users where id=?')
    const user = await connectedKnex('users')
        .select('users.*', 'roles.role_name')
        .join('roles', 'users.role_id', 'roles.id')
        .where(`users.${type}`, id)
        .first();
    return user
}

async function delete_user(id) {
    // db.run('update users ....')
        const delete_user = await connectedKnex.raw(`CALL delete_user(${id});`)
        return delete_user
}

// ---------------Admin permission only---------------

async function get_all() {
    // db.run('select * from users')
    const users = await connectedKnex.raw(`SELECT get_all_users();`)
    return users.rows[0].get_all_users
}
async function delete_all() {
    // db.run('update users ....')
    const result = await connectedKnex('users').del()
    await connectedKnex.raw('ALTER SEQUENCE "users_id_seq" RESTART WITH 1');
    return result
}

// ---------------Test functions only---------------

async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE users_id_seq RESTART WITH ${id}`);
        return result;
    } catch (e) {
        throw console.error(e);
    }
}

module.exports = {
    get_by_name, get_all, get_by_id, update_user, delete_user,checkPassword,
    delete_all, sp_i_users, sp_pass_users, sp_i_users_airlines, sp_pass_users_airlines, set_id
}