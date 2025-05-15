const express = require('express')
const router = express.Router()
const dal = require('../dals/dal_all_tables')
const logger = require('../logger/my_logger')

// '/api/all_tables'
// GET 
router.get('/', async (request, response) => {
    logger.info('Retrieving all tables information')
    
    try {
        const all_tables = await dal.get_all()
        logger.debug(`Retrieved information for all tables: ${Object.keys(all_tables).length} tables found`)
        response.json(all_tables)
    }
    catch (e) {
        logger.error('Error retrieving all tables:', e)
        response.json({ 'error': JSON.stringify(e) })
    }
})

// GET by ID
router.get('/:id', async (request, response) => {
    const table_id = parseInt(request.params.id)
    logger.info(`Retrieving table with ID: ${table_id}`)
    
    try {
        const table = await dal.get_by_id(table_id)
        
        if (table) {
            logger.info(`Table found for ID: ${table_id}`)
            response.json(table)
        }
        else {
            logger.warn(`Table not found for ID: ${table_id}`)
            response.status(404).json({ "error": `Cannot find table with id ${table_id}` })
        }
    }
    catch (e) {
        logger.error(`Error retrieving table ID ${table_id}:`, e)
        response.status(500).json({ 'error': `Failed to retrieve table: ${e.message}` })
    }
})

module.exports = router