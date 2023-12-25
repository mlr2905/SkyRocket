
const assert = require('assert')
const dal = require('./dals/dal')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'ID': 1, 'NAME': 'bot', 'TEXT': 'hello', 'TIME': '14:56:00', 'SUPER-ID': 0 })  // id: 1
        await dal.new_message({ 'ID': 2, 'NAME': 'Teddy', 'TEXT': 'hello', 'TIME': '14:00:00', 'SUPER-ID': 2 }) //id 2
        await dal.new_message({ 'ID': 3, 'NAME': 'bot', 'TEXT': 'hello', 'TIME': '13:00:00', 'SUPER-ID': 3 }) // Id: 3
    }, 20000)

    it('get_all', async () => {
        const expected = 3
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    }, 2000000)

    it('get_by_id', async () => {
        const expected = 'Teddy'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.NAME
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('updated_message', async () => {
        await dal.update_emplyee(3, { 'NAME': 'MOSHE', 'TEXT': 'hello', 'TIME': '00:00:00', 'SUPER-ID': 0 })
        const expected = 'MOSHE'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.NAME
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('delete_message', async () => {
        await dal.delete_message(3)
        const expected = undefined
        const message_id_3 = await dal.get_by_id(3)
        assert.strictEqual(expected, message_id_3)
    })

    it('new_message', async () => {
        await dal.new_message({ 'NAME': 'Shuli', 'TEXT': 'hello', 'TIME': '00:00:00', 'SUPER-ID': 0 }) // Id: 4
        const expected = 'Shuli'
        const message_id_4 = await dal.get_by_id(4)
        assert.strictEqual(expected, message_id_4.NAME)
    })


    // complete all other tests for all methods:
    // update_emplyee(id, updated_message)
    // delete_message(id)
    // new_message(new_emp)
    // delete_all ?

})