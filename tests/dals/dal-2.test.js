const assert = require('assert')
const dal = require('../../dals/dal_2')
const { log } = require('console')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const next_id = await dal.registered_countries()
        let id = next_id.rows[0].registered_countries
        const expected = id 
        const countrys = await dal.get_all()
        const actual = countrys.length
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'israel'
        const country_id = await dal.get_by_id(74)
        const actual = country_id.country_name
        assert.strictEqual(expected, actual)
    })

    it('new_country', async () => {
        const next_id = await dal.next_id()
        const id =next_id.rows[0].countries_next_id -1
        await dal.new_countrie({ 'country_name': 'test', 'continent_id': 3 })
        const expected = 'test'
        const actual = await dal.get_by_id(id)
        assert.strictEqual(expected, actual.country_name)
    })

    it('update_country', async () => {
        const by_name = await dal.get_by_name('test')
        let id = by_name.id
        await dal.update_countrie(id, { 'country_name': 'test', 'continent_id': 2 })
        const expected = 2
        const actual = await dal.get_by_id(id)
        assert.strictEqual(expected, actual.continent_id)
    })

    it('delete_country', async () => {
        const next_id = await dal.next_id()
        let id = next_id.rows[0].countries_next_id -1
        await dal.delete_countrie(id)
        const expected = undefined
        const country_id_5 = await dal.get_by_id(id)
        const set_id_country = await dal.set_id_country(id)
        assert.strictEqual(expected, country_id_5)
    })
  
})