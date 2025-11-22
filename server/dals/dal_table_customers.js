const knex = require('knex');
const db = require('../connect_db/default');
const Log = require('../logger/logManager');

const connectedKnex = db.connect();
const FILE = 'dal_table_customers';

Log.info(FILE, 'init', null, 'Customers DAL module initialized');

// ---------------User functions only and admin---------------

async function credit_check(card, id) {
    const func = 'credit_check';
    const cardLast4 = card ? `************${card.slice(-4)}` : 'Unknown';
    Log.info(FILE, func, id, 'Performing credit card validation');
    Log.debug(FILE, func, id, `Validating card: ${cardLast4}`);

    try {
        const credit_check = await connectedKnex.raw(`SELECT checkcreditcardvalidity(?)`, [card]);
        const isValid = credit_check.rows[0].checkcreditcardvalidity;

        if (!isValid) {
            Log.warn(FILE, func, id, 'Credit card validation failed (invalid format/checksum)');
            return false;
        }
        
        Log.debug(FILE, func, id, 'Credit card format is valid. Checking uniqueness...');
        
        const card_exist = await get_by_credit_card(card, id); 

        if (card_exist) { 
            Log.warn(FILE, func, id, 'Credit card check failed: Card already exists with another user');
            return false; 
        }

        Log.debug(FILE, func, id, 'Credit card is valid and available');
        return true;

    } catch (error) {
        Log.error(FILE, func, id, 'Error during credit card check', error);
        throw error; 
    }
}

async function get_by_credit_card(card, current_user_id) {
    const func = 'get_by_credit_card';
    const cardLast4 = card ? `************${card.slice(-4)}` : 'Unknown';
    Log.debug(FILE, func, current_user_id, `Checking uniqueness for card: ${cardLast4}`);
    
    try {
        const customer = await connectedKnex('customers')
            .select('id', 'user_id')
            .where('credit_card', card)
            .andWhere('user_id', '!=', current_user_id)
            .first();

        return !!customer;

    } catch (error) {
        Log.error(FILE, func, current_user_id, 'Error checking uniqueness', error);
        throw error;
    }
}

async function new_customer(new_cus) {
    const func = 'new_customer';
    Log.info(FILE, func, null, 'Creating new customer');
    
    const logSafeData = { ...new_cus };
    if (logSafeData.credit_card) {
        logSafeData.credit_card = `************${logSafeData.credit_card.slice(-4)}`;
    }
    Log.debug(FILE, func, null, `New customer data: ${JSON.stringify(logSafeData)}`);

    try {
        const result = await connectedKnex('customers').insert(new_cus).returning('*');

        const logSafeResult = { ...result[0] };
        if (logSafeResult.credit_card) {
            logSafeResult.credit_card = `************${logSafeResult.credit_card.slice(-4)}`;
        }

        Log.info(FILE, func, result[0].id, 'Customer created successfully');
        Log.debug(FILE, func, result[0].id, `Details: ${JSON.stringify(logSafeResult)}`);
        return result[0];
    } catch (error) {
        Log.error(FILE, func, null, 'Error creating new customer', error);
        throw error;
    }
}

async function verify_cvv(user_id, cvv) {
    const func = 'verify_cvv';
    Log.debug(FILE, func, user_id, 'Verifying CVV');
    
    try {
        const customer = await connectedKnex('customers')
            .select('id')
            .where('user_id', user_id)
            .andWhere('cvv', cvv)
            .first();
        
        return !!customer; 
    } catch (error) {
        Log.error(FILE, func, user_id, 'Error verifying CVV', error);
        throw error;
    }
}

