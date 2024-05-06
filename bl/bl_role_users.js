const dal_0 = require('../dals/dal_all_tables')
const dal_1 = require('../dals/dal_table_users')
const dal_4 = require('../dals/dal_table_customers')
const dal_5 = require('../dals/dal_table_flights')
const dal_6 = require('../dals/dal_table_tickets')
const dal_7 = require('../dals/dal_table_passengers')


async function login(email, password) {
  let url = 'https://jwt-node-mongodb.onrender.com/login';

  const data = {
    email: email,
    password: password
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    const user = await fetch(url, requestOptions);
    const data = await user.json(); // או כל פעולה אחרת לקריאת הנתונים
    return data

  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
async function signup(email, password) {
  console.log('email, password',email, password);
  let url_node_mongo = 'https://jwt-node-mongodb.onrender.com/signup';
  let url_spring = "https://spring-postgresql.onrender.com"
  const data = {
    email: email,
    password: password
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    const user = await fetch(url_node_mongo, requestOptions);
    const data = await user.json(); // או כל פעולה אחרת לקריאת הנתונים
    console.log("data", data);
    if (data.id !== undefined) {
      data.push({
        username: data.username,
        role_id: 1
      });
      const create_user = await fetch(url_spring, requestOptions);
      data = await create_user.json(); // או כל פעולה אחרת לקריאת הנתונים

      return data

    }

  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
//func users
async function create_user(uesr) {
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

async function get_by_id_user(type, id) {
  let url = null;

  if (id === undefined) {
    url = `https://node-mongodb-rest.onrender.com/api/users/${id}`;
  } else {
    url = `https://node-mongodb-rest.onrender.com/api/users/search?${type}=${id}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.role_id === 1) {
      return data;
    } else {
      return 'Postponed';
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
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
  login, signup, purchase_ticket, create_user, get_by_id_flights, get_all_flights, update_user, get_by_id_user, delete_account, new_customer
  , get_by_id_customer, update_customer, get_by_id_ticket, get_by_id_passenger, new_passenger, get_qr

}