const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Customers DAL module initialized')

// ---------------User functions only and admin---------------

/**
 * מבצע בדיקה כפולה: תקינות (פורמט) וייחודיות (האם קיים אצל משתמש אחר).
 * @param {string} card - מספר כרטיס האשראי לבדיקה
 * @param {number} id - ה-ID המספרי (integer) של המשתמש הנוכחי
 * @returns {Promise<boolean>} - מחזיר true אם הכרטיס תקין ופנוי. מחזיר false אחרת.
 */
async function credit_check(card, id) {
    logger.info('Performing credit card validation and uniqueness check')
    logger.debug(`Validating card: ************${card.slice(-4)} for user ID: ${id}`)

    try {
    
        const credit_check = await connectedKnex.raw(`SELECT checkcreditcardvalidity(?)`, [card])
        const isValid = credit_check.rows[0].checkcreditcardvalidity

        if (!isValid) {
            logger.warn('Credit card validation failed (invalid format/checksum).')
            return false
        }
        
        logger.debug('Credit card format is valid. Checking uniqueness...')
    
        const card_exist = await get_by_credit_card(card, id); 

        if (card_exist) { 
            logger.warn('Credit card check failed: Card already exists with another user.')
            return false; 
        }

        logger.debug('Credit card is valid and available (unique).');
        return true;

    } catch (error) {
        logger.error('Error during credit card check:', error)
        throw error 
    }
}

async function get_by_credit_card(card, current_user_id) {
    logger.debug(`Checking credit card uniqueness: ************${card.slice(-4)} for user ID: ${current_user_id}`);
    try {
        const customer = await connectedKnex('customers')
            .select('id', 'user_id')
            .where('credit_card', card)
            .andWhere('user_id', '!=', current_user_id)
            .first();

        return !!customer;

    } catch (error) {
        logger.error('Error checking credit card uniqueness:', error);
        throw error;
    }
}

async function new_customer(new_cus) {
    logger.info('Creating new customer')
    const logSafeData = { ...new_cus }
    if (logSafeData.credit_card) {
        logSafeData.credit_card = `************${logSafeData.credit_card.slice(-4)}`
    }
    logger.debug(`New customer data: ${JSON.stringify(logSafeData)}`)

    try {
        const result = await connectedKnex('customers').insert(new_cus).returning('*');

        // השמט את מספר כרטיס האשראי מהלוג גם כאן
        const logSafeResult = { ...result[0] }
        if (logSafeResult.credit_card) {
            logSafeResult.credit_card = `************${logSafeResult.credit_card.slice(-4)}`
        }

        logger.info(`Customer created successfully with ID: ${result[0].id}`)
        logger.debug(`Created customer details: ${JSON.stringify(logSafeResult)}`)
        return result[0]
    } catch (error) {
        logger.error('Error creating new customer:', error)
        throw error
    }
}

async function verify_cvv(user_id, cvv) {
    logger.debug(`DAL: Verifying CVV for user_id: ${user_id}`);
    try {
        const customer = await connectedKnex('customers')
            .select('id')
            .where('user_id', user_id)
            .andWhere('cvv', cvv)
            .first();
        
        return !!customer; 
    } catch (error) {
        logger.error('Error verifying CVV in DAL:', error);
        throw error;
    }
}



async function get_by_id(id) {
    logger.debug(`Looking up customer by user_ID: ${id}`)
    
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
            logger.debug(`Customer found by user_ID: ${id}`)
            return customer
        } else {
            logger.debug(`No customer found with user_ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up customer by user_ID ${id}:`, error)
        throw error
    }
}

/**
 * Updates customer details based on their USER ID.
 * Performs a partial update.
 * @param {number} user_id - The user's numeric ID (e.g., 49)
 * @param {object} updated_customer_data - The fields to update.
 * @returns {Promise<number|null>} Rows affected or null if not found.
 */
