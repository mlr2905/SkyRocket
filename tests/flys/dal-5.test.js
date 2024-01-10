const assert = require('assert')
const dal = require('../../dals/dals_flights/dal_5')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'airline_id': '1', 'origin_country_id': '4','destination_country_id':'23' ,'departure_time':'2024-01-21 05:00:00','landing_time':'2024-01-21 07:00:00','remaining_tickets':'200'}) // id: 1
        await dal.new_message({ 'id': 2, 'airline_id': '2', 'origin_country_id': '4','destination_country_id':'22' ,'departure_time':'2024-01-23 05:00:00','landing_time':'2024-01-23 07:00:00','remaining_tickets':'200'}) // id: 2
        await dal.new_message({ 'id': 3, 'airline_id': '3', 'origin_country_id': '4','destination_country_id':'26' ,'departure_time':'2024-01-25 05:00:00','landing_time':'2024-01-25 07:00:00','remaining_tickets':'200'}) // Id: 3
        await dal.new_message({ 'id': 4, 'airline_id': '4', 'origin_country_id': '4','destination_country_id':'12' ,'departure_time':'2024-02-27 05:00:00','landing_time':'2024-02-27 07:00:00','remaining_tickets':'200'}) // Id: 4
        await dal.new_message({ 'id': 5, 'airline_id': '5', 'origin_country_id': '4','destination_country_id':'43' ,'departure_time':'2024-03-30 05:00:00','landing_time':'2024-03-30 07:00:00','remaining_tickets':'200'}) // Id: 5
    })

    it('get_all', async () => {
        const expected = 5
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
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