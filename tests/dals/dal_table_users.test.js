const assert = require('assert')
const dal = require('../../dals/dal_table_users')
const dal_0 = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    
    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.users, actual.length)
    })  

    it('get_by_id', async () => {
        const expected = 'Michael29'
        const user_id = await dal.get_by_id('id',36)
        const actual = user_id.username
        assert.strictEqual(expected, actual)
    })

    it('new_user', async () => {
        await dal.sp_i_users({ 'username': 'michael_test', 'password': 'test', 'email': 'michael_test@gmail.com' })
        const expected = 'michael_test'
        const actual = await dal.get_by_id('email', 'michael_test@gmail.com')
        assert.strictEqual(expected, actual.username)
    })

    it('update_user', async () => {
        const user = await dal.get_by_id('email', 'michael_test@gmail.com')
        await dal.update_user(user.id, { 'username': 'michael_test', 'password': 'test_12345', 'email': 'null' })
        const expected = 'test_12345'
        const actual = await dal.get_by_id('id', user.id)
        assert.strictEqual(expected, actual.password)
    })

    it('delete_user', async () => {
        const user = await dal.get_by_id('email', 'michael_test@gmail.com')
        await dal.delete_user(user.id)
        const expected = undefined
        const actual = await dal.get_by_id('id', user.id)
        const set_id_user = await dal.set_id(user.id)
        assert.strictEqual(expected, actual)
    })

})