async function update_customer(user_id, updated_customer_data) {
    logger.info(`DAL: Updating customer for user_ID: ${user_id}`);

    const dataToUpdate = {
        first_name: updated_customer_data.first_name,
        last_name: updated_customer_data.last_name,
        address: updated_customer_data.address,
        phone: updated_customer_data.phone
    };


    if (updated_customer_data.credit_card && updated_customer_data.expiry_date && updated_customer_data.cvv) {
        logger.debug(`Payment details *are being* updated for user_id: ${user_id}`);
        dataToUpdate.credit_card = updated_customer_data.credit_card;
        dataToUpdate.expiry_date = updated_customer_data.expiry_date;
        dataToUpdate.cvv = updated_customer_data.cvv;
    } else {
        logger.debug(`Payment details are *not being* updated for user_id: ${user_id}`);
    }

    const logSafeData = { ...dataToUpdate };
    if (logSafeData.credit_card) {
        logSafeData.credit_card = `************${logSafeData.credit_card.slice(-4)}`;
    }
    logger.debug(`DAL: Final update data: ${JSON.stringify(logSafeData)}`);

    try {

        const result = await connectedKnex('customers')
            .where('user_id', user_id)
            .update(dataToUpdate);

        if (result === 0) {
            logger.warn(`DAL: Customer update failed - customer not found for user_id: ${user_id}`);
            return null;
        }

        logger.info(`DAL: Customer for user_id ${user_id} updated successfully. Rows affected: ${result}`);
        return result;
    } catch (error) {
        logger.error(`DAL: Error updating customer for user_id ${user_id}:`, error);
        throw error;
    }
}

// ---------------Admin permission only---------------

async function get_by_name(name) {
    logger.debug(`Looking up customer by last name: ${name}`)

    try {
        const customer = await connectedKnex('customers').select('*').where('last_name', name).first()

        if (customer) {
            // השמט את מספר כרטיס האשראי מהלוג
            const logSafeCustomer = { ...customer }
            if (logSafeCustomer.credit_card) {
                logSafeCustomer.credit_card = `************${logSafeCustomer.credit_card.slice(-4)}`
            }

            logger.debug(`Customer found by last name: ${name}`)
            logger.debug(`Customer details: ${JSON.stringify(logSafeCustomer)}`)
            return customer
        } else {
            logger.debug(`No customer found with last name: ${name}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up customer by last name ${name}:`, error)
        throw error
    }
}

async function delete_customer(id) {
    logger.info(`Deleting customer with ID: ${id}`)

    try {
        // תחילה בדוק אם הלקוח קיים
        const customer = await connectedKnex('customers').select('id').where('id', id).first()

        if (!customer) {
            logger.warn(`Customer deletion failed - customer not found: ${id}`)
            return 0
        }

        const result = await connectedKnex('customers').where('id', id).del()
        logger.info(`Customer ${id} deleted successfully`)
        return result
    } catch (error) {
        logger.error(`Error deleting customer ${id}:`, error)
        throw error
    }
}

async function delete_all() {
    logger.info('Deleting all customers (admin only function)')
    logger.warn('This operation will delete ALL customers from the database')

    try {
        const result = await connectedKnex('customers').del()
        logger.debug(`Deleted ${result} customers from database`)

        await connectedKnex.raw('ALTER SEQUENCE "customers_id_seq" RESTART WITH 1');
        logger.info('Reset customer ID sequence to 1')

        return result
    } catch (error) {
        logger.error('Error deleting all customers:', error)
        throw error
    }
}

async function get_all() {
    logger.info('Retrieving all customers (admin only function)')

    try {
        const customers = await connectedKnex.raw(`SELECT get_all_customers();`)
        const customersCount = customers.rows[0].get_all_customers ? customers.rows[0].get_all_customers.length : 0
        logger.debug(`Retrieved ${customersCount} customers successfully`)

        // לא מדפיסים את כל פרטי הלקוחות ללוג מסיבות אבטחה ושמירה על פרטיות

        return customers.rows[0].get_all_customers
    } catch (error) {
        logger.error('Error retrieving all customers:', error)
        throw error
    }
}

// ---------------Test functions only---------------

async function set_id(id) {
    logger.info(`Setting customer ID sequence to: ${id} (test function)`)

    try {
        const result = await connectedKnex.raw(`ALTER SEQUENCE customers_id_seq RESTART WITH ${id}`);
        logger.debug(`Successfully reset customer ID sequence to ${id}`)
        return result
    } catch (error) {
        logger.error(`Error setting customer ID sequence to ${id}:`, error)
        throw error
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
}