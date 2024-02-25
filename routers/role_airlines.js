const express = require('express')
const router = express.Router()
const bl = require('../bl/bl_role_users')

//role_airlines/users
/**
*  @swagger
*  components:
*     schemas:
*       user:
*         type: object
*         required:
*           - username
*           - password
*           - email
*           - role_id
*         properties:
*           username:
*             type: string
*             description: The name of the user.
*           password:
*             type: string
*             description: The password of the user.
*           email:
*             type: string
*             description: The email of the user.
*           role_id:
*             type: number
*             description: role_id of the user
*        user:
*          username: Idit Rozental
*          password: jsad439
*          email: idit@gmail.com
*          role_id: 1
*/

router.get('/', async (request, response) => {
    try {
        const messages = {
            'message': `Welcome to role admins the desired path must be specified,
        Enter the following path https://cloud-memory.onrender.com/role_admins/{neme ?}/1`}
        response.status(400).json(messages)
    }
    catch (error) {
        throw response.status(503).json({ 'error': 'The request failed, try again later', error })
    }
})


// GET by ID



router.get('/:id', async (request, response) => {
    try {
        const messages = { 'message': 'Enter the following path https://cloud-memory.onrender.com/role_airlines/{neme ?}/1' }
        response.status(400).json(messages)
    }
    catch (error) {
        throw response.status(503).json({ 'error': 'The request failed, try again later', error })
    }
})

/**
 * @swagger
 * /role_airlines/users/{id}:
 *   get:
 *     summary: Get an user by ID
 *     description: Retrieve user details based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with the user details.
 *         content:
 *           application/json:
 *             example:
 *               ID: 1
 *               USERNAME: Idit Rozental
 *               password: jsad439
 *               EMAI: idit@gmail.com
 *               ROLE_ID: 1
 *               ROLE_NAME: user
 *       404:
 *         description: user not found with the specified ID.
 *         content:
 *           application/json:
 *             example:
 *               error: cannot find user with id {id}
 */
// GET by ID
router.get('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    try {
        const user = await bl.get_by_id_user(user_id)
        if (user) {
            response.json(user)
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

//role_airlines/airline

// GET by ID
router.get('/airlines/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    try {
        const user = await bl.get_by_id_airline(user_id)
        if (user) {
            response.json(user)
        }
        else {
            throw response.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` })
        }

    } catch (error) {
        throw response.status(503).json({ "error": `The request failed, try again later ` })
    }
})

// POST
router.post('/airlines', async (request, response) => {
    const new_user = request.body
    try {
        const result = await bl.create_airline(new_user)
        response.status(201).json(result)

    } catch (error) {
        throw response.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system ` })
        ; // מעבירה את השגיאה הלאה
    }

})

// PUT 
router.put('/airlines/:id', async (request, response) => {

    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_user(user_id)

    if (user) {
        try {
            const updated_user_req = request.body
            const result = await bl.update_airline(user_id, updated_user_req)
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
//role_airlines/flights

router.get('/flights', async (request, response) => {
    try {
        const by_id_name = await bl.get_by_id_name()
        response.json(by_id_name)
    }
    catch (e) {
        response.json({ 'error': JSON.stringify(e) })
    }
})
// GET by ID
router.get('/flights/:id', async (request, response) => {
    const by_id = parseInt(request.params.id)
    const id = await bl.get_by_id_flights(by_id)
    if (id) {
        response.json(id)
    }
    else {
        response.status(404).json({ "error": `cannot find user with id ${by_id}` })
    }
})

// POST
router.post('/flights', async (request, response) => {
    const new_flight = request.body
    try {
        const result = await bl.create_new_flight(new_flight)
        response.status(201).json(result)

    } catch (error) {
        // throw response.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system ` })
        ; // לציין שגיאה עם קיימת טיסה עם אותם פרטים
    }

})
// PUT 

router.put('/flights/:id', async (request, response) => {

    const update_flight = parseInt(request.params.id)
    const flight = await bl.get_by_id_flights(update_flight)

    if (flight) {
        try {
            const update_flight_req = request.body
            const result = await bl.update_airline(update_flight, update_flight_req)
            response.json(update_flight_req)
        }
        catch (error) {
            throw response.status(503).json({ "error": `The request failed, try again later  ` })
            ; // מעבירה את השגיאה הלאה
        }
    }
    else {
        throw response.status(404).json({ "error": `The id ${update_flight} you specified does not exist in the system ` })

    }

})

// DELETE
router.delete('/flights/:id', async (request, response) => {
    const by_id = parseInt(request.params.id)
    const flight = await bl.get_by_id_flights(by_id)

    if (flight) {
        try {
            const result = await bl.delete_flight(by_id)
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



module.exports = router

