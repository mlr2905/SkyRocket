const knex = require('knex')
 require('dotenv').config();


function connect() {

    const connectedKnex = knex({
        client: 'pg',
        version: '16',
        connection: {
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            ssl: true
        }
    })
    return connectedKnex
}

module.exports = { connect }