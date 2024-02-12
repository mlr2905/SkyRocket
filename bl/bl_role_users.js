
const dal_1 = require('../dals/dals_flights/dal_1')
const dal_4 = require('../dals/dals_flights/dal_4')
const dal_5 = require('../dals/dals_flights/dal_5')
const dal_6 = require('../dals/dals_flights/dal_6')
const dal_7 = require('../dals/dals_flights/dal_7')

function Welcome(){
  const Welcome =  dal_1.Welcome(id);
  return Welcome
}

//func users
async function create_user(uesr) {

  // בודק אם קיבלה סיסמה
  if (uesr.password !== '') {
    // מפעילה את הפרוצדורה sp_i_users
    const new_user = await dal_1.sp_i_users(uesr);
    return `User '${uesr.username}' successfully created`
  } else {
    // מפעילה את הפרוצדורה sp_pass_users
    const new_user = await dal_1.sp_pass_users(uesr);

    return `User '${uesr.username}' successfully created`
  }

}


async function get_by_id_user(id) {

  const user_id = await dal_1.get_by_id(id);
  return user_id

}

async function update_user(id, email, password) {

  const user_id = await dal_1.get_by_id(id);

  if (user_id) {

    const update_user = await dal_1.update_user(id, email, password);
    return `${user_id.username}${update_user}`
  }
  else {
    return user_id
  }

}

async function delete_account(id) {

  const user_id = await dal_1.get_by_id(id);

  if (user_id) {
    const delete_user = await dal_1.delete_user(id);

    return `User '${user_id.username}' deleted successfully `
  }

  else {

    return `The ID ${id} you specified does not exist`;

  }
}

// func customers

async function new_customer(new_cus) {

  const new_customer = await dal_4.new_customer(new_cus);
  if (new_customer) {
    return new_cus
  }

}

async function get_by_id_customer(id) {

  const user_id = await dal_4.get_by_id(id);
  return user_id

}

async function update_customer(update) {

  const get_by_id = await dal_1.get_by_id(id);

  if (get_by_id) {

    const update_customer = await dal_4.update_customer(update);
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
async function purchase_ticket(new_ticket, test) {
  try {
    const flight = await dal_5.get_by_id(new_ticket.flight_id)

    if (flight) {

      if (flight.remaining_tickets > 0) {
        const id = parseInt(flight.id);
        if (test === undefined) {
          await dal_5.update_remaining_tickets(id);
        }
        await dal_6.new_ticket(new_ticket);

        return new_ticket

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


module.exports = {
  Welcome, purchase_ticket, create_user, get_by_id_flights, get_all_flights, update_user, get_by_id_user, delete_account, new_customer
  , get_by_id_customer, update_customer, get_by_id_ticket, get_by_id_passenger, new_passenger

}