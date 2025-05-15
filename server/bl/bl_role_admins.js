const dal_0 = require('../dals/dal_all_tables')
const dal_1 = require('../dals/dal_table_users')
const dal_3 = require('../dals/dal_table_airlines')
const dal_4 = require('../dals/dal_table_customers')
const dal_5 = require('../dals/dal_table_flights')
const dal_6 = require('../dals/dal_table_tickets')
const dal_7 = require('../dals/dal_table_passengers')
const winston = require('winston')

// Create a logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

//func users
async function create_user_role1(uesr) {
  logger.info(`Attempting to create user with role 1: ${uesr.username}`);
  const user_name = await dal_1.get_by_name(uesr.username)
  if (user_name === undefined) {
    try {
      logger.info(`Username ${uesr.username} is available, proceeding with creation (role 1)`);
      const new_user = await dal_1.new_user_role1(uesr)
      if (new_user.length === 8) {
        logger.info(`User ${uesr.username} with role 1 created successfully with generated password`);
        return { 'OK': `'${uesr.username}' successfully created,This is the generated password,'${new_user}'` }
      }
      if (new_user === true) {
        logger.info(`User ${uesr.username} with role 1 created successfully`);
        return { 'OK': `'${uesr.username}' successfully created` }
      }
      logger.warn(`Unexpected result when creating user ${uesr.username} with role 1`, new_user);
      return new_user
    }
    catch (error) {
      logger.error(`Error creating user ${uesr.username} with role 1: ${error.message}`);
      return error;
    }
  }
  else {
    logger.warn(`Username ${uesr.username} already exists, creation rejected`);
    return 'rejected';
  }
}

//// create_user
async function create_user_role2(uesr) {
  logger.info(`Attempting to create user with role 2: ${uesr.username}`);
  const user_name = await dal_1.get_by_name(uesr.username)
  if (user_name === undefined) {
    try {
      logger.info(`Username ${uesr.username} is available, proceeding with creation (role 2)`);
      const new_user = await dal_1.new_user_role2(uesr)
      if (new_user.length === 8) {
        logger.info(`User ${uesr.username} with role 2 created successfully with generated password`);
        return { 'OK': `'${uesr.username}' successfully created,This is the generated password,'${new_user}'` }
      }
      if (new_user === true) {
        logger.info(`User ${uesr.username} with role 2 created successfully`);
        return { 'OK': `'${uesr.username}' successfully created` }
      }
      logger.warn(`Unexpected result when creating user ${uesr.username} with role 2`, new_user);
      return new_user
    }
    catch (error) {
      logger.error(`Error creating user ${uesr.username} with role 2: ${error.message}`);
      return error;
    }
  }
  else {
    logger.warn(`Username ${uesr.username} already exists, creation rejected`);
    return 'rejected';
  }
}

async function get_by_id_user(type, id) {
  logger.info(`Getting user by ${type ? type : 'id'}: ${id}`);
  try {
    let user_id = null
    if (id === undefined) {
      logger.warn('get_by_id_user called with undefined id');
      user_id = await dal_1.get_by_id(id);
    }
    else {
      user_id = await dal_1.get_by_id_type(type, id);
    }

    if (user_id) {
      if (user_id.role_id === 2) {
        logger.info(`Successfully retrieved user with ${type ? type : 'id'}: ${id}`);
        return user_id
      }
      else {
        logger.warn(`User with ${type ? type : 'id'} ${id} has invalid role_id: ${user_id.role_id}, status: Postponed`);
        return 'Postponed'
      }
    }
    else {
      logger.warn(`No user found with ${type ? type : 'id'}: ${id}`);
      return false
    }
  } catch (error) {
    logger.error(`Error retrieving user with ${type ? type : 'id'} ${id}: ${error.message}`);
    return error;
  }
}

async function get_qr(id) {
  logger.info(`Getting QR for id: ${id}`);
  try {
    const user_id = await dal_0.get_qr(id);
    if (user_id) {
      logger.info(`Successfully retrieved QR for id: ${id}`);
    } else {
      logger.warn(`No QR found for id: ${id}`);
    }
    return user_id;
  } catch (error) {
    logger.error(`Error retrieving QR for id ${id}: ${error.message}`);
    return error;
  }
}

async function update_user(id, user) {
  logger.info(`Attempting to update user with id: ${id}`);
  try {
    const user_id = await dal_1.get_by_id('id', id);
    if (user_id) {
      logger.info(`Found user ${user_id.username}, proceeding with update`);
      const update_user = await dal_1.update_user(id, user);
      logger.info(`User ${user_id.username} updated successfully`);
      return { 'ok': `${user_id.username}${update_user}` }
    }
    else {
      logger.warn(`No user found with id: ${id}, update aborted`);
      return user_id
    }
  } catch (error) {
    logger.error(`Error updating user with id ${id}: ${error.message}`);
    return error;
  }
}

