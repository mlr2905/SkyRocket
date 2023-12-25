
const assert = require('assert')
const dal = require('./dals/dal')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'Id': 1, 'Name': 'bot', 'Text': 'hello','Time': '12:00:00', 'Type':'2'})  // id: 1
        await dal.new_message({ 'Id': 2, 'Name': 'michael', 'Text': 'helnlo' ,'Time': '12:00:00', 'Type':'2'}) //id 2
        await dal.new_message({ 'Id': 3, 'Name': 'Teddy', 'Text': 'helnnlo','Time': '12:00:00', 'Type':'2' }) // Id: 3
    })

    it('get_all', async () => {
        const expected = 3
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'Teddy'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.Name
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'Name': 'MOSHE', 'Text': 'hello','Time': '12:00:00', 'Type':'2'})
        const expected = 'MOSHE'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.Name
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
        await dal.new_message({ 'Id': 4,'Name': 'Shuddli', 'Text': 'hexdwdwdwdllo','Time': '12:00:00', 'Type':'2'}) // Id: 4
        const expected = 'Shuddli'
        const message_id_4 = await dal.get_by_id(4)
        assert.strictEqual(expected, message_id_4.Name)
    })


    // complete all other tests for all methods:
    // update_message(id, update_message)
    // delete_message(id)
    // new_message(new_emp)
    // delete_all ?

})