const assert = require('assert')
const dal = require('../../dals/dals_chats/dal_0')

describe('Testing functionallity of the DAL', () => {

    it('get_all', async () => {
        const expected = 5
        const messages = await dal.get_all()
        const actual = messages.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('get_by_id', async () => {
        const expected = 'bot'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.user
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

})