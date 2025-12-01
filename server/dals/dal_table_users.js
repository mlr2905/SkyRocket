const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_users';

Log.info(FILE, 'init', null, 'User DAL module initialized');

// ---------------User functions only and admin---------------

async function checkPassword(username, password) {
    const func = 'checkPassword';
    Log.debug(FILE, func, username, 'Verifying password');
    
    try {
        const user = await connectedKnex.raw('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        Log.debug(FILE, func, username, `Password verification result: ${!!user && user.length > 0}`);
        return user;
    } catch (error) {
        Log.error(FILE, func, username, 'Error verifying password', error);
        throw error;
    }
}

async function get_by_name(name) {
    const func = 'get_by_name';
    Log.debug(FILE, func, name, 'Looking up user by username');
    
    try {
        const user = await connectedKnex('users').select('*').where('username', name).first();
        Log.debug(FILE, func, name, `User lookup result: ${!!user}`);
        return user;
    } catch (error) {
        Log.error(FILE, func, name, 'Error looking up user', error);
        throw error;
    }
}

async function new_user_role1(user) {
    const func = 'new_user_role1';
    Log.info(FILE, func, user.username, 'Creating new user with role 1');
    
    try {
        if (user.password === 'null') {
            Log.debug(FILE, func, user.username, 'Generating password for new user');
            const Result = await connectedKnex.raw(`CALL sp_pass_users('${user.username}','${user.email}','');`);
            Log.info(FILE, func, user.username, 'User created successfully with generated password');
            return Result.rows[0]._generated_password;
        }
        else {
            Log.debug(FILE, func, user.username, 'Creating user with provided password');
            const Result = await connectedKnex.raw(`CALL sp_i_users('${user.username}','${user.email}','${user.password}');`);
            if (Result) {
                Log.info(FILE, func, user.username, 'User created successfully');
                return true;
            }
            Log.warn(FILE, func, user.username, 'User creation rejected - likely duplicate');
            return 'rejected';
        }
    }
    catch (e) {
        Log.error(FILE, func, user.username, 'Error creating user with role 1', e);
        return false;
    }
}

async function new_user_role2(user) {
    const func = 'new_user_role2';
    Log.info(FILE, func, user.username, 'Creating new user with role 2');
    
    try {
        if (user.password === 'null') {
            Log.debug(FILE, func, user.username, 'Generating password for new user');
            const Result = await connectedKnex.raw(`CALL sp_pass_users_airlines('${user.username}','${user.email}','');`);
            Log.info(FILE, func, user.username, 'User created successfully with generated password');
            return Result.rows[0]._generated_password;
        }
        else {
            Log.debug(FILE, func, user.username, 'Creating user with provided password');
            const Result = await connectedKnex.raw(`CALL sp_i_users_airlines('${user.username}','${user.email}','${user.password}');`);
            if (Result) {
                Log.info(FILE, func, user.username, 'User created successfully');
                return true;
            }
            Log.warn(FILE, func, user.username, 'User creation failed');
            return Result;
        }
    } catch (error) {
        Log.error(FILE, func, user.username, 'Error creating user with role 2', error);
        throw error;
    }
}

async function update_user(id, user) {
    const func = 'update_user';
    Log.info(FILE, func, id, 'Updating user');
    
    try {
        if (user.email === 'null' || user.email === "null") {
            Log.debug(FILE, func, id, 'Updating only password');
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, ${user.email}, '${user.password}');`);
            if (update.name == "error") {
                Log.warn(FILE, func, id, `User update failed: ${update.detail}`);
                return update.detail;
            }
            else {
                Log.info(FILE, func, id, 'User updated successfully (password only)');
                return true;
            }
        }
        
        if (user.password === 'null' || user.password === "null") {
            Log.debug(FILE, func, id, 'Updating only email');
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${user.email}', ${user.password});`);
            Log.info(FILE, func, id, 'User updated successfully (email only)');
            return update;
        }
    }
    catch (e) {
        Log.error(FILE, func, id, 'Error updating user', e);
        return e;
    }
}

async function get_by_id_type(type, id) {
    const func = 'get_by_id_type';
    Log.debug(FILE, func, id, `Looking up user by ${type}`);
    
    try {
        const user = await connectedKnex('users')
            .select('users.*', 'roles.role_name')
            .join('roles', 'users.role_id', 'roles.id')
            .where(`users.${type}`, id)
            .first();
            
        if (user) {
            Log.debug(FILE, func, id, `User found by ${type}`);
            return user;
        }
        else {
            Log.debug(FILE, func, id, `No user found by ${type}`);
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, `Error looking up user by ${type}`, error);
        return error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up user by ID');
    
    try {
        const user = await connectedKnex('users')
            .select('users.*', 'roles.role_name')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', id)
            .first();
            
        if (user) {
            Log.debug(FILE, func, id, 'User found');
            return user;
        }
        else {
            Log.debug(FILE, func, id, 'No user found');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up user', error);
        return error;
    }
}

async function delete_user(id) {
    const func = 'delete_user';
    Log.info(FILE, func, id, 'Deleting user');
    
    try {
        const user = await connectedKnex('users').select('*').where('id', id).first();
        
        if (!user) {
            Log.warn(FILE, func, id, 'User deletion failed - user not found');
            return false;
        }
        
        if (user.role === 1) {
            Log.debug(FILE, func, id, 'Deleting user with role 1 using stored procedure');
            const result = await connectedKnex.raw(`CALL delete_user(${id});`);
            Log.info(FILE, func, id, 'User deleted successfully (role 1)');
            return result;
        }
        else {
            Log.debug(FILE, func, id, 'Deleting user with direct query');
            const result = await connectedKnex('users').where('id', id).del();
            Log.info(FILE, func, id, `User deleted successfully (role ${user.role})`);
            return result;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting user', error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all users (admin only)');
    
    try {
        const users = await connectedKnex.raw(`SELECT get_all_users();`);
        Log.debug(FILE, func, null, 'Retrieved all users successfully');
        return users.rows[0].get_all_users;
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all users', error);
        throw error;
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all users (admin only)');
    
    try {
        const result = await connectedKnex('users').del();
        Log.debug(FILE, func, null, `Deleted ${result} users`);
        
        await connectedKnex.raw('ALTER SEQUENCE "users_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset user ID sequence to 1');
        
        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting all users', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting user ID sequence');
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE users_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset user ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error setting user ID sequence', error);
        throw error;
    }
}

async function logLogoutEvent(userId) {
    const func = 'logLogoutEvent';
    
    Log.info(FILE, func, userId, 'User logged out successfully (No DB record created)');
    
    return true; 
}
module.exports = {
    get_by_name, 
    get_all, 
    new_user_role1, 
    new_user_role2, 
    get_by_id, 
    get_by_id_type,
    update_user, 
    delete_user, 
    checkPassword, 
    delete_all, 
    set_id,
    logLogoutEvent
};