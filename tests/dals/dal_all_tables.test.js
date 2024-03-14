const assert = require('assert')
const dal = require('../../dals/dal_all_tables')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = 7;
        const all_tables = await dal.get_all();
        // בדיקה שהתוצאה אינה ריקה או מקורסת
        assert.ok(all_tables && all_tables.rows && all_tables.rows.length > 0, 'No data returned');
        const actual = Object.keys(all_tables.rows[0].get_all_data).length;
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
