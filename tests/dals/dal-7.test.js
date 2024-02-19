const assert = require('assert')
const dal = require('../../dals/dal_table_passengers')
const dal_0 = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const next_id = await dal_0.registered_Tables()
        let id = next_id.rows[0].registered_tables.tickets
        const expected = id 
        const countrys = await dal.get_all()
        const actual = countrys.length
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