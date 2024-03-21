const knex = require('knex')
const db = require('../connect_db/default')
const { loggers } = require('winston')
const connectedKnex = db.connect()

// ---------------User functions only and admin---------------

async function checkPassword(username, password) {
    // db.run('select * from users where id=?')
    const user = await connectedKnex.raw('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
    return user
}

async function get_by_name(name) {
    const user = await connectedKnex('users').select('*').where('username', name).first();
    return user;
}

async function new_user_role1(user) {
    try {
        if (user.password === 'null') {
            const Result = await connectedKnex.raw(`CALL sp_pass_users('${user.username}','${user.email}','');`)
            return Result.rows[0]._generated_password
        }
        else {
            const Result = await connectedKnex.raw(`CALL sp_i_users('${user.username}','${user.email}','${user.password}');`)
            if (Result) {
                return true
            }
            return 'rejected'
        }
    }
    catch (e) {
        return false

    }
}

async function new_user_role2(user) {

    if (user.password === 'null') {
        const Result = await connectedKnex.raw(`CALL sp_pass_users_airlines('${user.username}','${user.email}','');`)
        return Result.rows[0]._generated_password
    }
    else {
        const Result = await connectedKnex.raw(`CALL sp_i_users_airlines('${user.username}','${user.email}','${user.password}');`)
        if (Result) {
            return true
        }
        return Result
    }
}

async function update_user(id, user) {
    try {
        // if (user.password !== "null" && user.password !== "null") {
        //     const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${user.email}', '${user.password}');`)
        //     return update
        // }
        // else {
        if (user.email === 'null' || user.email === "null") {
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, ${user.email}, '${user.password}');`)
            if (update.name == "error") {
                return update.detail
            }
            else{
                return true
            }
        }
        if (user.password === 'null'|| user.password === "null") {
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${user.email}', ${user.password});`)
            if (update.name == "error") {
                return update.detail
            }
            else{
                return true
            }
        }
    }
    catch (e) {
        return e
    }
}

async function get_by_id_type(type, id) {
    try {
        const user = await connectedKnex('users')
            .select('users.*', 'roles.role_name')
            .join('roles', 'users.role_id', 'roles.id')
            .where(`users.${type}`, id)
            .first();
        if (user) {
            return user;
        }
        else{
            return false
        }
        
    } catch (error) {
        // טיפול בשגיאה כאן
        console.error(error);
        return error; // הזרקת השגיאה כדי שהיא תתפוס בקריאה לפונקציה
    }
}

async function get_by_id(id) {
    try {
        const user = await connectedKnex('users')
            .select('users.*', 'roles.role_name')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', id)
            .first();
        if (user) {
            return user;
        }
        else{
            return false
        }
    } catch (error) {
        // טיפול בשגיאה כאן
        return error; // הזרקת השגיאה כדי שהיא תתפוס בקריאה לפונקציה
    }
}

async function delete_user(id) {

    const user = await connectedKnex('users').select('*').where('id', id).first()
    if (user.role === 1) {
        return result = await connectedKnex.raw(`CALL delete_user(${id});`)
    }
    else {
        
        return result = await connectedKnex('users').where('id', id).del()
    }
}


// ---------------Admin permission only---------------

async function get_all() {
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
    get_by_name, get_all, new_user_role1, new_user_role2, get_by_id, get_by_id_type,update_user, delete_user, checkPassword, delete_all, set_id
}