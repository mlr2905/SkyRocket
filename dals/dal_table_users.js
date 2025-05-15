const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('User DAL module initialized')

// ---------------User functions only and admin---------------

async function checkPassword(username, password) {
    logger.debug(`Verifying password for user: ${username}`)
    try {
        const user = await connectedKnex.raw('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
        logger.debug(`Password verification result for ${username}: ${!!user && user.length > 0}`)
        return user
    } catch (error) {
        logger.error(`Error verifying password for user ${username}:`, error)
        throw error
    }
}

async function get_by_name(name) {
    logger.debug(`Looking up user by username: ${name}`)
    try {
        const user = await connectedKnex('users').select('*').where('username', name).first();
        logger.debug(`User lookup result for username ${name}: ${!!user}`)
        return user;
    } catch (error) {
        logger.error(`Error looking up user by username ${name}:`, error)
        throw error
    }
}

async function new_user_role1(user) {
    logger.info(`Creating new user with role 1: ${user.username}`)
    logger.debug(`New role 1 user data: ${JSON.stringify(user)}`)
    
    try {
        if (user.password === 'null') {
            logger.debug(`Generating password for new user: ${user.username}`)
            const Result = await connectedKnex.raw(`CALL sp_pass_users('${user.username}','${user.email}','');`)
            logger.info(`User created successfully with generated password: ${user.username}`)
            return Result.rows[0]._generated_password
        }
        else {
            logger.debug(`Creating user with provided password: ${user.username}`)
            const Result = await connectedKnex.raw(`CALL sp_i_users('${user.username}','${user.email}','${user.password}');`)
            if (Result) {
                logger.info(`User created successfully: ${user.username}`)
                return true
            }
            logger.warn(`User creation rejected - likely duplicate: ${user.username}`)
            return 'rejected'
        }
    }
    catch (e) {
        logger.error(`Error creating user with role 1 (${user.username}):`, e)
        return false
    }
}

async function new_user_role2(user) {
    logger.info(`Creating new user with role 2: ${user.username}`)
    logger.debug(`New role 2 user data: ${JSON.stringify(user)}`)
    
    try {
        if (user.password === 'null') {
            logger.debug(`Generating password for new user: ${user.username}`)
            const Result = await connectedKnex.raw(`CALL sp_pass_users_airlines('${user.username}','${user.email}','');`)
            logger.info(`User created successfully with generated password: ${user.username}`)
            return Result.rows[0]._generated_password
        }
        else {
            logger.debug(`Creating user with provided password: ${user.username}`)
            const Result = await connectedKnex.raw(`CALL sp_i_users_airlines('${user.username}','${user.email}','${user.password}');`)
            if (Result) {
                logger.info(`User created successfully: ${user.username}`)
                return true
            }
            logger.warn(`User creation failed: ${user.username}`)
            return Result
        }
    } catch (error) {
        logger.error(`Error creating user with role 2 (${user.username}):`, error)
        throw error
    }
}

async function update_user(id, user) {
    logger.info(`Updating user with ID: ${id}`)
    logger.debug(`Update data: ${JSON.stringify(user)}`)
    
    try {
        if (user.email === 'null' || user.email === "null") {
            logger.debug(`Updating only password for user ID: ${id}`)
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, ${user.email}, '${user.password}');`)
            if (update.name == "error") {
                logger.warn(`User update failed: ${update.detail}`)
                return update.detail
            }
            else {
                logger.info(`User ${id} updated successfully (password only)`)
                return true
            }
        }
        
        if (user.password === 'null' || user.password === "null") {
            logger.debug(`Updating only email for user ID: ${id}`)
            const update = await connectedKnex.raw(`CALL update_user_info(${id}, '${user.email}', ${user.password});`)
            logger.info(`User ${id} updated successfully (email only)`)
            return update
        }
    }
    catch (e) {
        logger.error(`Error updating user ${id}:`, e)
        return e
    }
}

async function get_by_id_type(type, id) {
    logger.debug(`Looking up user by ${type}: ${id}`)
    
    try {
        const user = await connectedKnex('users')
            .select('users.*', 'roles.role_name')
            .join('roles', 'users.role_id', 'roles.id')
            .where(`users.${type}`, id)
            .first();
            
        if (user) {
            logger.debug(`User found by ${type}: ${id}`)
            return user;
        }
        else {
            logger.debug(`No user found by ${type}: ${id}`)
            return false
        }
    } catch (error) {
        logger.error(`Error looking up user by ${type}: ${id}`, error)
        return error;
    }
}

async function get_by_id(id) {
    logger.debug(`Looking up user by ID: ${id}`)
    
    try {
        const user = await connectedKnex('users')
            .select('users.*', 'roles.role_name')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', id)
            .first();
            
        if (user) {
            logger.debug(`User found by ID: ${id}`)
            return user;
        }
        else {
            logger.debug(`No user found by ID: ${id}`)
            return false
        }
    } catch (error) {
        logger.error(`Error looking up user by ID: ${id}`, error)
        return error;
    }
}

async function delete_user(id) {
    logger.info(`Deleting user with ID: ${id}`)
    
    try {
        const user = await connectedKnex('users').select('*').where('id', id).first()
        
        if (!user) {
            logger.warn(`User deletion failed - user not found: ${id}`)
            return false
        }
        
        if (user.role === 1) {
            logger.debug(`Deleting user with role 1 using stored procedure: ${id}`)
            const result = await connectedKnex.raw(`CALL delete_user(${id});`)
            logger.info(`User ${id} deleted successfully (role 1)`)
            return result
        }
        else {
            logger.debug(`Deleting user with direct query: ${id}`)
            const result = await connectedKnex('users').where('id', id).del()
            logger.info(`User ${id} deleted successfully (role ${user.role})`)
            return result
        }
    } catch (error) {
        logger.error(`Error deleting user ${id}:`, error)
        throw error
    }
}

// ---------------Admin permission only---------------

async function get_all() {
    logger.info('Retrieving all users (admin only function)')
    
    try {
        const users = await connectedKnex.raw(`SELECT get_all_users();`)
        logger.debug(`Retrieved all users successfully`)
        return users.rows[0].get_all_users
    } catch (error) {
        logger.error('Error retrieving all users:', error)
        throw error
    }
}

async function delete_all() {
    logger.info('Deleting all users (admin only function)')
    logger.warn('This operation will delete ALL users from the database')
    
    try {
        const result = await connectedKnex('users').del()
        logger.debug(`Deleted ${result} users from database`)
        
        await connectedKnex.raw('ALTER SEQUENCE "users_id_seq" RESTART WITH 1');
        logger.info('Reset user ID sequence to 1')
        
        return result
    } catch (error) {
        logger.error('Error deleting all users:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting user ID sequence to: ${id} (test function)`)
    
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE users_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset user ID sequence to ${id}`)
        return result;
    } catch (error) {
        logger.error(`Error setting user ID sequence to ${id}:`, error)
        throw error;
    }
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
    set_id
}