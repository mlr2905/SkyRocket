const assert = require('assert')
const dal = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = 7
        const all_tables = await dal.get_all()
console.log(all_tables);
        const actual = Object.keys(all_tables.rows[0].get_all_data).length;
        assert.strictEqual(expected, actual)
    })

    
    it('get_by_id', async () => {
        const expected = 7
        const get_by_id = await dal.get_by_id(3)
        const actual = Object.keys(get_by_id).length;
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 7
        const get_by_id = await dal.get_qr('jcdjjsbsfjebde')

        const actual = 
        assert.strictEqual(expected, actual)
    })

})
