const assert = require('assert')
const bl = require('../../bl/bl_role_airlines')
const dal_1 = require('../../dals/dal_table_users')
const dal_3 = require('../../dals/dal_table_airlines')
const dal_5 = require('../../dals/dal_table_flights')

describe('Testing functionallity of the bl', () => {


    ///................users....................

    it('get_by_id', async () => {
        const expected = 'Michael29'
        const user_id = await bl.get_by_id_user('id', 36)
        const actual = user_id.username
        assert.strictEqual(expected, actual)
    })

    it('new_user', async () => {
        await bl.create_user({ 'username': 'michael_test', 'password': 'test', 'email': 'michael_test@gmail.com' })
        const expected = 'michael_test'
        const actual = await dal_1.get_by_id('email', 'michael_test@gmail.com')
        assert.strictEqual(expected, actual.username)
    })

    it('update_user', async () => {
        const user = await dal_1.get_by_id('email', 'michael_test@gmail.com')
        await bl.update_user(user.id, { 'username': 'michael_test', 'password': 'test_12345', 'email': 'null' })
        const expected = 'test_12345'
        const actual = await dal_1.get_by_id('id', user.id)
        assert.strictEqual(expected, actual.password)
    })

    ///................airlines....................

    it('get_by_id', async () => {
        const expected = 'Israir'
        const airlines_id = await bl.get_by_id_airline(26)
        const actual = airlines_id.name
        assert.strictEqual(expected, actual)
    })

    it('new_airline', async () => {
        const new_airline = await bl.create_airline({ 'name': 'airline_tset', 'country_id': 74, 'user_id': 36 })
        const expected = 'airline_tset'
        const actual = await dal_3.get_by_id(new_airline.id)
        assert.strictEqual(expected, actual.name)
    })

    it('update_airline', async () => {
        const by_name = await dal_3.get_by_name('airline_tset')
        await bl.update_airline(by_name.id, { 'name': 'airline_tset2', 'country_id': 74, 'user_id': 36 })
        const expected = 'airline_tset2'
        const actual = await dal_3.get_by_id(by_name.id)
        assert.strictEqual(expected, actual.name)
    })

   ///................flights....................

   it('get_by_id', async () => {
    const expected = '8861a00d-421c-49b3-98e8-642d6cd42d22'
    const actual = await bl.get_by_id_flights(1)
    assert.strictEqual(expected, actual.flight_code)
})

it('get_by_id_name', async () => {
    const expected = '8861a00d-421c-49b3-98e8-642d6cd42d22'
    const actual = await bl.get_by_id_name(1)
    assert.strictEqual(expected, actual.flight_code)
})

let flight_code = null

it('new_flight', async () => {
    const new_flight = await bl.create_new_flight({ 'airline_id': 25, 'origin_country_id': 74, 'destination_country_id': 30, 'departure_time': '2024-04-25 05:00:00', 'landing_time': '2024-01-25 07:00:00', 'plane_id': 1, 'remaining_tickets': 144 })
    const expected = 25
    flight_code = await dal_5.get_by_flight_code(new_flight.flight_code)
    assert.strictEqual(expected, flight_code.airline_id)
})

it('update_flight', async () => {

    await bl.update_flight(flight_code.id, { 'airline_id': 26, 'origin_country_id': 74, 'destination_country_id': 20, 'departure_time': '2024-03-03 05:00:00', 'landing_time': '2024-03-03 10:00:00', 'plane_id': 1, 'remaining_tickets': 144 })
    const expected = 26
    const get_by_id = await dal_5.get_by_id(flight_code.id)
    const actual = get_by_id.airline_id
    assert.strictEqual(expected, actual)
})

it('delete_flight', async () => {
    await bl.delete_flight(flight_code.id)
    const expected = undefined
    const actual = await dal_5.get_by_id(flight_code.id)
    await dal_5.set_id(flight_code.id)
    assert.strictEqual(expected, actual)
})

})

