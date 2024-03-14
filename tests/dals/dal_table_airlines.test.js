const assert = require('assert')
const dal = require('../../dals/dal_table_airlines')
const dal_0 = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.airlines, actual.length)
    })

    it('get_by_id', async () => {
        const expected = 'Israir'
        const airlines_id = await dal.get_by_id(26)
        const actual = airlines_id.name
        assert.strictEqual(expected, actual)
    })

    it('new_airline', async () => {
        const new_airline = await dal.new_airline({ 'name': 'airline_tset', 'country_id': 74, 'user_id': 36 })
        const expected = 'airline_tset'
        const actual = await dal.get_by_id(new_airline.id)
        assert.strictEqual(expected, actual.name)
    })

    it('update_airline', async () => {
        const by_name = await dal.get_by_name('airline_tset')
        await dal.update_airline(by_name.id, { 'name': 'airline_tset2', 'country_id': 74, 'user_id': 36 })
        const expected = 'airline_tset2'
        const actual = await dal.get_by_id(by_name.id)
        assert.strictEqual(expected, actual.name)
    })

    it('delete_country', async () => {
        const by_name = await dal.get_by_name('airline_tset2')
        await dal.delete_airline(by_name.id)
        const expected = undefined
        const country_id = await dal.get_by_id(by_name.id)
        const set_id_country = await dal.set_id(by_name.id)
        assert.strictEqual(expected, country_id)
    })
    
})
