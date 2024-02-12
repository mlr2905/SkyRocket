const assert = require('assert')
const dal = require('../dals/dals_flights/dal_2')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'countr_name': 'Japan','continent_id':2}) // id: 1
        await dal.new_message({ 'id': 2, 'countr_name': 'Canada','continent_id':4}) // id: 2
        await dal.new_message({ 'id': 3, 'countr_name': 'Italy','continent_id':3}) // Id: 3
        await dal.new_message({ 'id': 4, 'countr_name': 'South Africa','continent_id':1}) // Id: 4
        await dal.new_message({ 'id': 5, 'countr_name': 'Australia','continent_id':5}) // Id: 5
    })

    it('get_all', async () => {
        const expected = 5
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'Italy'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.countr_name
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'countr_name': 'cyprus'})
        const expected = 'cyprus'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.countr_name
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
        await dal.new_message({ 'id': 6, 'countr_name': 'israel','continent_id':2 }) // Id: 6
        const expected = 'michael'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.countr_name)
    })

    it('Confirm_one_line',async () => {
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'countr_name': 'israel','continent_id':2}) // id: 1
    })
})