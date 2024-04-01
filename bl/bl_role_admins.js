const dal_0 = require('../dals/dal_all_tables')
const dal_1 = require('../dals/dal_table_users')
const dal_3 = require('../dals/dal_table_airlines')
const dal_4 = require('../dals/dal_table_customers')
const dal_5 = require('../dals/dal_table_flights')
const dal_6 = require('../dals/dal_table_tickets')
const dal_7 = require('../dals/dal_table_passengers')


//func users
async function create_user_role1(uesr) {
  const user_name = await dal_1.get_by_name(uesr.username)
  if (user_name === undefined) {
    try {
      const new_user = await dal_1.new_user_role1(uesr)
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
 //// create_user
async function create_user_role2(uesr) {
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

async function get_qr(id) {
  const user_id = await dal_0.get_qr(id);
  return user_id
}

async function update_user(id, user) {
  const user_id = await dal_1.get_by_id('id', id);
  if (user_id) {
    const update_user = await dal_1.update_user(id, user);
    return { 'ok': `${user_id.username}${update_user}` }
  }
  else {
    return user_id
  }
}

async function delete_account(id) {
  const user_id = await dal_1.get_by_id('id', id);
  if (user_id) {
    const delete_user = await dal_1.delete_user(id);
    return `User '${user_id.username}' deleted successfully `
  }
  else {
    return `The ID ${id} you specified does not exist`;
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




// func customers

async function new_customer(new_cus) {
  const Credit_check = await dal_4.credit_check(new_cus.credit_card_no)
  if (!Credit_check) {
    const new_customer = await dal_4.new_customer(new_cus);
    if (new_customer) {
      return new_cus
    }
  }
  else {
    return `Invalid credit card number ${new_cus.credit_card_no} `;

  }

}

async function get_by_id_customer(id) {
  const user_id = await dal_4.get_by_id(id);
  return user_id
}

async function update_customer(id, update) {
  const get_by_id = await dal_4.get_by_id(id);
  if (get_by_id) {
    const update_customer = await dal_4.update_customer(id, update);
    return `${get_by_id.id}${update_customer}`
  }
  else {
    return console.error('The ID you specified does not exist:', error);
  }
}

// flights

async function get_all_flights(id) {
  try {
    const new_customer = await dal_5.get_all(id);
    return new_customer
  }
  catch (e) {
    // check error
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
async function flights_records_tables(v) {
  try {

    return await dal_5.flights_records_tables(v);

  } catch (error) {
    return error;
  }
}
async function create_new_flight(flights) {
  try {
    const check = await dal_5.flights_records_tables(flights);
    if (check.status === "correct") {
      const new_flights = await dal_5.new_flight(flights);
      return new_flights
    }
    else if (check.status !== "correct") {
      return check
    }
    else {
      return { "error": `${check}` }
    }
  } catch (error) {
    return error;
  }
}
async function update_flight(id, v) {
  try {

    const check1 = await dal_5.check_flight_existence(v);
    const check2 = await dal_5.flights_records_tables(v);
    if (check1 === false && check2.status === "correct") {
      const update = await dal_5.update_flight(id, v);
      if (update.airline_id > 0) {
        return { "status": "OK" }
      }
      else {
        return { "error": `Please refer to the following error:${update}` }
      }
    }
    else if (check1 === true) {
      return { "status": "exists" }
    }
    else if (check2.status !== "correct") {
      return check2
    }
    else {
      return { "error": `${check1} and${check2}` }
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

//tickets


async function get_by_id_ticket(id) {
  const user_id = await dal_6.get_by_id(id);
  return user_id
}

//new_passengers

async function new_passenger(new_p) {
  try {

    const new_passenger = await dal_7.new_passenger(new_p);
    return new_passenger
  }

  catch (e) {
    // check error
  }

}

async function get_by_id_passenger(id) {

  const passenger_id = await dal_7.get_by_id_passenger(id);
  return passenger_id

}

//tickets
async function purchase_ticket(new_ticket, test) {
  try {
    const flight = await dal_5.get_by_id(new_ticket.flight_id)
    if (flight) {
      if (flight.remaining_tickets > 0) {
        const id = parseInt(flight.id);
        if (test === undefined) {

          await dal_5.update_remaining_tickets(id);
        }
        const result = await dal_6.new_ticket(new_ticket);
        return result
      }
      else {
        return Error('no tickets left')
      }
    }
    else {
      throw Error('flight does not exist')
    }
  }
  catch (e) {
    // check error
  }
}

async function get_by_id_ticket(id) {
  const user_id = await dal_6.get_by_id(id);
  return user_id
}



module.exports = {
  purchase_ticket, create_user_role1,create_user_role2, get_by_id_flights, get_all_flights, update_user, get_by_id_user,
  delete_account,new_customer,get_by_id_customer, update_customer, get_by_id_ticket, get_by_id_passenger, new_passenger, get_qr,
  get_by_id_user, update_user, create_airline, get_by_id_airline, flights_records_tables,update_airline,get_flight_by_airline_id,
  get_by_id_flights, check_flight_existence, create_new_flight,update_flight, delete_flight

}