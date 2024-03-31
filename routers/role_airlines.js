const express = require('express')
const router = express.Router()
const bl = require('../bl/bl_role_airlines')



// router.get('/', async (request, response) => {
//     try {
//         const messages = {
//             'message': `Welcome to role admins the desired path must be specified,
//         Enter the following path https://cloud-memory.onrender.com/role_admins/{neme ?}/1`}
//         response.status(400).json(messages)
//     }
//     catch (error) {
//          response.status(503).json({ 'error': 'The request failed, try again later', error })
//     }
// })


// // GET by ID



// router.get('/:id', async (request, response) => {
//     try {
//         const messages = { 'message': 'Enter the following path https://cloud-memory.onrender.com/role_airlines/{neme ?}/1' }
//         response.status(400).json(messages)
//     }
//     catch (error) {
//          response.status(503).json({ 'error': 'The request failed, try again later', error })
//     }
// })

//role_airlines/users

// GET by search
router.get('/users/search', async (request, response) => {
    // const user_id = parseInt(request.params.id)
    const query = request.query
    const email = query.email
    const username = query.username
    const password = query.password
    const id = query.id
    let search = email ? email : username ? username : password ? password : id;
    let type = search !== undefined ? (search === email ? "email" : search === username ? "username" : search === password ? "password" : "id") : undefined;

    try {
        const user = await bl.get_by_id_user(type, search)
        if (user) {
            response.status(200).json(user)
        }
        else {
            response.status(404).json({ "error": `The id ${search} you specified does not exist in the system` })
        }

    } catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
})
// GET by ID
router.get('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    try {
        const user = await bl.get_by_id_user('id', user_id)
        if (user) {
            if (user !== 'Postponed') {
                response.status(200).json(user)
            }
            else {
                response.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id ${user_id}` })
            }
        }
        else {
            response.status(404).json({ "error": `cannot find user with id '${user_id}'` })
        }
    }
    catch (error) {
        response.status(503).json({ "error": `The request failed, try again later '${error}'` })
    }
})

// POST
router.post('/users', async (request, response) => {
    const new_user = request.body
    try {
        const result = await bl.create_user(new_user)
        if (result.ok) {
            response.status(201).json(result.ok)
        }
        else if (result === 'rejected') {
            response.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` })
        }
        else {
            response.status(503).json({ "error": `The request failed, try again later` })
        }
    } catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })

    }

})

// PUT 
router.put('/users/:id', async (request, response) => {

    const id = request.params.id

    const user = await bl.get_by_id_user('id', id)

    if (user) {
        try {
            const updated = request.body
            const result = await bl.update_user(id, updated)
            if (result) {
                response.status(201).json(`email ${updated.email} successfully updated`)
            }
            else {
                response.status(409).json({ "error": `${updated.email} already exists` })
            }
        }
        catch (error) {
            response.status(503).json({ "error": `The request failed, try again later ${error}` })
        }
    }
    else {
        response.status(404).json({ "error": `No user found with this handle '${id}'` })
    }
})


//role_airlines/airline

// POST
router.post('/airlines', async (request, response) => {
    const new_user = request.body
    try {
        const result = await bl.create_airline(new_user)
        if (result.id) {
            response.status(201).json(result)
        }
        else if (result === 'rejected') {
            response.status(409).json({ "error": `name ${new_user.name} or user_id ${new_user.user_id} exist in the system` })
        }
        else {
            response.status(503).json({ "error": `The request failed, try again later ${result}` })
        }
    } catch (error) {

        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }

})

// GET by ID
router.get('/airlines/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    try {
        const user = await bl.get_by_id_airline(user_id)
        if (user) {
            response.json(user)
        }
        else {
            response.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system` })
        }

    } catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
})

// PUT 
router.put('/airlines/:id', async (request, response) => {

    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_airline(user_id)

    if (user) {
        try {
            const updated_user_req = request.body
            const result = await bl.update_airline(user_id, updated_user_req)
            response.status(201).json(result)
        }
        catch (error) {
            response.status(503).json({ "error": `The request failed, try again later ${error}` })
        }
    }
    else {
        response.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system` })
    }
})

//role_airlines/flights

router.get('/airline_id/:id', async (request, response) => {
    try {
        const by_id = parseInt(request.params.id)
        const id = await bl.get_flight_by_airline_id(by_id)
        if (id) {
            response.json(id)
        }
        else {
            response.status(404).json({ "error": `cannot find user with id ${by_id}` })
        }
    }
    catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
})

// GET by ID
router.get('/flights/:id', async (request, response) => {
    const by_id = parseInt(request.params.id)
    const id = await bl.get_by_id_flights(by_id)
    try {
        if (id) {
            response.status(200).json(id)
        }
        else {
            response.status(404).json({ "error": `cannot find user with id ${by_id}` })
        }
    } catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
})

// POST
router.post('/flights', async (request, response) => {
    const new_flight = request.body
    try {

        const check_flight_existence = await bl.check_flight_existence(new_flight)

        if (!check_flight_existence) {
            const result = await bl.create_new_flight(new_flight)
            if (result.id > 0) {
                response.status(201).json(result)
            }
            else {
                const id = result === "airline_id" ? new_flight.airline_id :
                    result === "origin_country_id" ? new_flight.origin_country_id :
                        result === "destination_country_id" ? new_flight.destination_country_id :
                            result === "plane_id" ? new_flight.plane_id : null;

                response.status(404).json({ "error": `The ${id} you specified does not exist in the ${result}` })
            }
        }
        else {
            response.status(409).json({ "error": "The flight you want already exists" })

        }
    } catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })

    }

})
// PUT 

router.put('/flights/:id', async (request, response) => {

    const id = parseInt(request.params.id)
    const by_id = await bl.get_by_id_flights(id)
    const update_flight = request.body
    try {
        if (by_id) {
            const result = await bl.update_flight(id, update_flight)
            if (result.status === "OK") {
                response.json(id, update_flight)
            }
            
            else if (result.status === "some") {
                response.status(404).json({ "error": `The id ${update_flight.result.status} you specified does not exist in the ${result.status}` })

            }
            else if (result.status === "exists") {

                response.status(409).json({ "error": `${result.status} The flight you want already exists` })
            }
            else if (result.status === "planes_id" || result.status === "origin_country_id" || result.status === "destination_country_id" || result.status === "airline_id") {
                response.status(404).json({ "error": `The id ${update_flight.result.status} you specified does not exist in the ${result.status}` })
            }
            else {
                response.status(503).json({ "error": `The request failed, try again later ${result}` })
            }
        }
        else {
            response.status(404).json({ "error": `The id ${id} you specified does not exist in the system` })
        }
    }
    catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
})

// DELETE
router.delete('/flights/:id', async (request, response) => {
    const id = parseInt(request.params.id)
    const by_id = await bl.get_by_id_flights(id)
    console.log('by_id', by_id);
    try {
        if (by_id) {
            const result = await bl.delete_flight(id)
            response.status(204).json(`flight id: ${id} deleted successfully`)
        }
        else {
            response.status(404).json({ "error": `The ID ${id} you specified does not exist` })
        }
    }
    catch (error) {
        response.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
})



module.exports = router





