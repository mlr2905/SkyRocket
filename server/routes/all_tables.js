const express = require('express');
const router = express.Router();
const dal = require('../dals/dal_all_tables');
const Log = require('../logger/logManager');

const FILE = 'routes/all_tables';

Log.info(FILE, 'init', null, 'All Tables Router initialized');

router.get('/', async (request, response) => {
    const func = 'get_all_tables';
    Log.info(FILE, func, null, 'Retrieving all tables information');
    
    try {
        const all_tables = await dal.get_all();
        const tableCount = all_tables ? Object.keys(all_tables).length : 0;
        Log.debug(FILE, func, null, `Retrieved information for ${tableCount} tables`);
        response.json(all_tables);
    }
    catch (e) {
        Log.error(FILE, func, null, 'Error retrieving all tables', e);
        response.json({ 'error': JSON.stringify(e) });
    }
});

router.get('/:id', async (request, response) => {
    const func = 'get_table_by_id';
    const table_id = parseInt(request.params.id);
    Log.info(FILE, func, table_id, 'Retrieving table by ID');
    
    try {
        const table = await dal.get_by_id(table_id);
        
        if (table) {
            Log.info(FILE, func, table_id, 'Table found');
            response.json(table);
        }
        else {
            Log.warn(FILE, func, table_id, 'Table not found');
            response.status(404).json({ "error": `Cannot find table with id ${table_id}` });
        }
    }
    catch (e) {
        Log.error(FILE, func, table_id, 'Error retrieving table', e);
        response.status(500).json({ 'error': `Failed to retrieve table: ${e.message}` });
    }
});

module.exports = router;