async function get_by_id(id) {
    const func = 'get_by_id';
    Log.debug(FILE, func, id, 'Looking up customer by user_ID');
    
    try {
        const customer = await connectedKnex('customers')
            .select(
                'customers.id',
                'customers.first_name',
                'customers.last_name',
                'customers.address',
                'customers.phone',
                'customers.expiry_date', 
                'customers.user_id',
            
                'users.username as user_name',
                connectedKnex.raw("CONCAT('************', RIGHT(customers.credit_card, 4)) AS credit_card") 
            )
            .leftJoin('users', 'users.id', '=', 'customers.user_id')
            .where('customers.user_id', id)
            .first();
            
        if (customer) {
            Log.debug(FILE, func, id, 'Customer found');
            return customer;
        } else {
            Log.debug(FILE, func, id, 'No customer found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error looking up customer', error);
        throw error;
    }
}

async function update_customer(user_id, updated_customer_data) {
    const func = 'update_customer';
    Log.info(FILE, func, user_id, 'Updating customer');

    const dataToUpdate = {
        first_name: updated_customer_data.first_name,
        last_name: updated_customer_data.last_name,
        address: updated_customer_data.address,
        phone: updated_customer_data.phone
    };

    if (updated_customer_data.credit_card && updated_customer_data.expiry_date && updated_customer_data.cvv) {
        Log.debug(FILE, func, user_id, 'Payment details ARE being updated');
        dataToUpdate.credit_card = updated_customer_data.credit_card;
        dataToUpdate.expiry_date = updated_customer_data.expiry_date;
        dataToUpdate.cvv = updated_customer_data.cvv;
    } else {
        Log.debug(FILE, func, user_id, 'Payment details are NOT being updated');
    }

    const logSafeData = { ...dataToUpdate };
    if (logSafeData.credit_card) {
        logSafeData.credit_card = `************${logSafeData.credit_card.slice(-4)}`;
    }
    Log.debug(FILE, func, user_id, `Final update data: ${JSON.stringify(logSafeData)}`);

    try {
        const result = await connectedKnex('customers')
            .where('user_id', user_id)
            .update(dataToUpdate);

        if (result === 0) {
            Log.warn(FILE, func, user_id, 'Customer update failed - customer not found');
            return null;
        }

        Log.info(FILE, func, user_id, `Customer updated successfully. Rows affected: ${result}`);
        return result;
    } catch (error) {
        Log.error(FILE, func, user_id, 'Error updating customer', error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function get_by_name(name) {
    const func = 'get_by_name';
    Log.debug(FILE, func, name, 'Looking up customer by last name');

    try {
        const customer = await connectedKnex('customers').select('*').where('last_name', name).first();

        if (customer) {
            const logSafeCustomer = { ...customer };
            if (logSafeCustomer.credit_card) {
                logSafeCustomer.credit_card = `************${logSafeCustomer.credit_card.slice(-4)}`;
            }

            Log.debug(FILE, func, name, 'Customer found');
            Log.debug(FILE, func, name, `Details: ${JSON.stringify(logSafeCustomer)}`);
            return customer;
        } else {
            Log.debug(FILE, func, name, 'No customer found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, name, 'Error looking up customer', error);
        throw error;
    }
}

async function delete_customer(id) {
    const func = 'delete_customer';
    Log.info(FILE, func, id, 'Deleting customer');

    try {
        const customer = await connectedKnex('customers').select('id').where('id', id).first();

        if (!customer) {
            Log.warn(FILE, func, id, 'Customer deletion failed - customer not found');
            return 0;
        }

        const result = await connectedKnex('customers').where('id', id).del();
        Log.info(FILE, func, id, 'Customer deleted successfully');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting customer', error);
        throw error;
    }
}

async function delete_all() {
    const func = 'delete_all';
    Log.info(FILE, func, null, 'Deleting all customers (admin only)');
    Log.warn(FILE, func, null, 'This operation will delete ALL customers from the database');

    try {
        const result = await connectedKnex('customers').del();
        Log.debug(FILE, func, null, `Deleted ${result} customers`);

        await connectedKnex.raw('ALTER SEQUENCE "customers_id_seq" RESTART WITH 1');
        Log.info(FILE, func, null, 'Reset customer ID sequence to 1');

        return result;
    } catch (error) {
        Log.error(FILE, func, null, 'Error deleting all customers', error);
        throw error;
    }
}

async function get_all() {
    const func = 'get_all';
    Log.info(FILE, func, null, 'Retrieving all customers (admin only)');

    try {
        const customers = await connectedKnex.raw(`SELECT get_all_customers();`);
        const customersCount = customers.rows[0].get_all_customers ? customers.rows[0].get_all_customers.length : 0;
        Log.debug(FILE, func, null, `Retrieved ${customersCount} customers successfully`);

        return customers.rows[0].get_all_customers;
    } catch (error) {
        Log.error(FILE, func, null, 'Error retrieving all customers', error);
        throw error;
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    const func = 'set_id';
    Log.info(FILE, func, id, 'Setting customer ID sequence');

    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE customers_id_seq RESTART WITH ${id}`);
        Log.debug(FILE, func, id, 'Successfully reset customer ID sequence');
        return result;
    } catch (error) {
        Log.error(FILE, func, id, 'Error setting customer ID sequence', error);
        throw error;
    }
}

module.exports = {
    get_all,
    get_by_id,
    verify_cvv,
    new_customer,
    update_customer,
    delete_customer,
    get_by_name,
    set_id,
    credit_check,
    delete_all
};