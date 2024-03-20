const assert = require('assert')
const bl = require('../../bl/bl_role_airlines')
const dal_1 = require('../../dals/dal_table_users')
const dal_3 = require('../../dals/dal_table_airlines')
const dal_5 = require('../../dals/dal_table_flights')

describe('Testing functionallity of the bl', () => {

    //................users....................

    it('new_user and get_by_id', async () => {
        await bl.create_user({ 'username': 'air_test2', 'password': 'test', 'email': 'air_test2@gmail.com' })
        const expected = "air_test2"
        const actual = await bl.get_by_id_user('email', 'air_test2@gmail.com')
        const delete_account = await dal_1.delete_user(actual.id)
        const set_id_user = await dal_1.set_id(actual.id)
        assert.strictEqual(expected, actual.username)
    })

    let id = null

    it('update_user', async () => {
        await bl.create_user({ 'username': 'air_test3', 'password': 'test', 'email': 'air_test3@gmail.com' })
        id = await bl.get_by_id_user('username', 'air_test3')
        await bl.update_user(id.id, { email: 'test34@gmail.com', password: 'null' })
        const expected = 'test34@gmail.com'
        const actual = await bl.get_by_id_user('id', id.id)
        assert.strictEqual(expected, actual.email)
    })

    it('update_user', async () => {
        await bl.update_user(id.id, { email: 'null', password: 'test_us' })
        const expected = 'test_us'
        const actual = await bl.get_by_id_user('id', id.id)
        const delete_account = await dal_1.delete_user(actual.id)
        const set_id_user = await dal_1.set_id(actual.id)
        assert.strictEqual(expected, actual.password)
    })

    it('new_user and get_by_id ', async () => {
        const new_user = await bl.create_user({ 'username': 'air_test4', 'password': 'null', 'email': 'air_test4@gmail.com' })
        const id = await bl.get_by_id_user('username', 'air_test4')
        const expected = id.password
        const actual = await bl.get_by_id_user('email', 'air_test4@gmail.com')
        const delete_account = await dal_1.delete_user(actual.id)
        const set_id_user = await dal_1.set_id(actual.id)
        assert.strictEqual(expected, actual.password)
    })

    //......................airlines....................

    it('new_airline', async () => {
        id = await bl.create_airline({ 'name': 'airline_tset', 'country_id': 74, 'user_id': 37 })
        const expected = 'airline_tset'
        const actual = await dal_3.get_by_id(id.id)
        assert.strictEqual(expected, actual.name)
    })

    it('get_airline_by_id', async () => {
        const expected = 37
        const actual = await bl.get_by_id_airline(id.id)
        assert.strictEqual(expected, actual.user_id)
    })

    it('update_airline', async () => {
        await bl.update_airline(id.id, { 'name': 'airline_tset2', 'country_id': 74, 'user_id': 37 })
        const expected = 'airline_tset2'
        const actual = await dal_3.get_by_id(id.id)
        const delete_account = await dal_3.delete_airline(actual.id)
        const set_id_user = await dal_3.set_id(actual.id)
        assert.strictEqual(expected, actual.name)
    })

    //.......................flights....................

    it('new_flight', async () => {
        id = await bl.create_new_flight({ 'airline_id': 25, 'origin_country_id': 74, 'destination_country_id': 30, 'departure_time': '2024-04-25 05:00:00', 'landing_time': '2024-01-25 07:00:00', 'plane_id': 1, 'remaining_tickets': 144 })
        const expected = 25
        actual = id
        assert.strictEqual(expected, actual.airline_id)
    })

    it('get_by_id', async () => {
        const expected = id.flight_code
        const actual = await bl.get_by_id_flights(id.id)
        assert.strictEqual(expected, actual.flight_code)
    })

    it('update_flight', async () => {
        await bl.update_flight(id.id, { 'airline_id': 26, 'origin_country_id': 74, 'destination_country_id': 20, 'departure_time': '2024-03-03 05:00:00', 'landing_time': '2024-03-03 10:00:00', 'plane_id': 1, 'remaining_tickets': 144 })
        const expected = 26
        const actual = await dal_5.get_by_id(id.id)
        assert.strictEqual(expected, actual.airline_id)
    })

    it('delete_flight', async () => {
        await bl.delete_flight(id.id)
        const expected = undefined
        const actual = await dal_5.get_by_id(id.id)
        await dal_5.set_id(id.id)
        assert.strictEqual(expected, actual)
    })

})

