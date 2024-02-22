const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()
// ---------------User functions only and admin---------------

async function new_passenger(new_passenger) {
    // db.run('insert into passengers ....')
    // result[0] will be the new ID given by the SQL
    // Insert into passengers values(....)
    const result = await connectedKnex('passengers').insert(new_passenger)
    return { ...new_passenger, id: result[0] }
}

async function get_by_id_passenger(id) {
    // db.run('select * from passengers where user_id=?')
    const passenger = await connectedKnex('passengers').select('*').where('user_id', id).first()
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

    return passengers.rows
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

async function get_next_passenger_id() {
    try {
        let result = await connectedKnex.raw(`SELECT last_value FROM passengers_id_seq;`);
        return result

    } catch (e) {
        throw console.error('Error fetching next user ID:', e);

    }
}
async function set_id_passenger(id) {
    try {
        const result = await connectedKnex.raw(`CALL reset_id_passenger(${id})`);
        return result;

    } catch (e) {
        throw console.error('Error fetching next user ID:', e);

    }
}
// async function create_table_if_not_exist() {
//     const tableExists = await connectedKnex.schema.hasTable('passengers');

//     if (!tableExists) {
//         await connectedKnex.schema.createTable('passengers', (table) => {
//             table.increments('id').primary();
//             table.integer('flight_id').notNullable().references('flights.id');
//             table.integer('customer_id').unique().notNullable().references('customers.id');
//             table.integer('passenger_id').unique().notNullable().references('passengers.id');
//                 });
//     }
// }

module.exports = {
    get_all, get_by_id, new_passenger, update_passenger, delete_passenger,
    delete_all, get_by_id_passenger, get_next_passenger_id, set_id_passenger
    // , create_table_if_not_exist
}