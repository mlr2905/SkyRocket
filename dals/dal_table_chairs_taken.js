const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------User functions only and admin---------------

async function new_chair(new_t) {
    // db.run('insert into chairs_taken ....')
    // result[0] will be the new ID given by the SQL
    // Insert into chairs_taken values(....)
    const result = await connectedKnex('chairs_taken').insert(new_t).returning('*');
    return result[0]
}

// ---------------Admin permission only---------------

async function get_by_id(id) {
    // db.run('select * from chairs_taken where user_id=?')
    const chair = await connectedKnex('chairs_taken').select('*').where('user_id', id).first()
    return chair
}

async function delete_chair(id) {
    // db.run('update chairs_taken ....')
    const result = await connectedKnex('chairs_taken').where('id', id).del()
    return result
}

async function update_chair(id, updated_chair) {
    // db.run('update chairs_taken ....')
    const result = await connectedKnex('chairs_taken').where('id', id).update(updated_chair)
    return updated_chair
}

async function get_all_chairs_by_flight(id) {
    // db.run('select * from chairs_taken')
    const chairs_taken = await connectedKnex.raw(`SELECT id,flight_id,char_id,passenger_id,user_id
FROM 
    public.chairs_taken
WHERE 
    flight_id = ${ id }`)
    console.log(chairs_taken);
    return chairs_taken.rows
}

async function delete_all() {
    // db.run('update chairs_taken ....')
    const result = await connectedKnex('chairs_taken').del()
    await connectedKnex.raw('ALTER SEQUENCE "chairs_id_seq" RESTART WITH 1');
    return result
}

// ---------------Test functions only---------------

async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE chairs_id_seq RESTART WITH ${id}`);
        return result
    } catch (e) {
        throw console.error(e);
    }
}

module.exports = { get_all_chairs_by_flight, get_by_id, new_chair, update_chair, delete_chair, set_id, delete_all }