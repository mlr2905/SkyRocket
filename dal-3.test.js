const assert = require('assert')
const dal = require('./dals/dal-3')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'name': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // id: 1
        await dal.new_message({ 'id': 2, 'name': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // id: 2
        await dal.new_message({ 'id': 3, 'name': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // Id: 3
        await dal.new_message({ 'id': 4, 'name': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // Id: 4
        await dal.new_message({ 'id': 5, 'name': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // Id: 5
    })

    it('get_all', async () => {
        const expected = 5
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'bot'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.name
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'name': 'bot', 'text': 'hello', 'time': '12:00:01', 'type': 'text' })
        const expected = '12:00:01'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.time
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('delete_message', async () => {
        await dal.delete_message(5)
        const expected = undefined
        const message_id_3 = await dal.get_by_id(5)
        assert.strictEqual(expected, message_id_3)
    })

    it('new_message', async () => {
        await dal.new_message({ 'id': 6, 'name': 'bot', 'text': 'hello', 'time': '12:10:00', 'type': 'text' }) // Id: 6
        const expected = '12:10:00'
        const message_id_4 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_4.time)
    })


    // complete all other tests for all methods:
    // update_message(id, update_message)
    // delete_message(id)
    // new_message(new_emp)
    // delete_all ?

})