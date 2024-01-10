const express = require('express')
const router = express.Router()
const dal = require('../../dals/dals_flights/dal_0')

// '/api/all_tables'
// GET 
router.get('/', async (request, response) => {
    try {
    const all_tabless = await dal.get_all()
    response.json(all_tabless)
    }
    catch (e) {
        response.json({'error': JSON.stringify(e)})
    }
})
// GET by ID
router.get('/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await dal.get_by_id(user_id)
    if (user) {
        response.json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})
module.exports = router