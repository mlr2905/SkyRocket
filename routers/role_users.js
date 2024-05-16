const express = require('express')
const router = express.Router()
const qrcode = require('qrcode');
const bl = require('../bl/bl_role_users');
const { log } = require('winston');
const jwt = require('jsonwebtoken');



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


// router.get('/:id', async (request, response) => {
//     try {
//         const messages = { 'message': 'Enter the following path https://cloud-memory.onrender.com/role_users/{neme ?}/1' }
//         response.status(400).json(messages)
//     }
//     catch (error) {
//         throw response.status(503).json({ 'error': 'The request failed, try again later', error })
//     }
// })


router.post('/authcode', async (request, response) => {
    try {
        const Query = request.body;
        const email = Query.email;
        console.log(Query.email);
        const datas = await bl.authcode(email)
        console.log("rl",datas);
        const data =datas.data
        if (datas.e === "yes") {
            response.status(409).json({"e":"yes", "errors":`${datas.error}`});
        } else {
            console.log(data.code !== undefined);
            if (datas.code !== undefined) {
                response.status(200).json({data});
            }
        }
    } catch (error) {
        response.status(503).json({ 'error': 'The request failed, try again later', error });
    }
});

router.post('/validation', async (request, response) => {
    try {
        const Query = request.body;
        const email = Query.email;
        const code = Query.code;
        const datas = await bl.login_code(email, code)
        console.log("r data",data);
        const data = datas.user
        const err = datas.e
        if (err === "yes") {
            response.status(409).json({"e":"yes", "error":`${user.error}` });

        }
        else {
        console.log("r user",data.token);

         const token = data.token
         console.log("token",token);
         response.cookie('sky', token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
        });
            // בניית הקישור לדף Swagger
            const swaggerUrl = 'https://skyrocket.onrender.com/swagger/';

            // הפניה לדף Swagger בתגובה המוחזרת
            response.status(200).json({ data, swaggerUrl });
        }

    }
    catch (error) {
        response.status(503).json({ 'error': 'The request failed, try again later', error });
    }
});

router.post('/login', async (request, response) => {
    try {
        const signupUrl = 'https://skyrocket.onrender.com/signup.html';

        const Query = request.body;
        const email = Query.email;
        const password = Query.password;
        const user = await bl.login(email, password)
        if (user.e === "yes") {
            response.status(409).json({"e":"yes", "error":`${user.error}` });

        }
        else {
         const token =user.token
         response.cookie('sky', token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
        });
            // בניית הקישור לדף Swagger
            const swaggerUrl = 'https://skyrocket.onrender.com/swagger/';
            let data =user.user

            // הפניה לדף Swagger בתגובה המוחזרת
            response.status(200).json({ data, swaggerUrl });
        }

    }
    catch (error) {
        response.status(503).json({ 'error': 'The request failed, try again later', error });
    }
});

router.post('/signup', async (request, response) => {
    try {
        const Query = request.body;
        const email = Query.email;
        const password = Query.password;
        const loginUrl = 'https://skyrocket.onrender.com/login.html';
        const user = await bl.signup(email, password)
        if (user.e === "yes") {
            response.status(409).json({"e":"yes", "error":`${user.error}`,"loginUrl": loginUrl });

        }
        else{
            if (user.response.mongo_id !== undefined) {
    
                // הפניה לדף login בתגובה המוחזרת
                response.status(200).json({"e":"no", "loginUrl": loginUrl });
            }
        }
    }
    catch (error) {
        response.status(503).json({ 'error': 'The request failed, try again later', error });
    }
});



// GET by search
router.get('/users/search', async (request, response) => {
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
            if (user !== 'Postponed') {
                response.status(200).json(user)
            }
            else {
                response.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id '${search}'` })
            }
        }
        else {
            response.status(404).json({ "error": `cannot find user with id '${search}'` })
        }
    }
    catch (error) {
        response.status(503).json({ "error": `The request failed, try again later '${error}'` })
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
                response.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id '${user_id}'` })
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
            response.status(201).json(result)
        }
        else if (result === 'rejected') {
            response.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` })
        }
        else {
            response.status(503).json({ "error": `The request failed, try again later` })
        }
    } catch (error) {
    }
    response.status(503).json({ "error": `The request failed, try again later ${error}` })

})

// PUT 

router.put('/users/:id', async (request, response) => {
    const user_id = parseInt(request.params.id)
    const user = await bl.get_by_id_user('id', user_id)
    if (user) {
        try {
            const updated_user_req = request.body
            const result = await bl.update_user(user_id, updated_user_req)
            if (result) {
                response.status(201).json(result)
            }
            else {
                response.status(409).json({ "error": `${updated_user_req.email} already exists` })
            }
        }
        catch (error) {
            response.status(503).json({ "error": `The request failed, try again later ${error}` })
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

module.exports = router








