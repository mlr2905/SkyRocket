const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_all_tables';

Log.info(FILE, 'init', null, 'All Tables DAL module initialized');

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all data from all tables');
    
    try {
        const { rows } = await connectedKnex.raw(`SELECT get_all_data();`);
        const tablesData = rows[0]?.get_all_data;
        
        if (tablesData) {
            const tableNames = Object.keys(tablesData);
            Log.debug(FILE, func, null, `Retrieved data from ${tableNames.length} tables`);
            return tablesData;
        } else {
            Log.warn(FILE, func, null, 'No data returned');
            return {};
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all data', error);
        throw error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.info(FILE, func, id, 'Looking up records across all tables');

    const tablesToQuery = [
        'users', 'countries', 'airlines', 'customers', 'flights', 'tickets', 'passengers'
    ];

    try {
        const promises = tablesToQuery.map(async (tableName) => {
            try {
                const result = await connectedKnex(tableName).select('*').where('id', id).first();
                return { tableName, data: result || null };
            } catch (error) {
                Log.warn(FILE, func, id, `Error querying table ${tableName}: ${error.message}`);
                return { tableName, data: null };
            }
        });
        
        const allResults = await Promise.all(promises);

        const results = allResults.reduce((acc, { tableName, data }) => {
            acc[tableName] = data;
            return acc;
        }, {});

        const foundTables = Object.entries(results)
            .filter(([_, data]) => data !== null)
            .map(([tableName]) => tableName);

        if (foundTables.length > 0) {
            Log.info(FILE, func, id, `Found records in: ${foundTables.join(', ')}`);
        } else {
            Log.warn(FILE, func, id, 'No records found in any table');
        }

        return results;
        
    } catch (error) {
        Log.error(FILE, func, id, 'Error in get_by_id', error);
        throw error;
    }
}

async function registered_Tables() {
    const func = 'registered_Tables';
    Log.info(FILE, func, null, 'Retrieving registered tables info');
    
    try {
        const { rows } = await connectedKnex.raw(` SELECT registered_Tables();`);
        const tables = rows[0]?.registered_tables;

        if (tables) {
            Log.debug(FILE, func, null, `Retrieved info for ${Object.keys(tables).length} tables`);
            return tables;
        } else {
            Log.warn(FILE, func, null, 'No registered tables info returned');
            return {};
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving registered tables', error);
        throw error;
    }
}

async function flights_records_tables() {
    const func = 'flights_records_tables';
    Log.info(FILE, func, null, 'Retrieving flight records tables info');
    
    try {
        const { rows } = await connectedKnex.raw(` SELECT flights_records_tables();`);
        const flightRecords = rows[0]?.flights_records_tables;

        if (flightRecords) {
            Log.debug(FILE, func, null, 'Retrieved flight records info successfully');
            return flightRecords;
        } else {
            Log.warn(FILE, func, null, 'No flight records info returned');
            return {};
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving flight records info', error);
        throw error;
    }
}

async function get_qr(code) {
    const func = 'get_qr';
    Log.info(FILE, func, code, 'Generating QR code');
    
    try {
        const { rows } = await connectedKnex.raw(`SELECT generate_qr_code(?);`, [code]);
        const qrCode = rows[0]?.generate_qr_code;

        if (qrCode) {
            Log.debug(FILE, func, code, 'Successfully generated QR code');
            return qrCode;
        } else {
            Log.warn(FILE, func, code, 'Failed to generate QR code');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, code, 'Error generating QR code', error);
        throw error;
    }
}

module.exports = { 
    get_all, 
    get_by_id, 
    registered_Tables,
    flights_records_tables, 
    get_qr 
};