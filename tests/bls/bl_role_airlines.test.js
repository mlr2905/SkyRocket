const assert = require('assert')
const bl = require('../../bl/bl_role_airlines')
const dal_1 = require('../../dals/dal_1')
const dal_3 = require('../../dals/dal_3')
const dal_5 = require('../../dals/dal_5')


describe('Testing functionallity of the bl', () => {

    it('new_user_airlines and delete and get_by_id', async () => {
        const next_id = await dal_1.get_next_user_id()
        let id = parseInt(next_id.rows[0].last_value)
        await bl.create_user_airlines({'username':'michael_1tset','email':'michael_1test@gmail.com','password':'1test'})
        const expected = "michael_1tset"
        const new_user = await bl.get_by_id_user_airline(id)
        const delete_account = await bl.delete_account(id)
        const set_id_user = await dal_1.set_id_user(id)
        assert.strictEqual(expected, new_user.username)
    })

    it('new_user_airlines and delete and get_by_id ', async () => {
        const next_id = await dal_1.get_next_user_id()
        let id = parseInt(next_id.rows[0].last_value)
        await bl.create_user_airlines({'username':'michael_2tset','email':'michael_2test@gmail.com','password':'2test'})
        const expected = 'test_2test'
        const new_user = await bl.get_by_id_user_airline(id)
        const delete_account = await bl.delete_account(id)
        const set_id_user = await dal_1.set_id_user(id)
        assert.strictEqual(expected, new_user.username)
    })
 
    it('update_user', async () => {
        await bl.update_user_airline(36, 'test34@gmail.com', null)
        const expected = 'test34@gmail.com'
        const new_user = await bl.get_by_id_user(36)
        assert.strictEqual(expected, new_user.email)
    })

    it('update_user', async () => {
        await bl.update_user_airline(36, null, 'test_us')
        const expected = 'test_us'
        const new_user = await bl.get_by_id_user(36)
        assert.strictEqual(expected, new_user.password)
    })


})

