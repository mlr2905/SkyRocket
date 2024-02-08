const assert = require('assert')
const dal = require('../../dals/dals_flights/dal_1')
describe('Testing functionallity of the DAL', () => {
   
    it('get_all', async () => {
        const expected = 5
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_name', async () => {
        const expected = 'jjsajsa'
        const message_id_3 = await dal.get_by_name("jjsajsa")
        const actual = message_id_3.username
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'bot'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.username
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'username': 'admin', 'password': 'fsds33', 'email': 'c@gmail.com' })
        const expected = 'admin'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.username
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
        await dal.new_message({ 'id': 6, 'username': 'michael', 'password': 'ferf444', 'email': 'c@gmail.com' }) // Id: 6
        const expected = 'michael'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.username)
    })

    it('Confirm_one_line',async () => {
        await dal.delete_all()
        await dal.new_message({ 'id': 1,  'username': 'michael', 'password': 'ferf444', 'email': 'c@gmail.com' }) // id: 1
    })

})