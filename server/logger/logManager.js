const logger = require('./my_logger');

const formatMessage = (fileName, functionName, id, message) => {
    const idString = id ? `[ID: ${id}]` : '[ID: N/A]';
    return `[${fileName}] [${functionName}] ${idString} - ${message}`;
};

module.exports = {
    /**
     *INFO log
     * @param {string} file
     * @param {string} func
     * @param {string|number}id
     * @param {string} message
     */
    info: (file, func, id, message) => {
        logger.info(formatMessage(file, func, id, message));
    },

    /**
     *  WARNING log
     */
    warn: (file, func, id, message) => {
        logger.warn(formatMessage(file, func, id, message));
    },

    /**
     *ERROR log
     * @param {any} errorObject
     */
    error: (file, func, id, message, errorObject = null) => {
        let formattedMsg = formatMessage(file, func, id, message);
        if (errorObject) {
            formattedMsg += ` | Error: ${errorObject.message || errorObject}`;
        }
        logger.error(formattedMsg);
    },

    /**
     *DEBUG log
     */
    debug: (file, func, id, message) => {
        logger.debug(formatMessage(file, func, id, message));
    }
};