async function delete_account(id) {
  logger.info(`Attempting to delete account with id: ${id}`);
  try {
    const user_id = await dal_1.get_by_id('id', id);
    if (user_id) {
      logger.info(`Found user ${user_id.username}, proceeding with deletion`);
      const delete_user = await dal_1.delete_user(id);
      logger.info(`User ${user_id.username} deleted successfully`);
      return `User '${user_id.username}' deleted successfully `
    }
    else {
      logger.warn(`No user found with id: ${id}, deletion aborted`);
      return `The ID ${id} you specified does not exist`;
    }
  } catch (error) {
    logger.error(`Error deleting account with id ${id}: ${error.message}`);
    return error;
  }
}

// airline
async function create_airline(uesr) {
  logger.info(`Attempting to create airline: ${uesr.name}`);
  try {
    const user_name = await dal_3.get_by_name(uesr.name)
    if (user_name === undefined) {
      logger.info(`Airline name ${uesr.name} is available, proceeding with creation`);
      const new_user = await dal_3.new_airline(uesr);
      logger.info(`Airline ${uesr.name} created successfully`);
      return new_user;
    }
    else {
      logger.warn(`Airline name ${uesr.name} already exists, creation rejected`);
      return 'rejected';
    }
  } catch (error) {
    logger.error(`Error creating airline ${uesr.name}: ${error.message}`);
    return error;
  }
}

async function get_by_id_airline(id) {
  logger.info(`Getting airline by id: ${id}`);
  try {
    const user_id = await dal_3.get_by_id(id);
    if (user_id) {
      logger.info(`Successfully retrieved airline with id: ${id}`);
    } else {
      logger.warn(`No airline found with id: ${id}`);
    }
    return user_id;
  } catch (error) {
    logger.error(`Error retrieving airline with id ${id}: ${error.message}`);
    return error;
  }
}

async function update_airline(id, update_airline) {
  logger.info(`Attempting to update airline with id: ${id}`);
  try {
    const user_id = await dal_3.get_by_id(id);
    if (user_id) {
      logger.info(`Found airline ${user_id.name}, proceeding with update`);
      const update_user = await dal_3.update_airline(id, update_airline);
      logger.info(`Airline ${user_id.name} updated successfully`);
      return `${user_id.name}${update_user}`
    }
    else {
      logger.error(`The airline ID ${id} does not exist`);
      return console.error('The ID you specified does not exist:');
    }
  } catch (error) {
    logger.error(`Error updating airline ${id}: ${error.message}`);
    return error;
  }
}

// func customers
async function new_customer(new_cus) {
  logger.info(`Attempting to create new customer with credit card: ${new_cus.credit_card_no.substring(0, 4)}XXXX`);
  try {
    const Credit_check = await dal_4.credit_check(new_cus.credit_card_no)
    if (!Credit_check) {
      logger.info(`Credit card validated, proceeding with customer creation`);
      const new_customer = await dal_4.new_customer(new_cus);
      if (new_customer) {
        logger.info(`Customer created successfully`);
        return new_cus
      } else {
        logger.warn(`Failed to create customer`);
        return false;
      }
    }
    else {
      logger.warn(`Invalid credit card number ${new_cus.credit_card_no.substring(0, 4)}XXXX, customer creation rejected`);
      return `Invalid credit card number ${new_cus.credit_card_no} `;
    }
  } catch (error) {
    logger.error(`Error creating new customer: ${error.message}`);
    return error;
  }
}

async function get_by_id_customer(id) {
  logger.info(`Getting customer by id: ${id}`);
  try {
    const user_id = await dal_4.get_by_id(id);
    if (user_id) {
      logger.info(`Successfully retrieved customer with id: ${id}`);
    } else {
      logger.warn(`No customer found with id: ${id}`);
    }
    return user_id;
  } catch (error) {
    logger.error(`Error retrieving customer with id ${id}: ${error.message}`);
    return error;
  }
}

async function update_customer(id, update) {
  logger.info(`Attempting to update customer with id: ${id}`);
  try {
    const get_by_id = await dal_4.get_by_id(id);
    if (get_by_id) {
      logger.info(`Found customer with id ${id}, proceeding with update`);
      const update_customer = await dal_4.update_customer(id, update);
      logger.info(`Customer ${id} updated successfully`);
      return `${get_by_id.id}${update_customer}`
    }
    else {
      logger.error(`The customer ID ${id} does not exist`);
      return console.error('The ID you specified does not exist:', new Error('Customer not found'));
    }
  } catch (error) {
    logger.error(`Error updating customer ${id}: ${error.message}`);
    return error;
  }
}

