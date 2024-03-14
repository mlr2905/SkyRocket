const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------User functions only and admin---------------

async function new_passenger(new_passenger) {
    // db.run('insert into passengers ....')
    // result[0] will be the new ID given by the SQL
    // Insert into passengers values(....)
    const result = await connectedKnex('passengers').insert(new_passenger).returning('*');
    return result[0]
}

async function get_by_id_passenger(id) {
    // db.run('select * from passengers where user_id=?')
    const passenger = await connectedKnex('passengers').select('*').where('id', id).first()
    return passenger
}

// ---------------Admin permission only---------------

async function update_passenger(id, updated_passenger) {
    // db.run('update passengers ....')
    const result = await connectedKnex('passengers').where('id', id).update(updated_passenger)
    return updated_passenger
}
async function delete_passenger(id) {
    // db.run('update passengers ....')
    const result = await connectedKnex('passengers').where('id', id).del()
    return result
}

async function get_all() {
    // db.run('select * from passengers')
    const passengers = await connectedKnex.raw(`SELECT get_all_passengers();`)
    return passengers.rows[0].get_all_passengers
}

async function get_by_id(id) {
    // db.run('select * from passengers where user_id=?')
    const passenger = await connectedKnex('passengers').select('*').where('id', id).first()
    return passenger
}

async function delete_all() {
    // db.run('update passengers ....')
    const result = await connectedKnex('passengers').del()
    await connectedKnex.raw('ALTER SEQUENCE "passengers_id_seq" RESTART WITH 1');
    return result
}

// ---------------Test functions only---------------

async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE passengers_id_seq RESTART WITH ${id}`);
        return result;
    } catch (e) {
        throw console.error('Error fetching next user ID:', e);
    }
}

async function get_by_passport_number(id) {
    const airline_name = await connectedKnex('passengers').select('*').where('passport_number', id).first()
    return airline_name
}

module.exports = {
    get_all, get_by_id, new_passenger, update_passenger, delete_passenger,
    delete_all, get_by_id_passenger, set_id, get_by_passport_number
}