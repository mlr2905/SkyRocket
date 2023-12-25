
const assert = require('assert')
const dal = require('./dals/dal')

describe('Testing functionallity of the DAL' , () => {
    beforeEach(async () => {
        await dal.create_table_if_not_exist()
        await dal.delete_all()
        await dal.new_data({ 'ID': 1,'NAME': 'bot', 'TEXT': 'hello', 'TIME': '00:00:00','SUPER-ID':0})  // Id: 1
        await dal.new_data({ 'ID': 2,'NAME': 'bot', 'TEXT': 'test', 'TIME': '00:00:00','SUPER-ID':0}) //id: 2
        await dal.new_data({ 'ID': 3,'NAME': 'bot', 'TEXT': 'hi', 'TIME': '00:00:00','SUPER-ID':0})  //id:3
         }, 20000)


    it('get_all', async () => {
        const expected = 3
        const datas = await dal.get_all()
        const actual = datas.length
        console.log(actual);
        assert.strictEqual(expected, actual)
    }, 20000)

    it('get_by_id', async () => {
        const expected = 'bot'
        const data_id_3 = await dal.get_by_id(3)
        const actual = data_id_3.NAME
        console.log(actual);
        assert.strictEqual(expected, actual)
    })

    it('updated_data', async () => {
        await dal.update_emplyee(3, {'NAME': 'bot bob', 'TEXT': 'hi', 'TIME': '00:00:00','SUPER-ID':0})
        const expected = 'bot bob'
        const data_id_3 = await dal.get_by_id(3)
        const actual = data_id_3.NAME
        console.log(actual);
        assert.strictEqual(expected, actual)
    })    

    it('delete_data', async () => {
        await dal.delete_data(3)
        const expected = undefined
        const data_id_3 = await dal.get_by_id(3)
        assert.strictEqual(expected, data_id_3)
    })        

  
    
    // complete all other tests for all methods:
    // update_emplyee(id, updated_data)
    // delete_data(id)
    // new_data(new_emp)
    // delete_all ?

})