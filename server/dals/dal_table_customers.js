const knex = require('knex')
const db = require('../connect_db/default')
const logger = require('../logger/my_logger')
const connectedKnex = db.connect()

logger.info('Customers DAL module initialized')

// ---------------User functions only and admin---------------

async function credit_check(card) {
    logger.info('Performing credit card validation')
    logger.debug(`Validating credit card: ************${card.slice(-4)}`) // לוג רק 4 ספרות אחרונות לאבטחה
    
    try {
        const credit_check = await connectedKnex.raw(`SELECT checkcreditcardvalidity('${card}')`)
        const isValid = credit_check.rows[0].checkcreditcardvalidity
        
        if (isValid) {
            logger.debug('Credit card validation successful')
        } else {
            logger.warn('Credit card validation failed')
        }
        
        return isValid
    } catch (error) {
        logger.error('Error validating credit card:', error)
        throw error
    }
}

async function new_customer(new_cus) {
    logger.info('Creating new customer')
    // השמט את מספר כרטיס האשראי מהלוג מסיבות אבטחה
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

async function get_by_id(id) {
    logger.debug(`Looking up customer by ID: ${id}`)
    
    try {
        const customer = await connectedKnex('customers')
            .select(
                'customers.*',
                'users.username as user_name',
                connectedKnex.raw("CONCAT('************', RIGHT(customers.credit_card, 4)) AS credit_card")
            )
            .leftJoin('users', 'users.id', '=', 'customers.user_id')
            .where('customers.user_id', id)
            .first();
            
        if (customer) {
            logger.debug(`Customer found by ID: ${id}`)
            return customer
        } else {
            logger.debug(`No customer found with ID: ${id}`)
            return null
        }
    } catch (error) {
        logger.error(`Error looking up customer by ID ${id}:`, error)
        throw error
    }
}

async function update_customer(id, updated_customer) {
    logger.info(`Updating customer with ID: ${id}`)
    
    // השמט את מספר כרטיס האשראי מהלוג מסיבות אבטחה
    const logSafeData = { ...updated_customer }
    if (logSafeData.credit_card) {
        logSafeData.credit_card = `************${logSafeData.credit_card.slice(-4)}`
    }
    logger.debug(`Update data: ${JSON.stringify(logSafeData)}`)
    
    try {
        // תחילה בדוק אם הלקוח קיים
        const customer = await connectedKnex('customers').select('id').where('user_id', id).first()
        console.log("customer",customer);
        
        if (!customer) {
            logger.warn(`Customer update failed - customer not found: ${id}`)
            return null
        }
        
        const result = await connectedKnex('customers').where('id', customer.id).update(updated_customer)
        logger.info(`Customer ${id} updated successfully`)
        return updated_customer
    } catch (error) {
        logger.error(`Error updating customer ${id}:`, error)
        throw error
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
    new_customer, 
    update_customer, 
    delete_customer, 
    get_by_name, 
    set_id, 
    credit_check, 
    delete_all 
}