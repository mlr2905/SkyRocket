const assert = require('assert')
const dal = require('../../dals/dal_table_tickets')
const dal_0 = require('../../dals/dal_all_tables')
const dal_1 = require('../../dals/dal_table_passengers')
const dal_2 = require('../../dals/dal_table_chairs_taken')



describe('Testing functionallity of the DAL', () => {

    let id = null

    it('new_ticket', async () => {
        await dal_1.new_passenger({ 'first_name': 'test', 'last_name': 'passenger', 'date_of_birth': '1993-05-29', 'passport_number': '60407537', 'user_id': 27, 'flight_id': 1 }) // Id: 6
        id = await dal_1.get_by_passport_number('60407537')
        const new_chair = await dal_2.new_chair({ 'flight_id': 2, 'char_id': 55, 'passenger_id': id.id, 'user_id': 27 }) // Id: 6
        const new_ticket = await dal.new_ticket({ 'flight_id': 2, 'customer_id': 4, 'passenger_id': id.id, 'user_id': 27, 'chair_id': new_chair.id })
        const expected = id.id
        id = await dal.get_by_ticket_code(new_ticket.ticket_code)
        const actual = id
        assert.strictEqual(expected, actual.passenger_id)
    })

    it('get_all', async () => {
        const expected = await dal_0.registered_Tables()
        const actual = await dal.get_all()
        assert.strictEqual(expected.tickets, actual.length)
    })

    it('get_by_id', async () => {
        const expected = 27
        const actual = await dal.get_by_id(id.id)
        assert.strictEqual(expected, actual.user_id)
    })

    it('update_ticket', async () => {
        await dal.update_ticket(id.id, { 'flight_id': 1 })
        const expected = 1
        const actual = await dal.get_by_id(id.id)
        assert.strictEqual(expected, actual.flight_id)
    })

    it('delete_ticket', async () => {
        await dal.delete_ticket(id.id)
        const expected = undefined
        const actual = await dal.get_by_id(id.id)
        await dal.set_id(id.id)
        await dal_1.delete_passenger(id.passenger_id)
        await dal_1.set_id(id.passenger_id)
        await dal_2.delete_chair(id.chair_id)
        await dal_2.set_id(id.chair_id)
        assert.strictEqual(expected, actual)
    })

})