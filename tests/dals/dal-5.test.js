const assert = require('assert')
const dal = require('../../dals/dal_5')
const dal_0 = require('../../dals/dal_0')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const next_id = await dal_0.registered_Tables()
        let id = next_id.rows[0].registered_tables.flights
        const expected = id 
        const flights = await dal.get_all()
        const actual = flights.length
        assert.strictEqual(expected, actual)
    }) 

    it('get_by_id', async () => {
        const expected = '1'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.airline_id
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'airline_id': '3', 'origin_country_id': '4','destination_country_id':'26' ,'departure_time':'2024-01-25 05:00:00','landing_time':'2024-01-25 07:00:00','remaining_tickets':'200'})
        const expected = '3'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.airline_id
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('delete_message', async () => {
        await dal.delete_message(5)
        const expected = undefined
        const message_id_5 = await dal.get_by_id(5)
        assert.strictEqual(expected, message_id_5)
    })

    it('new_message', async () => {
        await dal.new_message({ 'id': 6, 'airline_id': '6', 'origin_country_id': '4','destination_country_id':'30' ,'departure_time':'2024-04-25 05:00:00','landing_time':'2024-01-25 07:00:00','remaining_tickets':'200'}) // Id: 6
        const expected = '6'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.airline_id)
    })

    it('delete_all',async () => {
        await dal.delete_all()
        await dal.new_message({ 'id': 1,'airline_id': '1', 'origin_country_id': '4','destination_country_id':'23' ,'departure_time':'2024-01-21 05:00:00','landing_time':'2024-01-21 07:00:00','remaining_tickets':'200' }) // id: 1

    })

})