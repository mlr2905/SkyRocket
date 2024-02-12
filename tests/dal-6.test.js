const assert = require('assert')
const dal = require('../dals/dal_6')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'flight_id': '1', 'customer_id': '1','passenger_id':1}) // id: 1
        await dal.new_message({ 'id': 2, 'flight_id': '2', 'customer_id': '1','passenger_id':2}) // id: 2
        await dal.new_message({ 'id': 3, 'flight_id': '3', 'customer_id': '1','passenger_id':3}) // Id: 3
        await dal.new_message({ 'id': 4, 'flight_id': '4', 'customer_id': '1','passenger_id':4}) // Id: 4
        await dal.new_message({ 'id': 5, 'flight_id': '5', 'customer_id': '1','passenger_id':5}) // Id: 5
    })
   
    it('get_all', async () => {
        const expected = 5
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = '3'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.flight_id
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, {  'flight_id': '3', 'customer_id': '2','passenger_id':5})
        const expected = '2'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.customer_id
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
        await dal.new_message({ 'id': 6, 'flight_id': '6', 'customer_id': '2','passenger_id':6 }) // Id: 6
        const expected = '2'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.customer_id)
    })

    it('Confirm_one_line',async () => {
        await dal.delete_all()
        await dal.new_message({ 'id': 1,'flight_id': '1', 'customer_id': '1','passenger_id':1}) // id: 1
    })

})