const assert = require('assert')
const dal = require('../BL/bl_filghts')
const dal_1 = require('../dals/dals_flights/dal_1')


describe('Testing functionallity of the bl', () => {
 
    
    it('new_user', async () => {
        const length = await dal_1.getNextUserId()
        const id =length.rows[0].get_next_user_id
        await  dal.pass_users('michael_354542','michael_354542@gmail.com','jxjaja')
        const expected = 'michael_354542'
    
        const new_user = await dal_1.get_by_id(id)
        assert.strictEqual(expected, new_user.username)
    })

    it('new_user', async () => {
        const length = await dal_1.getNextUserId()
        const id =length.rows[0].get_next_user_id
        await  dal.pass_users('michael_354542','michael_354542@gmail.com','')
        const expected = 'michael_354542'
    
        const new_user = await dal_1.get_by_id(id)
        assert.strictEqual(expected, new_user.username)
    })


})


  
    