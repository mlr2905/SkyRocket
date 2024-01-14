
const dal_5 = require('../../dals/dals_flights/dal_5')
const dal_6 = require('../../dals/dals_flights/dal_6')

async function get_all_flights() {
  try {
    // בודקת אם הטבלה קיימת (בהנחה שיש פונקציית tableExists ב-DAL)
    const tableExists = await connectedKnex.schema.hasTable('flights');

    if (tableExists) {
      // אם הטבלה קיימת, מפעילה את הפונקציה get_all מה-DAL
      const flights = await dal_5.get_all('flights');
      return flights;
    } else {
      return console.error( 'The requested table does not exist'); // מחזירה null אם הטבלה לא קיימת
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
    delete_flight, purchase_ticket
}