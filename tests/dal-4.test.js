const assert = require('assert')
const dal = require('../dals/dal_4')

describe('Testing functionallity of the DAL', () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'first_name': 'idit', 'last_name': 'rozental', 'address': 'israel', 'phone_no': '+972503424253', 'credit_card_no': '2255', 'user_id': 1 }) // id: 1
        await dal.new_message({ 'id': 1, 'first_name': 'meital', 'last_name': 'rozental', 'address': 'israel', 'phone_no': '+972507462964', 'credit_card_no': '4422', 'user_id': 2 }) // id: 2
        await dal.new_message({ 'id': 3, 'first_name': 'yosef', 'last_name': 'rozental', 'address': 'israel', 'phone_no': '+972506372833', 'credit_card_no': '6586', 'user_id': 3 }) // id: 3
        await dal.new_message({ 'id': 1, 'first_name': 'Atlas', 'last_name': 'Air', 'address': 'American', 'phone_no': '+141523581961', 'credit_card_no': '3932', 'user_id': 4 }) // id: 4
        await dal.new_message({ 'id': 1, 'first_name': 'American', 'last_name': 'Airlines', 'address': 'American', 'phone_no': '+14152358132', 'credit_card_no': '5234', 'user_id': 5 }) // id: 5

    })

    

        it('get_all', async () => {
            const expected = 5
            const messages = await dal.get_all()
            const actual = messages.length
            console.log(actual);
            assert.strictEqual(expected, actual)
        })

    it('get_by_id', async () => {
        const expected = 'yosef'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.first_name
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('update_message', async () => {
        await dal.update_message(3, { 'first_name': 'American', 'last_name': 'Airlines', 'address': 'American', 'phone_no': '+14152358652', 'credit_card_no': '5234', 'user_id': 5 })
        const expected = '+14152358652'
        const message_id_3 = await dal.get_by_id(3)
        const actual = message_id_3.phone_no
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('delete_message', async () => {
        await dal.delete_message(5)
        const expected = undefined
        const message_id_5 = await dal.get_by_id(5)
        assert.strictEqual(expected, message_id_5)
    })

    it('new_message', async () => {
        await dal.new_message({ 'id': 6,'first_name': 'Egypt', 'last_name': 'Air', 'address': 'Egypt', 'phone_no': '+2022597325', 'credit_card_no': '6362', 'user_id': 6  }) // Id: 6
        const expected = 'Egypt'
        const message_id_6 = await dal.get_by_id(6)
        assert.strictEqual(expected, message_id_6.first_name)
    })

    it('Confirm_one_line', async () => {
        await dal.delete_all()
        await dal.new_message({ 'id': 1, 'first_name': 'idit', 'last_name': 'rozental', 'address': 'israel', 'phone_no': '+972503424253', 'credit_card_no': '2255', 'user_id': 1 }) // id: 1
    })


})