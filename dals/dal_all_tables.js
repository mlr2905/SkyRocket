const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

async function get_all() {
    // db.run('select * from chat1')
    const arr = await connectedKnex.raw(`SELECT get_all_data();`)
    return arr.rows[0].get_all_data
}

async function get_by_id(id) {
    // db.run('select * from chat1 where id=?')
    const a = await connectedKnex('users').select('*').where('id', id).first()
    const b = await connectedKnex('countries').select('*').where('id', id).first()
    const c = await connectedKnex('airlines').select('*').where('id', id).first()
    const d = await connectedKnex('customers').select('*').where('id', id).first()
    const e = await connectedKnex('flights').select('*').where('id', id).first()
    const f = await connectedKnex('tickets').select('*').where('id', id).first()
    const h = await connectedKnex('passengers').select('*').where('id', id).first()

    const arr = { 0: a, 1: b, 2: c, 3: d, 4: e, 5: f, 6: h }
    return arr
}

// ---------------Test functions only---------------

async function registered_Tables () {
    try {
        let result = await connectedKnex.raw(` SELECT registered_Tables();`);
        return result.rows[0].registered_tables

    } catch (e) {
        throw console.error(e);
    }
}
async function flights_records_tables() {
    try {
        let result = await connectedKnex.raw(` SELECT flights_records_tables();`);
        return result.rows[0].flights_records_tables

    } catch (e) {
        throw console.error(e);
    }
}


async function get_qr(code) {
    // db.run('select * from flights')
    const flights = await connectedKnex.raw(`SELECT generate_qr_code('${code}');`)
    return flights.rows[0].generate_qr_code
}

module.exports = { get_all, get_by_id, registered_Tables,flights_records_tables, get_qr }