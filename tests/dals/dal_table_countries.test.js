const assert = require('assert')
const dal = require('../../dals/dal_table_countries')
const dal_0 = require('../../dals/dal_all_tables')

const { log } = require('console')


describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.countries, actual.length)
    })

    it('get_by_id', async () => {
        const expected = 'israel'
        const country_id = await dal.get_by_id(74)
        const actual = country_id.country_name
        assert.strictEqual(expected, actual)
    })

    it('new_country', async () => {
        const new_countrie = await dal.new_countrie({ 'country_name': 'countrie_test', 'continent_id': 3 })
        const expected = 'countrie_test'
        const actual = await dal.get_by_id(new_countrie.id)
        assert.strictEqual(expected, actual.country_name)
    })

    it('update_country', async () => {
        const by_name = await dal.get_by_name('countrie_test')
        await dal.update_countrie(by_name.id, { 'country_name': 'countrie_test', 'continent_id': 2 })
        const expected = 2
        const actual = await dal.get_by_id(by_name.id)
        assert.strictEqual(expected, actual.continent_id)
    })

    it('delete_country', async () => {
        const by_name = await dal.get_by_name('countrie_test')
        await dal.delete_countrie(by_name.id)
        const expected = undefined
        const country_id = await dal.get_by_id(by_name.id)
        const set_id_country = await dal.set_id(by_name.id)
        assert.strictEqual(expected, country_id)
    })

})