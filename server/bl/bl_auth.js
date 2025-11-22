const Log = require('../logger/logManager');
const { logLogoutEvent } = require('../dals/dal_table_users');

const FILE = 'bl_auth';

/**
 * Processes a user logout, including audit logging via the DAL.
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function processUserLogout(userId) {
    const func = 'processUserLogout';
    Log.info(FILE, func, userId, 'Processing logout');
    
    try {
        if (userId) {
            await logLogoutEvent(userId); 
            Log.debug(FILE, func, userId, 'Logout event logged to DB');
        } else {
            Log.warn(FILE, func, null, 'Logout processed for unauthenticated user (no ID)');
        }
        
        Log.info(FILE, func, userId, 'Logout process completed');
        return true; 

    } catch (error) {
        Log.error(FILE, func, userId, 'Error processing logout', error);
        return true; 
    }
}

module.exports = {
    processUserLogout
};