const assert = require('assert')
const dal = require('../../dals/dal_1')
const dal_0 = require('../../dals/dal_0')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const next_id = await dal_0.registered_Tables()
        const expected = next_id.rows[0].registered_tables.users
        const users = await dal.get_all()
        const actual = users.length
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'Michael29'
        const user_id = await dal.get_by_id(36)
        const actual = user_id.username
        assert.strictEqual(expected, actual)
    })

    it('new_user', async () => {
        const next_id = await dal.next_id()
        let id = next_id.rows[0].last_value
        await dal.sp_i_users({ 'username': 'michael_test', 'password': 'test', 'email': 'michael_test@gmail.com' }) 
        const expected = 'michael_test'
        const actual = await dal.get_by_id(id)
        assert.strictEqual(expected, actual.username)
    })

   it('update_user', async () => {
        const next_id = await dal.next_id()
        let id = next_id.rows[0].last_value
        await dal.update_user(id, { 'username': 'michael_test', 'password': 'test_12345', 'email': null})
        const expected = 'test_12345'
        const actual = await dal.get_by_id(id)
        assert.strictEqual(expected, actual.password)
    }) 

    it('delete_user', async () => {
        const next_id = await dal.next_id()
        let id = next_id.rows[0].last_value
        await dal.delete_user(id)
        const expected = undefined
        const user_id = await dal.get_by_id(id)
        const set_id_user = await dal.set_id(id)
        assert.strictEqual(expected, user_id)
    })
 
})