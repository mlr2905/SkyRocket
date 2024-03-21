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
  let user_id = nul
  console.log('bl id',id);
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


async function update_user(id, user) {

  const update_user = await dal_1.update_user(id, user);
  if (update_user) {
    return { 'ok': `${user_id.username}${update_user}` }
  }
  else {
    return false
  }
}




// airline

async function create_airline(username) {
  try {
    const new_user = await dal_3.new_airline(username);
    return new_user

  } catch (error) {
    console.error('Error passing users:', error);
    throw error; // מעבירה את השגיאה הלאה
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
    console.log('bl no ko');
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
      return console.error('The hand does not exist in Bella'); // מחזירה null אם הטבלה לא קיימת
    }
  } catch (error) {
    console.error('Error checking id  or fetching flight:', error);
    throw error; // מעבירה את השגיאה הלאה
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
    throw error; // מעבירה את השגיאה הלאה
  }
}

async function create_new_flight(flights) {
  try {
    const new_flights = await dal_5.new_flight(flights);
    return new_flights

  } catch (error) {
    console.error('Error passing users:', error);
    throw error; // מעבירה את השגיאה הלאה
  }
}

async function update_flight(id, update_flight) {
  const flight_id = await dal_5.get_by_id(id);
  if (flight_id) {
    const update = await dal_5.update_flight(id, update_flight);
    return `${flight_id.id}${update}`
  }
  else {
    return console.error('The ID you specified does not exist:');
  }
}

async function delete_flight(id) {
  try {
    const delete_flight = await dal_5.delete_flight(id);
    return delete_flight
  } catch (error) {
    console.error('Error passing users:', error);
    throw error; // מעבירה את השגיאה הלאה
  }
}


module.exports = {
  create_user, get_by_id_user, update_user, create_airline, get_by_id_airline,
  update_airline, get_flight_by_airline_id, get_by_id_flights, create_new_flight,
  update_flight, delete_flight
}