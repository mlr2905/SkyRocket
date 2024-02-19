const dal_1 = require('../dals/dal_table_users')
const dal_2 = require('../dals/dal_table_countries')
const dal_3 = require('../dals/dal_table_airlines')
const dal_4 = require('../dals/dal_table_customers')
const dal_5 = require('../dals/dal_table_flights')
const dal_6 = require('../dals/dal_table_tickets')
const dal_7 = require('../dals/dal_table_passengers')


//func users
async function create_user(username, email, password) {
  try {
    // בודקת אם קיבלה סיסמה
    if (password !== '') {
      // מפעילה את הפרוצדורה sp_i_users
      const new_user = await dal_1.sp_i_users(username, email, password);
      return new_user
    } else {
      // מפעילה את הפרוצדורה sp_pass_users
      const new_user = await dal_1.sp_pass_users(username, email);
      return new_user
    }
  } catch (error) {
    console.error('Error passing users:', error);
    throw error; // מעבירה את השגיאה הלאה
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
    return console.error('The ID you specified does not exist:', error);
  }
}

async function delete_account(id) {
  const user_id = await dal_1.get_by_id(id);
  if (user_id) {
    const delete_user = await dal_1.delete_user(id);
    return delete_user
  }
  else {
    return console.error('The ID you specified does not exist:', error);
  }
}

async function get_all_flights() {
  try {
    // בודקת אם הטבלה קיימת (בהנחה שיש פונקציית tableExists ב-DAL)
    const tableExists = await dal_5.Checks_if_a_table_exists('flights');
    if (tableExists) {
      // אם הטבלה קיימת, מפעילה את הפונקציה get_all מה-DAL
      const flights = await dal_5.get_all('flights');
      return flights;
    } else {
      return console.error('The requested table does not exist'); // מחזירה null אם הטבלה לא קיימת
    }
  } catch (error) {
    console.error('Error checking table or fetching flights:', error);
    throw error; // מעבירה את השגיאה הלאה
  }
}

async function purchase_ticket(flight_id, customer_id, passenger_id) {
  try {
    const flight = await dal_5.get_by_id(flight_id)
    if (flight) {
      if (flight.remaining_tickets > 0) {
        await dal_5.update_flight({ ...flight, remaining_tickets: remaining_tickets - 1 })
        await dal_6.new_ticket(flight_id, customer_id, passenger_id)
      }
      else
        return Error('no tickets left')
    }
    else
      throw Error('flight does not exist')
  }
  catch (e) {
    // check error
  }
}

async function delete_flight(id) {
  const result = await dal_5.get_by_id(id)
  if (!result) {
    await dal_5.delete_flight(id)
  }
}

module.exports = {
  delete_flight, purchase_ticket, create_user, get_all_flights, update_user, get_by_id_user, delete_account
}