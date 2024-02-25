const express = require('express')
const router = express.Router()
const qrcode = require('qrcode');

const bl = require('../bl/bl_role_users')
//role_users/users

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
*        
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

/**
 * @swagger
 * /role_users/users/{id}:
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
/**
 * @swagger
 * /role_users/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user record with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NAME:
 *                 type: string
 *                 description: The name of the user.
 *               AGE:
 *                 type: number
 *                 description: The age of the user.
 *               ADDRESS:
 *                 type: string
 *                 description: The address of the user.
 *               SALARY:
 *                 type: number
 *                 description: The salary of the user.
 *             example:
 *               name: John Doe
 *               age: 30
 *               address: Example Street
 *               salary: 50000.00
 *     responses:
 *       201:
 *         description: user created successfully.
 *         content:
 *           application/json:
 *             example:
 *               ID: 1
 *               NAME: John Doe
 *               AGE: 30
 *               ADDRESS: Example Street
 *               SALARY: 50000.00
 *       400:
 *         description: Bad request. Ensure all required fields are provided.
 *         content:
 *           application/json:
 *             example:
 *               error: Bad request. Missing required fields.
 */

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


/**
 * @swagger
 * /role_users/users/{id}:
 *   delete:
 *     summary: Delete an user by ID
 *     description: Delete the user record with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: user deleted successfully.
 *       404:
 *         description: user not found with the specified ID.
 *         content:
 *           application/json:
 *             example:
 *               error: cannot find user with id {id}
 */

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

//role_users/customers

// GET by ID
router.get('/customers/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_customer(user_id)
    if (user) {
        responsestatus(200).json(user)
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
        responsestatus(201).json(user)
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


module.exports = router

