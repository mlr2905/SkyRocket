 const assert = require('assert')
const bl = require('../BL/bl_filghts')
const dal_1 = require('../dals/dals_flights/dal_1')


describe('Testing functionallity of the bl', () => {
 
    
    it('new_user and delete and get_by_id', async () => {
        const next_id = await dal_1.get_next_user_id()
        const id =next_id.rows[0].get_next_user_id
        console.log(`${id}-'id'` )
        await  bl.create_user('michael_1tset','michael_1test@gmail.com','1test')
        const expected = "michael_1tset"
        const new_user = await bl.get_by_id_user(id)
        const delete_account = await bl.delete_account(id)
        const set_id_user = await dal_1.set_id_user(id)
        console.log( 'teset_id',teset_id)
        assert.strictEqual(expected, new_user.username)
    })

    it('new_user and delete and get_by_id ', async () => {
        const next_id = await dal_1.get_next_user_id()
        const id =next_id.rows[0].get_next_user_id
        await  bl.create_user('michael_2test','michael_2test@gmail.com','')
        const expected = 'michael_2test'
        const new_user = await bl.get_by_id_user(id)
        const delete_account = await bl.delete_account(id)
        const del = delete_account
        const set_id_user = await dal_1.set_id_user(id)
        assert.strictEqual(expected, new_user.username)
    }) 

    
    it('update_user', async () => {

        await  bl.update_user(36,'test@gmail.com',null)
        const expected = 'test@gmail.com'
        const new_user = await bl.get_by_id_user(36)
        assert.strictEqual(expected, new_user.email)
    })
    
    it('update_user', async () => {
        await  bl.update_user(36,null,'test')
        const expected = 'test'
    
        const new_user = await bl.get_by_id_user(36)
        assert.strictEqual(expected, new_user.password)
    })

})

