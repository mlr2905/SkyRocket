
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

async function create_table_if_not_exist() {
    const tableExists = await connectedKnex.schema.hasTable('customers');

    if (!tableExists) {
        await connectedKnex.schema.createTable('customers', (table) => {
            table.increments('id').primary(); // This creates a SERIAL column
            table.string('first_name', 255).notNullable().comment('Customer first name');
            table.string('last_name', 255).notNullable().comment('Customer last name');
            table.string('address', 255).notNullable().comment('Customer address');
            table.string('phone_no', 255).notNullable().unique().comment('Customer phone number');
            table.string('credit_card_no', 255).notNullable().unique().comment('Customer credit card number');
            table.bigInteger('user_id').notNullable().unique().comment('User ID linked to this customer');
            table.foreign('user_id').references('users.id');
       
        
        });
    }
}

async function delete_all() {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').del()
    await connectedKnex.raw('ALTER SEQUENCE "cusstomers_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from customers')
    const customers = await connectedKnex('customers')
    .join('users', 'users.id', 'customers.user_id')
    .select('customers.*', 'users.username as user_name');
  
  
    return customers
}

async function get_by_id(id) {
    // db.run('select * from customers where id=?')
    const customer = await connectedKnex('customers')
    .select('customers.*', 'users.username as user_name')
    .leftJoin('users', 'users.id', '=', 'customers.user_id')
    .where('customers.id', id)
    .first()
    return customer
}

async function new_customer(new_mes) {
    // db.run('insert into customers ....')
    // result[0] will be the new ID given by the SQL
    // Insert into customers values(....)
    const result = await connectedKnex('customers').insert(new_mes)
    return { ...new_mes, id: result[0] }
}

async function update_customer(id, updated_customer) {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').where('id', id).update(updated_customer)
    return updated_customer
}

async function delete_customer(id) {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').where('id', id).del()
    return result
}

module.exports = {
    get_all, get_by_id, new_customer, update_customer, delete_customer,
    delete_all, create_table_if_not_exist
}