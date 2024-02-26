const knex = require('knex')
const db = require('../connect_db/default')
const connectedKnex = db.connect()
// ---------------User functions only and admin---------------
async function credit_check (card){
    const credit_check = await connectedKnex.raw(`SELECT checkcreditcardvalidity('${card}')`)

    return credit_check.rows[0].checkcreditcardvalidity

}

async function new_customer(new_cus) {

    const new_customer = await connectedKnex.raw(`SELECT create_new_customer(
        '${new_cus.first_name}','${new_cus.last_name}','${new_cus.address}'
        ,'${new_cus.phone_no}','${new_cus.credit_card_no}','${new_cus.user_id}');`)   
    return new_customer
}

async function get_by_id(id) {
    const customer = await connectedKnex('customers')
        .select(
            'customers.*', 
            'users.username as user_name',
            connectedKnex.raw("CONCAT('************', RIGHT(customers.credit_card_no, 4)) AS credit_card_no")
        )
        .leftJoin('users', 'users.id', '=', 'customers.user_id')
        .where('customers.id', id)
        .first();
    return customer;
}




async function update_customer(id, updated_customer) {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').where('id', id).update(updated_customer)
    
    return updated_customer
}

// ---------------Admin permission only---------------

async function get_by_name(name) {

    const country_name = await connectedKnex('customers').select('*').where('last_name', name).first()

    return country_name
}

async function delete_customer(id) {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').where('id', id).del()
    return result
}

async function delete_all() {
    // db.run('update customers ....')
    const result = await connectedKnex('customers').del()
    await connectedKnex.raw('ALTER SEQUENCE "customers_id_seq" RESTART WITH 1');
    return result
}

async function get_all() {
    // db.run('select * from customers')
    const customers = await connectedKnex.raw(`SELECT get_all_customers();`)

    return customers.rows
}

// ---------------Test functions only---------------



async function next_id() {
    try {
        const result = await connectedKnex.raw(`SELECT nextval('customers_id_seq')`);
        return result;

    } catch (e) {
        throw console.error( e);

    }
}

async function set_id(id) {
    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE customers_id_seq RESTART WITH ${id}`);
        return result;

    } catch (e) {
        throw console.error(e);

    }
}

module.exports = {
    get_all, get_by_id, new_customer, update_customer, delete_customer,get_by_name,next_id,set_id,credit_check,
    delete_all
    // , create_table_if_not_exist
}