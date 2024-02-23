const express = require('express')
const router = express.Router()
const qrcode = require('qrcode');

const bl = require('../bl/bl_role_users')
//role_users/users

/**
*  @swagger
*  components:
*     schemas:
*       Employee:
*         type: object
*         required:
*           - id
*           - name
*           - age
*           - address
*           - salary
*         properties:
*           id:
*             type: number
*             description: The auto-generated id of the employee.
*           name:
*             type: string
*             description: The name of the employee.
*           age:
*             type: number
*             description: age of the employee
*           address:
*             type: string
*             description: The address of the employee.
*           salary:
*             type: number
*             description: salary of the employee
*         example:
*           name: Kim
*           age: 22
*           address: South-Hall
*           salary: 45000
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
 *     summary: Get an employee by ID
 *     description: Retrieve employee details based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with the employee details.
 *         content:
 *           application/json:
 *             example:
 *               ID: 1
 *               username: Idit Rozental
 *               password: jsad439
 *               email: idit@gmail.com
 *               role_id : 1
 *               role_id: user
 *       404:
 *         description: Employee not found with the specified ID.
 *         content:
 *           application/json:
 *             example:
 *               error: cannot find employee with id {id}
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
 * /users:
 *   post:
 *     summary: Create a new employee
 *     description: Create a new employee record with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NAME:
 *                 type: string
 *                 description: The name of the employee.
 *               AGE:
 *                 type: number
 *                 description: The age of the employee.
 *               ADDRESS:
 *                 type: string
 *                 description: The address of the employee.
 *               SALARY:
 *                 type: number
 *                 description: The salary of the employee.
 *             example:
 *               name: John Doe
 *               age: 30
 *               address: Example Street
 *               salary: 50000.00
 *     responses:
 *       201:
 *         description: Employee created successfully.
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
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete an employee by ID
 *     description: Delete the employee record with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Employee deleted successfully.
 *       404:
 *         description: Employee not found with the specified ID.
 *         content:
 *           application/json:
 *             example:
 *               error: cannot find employee with id {id}
 */

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

