const assert = require('assert')
const dal = require('../../dals/dal_table_passengers')
const dal_0 = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    let passenger = null

    it('new_passenger', async () => {
        await dal.new_passenger({ 'first_name': 'test', 'last_name': 'passenger', 'date_of_birth': '1993-05-29', 'passport_number': '73234076', 'user_id': 27, 'flight_id': 1 }) // Id: 6
        const expected = 'passenger'
        passenger = await dal.get_by_passport_number('73234076')
        const actual = passenger
        assert.strictEqual(expected, actual.last_name)
    })

    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.passengers, actual.length)
    })

    it('get_by_id', async () => {
        const expected = '73234076'
        const actual = await dal.get_by_id(passenger.id)
        assert.strictEqual(expected, actual.passport_number)
    })

    it('update_passenger', async () => {
        await dal.update_passenger(passenger.id, { 'first_name': 'test-2', 'last_name': 'passenger', 'date_of_birth': '1993-05-29', 'passport_number': '73234076', 'user_id': 27, 'flight_id': 1 })
        const expected = 'test-2'
        const actual = await dal.get_by_id(passenger.id)
        assert.strictEqual(expected, actual.first_name)
    })

    it('delete_passenger', async () => {
        await dal.delete_passenger(passenger.id)
        const expected = undefined
        const actual = await dal.get_by_id(passenger.id)
         await dal.set_id(passenger.id)
        assert.strictEqual(expected, actual)
    })

})