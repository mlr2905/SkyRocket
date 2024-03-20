const assert = require('assert')
const dal = require('../../dals/dal_table_users')
const dal_0 = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.users, actual.length)
    })

    it('get_by_id (role_id 1)', async () => {
        const expected = 'Michael29'
        const user_id = await dal.get_by_id('id', 36)
        const actual = user_id.username
        assert.strictEqual(expected, actual)
    })

    it('new_user (role_id 1)', async () => {
        await dal.new_user_role1({ 'username': 'michael_test11', 'password': 'test', 'email': 'michael_test11@gmail.com' })
        const expected = 'michael_test11'
        const actual = await dal.get_by_id('email', 'michael_test11@gmail.com')
        assert.strictEqual(expected, actual.username)
    })

    it('update_user (role_id 1)', async () => {
        const user = await dal.get_by_id('email', 'michael_test11@gmail.com')
        await dal.update_user(user.id, { 'password': 'test_12345', 'email': 'null' })
        const expected = 'test_12345'
        const actual = await dal.get_by_id('id', user.id)
        assert.strictEqual(expected, actual.password)
    })

    
    it('delete_user (role_id 1)', async () => {
        const user = await dal.get_by_id('email', 'michael_test11@gmail.com')
        await dal.delete_user(user.id)
        const expected = false
        const actual = await dal.get_by_id('id', user.id)
        const set_id_user = await dal.set_id(user.id)
        assert.strictEqual(expected, actual)
    })

    it('new_user (role_id 1)', async () => {
        const expected = await dal.new_user_role1({ 'username': 'michael_test22', 'password': 'null', 'email': 'michael_test22@gmail.com' })
        const actual = await dal.get_by_id('email', 'michael_test22@gmail.com')
        assert.strictEqual(expected, actual.password)
    })

    it('update_user (role_id 1)', async () => {
        const user = await dal.get_by_id('email', 'michael_test22@gmail.com')
        await dal.update_user(user.id, { 'password': 'null', 'email': 'michael_test32@gmail.com' })
        const expected = 'michael_test32@gmail.com'
        const actual = await dal.get_by_id('id', user.id)
        assert.strictEqual(expected, actual.email)
    })

    it('delete_user (role_id 1)', async () => {
        const user = await dal.get_by_id('email', 'michael_test32@gmail.com')
        await dal.delete_user(user.id)
        const expected = false
        const actual = await dal.get_by_id('id', user.id)
        const set_id_user = await dal.set_id(user.id)
        assert.strictEqual(expected, actual)
    })

    it('get_by_id (role_id 2)', async () => {
        const expected = 'Israir'
        const user_id = await dal.get_by_id('id', 30)
        const actual = user_id.username
        assert.strictEqual(expected, actual)
    })

    it('new_user (role_id 2)', async () => {
        await dal.new_user_role2({ 'username': 'air_test1', 'password': 'test', 'email': 'air_test1@gmail.com' })
        const expected = 'air_test1'
        const actual = await dal.get_by_id('email', 'air_test1@gmail.com')
        assert.strictEqual(expected, actual.username)
    })

    it('update_user (role_id 2)', async () => {
        const user = await dal.get_by_id('email', 'air_test1@gmail.com')
        await dal.update_user(user.id, { 'password': 'test_12345', 'email': 'null' })
        const expected = 'test_12345'
        const actual = await dal.get_by_id('id', user.id)
        assert.strictEqual(expected, actual.password)
    })

    it('delete_user (role_id 2)', async () => {
        const user = await dal.get_by_id('email', 'air_test1@gmail.com')
        await dal.delete_user(user.id)
        const expected = false
        const actual = await dal.get_by_id('id', user.id)
        const set_id_user = await dal.set_id(user.id)
        assert.strictEqual(expected, actual)
    })

    it('new_user (role_id 2)', async () => {
        const expected = await dal.new_user_role2({ 'username': 'air_test321', 'password': 'null', 'email': 'air_test321@gmail.com' })
        const actual = await dal.get_by_id('email', 'air_test321@gmail.com')
        assert.strictEqual(expected, actual.password)
    })

    it('update_user (role_id 2)', async () => {
        const user = await dal.get_by_id('email', 'air_test321@gmail.com')
        await dal.update_user(user.id, { 'password': 'null', 'email': 'air_test666@gmail.com' })
        const expected = 'air_test666@gmail.com'
        const actual = await dal.get_by_id('id', user.id)
        assert.strictEqual(expected, actual.email)
    })

    it('delete_user (role_id 2)', async () => {
        const user = await dal.get_by_id('email', 'air_test666@gmail.com')
        await dal.delete_user(user.id)
        const expected = false
        const actual = await dal.get_by_id('id', user.id)
        const set_id_user = await dal.set_id(user.id)
        assert.strictEqual(expected, actual)
    })

})