// flights
async function get_all_flights(id) {
  logger.info(`Getting all flights${id ? ` for id: ${id}` : ''}`);
  try {
    const flights = await dal_5.get_all(id);
    logger.info(`Successfully retrieved ${flights ? flights.length : 0} flights`);
    return flights;
  }
  catch (error) {
    logger.error(`Error retrieving all flights${id ? ` for id: ${id}` : ''}: ${error.message}`);
    return error;
  }
}

async function get_by_id_flights(id) {
  logger.info(`Getting flight by id: ${id}`);
  try {
    const get_by_id = await dal_5.get_by_id(id);
    if (get_by_id) {
      logger.info(`Successfully retrieved flight with id: ${id}`);
      return get_by_id
    } else {
      logger.warn(`No flight found with id: ${id}`);
      return false
    }
  } catch (error) {
    logger.error(`Error retrieving flight with id ${id}: ${error.message}`);
    return error;
  }
}

async function get_flight_by_airline_id(id) {
  logger.info(`Getting flights by airline id: ${id}`);
  try {
    const get_by_id = await dal_5.get_flight_by_airline_id(id);
    if (get_by_id) {
      logger.info(`Successfully retrieved flights for airline id: ${id}`);
      return get_by_id
    } else {
      logger.error(`No flights found for airline id: ${id}`);
      return console.error('The hand does not exist in Bella');
    }
  } catch (error) {
    logger.error(`Error retrieving flights for airline id ${id}: ${error.message}`);
    return error;
  }
}

async function check_flight_existence(v) {
  logger.info(`Checking flight existence: ${JSON.stringify(v)}`);
  try {
    const result = await dal_5.check_flight_existence(v);
    logger.info(`Flight existence check result: ${result}`);
    return result;
  } catch (error) {
    logger.error(`Error checking flight existence: ${error.message}`);
    return error;
  }
}

