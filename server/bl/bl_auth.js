const logger = require('../logger/my_logger');
const { logLogoutEvent } = require('../dals/dal_table_users');
/**
 * Processes a user logout, including audit logging via the DAL.
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function processUserLogout(userId) {
    logger.info(`BL_Auth: Processing logout for user ID: ${userId}`);
    
    if (userId) {
        await logLogoutEvent(userId); 
    }
    
    logger.info(`BL_Auth: Logout process completed for user ID: ${userId}`);
    return true; 
}

module.exports = {
    processUserLogout
};