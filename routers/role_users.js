const express = require('express')
const router = express.Router()
const qrcode = require('qrcode');
const bl = require('../bl/bl_role_users')

// router.get('/', async (request, response) => {
//     try {
//         const messages = {
//             'message': `Welcome to role admins the desired path must be specified,
//         Enter the following path https://cloud-memory.onrender.com/role_admins/{neme ?}/1`}
//         response.status(400).json(messages)
//     }
//     catch (error) {
//         throw response.status(503).json({ 'error': 'The request failed, try again later', error })
//     }
// })


router.get('/:id', async (request, response) => {
    try {
        const messages = { 'message': 'Enter the following path https://cloud-memory.onrender.com/role_users/{neme ?}/1' }
        response.status(400).json(messages)
    }
    catch (error) {
        throw response.status(503).json({ 'error': 'The request failed, try again later', error })
    }
})



router.get('/qr/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    try {
        const user = await bl.get_qr(user_id)
        if (user) {
            response.status(200).json(user)
        }
        else {
            throw response.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` })

        }

    } catch (error) {
        throw response.status(503).json({ "error": `The request failed, try again later ` })
    }
})


// GET by ID
router.get('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    try {
        const user = await bl.get_by_id_user(user_id)
        if (user) {
            response.status(200).json(user)
        }
        else {
            throw response.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` })

        }

    } catch (error) {
        throw response.status(503).json({ "error": `The request failed, try again later ` })
    }
})

// POST
router.post('/users', async (request, response) => {
    const new_user = request.body
    try {
        const result = await bl.create_user(new_user)
        response.status(201).json(result)

    } catch (error) {
        throw response.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system ` })
        ; // מעבירה את השגיאה הלאה
    }

})

// PUT 
router.put('/users/:id', async (request, response) => {

    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_user(user_id)

    if (user) {
        try {
            const updated_user_req = request.body
            const result = await bl.update_user(user_id, updated_user_req)
            response.json(updated_user_req)
        }
        catch (error) {
            throw response.status(503).json({ "error": `The request failed, try again later  ` })
            ; // מעבירה את השגיאה הלאה
        }
    }
    else {
        throw response.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` })
    }
})

// DELETE
router.delete('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_user(user_id)

    if (user) {
        try {
            const result = await bl.delete_account(user_id)
            response.status(204).json({ result })
        }
        catch (error) {
            throw response.status(503).json({ "error": `The request failed, try again later  ` })
            ; // מעבירה את השגיאה הלאה
        }
    }
    else {
        throw response.status(404).json({ "error": `The ID ${user_id} you specified does not exist ` })

    }
})


// GET by ID
router.get('/customers/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_customer(user_id)
    if (user) {
        response.status(200).json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})

// POST
router.post('/customers', async (request, response) => {
    const new_user = request.body
    const result = await bl.new_customer(new_user)
    if (user) {
        response.status(201).json(user)
    }
    else {
        response.status(409).json({ "error": `There is a customer with the details I mentioned` })
    }
})

// PUT /PATCH
router.put('/customers/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    // user exists ==> perform update
    const updated_user_req = request.body
    const result = await bl.update_customer(user_id, updated_user_req)
    response.json(updated_user_req)

})

//role_users/flights

router.get('/flights', async (request, response) => {
    try {
        const customers = await bl.get_all_flights()
        response.json(customers)
    }
    catch (e) {
        response.json({ 'error': JSON.stringify(e) })
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

//role_users/tickets

// POST
router.post('/tickets', async (request, response) => {
    const new_user = request.body
    const result = await bl.purchase_ticket(new_user)
    response.status(201).json(result)
})

//role_users/passengers

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
        response.status(200).json(user)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${user_id}` })
    }
})

/**
*  @swagger
*  components:
*    schemas:
*      schema:
*        type: object
*        required:
*          - users
*          - customers
*          - flights
*        properties:
*          users:
*            type: object
*            required:
*              - username
*              - password
*              - email
*            properties:
*              username:
*                type: string
*                description: The username of the user.
*                example: test tsets
*              password:
*                type: string
*                example: test_1
*              email:
*                type: string
*                example: test_tsets@gmail.com
*          customers:
*            type: object
*            required:
*              - first_name
*              - last_name
*              - address
*              - phone_no
*              - credit_card_no
*            properties:
*              first_name:
*                type: string
*                example: test
*              last_name:
*                type: string
*                example: tests
*              address:
*                type: string
*                example: israel
*              phone_no:
*                type: string
*                example: 00507462964
*              credit_card_no:
*                type: string
*                example: 1234-1234-1234-7654
*          flights:
*            type: object
*            required:
*              - airline_id
*              - origin_country_id
*              - destination_country_id
*              - departure_time
*              - landing_time
*              - plane_id
*              - remaining_tickets
*            properties:
*              airline_id:
*                type: integer
*                example: 10
*              origin_country_id:
*                type: integer
*                example: 74
*              destination_country_id:
*                type: integer
*                example: 21
*              departure_time:
*                type: string
*                format: date-time
*                example: "2024-01-30T05:00:00.000Z"
*              landing_time:
*                type: string
*                format: date-time
*                example: "2024-01-30T16:00:00.000Z"
*              plane_id:
*                type: integer
*                example: 2
*              remaining_tickets:
*                type: integer
*                example: 195
*/








module.exports = router

