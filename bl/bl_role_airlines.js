const dal_0 = require('../dals/dal_all_tables')
const dal_1 = require('../dals/dal_table_users')
const dal_3 = require('../dals/dal_table_airlines')
const dal_5 = require('../dals/dal_table_flights')
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
async function create_user(uesr) {
  logger.info(`Attempting to create user: ${uesr.username}`);
  const user_name = await dal_1.get_by_name(uesr.username)
  if (user_name === undefined) {
    try {
      logger.info(`Username ${uesr.username} is available, proceeding with creation`);
      const new_user = await dal_1.new_user_role2(uesr)
      if (new_user.length === 8) {
        logger.info(`User ${uesr.username} created successfully with generated password`);
        return { 'OK': `'${uesr.username}' successfully created,This is the generated password,'${new_user}'` }
      }
      if (new_user === true) {
        logger.info(`User ${uesr.username} created successfully`);
        return { 'OK': `'${uesr.username}' successfully created` }
      }
      logger.warn(`Unexpected result when creating user ${uesr.username}`, new_user);
      return new_user
    }
    catch (error) {
      logger.error(`Error creating user ${uesr.username}: ${error.message}`);
      return error;
    }
  }
  else {
    logger.warn(`Username ${uesr.username} already exists, creation rejected`);
    return 'rejected';
  }
}

async function get_by_id_user(type, id) {
  logger.info(`Getting user by ${type ? 'type and' : ''} id: ${id}`);
  let user_id = null
  try {
    if (id === undefined) {
      logger.warn('get_by_id_user called with undefined id');
      user_id = await dal_1.get_by_id(id);
    }
    else {
      user_id = await dal_1.get_by_id_type(type, id);
    }

    if (user_id) {
      if (user_id.role_id === 2) {
        logger.info(`Successfully retrieved user with id: ${id}`);
        return user_id
      }
      else {
        logger.warn(`User with id ${id} has invalid role_id: ${user_id.role_id}, status: Postponed`);
        return 'Postponed'
      }
    }
    else {
      logger.warn(`No user found with id: ${id}`);
      return false
    }
  }
  catch (error) {
    logger.error(`Error retrieving user with id ${id}: ${error.message}`);
    return error;
  }
}

async function update_user(id, user) {
  logger.info(`Attempting to update user with id: ${id}`);
  try {
    const result = await dal_1.update_user(id, user);
    logger.info(`User ${id} updated successfully`);
    return result;
  }
  catch (error) {
    logger.error(`Error updating user ${id}: ${error.message}`);
    return;
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
      return `${user_id.name}${update_user}`;
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

// flights
async function get_by_id_flights(id) {
  logger.info(`Getting flight by id: ${id}`);
  try {
    const get_by_id = await dal_5.get_by_id(id);
    if (get_by_id) {
      logger.info(`Successfully retrieved flight with id: ${id}`);
      return get_by_id;
    } else {
      logger.warn(`No flight found with id: ${id}`);
      return false;
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
      return get_by_id;
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
  logger.info(`Checking flight existence for: ${JSON.stringify(v)}`);
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

module.exports = {
  create_user, get_by_id_user, update_user, create_airline, get_by_id_airline, flights_records_tables,
  update_airline, get_flight_by_airline_id, get_by_id_flights, check_flight_existence, create_new_flight,
  update_flight, delete_flight
}