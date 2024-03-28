const assert = require('assert')
const dal = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = 7;
        const all_tables = await dal.get_all();
        const actual = Object.keys(all_tables).length;
        assert.strictEqual(expected, actual);
    });

    it('registered_Tables', async () => {
        const expected = 7;
        const all_tables = await dal.registered_Tables();
        const actual = Object.keys(all_tables).length;
        assert.strictEqual(expected, actual);
    });
    it('flights_records_tables', async () => {
        const expected = 3;
        const all_tables = await dal.flights_records_tables();
        const actual = Object.keys(all_tables).length;
        assert.strictEqual(expected, actual);
    });

    it('get_by_id', async () => {
        const expected = 7;
        const get_by_id = await dal.get_by_id(3);
        // בדיקה שהתוצאה אינה ריקה או מקורסת
        assert.ok(get_by_id, 'No data returned');
        const actual = Object.keys(get_by_id).length;
        assert.strictEqual(expected, actual);
    });

    //     it('get_by_id', async () => {
    //         const expected = 7
    //         const get_by_id = await dal.get_qr('jcdjjsbsfjebde')
    // console.log(get_by_id);
    //         const actual = 
    //         assert.strictEqual(expected, actual)
    //     })

})
