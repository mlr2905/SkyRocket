const knex = require('knex')
const config = require('config')

function connect() {

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
    return connectedKnex
}

module.exports = { connect }