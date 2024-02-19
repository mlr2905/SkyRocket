const assert = require('assert')
const dal = require('../../dals/dal_table_customers')
const dal_0 = require('../../dals/dal_all_tables')
const { log } = require('console')

describe('Testing functionallity of the DAL', () => {
    
    it('Credit_check', async () => {
        const expected = true
        const actual = await dal.credit_check('4580980102346346')
        assert.strictEqual(expected, actual)
    })

    it('Credit_check', async () => {
        const expected = false
        const actual = await dal.credit_check('4580980102346666')
        assert.strictEqual(expected, actual)
    })

    it('get_all', async () => {
        const next_id = await dal_0.registered_Tables()
        let id = next_id.rows[0].registered_tables.customers
        const expected = id 
        const customers = await dal.get_all()
        const actual = customers.length
        assert.strictEqual(expected, actual)
    }) 

    it('get_by_id', async () => {
        const expected = 'michael rozental'
        const customer_id = await dal.get_by_id(4)
        const actual = customer_id.last_name
        assert.strictEqual(expected, actual)
    })

    it('new_customer', async () => {
        const new_customer = await dal.new_customer({'first_name': 'admin', 'last_name': 'Michael29', 'address': 'israel', 'phone_no': '05034284744', 'credit_card_no': '5555-5432-1098-7337', 'user_id': 36  }) 
        const expected = 'Michael29'
        const actual = await dal.get_by_name('Michael29')
        assert.strictEqual(expected, actual.last_name)
    })

    it('update_customer', async () => {
        const by_name = await dal.get_by_name('Michael29')
        await dal.update_customer(by_name.id, {'first_name': 'admin', 'last_name': 'Michael29', 'address': 'israel', 'phone_no': '05034284744', 'credit_card_no': '4444-5432-1098-7654','user_id': 36 })
        const expected = '4444-5432-1098-7654'
        const actual = await dal.get_by_id(by_name.id)
        assert.strictEqual(expected, actual.credit_card_no)
    })

    it('delete_customer', async () => {
        const by_name = await dal.get_by_name('Michael29')
        await dal.delete_customer(by_name.id)
        const expected = undefined
        const country_id = await dal.get_by_id(by_name.id)
        const set_id_country = await dal.set_id(by_name.id)
        assert.strictEqual(expected, country_id)
    })

})