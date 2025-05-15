const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('All Tables DAL module initialized')

/**
 * Gets all data from all tables in the database.
 * @returns {Promise<object>} All data from the database.
 */
async function get_all() {
    logger.info('Retrieving all data from all tables')
    
    try {
        const arr = await connectedKnex.raw(`SELECT get_all_data();`)
        
        if (arr.rows && arr.rows[0] && arr.rows[0].get_all_data) {
            const tablesData = arr.rows[0].get_all_data
            const tableNames = Object.keys(tablesData)
            logger.debug(`Retrieved data from ${tableNames.length} tables: ${tableNames.join(', ')}`)
            
            // לא מדפיסים את כל הנתונים ללוג מסיבות של ביצועים ואבטחה
            return tablesData
        } else {
            logger.warn('No data returned from get_all_data function')
            return {}
        }
    } catch (error) {
        logger.error('Error retrieving all data:', error)
        throw error
    }
}

/**
 * Gets records with specified ID from multiple tables.
 * @param {number} id - The ID to look up in various tables.
 * @returns {Promise<object>} Object containing records from different tables.
 */
async function get_by_id(id) {
    logger.info(`Looking up records with ID: ${id} across all tables`)
    
    try {
        // מערך לאיסוף התוצאות המוצלחות והשגיאות
        const results = {}
        const errors = []
        
        // פונקציה עזר לביצוע שאילתות בטוחות
        async function safeQuery(tableName, index) {
            try {
                const result = await connectedKnex(tableName).select('*').where('id', id).first()
                
                if (result) {
                    logger.debug(`Found record in table ${tableName} with ID: ${id}`)
                } else {
                    logger.debug(`No record found in table ${tableName} with ID: ${id}`)
                }
                
                results[index] = result
            } catch (error) {
                logger.warn(`Error querying table ${tableName} with ID ${id}: ${error.message}`)
                errors.push({ table: tableName, error: error.message })
                results[index] = null
            }
        }
        
        // ביצוע שאילתות במקביל לשיפור ביצועים
        await Promise.all([
            safeQuery('users', 0),
            safeQuery('countries', 1),
            safeQuery('airlines', 2),
            safeQuery('customers', 3),
            safeQuery('flights', 4),
            safeQuery('tickets', 5),
            safeQuery('passengers', 6)
        ])
        
        // תיעוד תוצאות
        const foundTables = Object.keys(results).filter(key => results[key] !== null)
        
        if (foundTables.length > 0) {
            const tableMap = {
                '0': 'users',
                '1': 'countries',
                '2': 'airlines',
                '3': 'customers', 
                '4': 'flights',
                '5': 'tickets',
                '6': 'passengers'
            }
            
            const foundTableNames = foundTables.map(index => tableMap[index])
            logger.info(`Found records with ID ${id} in tables: ${foundTableNames.join(', ')}`)
        } else {
            logger.warn(`No records found with ID ${id} in any table`)
        }
        
        if (errors.length > 0) {
            logger.warn(`Encountered ${errors.length} errors while querying tables`)
        }
        
        return results
    } catch (error) {
        logger.error(`Error in get_by_id with ID ${id}:`, error)
        throw error
    }
}

// ---------------Test functions only---------------

/**
 * Gets information about registered tables in the database.
 * @returns {Promise<object>} Information about registered tables.
 */
async function registered_Tables() {
    logger.info('Retrieving registered tables information (test function)')
    
    try {
        let result = await connectedKnex.raw(` SELECT registered_Tables();`);
        
        if (result.rows && result.rows[0] && result.rows[0].registered_tables) {
            const tables = result.rows[0].registered_tables
            logger.debug(`Retrieved registered tables information: ${Object.keys(tables).length} tables`)
            return tables
        } else {
            logger.warn('No registered tables information returned')
            return {}
        }
    } catch (error) {
        logger.error('Error retrieving registered tables information:', error)
        throw error
    }
}

/**
 * Gets information about flight record tables.
 * @returns {Promise<object>} Information about flight record tables.
 */
async function flights_records_tables() {
    logger.info('Retrieving flight records tables information (test function)')
    
    try {
        let result = await connectedKnex.raw(` SELECT flights_records_tables();`);
        
        if (result.rows && result.rows[0] && result.rows[0].flights_records_tables) {
            const flightRecords = result.rows[0].flights_records_tables
            logger.debug(`Retrieved flight records tables information successfully`)
            return flightRecords
        } else {
            logger.warn('No flight records tables information returned')
            return {}
        }
    } catch (error) {
        logger.error('Error retrieving flight records tables information:', error)
        throw error
    }
}

/**
 * Generates a QR code for the given code.
 * @param {string} code - The code to generate QR for.
 * @returns {Promise<string>} The generated QR code.
 */
async function get_qr(code) {
    logger.info(`Generating QR code for: ${code}`)
    
    try {
        const qrResult = await connectedKnex.raw(`SELECT generate_qr_code('${code}');`)
        
        if (qrResult.rows && qrResult.rows[0] && qrResult.rows[0].generate_qr_code) {
            logger.debug(`Successfully generated QR code for: ${code}`)
            return qrResult.rows[0].generate_qr_code
        } else {
            logger.warn(`Failed to generate QR code for: ${code}`)
            return null
        }
    } catch (error) {
        logger.error(`Error generating QR code for ${code}:`, error)
        throw error
    }
}

module.exports = { 
    get_all, 
    get_by_id, 
    registered_Tables,
    flights_records_tables, 
    get_qr 
}