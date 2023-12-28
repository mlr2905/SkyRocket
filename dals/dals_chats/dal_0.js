
const knex = require('knex')
const config = require('config')

const connectedKnex = knex({
    client: 'pg',
    version: '15',
    connection: {
        host: config.db_cloud.host,
        user: config.db_cloud.user,
        password: config.db_cloud.password,
        database: config.db_cloud.database,
        ssl: true
    }
})

async function delete_all() {
    // db.run('update chat1 ....')
    const a = await connectedKnex('chat1').del()
    await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
    const b = await connectedKnex('chat2').del()
    await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
    const c = await connectedKnex('chat3').del()
    await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
    const d = await connectedKnex('chat4').del()
    await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
    const e = await connectedKnex('connected').del()
    await connectedKnex.raw('ALTER SEQUENCE "chat1_id_seq" RESTART WITH 1');
}

async function get_all() {
    // db.run('select * from chat1')
    const a = await connectedKnex('chat1').select('*')
    const b = await connectedKnex('chat2').select('*')
    const c = await connectedKnex('chat3').select('*')
    const d = await connectedKnex('chat4').select('*')
    const e = await connectedKnex('connected').select('*')
    const arr = { 1: a, 2: b, 3: c, 4: d, 5: e }
    return arr
}

async function get_by_id(id) {
    // db.run('select * from chat1 where id=?')
    const a = await connectedKnex('chat1').select('*').where('id', id).first()
    const b = await connectedKnex('chat2').select('*').where('id', id).first()
    const c = await connectedKnex('chat3').select('*').where('id', id).first()
    const d = await connectedKnex('chat4').select('*').where('id', id).first()
    const e = await connectedKnex('connected').select('*').where('id', id).first()
    const arr = { 1: a, 2: b, 3: c, 4: d, 5: e }
    return arr
}




module.exports = {
    get_all, get_by_id, delete_all
}