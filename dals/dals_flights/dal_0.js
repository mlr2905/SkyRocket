
const knex = require('knex')
const config = require('config')

const connectedKnex = knex({
    client: 'pg',
    version: '15',
    connection: {
        host: config.db_cloud.host,
        user: config.db_cloud.user,
        password: config.db_cloud.password,
        database: config.db_cloud.database,
        ssl: true
    }
})

// async function delete_all() {
//     // db.run('update chat1 ....')
//     const a = await connectedKnex('chat1').del()
//     await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
//     const b = await connectedKnex('chat2').del()
//     await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
//     const c = await connectedKnex('chat3').del()
//     await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
//     const d = await connectedKnex('chat4').del()
//     await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
//     const e = await connectedKnex('connected').del()
//     await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
// }

async function get_all() {
    // db.run('select * from chat1')
    const a = await connectedKnex('users')
    .select('users.*', 'roles.role_name')
    .from('users')
    .join('roles', 'users.role_id', 'roles.id');

    const b = await connectedKnex('countries')
    .select('countries.*', 'continents.continent')
    .from('countries')
    .join('continents', 'countries.continent_id', 'continents.id');
   
    const c = await connectedKnex('airlines').select('*')
    .leftJoin('users', 'users.id', '=', 'airlines.user_id')
    .leftJoin('countries', 'countries.id', '=', 'airlines.country_id') 
    .select('airlines.*',  'countries.country_name', 'users.username as user_name'); 
  
    const d = await connectedKnex('customers').select('*')
    .join('users', 'users.id', 'customers.user_id')
    .select('customers.*', 'users.username as user_name');
  
    const e = await connectedKnex('flights').select('*')
    .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
    .leftJoin('countries as origin_countries', 'origin_countries.id', 'flights.origin_country_id')
    .leftJoin('countries as destination_countries', 'destination_countries.id', 'flights.destination_country_id')
    .leftJoin('planes', 'planes.id', 'flights.plane_id')
    .select('flights.*', 'airlines.name as airline_name', 'origin_countries.country_name as origin_country_name', 'destination_countries.country_name as destination_country_name','planes.seat as Total_tickets')
       
    const f = await connectedKnex('tickets')  
    .leftJoin('countries', 'countries.id', 'tickets.flight_id')
    .leftJoin('customers', 'customers.id', 'tickets.customer_id')
    .leftJoin('passengers', 'passengers.id', 'tickets.passenger_id')
    .leftJoin('flights', 'flights.id', 'tickets.passenger_id')
    .leftJoin('airlines', 'airlines.id', 'flights.airline_id')
    .leftJoin('seats', 'seats.id', 'tickets.seat_id')
    .select('tickets.*','airlines.name as airline_name' ,'countries.country_name as flight_destination',
    'passengers.first_name as passanger_first_name','passengers.last_name as passanger_last_name',
    'customers.first_name','customers.last_name','seats.name as seat');
   const h = await connectedKnex('passengers').select('*')
//    const g = await connectedKnex('chairs')
//    .leftJoin('chair_3', 'chair_3.id', 'chairs.char_id')
//    .leftJoin('passengers', 'passengers.id', 'chairs.passenger_id')
//    .select('chairs.*','chair_3.name','passengers.first_name as passanger_first_name','passengers.last_name as passanger_last_name')


    const arr = { 0: a, 1: b, 2: c, 3: d, 4: e ,5:f,6:h}
    return arr
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


    const arr = { 0: a, 1: b, 2: c, 3: d, 4: e ,5:f,6:h}
    return arr
}




module.exports = {
    get_all, get_by_id
}