const assert = require('assert')
const dal = require('../../dals/dals_chats/dal_1')
describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'username': 'bot1', 'password': '22xjjs', 'email': 'a@gmail.com'}) // id: 1
        await dal.new_message({ 'id': 2, 'username': 'bot2', 'password': '22jjks', 'email': 'b@gmail.com'}) // id: 2
        await dal.new_message({ 'id': 3, 'username': 'bot3', 'password': 'fsds33', 'email': 'c@gmail.com'}) // Id: 3
        await dal.new_message({ 'id': 4, 'username': 'bot4', 'password': '243djs', 'email': 'd@gmail.com'}) // Id: 4
        await dal.new_message({ 'id': 5, 'username': 'bot5', 'password': '22dsjs', 'email': 'a@gmail.com'}) // Id: 5

    })
    table.increments('id').primary(); // This creates a SERIAL column
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.string('email').notNullable();

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
        await dal.new_message({ 'id': 6, 'username': 'michael', 'password': 'fsds33', 'email': 'c@gmail.com' }) // Id: 6
        const expected = 'michael'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.username)
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