const dal_0 = require('../dals/dal_all_tables')
const dal_1 = require('../dals/dal_table_users')
const dal_3 = require('../dals/dal_table_airlines')
const dal_5 = require('../dals/dal_table_flights')
const { log } = require('winston')

//func users 
async function create_user(uesr) {
  const user_name = await dal_1.get_by_name(uesr.username)
  if (user_name === undefined) {
    try {
      const new_user = await dal_1.new_user_role2(uesr)
      if (new_user.length === 8) {
        return { 'OK': `'${uesr.username}' successfully created,This is the generated password,'${new_user}'` }
      }
      if (new_user === true) {
        return { 'OK': `'${uesr.username}' successfully created` }
      }
      return new_user
    }
    catch (error) {
      return error;
    }
  }

  else {
    return 'rejected';
  }
}

async function get_by_id_user(type, id) {
  let user_id = null
  try {

    if (id === undefined) {
      user_id = await dal_1.get_by_id(id);
    }
    else {
      user_id = await dal_1.get_by_id_type(type, id);
    }

    if (user_id) {
      if (user_id.role_id === 2) {
        return user_id
      }
      else {
        return 'Postponed'
      }
    }
    else {
      return false
    }
  }
  catch (error) {
    return error;
  }
}


async function update_user(id, user) {
  try {
    return await dal_1.update_user(id, user);
  }
  catch (error) {
    return
  }
}

// airline

async function create_airline(uesr) {
  try {
    const user_name = await dal_3.get_by_name(uesr.name)
    if (user_name === undefined) {
      return new_user = await dal_3.new_airline(uesr)
    }
    else {
      return 'rejected';
    }
  } catch (error) {
    return error;
  }
}

async function get_by_id_airline(id) {
  const user_id = await dal_3.get_by_id(id);
  return user_id
}

async function update_airline(id, update_airline) {
  const user_id = await dal_3.get_by_id(id);
  if (user_id) {
    const update_user = await dal_3.update_airline(id, update_airline);
    return `${user_id.name}${update_user}`
  }
  else {
    return console.error('The ID you specified does not exist:');
  }
}

// flights

async function get_by_id_flights(id) {
  try {
    const get_by_id = await dal_5.get_by_id(id);
    if (get_by_id) {
      return get_by_id
    } else {
      return false
    }
  } catch (error) {
    return error;
  }
}
async function get_flight_by_airline_id(id) {
  try {
    const get_by_id = await dal_5.get_flight_by_airline_id(id);
    if (get_by_id) {
      return get_by_id
    } else {
      return console.error('The hand does not exist in Bella'); // מחזירה null אם הטבלה לא קיימת
    }
  } catch (error) {
    console.error('Error checking id  or fetching flight:', error);
    return error;
  }
}

async function check_flight_existence(v) {
  try {

    return await dal_5.check_flight_existence(v);

  } catch (error) {
    return error;
  }
}
async function create_new_flight(flights) {
  try {
    const check = await dal_0.flights_records_tables();
    if (check.airline_id || check.origin_country_id || check.destination_country_id || check.plane_id) {
      return { "error": `The specified ${Object.keys(check).filter(key => check[key]).join(", ")} does not exist in the corresponding table(s)` };
    }

    const new_flights = await dal_5.new_flight(flights);
    return new_flights

  } catch (error) {
    return error;
  }
}

async function update_flight(id, update_flight) {
  try {

    const flight_id = await dal_5.get_by_id(id);
    if (flight_id) {
      const check = await dal_5.flights_records_tables(update_flight);
      if (check) {
        if (check.status === "correct") {
          const update = await dal_5.update_flight(id, update_flight);
          return `${flight_id.id}${update}`
        }
        else {
          return check
        }
      }


    }
  } catch (error) {
    return error;
  }
}

async function delete_flight(id) {
  try {
    const delete_flight = await dal_5.delete_flight(id);
    if (delete_flight) {
      return true
    }
    else false
  } catch (error) {
    return error;
  }
}


module.exports = {
  create_user, get_by_id_user, update_user, create_airline, get_by_id_airline,
  update_airline, get_flight_by_airline_id, get_by_id_flights, check_flight_existence, create_new_flight,
  update_flight, delete_flight
}