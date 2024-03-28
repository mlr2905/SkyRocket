const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()

// ---------------All types of users can activate---------------

async function check_flight_existence(v) {
    const check = await connectedKnex.raw(`SELECT check_flight_existence(${v});`)

    return check.rows[0].check_flight_existence
}

async function get_all() {
    // db.run('select * from flights')
    const flights = await connectedKnex.raw(`SELECT get_all_flights();`)

    return flights.rows[0].get_all_flights
}

// ---------------User functions only and admin---------------

async function update_remaining_tickets(id) {
    // db.run('update flights ....')
    const result = await connectedKnex.raw(`CALL update_remaining_tickets(${id})`)
    if (result.error) {
    } else {
        return result
    }
}

// ---------------airline_User functions only and admin---------------

async function new_flight(new_flight) {
    // db.run('insert into flights ....')
    // result[0] will be the new ID given by the SQL
    // Insert into flights values(....)
    const result = await connectedKnex('flights').insert(new_flight).returning('*');
    return result[0]
}

async function get_by_id(id) {
    // db.run('select * from flights where id=?')
    const flight = await connectedKnex('flights')
        .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
        .leftJoin('countries as origin_countries', 'origin_countries.id', 'flights.origin_country_id')
        .leftJoin('countries as destination_countries', 'destination_countries.id', 'flights.destination_country_id')
        .leftJoin('planes', 'planes.id', 'flights.plane_id')
        .select('flights.*', 'airlines.name as airline_name', 'origin_countries.country_name as origin_country_name', 'destination_countries.country_name as destination_country_name', 'planes.seat as Total_tickets')
        .where('flights.id', id).first()
    return flight
}

async function get_flight_by_airline_id(id) {
    // db.run('select * from flights where id=?')
    const result = await connectedKnex.raw(`SELECT get_flight_details_by_airline(${id})`);
    return result.rows[0].get_flight_details_by_airline
}

async function update_flight(id, updated_flight) {
    // db.run('update flights ....')
    const result = await connectedKnex('flights').where('id', id).update(updated_flight)
    return updated_flight
}


async function delete_flight(id) {
    // db.run('update flights ....')
    const result = await connectedKnex.raw(`CALL delete_flight(${id})`);

    return result
}

// ---------------Admin permission only---------------

async function delete_all() {
    // db.run('update flights ....')
    const result = await connectedKnex('flights').del()
    await connectedKnex.raw('ALTER SEQUENCE "flights_id_seq" RESTART WITH 1');
    return result
}

// ---------------Test functions only---------------

async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE flights_id_seq RESTART WITH ${id}`);
        return result;
    } catch (e) {
        throw console.error(e);
    }
}
async function get_by_flight_code(code) {
    const get_by_flight_code = await connectedKnex('flights').select('*').where('flight_code', code).first()
    return get_by_flight_code
}
async function get_flight_by_airline_id_test(id) {
    // db.run('select * from flights where id=?')
    
    const result = await connectedKnex.raw(`SELECT get_flights_by_airline(${id})`);

    return result
}

module.exports = {check_flight_existence,get_all, get_by_id, get_flight_by_airline_id, new_flight, update_flight, update_remaining_tickets, delete_flight, delete_all, get_by_flight_code, set_id,get_flight_by_airline_id_test }