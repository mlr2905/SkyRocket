const express = require('express')
const router = express.Router()
const bl = require('../../bl/bl_filghts_user')


//filghts_users/users

// GET by ID
router.get('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_user(user_id)
    if (user) {
        response.json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})

// POST
router.post('/users', async (request, response) => {
    const new_user = request.body
    const result = await bl.create_user(new_user)
    response.status(201).json(result)
})
// PUT /PATCH
router.put('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
        // user exists ==> perform update
        const updated_user_req = request.body
        const result = await bl.update_user(user_id, updated_user_req)
        response.json(updated_user_req)

})

// DELETE
router.delete('/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const result = await bl.delete_account(user_id)
    response.status(204).json({ result })

})

//filghts_users/customers


// GET by ID
router.get('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_customer(user_id)
    if (user) {
        response.json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})

// POST
router.post('/users', async (request, response) => {
    const new_user = request.body
    const result = await bl.new_customer(new_user)
    response.status(201).json(result)
})

// PUT /PATCH
router.put('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
        // user exists ==> perform update
        const updated_user_req = request.body
        const result = await bl.update_customer(user_id, updated_user_req)
        response.json(updated_user_req)

})

//filghts_users/flights

router.get('/flights', async (request, response) => {
    try {
    const customers = await bl.get_all_flights()
    response.json(customers)
    }
    catch (e) {
        response.json({'error': JSON.stringify(e)})
    }
})
// GET by ID
router.get('/flights/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_flights(user_id)
    if (user) {
        response.json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})

//filghts_users/tickets

// POST
router.post('/tickets', async (request, response) => {
    const new_user = request.body
    const result = await bl.purchase_ticket(new_user)
    response.status(201).json(result)
})

//filghts_users/passengers

// POST
router.post('/passengers', async (request, response) => {
    const new_user = request.body
    const result = await bl.new_passenger(new_user)
    response.status(201).json(result)
})

// GET by ID
router.get('/passengers/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_passenger(user_id)
    if (user) {
        response.json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})


module.exports = router

