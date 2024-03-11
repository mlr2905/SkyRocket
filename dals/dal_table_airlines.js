const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()
// ---------------User airline functions only and admin---------------

async function new_airline(new_mes) {
    // db.run('insert into airlines ....')
    // result[0] will be the new ID given by the SQL
    // Insert into airlines values(....)
    const result = await connectedKnex('airlines').insert(new_mes).returning('id');
    // החזרת אובייקט עם המידע החדש, כולל ה-id
    return { ...new_mes, id: result[0].id };
  }
  

async function get_by_id(id) {
    // db.run('select * from airlines where id=?')
    const airline = await connectedKnex('airlines')
        .select('airlines.*', 'countries.country_name', 'users.username as user_name')
        .leftJoin('users', 'users.id', '=', 'airlines.user_id')
        .leftJoin('countries', 'countries.id', '=', 'airlines.country_id')
        .where('airlines.id', id)
        .first();
    return airline.rows
}

async function update_airline(id, updated_airline) {
    // db.run('update airlines ....')
    const result = await connectedKnex('airlines').where('id', id).update(updated_airline)
    return updated_airline
}

// ---------------Admin permission only---------------

async function delete_airline(id) {
    // db.run('update airlines ....')
    const result = await connectedKnex('airlines').where('id', id).del()
    return result
}


async function get_all() {
    // db.run('select * from airlines')
    const airlines = await connectedKnex.raw(`SELECT get_all_airlines();`)
    return airlines.rows[0].get_all_airlines
}
async function delete_all() {
    // db.run('update airlines ....')
    const result = await connectedKnex('airlines').del()
    await connectedKnex.raw('ALTER SEQUENCE "airlines_id_seq" RESTART WITH 1');
    return result
}
// ---------------Test functions only---------------



async function next_id() {
    try {
        const result = await connectedKnex.raw(`SELECT nextval('airlines_id_seq')`);
        return result;

    } catch (e) {
        throw console.error( e);

    }
}

async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE airlines_id_seq RESTART WITH ${id}`);
        return result;

    } catch (e) {
        throw console.error(e);

    }
}
async function get_by_name(name) {

    const airline_name = await connectedKnex('airlines').select('*').where('name', name).first()

    return airline_name
}

// async function create_table_if_not_exist() {
//     const tableExists = await connectedKnex.schema.hasTable('airlines');

//     if (!tableExists) {
//         await connectedKnex.schema.createTable('airlines', (table) => {
//             table.increments('id').primary(); // This creates a SERIAL column
//             table.integer('country_id').notNullable();
//             table.integer('user_id').notNullable();
//             table.foreign('country_id').references('countries').on('id');
//             table.foreign('user_id').references('users').on('id');
//         });
//     }
// }

module.exports = {
    get_all, get_by_id, new_airline, update_airline, delete_airline,next_id,set_id,get_by_name,
    delete_all
    // , create_table_if_not_exist
}