async function flights_records_tables(v) {
  logger.info(`Validating flight records: ${JSON.stringify(v)}`);
  try {
    const result = await dal_5.flights_records_tables(v);
    logger.info(`Flight records validation result: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    logger.error(`Error validating flight records: ${error.message}`);
    return error;
  }
}

async function create_new_flight(flights) {
  logger.info(`Attempting to create new flight: ${JSON.stringify(flights)}`);
  try {
    const check = await dal_5.flights_records_tables(flights);
    logger.info(`Validation check for new flight: ${JSON.stringify(check)}`);
    
    if (check.status === "correct") {
      logger.info("Flight validation passed, proceeding with creation");
      const new_flights = await dal_5.new_flight(flights);
      logger.info(`Flight created successfully: ${JSON.stringify(new_flights)}`);
      return new_flights;
    }
    else if (check.status !== "correct") {
      logger.warn(`Flight validation failed: ${JSON.stringify(check)}`);
      return check;
    }
    else {
      logger.error(`Unexpected validation result: ${check}`);
      return { "error": `${check}` };
    }
  } catch (error) {
    logger.error(`Error creating new flight: ${error.message}`);
    return error;
  }
}

async function update_flight(id, v) {
  logger.info(`Attempting to update flight with id ${id}: ${JSON.stringify(v)}`);
  try {
    const check1 = await dal_5.check_flight_existence(v);
    logger.info(`Flight existence check result: ${check1}`);
    
    const check2 = await dal_5.flights_records_tables(v);
    logger.info(`Flight records validation result: ${JSON.stringify(check2)}`);
    
    if (check1 === false && check2.status === "correct") {
      logger.info("Flight validation passed, proceeding with update");
      const update = await dal_5.update_flight(id, v);
      
      if (update.airline_id > 0) {
        logger.info(`Flight ${id} updated successfully`);
        return { "status": "OK" };
      }
      else {
        logger.error(`Failed to update flight ${id}: ${JSON.stringify(update)}`);
        return { "error": `Please refer to the following error:${update}` };
      }
    }
    else if (check1 === true) {
      logger.warn(`Flight already exists, update rejected`);
      return { "status": "exists" };
    }
    else if (check2.status !== "correct") {
      logger.warn(`Flight validation failed: ${JSON.stringify(check2)}`);
      return check2;
    }
    else {
      logger.error(`Multiple validation issues: ${check1} and ${check2}`);
      return { "error": `${check1} and${check2}` };
    }
  } catch (error) {
    logger.error(`Error updating flight ${id}: ${error.message}`);
    return error;
  }
}

async function delete_flight(id) {
  logger.info(`Attempting to delete flight with id: ${id}`);
  try {
    const delete_flight = await dal_5.delete_flight(id);
    if (delete_flight) {
      logger.info(`Flight ${id} deleted successfully`);
      return true;
    }
    else {
      logger.warn(`Failed to delete flight ${id}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error deleting flight ${id}: ${error.message}`);
    return error;
  }
}

// Note: This is a duplicate function with a different implementation
// Added unique logging but keeping both functions as in original code
async function get_by_id_flights_alt(id) {
  logger.info(`Getting flight by id (alt method): ${id}`);
  try {
    const get_by_id = await dal_5.get_by_id(id);
    if (get_by_id) {
      logger.info(`Successfully retrieved flight with id: ${id}`);
      return get_by_id;
    } else {
      logger.error(`No flight found with id: ${id}`);
      return console.error('The hand does not exist in Bella');
    }
  } catch (error) {
    logger.error(`Error retrieving flight with id ${id}: ${error.message}`);
    throw error; // This version throws the error rather than returning it
  }
}

//tickets
async function get_by_id_ticket(id) {
  logger.info(`Getting ticket by id: ${id}`);
  try {
    const user_id = await dal_6.get_by_id(id);
    if (user_id) {
      logger.info(`Successfully retrieved ticket with id: ${id}`);
    } else {
      logger.warn(`No ticket found with id: ${id}`);
    }
    return user_id;
  } catch (error) {
    logger.error(`Error retrieving ticket with id ${id}: ${error.message}`);
    return error;
  }
}

//new_passengers
async function new_passenger(new_p) {
  logger.info(`Attempting to create new passenger: ${JSON.stringify(new_p)}`);
  try {
    const new_passenger = await dal_7.new_passenger(new_p);
    logger.info(`Passenger created successfully: ${JSON.stringify(new_passenger)}`);
    return new_passenger;
  }
  catch (error) {
    logger.error(`Error creating new passenger: ${error.message}`);
    return error;
  }
}

async function get_by_id_passenger(id) {
  logger.info(`Getting passenger by id: ${id}`);
  try {
    const passenger_id = await dal_7.get_by_id_passenger(id);
    if (passenger_id) {
      logger.info(`Successfully retrieved passenger with id: ${id}`);
    } else {
      logger.warn(`No passenger found with id: ${id}`);
    }
    return passenger_id;
  } catch (error) {
    logger.error(`Error retrieving passenger with id ${id}: ${error.message}`);
    return error;
  }
}

//tickets
async function purchase_ticket(new_ticket, test) {
  logger.info(`Attempting to purchase ticket for flight id: ${new_ticket.flight_id}, test mode: ${test !== undefined}`);
  try {
    const flight = await dal_5.get_by_id(new_ticket.flight_id)
    if (flight) {
      logger.info(`Found flight ${flight.id} with ${flight.remaining_tickets} remaining tickets`);
      if (flight.remaining_tickets > 0) {
        const id = parseInt(flight.id);
        if (test === undefined) {
          logger.info(`Updating remaining tickets for flight ${id}`);
          await dal_5.update_remaining_tickets(id);
        } else {
          logger.info(`Test mode: skipping ticket count update for flight ${id}`);
        }
        const result = await dal_6.new_ticket(new_ticket);
        logger.info(`Ticket purchased successfully: ${JSON.stringify(result)}`);
        return result;
      }
      else {
        logger.warn(`No tickets left for flight ${flight.id}, purchase rejected`);
        return Error('no tickets left');
      }
    }
    else {
      logger.error(`Flight ${new_ticket.flight_id} does not exist, purchase rejected`);
      throw Error('flight does not exist');
    }
  }
  catch (error) {
    logger.error(`Error purchasing ticket: ${error.message}`);
    return error;
  }
}

// This is a duplicate function - keeping both as in original code
async function get_by_id_ticket_alt(id) {
  logger.info(`Getting ticket by id (alt method): ${id}`);
  try {
    const user_id = await dal_6.get_by_id(id);
    if (user_id) {
      logger.info(`Successfully retrieved ticket with id: ${id}`);
    } else {
      logger.warn(`No ticket found with id: ${id}`);
    }
    return user_id;
  } catch (error) {
    logger.error(`Error retrieving ticket with id ${id}: ${error.message}`);
    return error;
  }
}

module.exports = {
  purchase_ticket, create_user_role1, create_user_role2, get_by_id_flights, get_all_flights, update_user, get_by_id_user,
  delete_account, new_customer, get_by_id_customer, update_customer, get_by_id_ticket, get_by_id_passenger, new_passenger, get_qr,
  get_by_id_user, update_user, create_airline, get_by_id_airline, flights_records_tables, update_airline, get_flight_by_airline_id,
  get_by_id_flights, check_flight_existence, create_new_flight, update_flight, delete_flight
}