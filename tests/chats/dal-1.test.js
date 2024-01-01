const assert = require('assert')
const dal = require('../../dals/dals_chats/dal_1')
describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'user': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // id: 1
        await dal.new_message({ 'id': 2, 'user': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // id: 2
        await dal.new_message({ 'id': 3, 'user': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // Id: 3
        await dal.new_message({ 'id': 4, 'user': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // Id: 4
        await dal.new_message({ 'id': 5, 'user': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // Id: 5

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
        const actual = message_id_3.user
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'user': 'bot', 'text': 'hello', 'time': '12:10:00', 'type': 'text' })
        const expected = '12:10:00'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.time
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
        await dal.new_message({ 'id': 6, 'user': 'bot', 'text': 'hello', 'time': '12:10:00', 'type': 'text' }) // Id: 6
        const expected = '12:10:00'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.time)
    })

    it('Confirm_one_line',async () => {
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'user': 'bot', 'text': 'hello', 'time': '12:00:00', 'type': 'text' }) // id: 1
    })

    // complete all other tests for all methods:
    // update_message(id, update_message)
    // delete_message(id)
    // new_message(new_emp)
    // delete_all ?

})