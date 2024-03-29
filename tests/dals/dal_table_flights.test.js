const assert = require('assert')
const dal = require('../../dals/dal_table_flights')
const dal_0 = require('../../dals/dal_all_tables')
const { log } = require('console')

describe('Testing functionallity of the DAL', () => {

    
    it('check_flight_existence', async () => {
        const expected = 'correct'
        const actual = await dal.flights_records_tables({'airline_id':9,'origin_country_id':33,'destination_country_id':2,'planes_id':1})
        assert.strictEqual(expected, actual.status)
    })
    it('check_flight_existence', async () => {
        const expected = 'incorrect'
        const actual = await dal.flights_records_tables({'airline_id':999,'origin_country_id':33,'destination_country_id':2,'planes_id':1})

        assert.strictEqual(expected, actual.airline_id)
    })
    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.flights, actual.length)
    })

    it('get_by_id', async () => {
        const expected = '8861a00d-421c-49b3-98e8-642d6cd42d22'
        const actual = await dal.get_by_id(1)
        assert.strictEqual(expected, actual.flight_code)
    })

    let flight_code = null

    it('new_flight', async () => {
        const new_flight = await dal.new_flight({ 'airline_id': 25, 'origin_country_id': 74, 'destination_country_id': 30, 'departure_time': '2024-04-25 05:00:00', 'landing_time': '2024-01-25 07:00:00', 'plane_id': 1})
        const expected = 25
        flight_code = await dal.get_by_flight_code(new_flight.flight_code)
        assert.strictEqual(expected, flight_code.airline_id)
    })

    it('update_flight', async () => {

        await dal.update_flight(flight_code.id, { 'airline_id': 26, 'origin_country_id': 74, 'destination_country_id': 20, 'departure_time': '2024-03-03 05:00:00', 'landing_time': '2024-03-03 10:00:00', 'plane_id': 1})
        const expected = 26
        const get_by_id = await dal.get_by_id(flight_code.id)
        const actual = get_by_id.airline_id
        assert.strictEqual(expected, actual)
    })

    it('delete_flight', async () => {
        await dal.delete_flight(flight_code.id)
        const expected = undefined
        const actual = await dal.get_by_id(flight_code.id)
        await dal.set_id(flight_code.id)
        assert.strictEqual(expected, actual)
    })

})

