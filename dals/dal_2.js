const knex = require('knex')
const db = require('../../a_db/db')
const connectedKnex = db.connect()

// ---------------Admin permission only---------------

async function new_countrie(new_mes) {
    // db.run('insert into countries ....')
    // result[0] will be the new ID given by the SQL
    // Insert into countries values(....)
    const result = await connectedKnex('countries').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function get_by_id(id) {
    // db.run('select * from countries where id=?')
    const countrie = await connectedKnex('countries')
        .select('countries.*', 'continents.*')
        .leftJoin('continents', 'continents.id', '=', 'countries.continent_id')
        .where('countries.id', id)
        .first();
    return countrie
}

async function update_countrie(id, updated_countrie) {
    // db.run('update countries ....')
    const result = await connectedKnex('countries').where('id', id).update(updated_countrie)
    return updated_countrie
}

async function delete_countrie(id) {
    // db.run('update countries ....')
    const result = await connectedKnex('countries').where('id', id).del()
    return result
}

async function get_all() {
    // db.run('select * from countries')
    const countries = await connectedKnex('countries')
        .select('countries.*', 'continents.continent')
        .from('countries')
        .join('continents', 'countries.continent_id', 'continents.id');
    return countries
}

async function delete_all() {
    // db.run('update countries ....')
    const result = await connectedKnex('countries').del()
    await connectedKnex.raw('ALTER SEQUENCE "countries_id_seq" RESTART WITH 1');
    return result
}
// async function create_table_if_not_exist() {
//     const tableExists = await connectedKnex.schema.hasTable('countries');

//     if (!tableExists) {
//         await connectedKnex.schema.createTable('countries', (table) => {
//             table.increments('id').primary(); // This creates a SERIAL column
//             table.string('name_continent').notNullable();
//             table.integer('country_name').notNullable();
//             table.foreign('continent_id').references('continents').on('id');
//         });
//     }
// }

module.exports = {
    get_all, get_by_id, new_countrie, update_countrie, delete_countrie,
    delete_all
    // , create_table_if_not_exist
}