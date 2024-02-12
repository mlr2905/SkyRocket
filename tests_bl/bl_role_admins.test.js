const assert = require('assert')
const bl = require('../bl/bl_role_users')
const dal_1 = require('../dals/dal_1')
const dal_6 = require('../dals/dal_6')
const dal_7 = require('../dals/dal_7')


describe('Testing functionallity of the bl', () => {



    it('update_user', async () => {
        await bl.update_user(36, 'test34@gmail.com', null)
        const expected = 'test34@gmail.com'
        const new_user = await bl.get_by_id_user(36)
        assert.strictEqual(expected, new_user.email)
    })

    it('update_user', async () => {
        await bl.update_user(36, null, 'test_us')
        const expected = 'test_us'
        const new_user = await bl.get_by_id_user(36)
        assert.strictEqual(expected, new_user.password)
    })

    it('new_user and delete and get_by_id ', async () => {
        const next_id = await dal_1.get_next_user_id()
        let id = parseInt(next_id.rows[0].last_value)
        await bl.create_user('test_2test', 'test_2test@gmail.com', '')
        const expected = 'test_2test'
        const new_user = await bl.get_by_id_user(id)
        const delete_account = await bl.delete_account(id)
        const set_id_user = await dal_1.set_id_user(id)
        assert.strictEqual(expected, new_user.username)
    })
 

    it('get_by_id_flights', async () => {
        const expected = 74
        const new_user = await bl.get_by_id_flights(2)
        assert.strictEqual(expected, new_user.origin_country_id)
    })

       it('purchase_ticket', async () => {
        const next_id = await dal_6.get_next_ticket_id()
        const id = parseInt(next_id.rows[0].last_value)
        await bl.purchase_ticket({'flight_id':2,'customer_id': 1,'passenger_id': 4, 'user_id':1,'seat_id': 251},'test')
        const expected = 251
        const new_user = await dal_6.get_by_id(id)
        const delete_account = await dal_6.delete_ticket(id)
        const set_id_user = await dal_6.set_id_ticket(id)
        assert.strictEqual(expected, new_user.seat_id)
    })

    it('get_by_id_passenger', async () => {
        const expected = 'Mary'
        const new_user = await bl.get_by_id_passenger(4)
        assert.strictEqual(expected, new_user.first_name)
    })

    it('new_passenger', async () => {
        const next_id = await dal_7.get_next_passenger_id()
        const id = parseInt(next_id.rows[0].last_value)
        await bl.new_passenger({ 'first_name': 'Anya', 'last_name': 'Moon', 'date_of_birth': '1993-05-29', 'passport_number': '434873743', 'user_id': 1 })
        const expected = 'Anya'
        const new_user = await dal_7.get_by_id(id)
        const delete_account = await dal_7.delete_passenger(id)
        const set_id_user = await dal_7.set_id_passenger(id)
        assert.strictEqual(expected, new_user.first_name)
    })

})

