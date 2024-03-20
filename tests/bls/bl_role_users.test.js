const assert = require('assert')
const bl = require('../../bl/bl_role_users')
const dal_0 = require('../../dals/dal_all_tables')
const dal_1 = require('../../dals/dal_table_users')
const dal_4 = require('../../dals/dal_table_customers')
const dal_5 = require('../../dals/dal_table_chairs_taken')
const dal_6 = require('../../dals/dal_table_tickets')
const dal_7 = require('../../dals/dal_table_passengers')
const { log } = require('console')


describe('Testing functionallity of the bl', () => {


    it('new_user and delete and get_by_id', async () => {
        await bl.create_user({ 'username': 'michael_test', 'password': 'test', 'email': 'michael_test@gmail.com' })
        const expected = "michael_test"
        const actual = await bl.get_by_id_user('email', 'michael_test@gmail.com')
        const delete_account = await bl.delete_account(actual.id)
        const set_id_user = await dal_1.set_id(actual.id)
        assert.strictEqual(expected, actual.username)
    })

    it('update_user', async () => {
        await bl.update_user(36, { email: 'test34@gmail.com', password: 'null' })
        const expected = 'test34@gmail.com'
        const actual = await bl.get_by_id_user('id', 36)
        await bl.update_user(36, { email: 'Michael29@gmail.com', password: 'null' })
        assert.strictEqual(expected, actual.email)
    })

    it('update_user', async () => {
        await bl.update_user(36, { email: 'null', password: 'test_us' })
        const expected = 'test_us'
        const actual = await bl.get_by_id_user('id', 36)
        await bl.update_user(36, { email: 'null', password: 'test_1234' })
        assert.strictEqual(expected, actual.password)
    })

    it('new_user and delete and get_by_id ', async () => {
        const new_user = await bl.create_user({ 'username': 'michael_test2', 'password': 'null', 'email': 'michael_test2@gmail.com' })
        const id = await bl.get_by_id_user('username', 'michael_test2')
        const expected = id.password
        const actual = await bl.get_by_id_user('email', 'michael_test2@gmail.com')
        const delete_account = await bl.delete_account(actual.id)
        const set_id_user = await dal_1.set_id(actual.id)
        assert.strictEqual(expected, actual.password)
    })

    it('new_customer', async () => {
        const new_customer = await bl.new_customer({ 'first_name': 'admin', 'last_name': 'Michael29', 'address': 'israel', 'phone_no': '0506367322', 'credit_card_no': '5555-5432-1098-7337', 'user_id': 36 })
        const expected = 'Michael29'
        const actual = await dal_4.get_by_name('Michael29')
        assert.strictEqual(expected, actual.last_name)
    })

    it('update_customer', async () => {
        const by_name = await dal_4.get_by_name('Michael29')
        await bl.update_customer(by_name.id, { 'credit_card_no': '4444-5432-1098-7654' })
        const expected = '************7654'
        const actual = await dal_4.get_by_id(by_name.id)
        assert.strictEqual(expected, actual.credit_card_no)
    })

    it('get_by_id_flights', async () => {
        const expected = 74
        const actual = await bl.get_by_id_flights(2)
        assert.strictEqual(expected, actual.origin_country_id)
    })

    it('get_all_flights', async () => {

        const expected = await dal_0.registered_Tables()
        const actual = await bl.get_all_flights()
        assert.strictEqual(expected.flights, actual.length)
    })

    let id = null

    it('new_passenger', async () => {
        id = await dal_7.new_passenger({ 'first_name': 'test', 'last_name': 'passenger', 'date_of_birth': '1993-05-29', 'passport_number': '60407537', 'user_id': 27, 'flight_id': 1 }) // Id: 6
        const expected = 'test'
        const actual = await dal_7.get_by_id(id.id)
        assert.strictEqual(expected, actual.first_name)
    })

    it('get_by_id_passenger', async () => {
        const expected = 'passenger'
        const actual = await bl.get_by_id_passenger(id.id)
        assert.strictEqual(expected, actual.last_name)
    })

    it('new_ticket', async () => {
        const new_chair = await dal_5.new_chair({ 'flight_id': 2, 'char_id': 55, 'passenger_id': id.id, 'user_id': 27 }) // Id: 6
        const new_ticket = await bl.purchase_ticket({ 'flight_id': 2, 'customer_id': 4, 'passenger_id': id.id, 'user_id': 27, 'chair_id': new_chair.id }, 'test')
        const expected = id.id
        id = await dal_6.get_by_ticket_code(new_ticket.ticket_code)
        const actual = id
        assert.strictEqual(expected, actual.passenger_id)
    })

    it('delete_ticket ', async () => {
        await dal_6.delete_ticket(id.id)
        const expected = undefined
        const actual = await bl.get_by_id_ticket(id.id)
        assert.strictEqual(expected, actual)
    })

    //...This test does not test a function in BL, it is designed to reset and delete what the test created...

    it('reset and delete', async () => {
        await dal_6.delete_ticket(id.id)
        const expected = undefined
        const actual = await dal_6.get_by_id(id.id)
        await dal_6.set_id(id.id)
        await dal_7.delete_passenger(id.passenger_id)
        await dal_7.set_id(id.passenger_id)
        await dal_5.delete_chair(id.chair_id)
        await dal_5.set_id(id.chair_id)
        await dal_4.delete_customer(id.customer_id)
        await dal_4.set_id(id.customer_id)
        assert.strictEqual(expected, actual)
    })

})

