const assert = require('assert')
const bl = require('../bl/bl_role_users')
const dal_1 = require('../dals/dals_flights/dal_1')
const dal_6 = require('../dals/dals_flights/dal_6')
const dal_7 = require('../dals/dals_flights/dal_7')
const dal_4 = require('../dals/dals_flights/dal_4')


describe('Testing functionallity of the bl', () => {




    it('get_by_id_flights', async () => {
        const expected = 'msmdm'
        const new_user = await dal_4.get_by_id(23)
        assert.strictEqual(expected, new_user.first_name)
    })


})

