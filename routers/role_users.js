const express = require('express')
const router = express.Router()
const qrcode = require('qrcode');
const bl = require('../bl/bl_role_users');
const { log } = require('winston');


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
        const email = request.body.email;
        const datas = await bl.authcode(email)
        if (datas.e === "yes") {
            response.status(409).json({ "e": "yes", "errors": `${datas.error}` });
        } else {
            if (datas.code !== undefined) {
                response.status(200).json({ datas });
            }
        }
    } catch (error) {
        response.status(503).json({ 'error': 'The request failed, try again later', error });
    }
});

router.post('/validation', async (request, response) => {
    try {
        const email = request.body.email;
        const code = request.body.code;
        const datas = await bl.login_code(email, code)
        if (datas.e === "yes") {
            response.status(409).json({ "e": "yes", "error": `${datas.error}` });

        }
        else {
            const token = datas.jwt
            response.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
            });
            // בניית הקישור לדף Swagger
            const swaggerUrl = 'https://skyrocket.onrender.com/search_form.html';

            // הפניה לדף Swagger בתגובה המוחזרת
            response.status(200).json({ datas, swaggerUrl });
        }

    }
    catch (error) {
        response.status(503).json({ 'error': 'The request failed, try again later', error });
    }
});
router.get('/ip', async (request, response) => {

    const forwardedFor = request.headers['x-forwarded-for'];
    const clientIPs = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : [];
    const ip = clientIPs.length > 0 ? clientIPs[0] : undefined;
    let country = request.headers['cf-ipcountry'];
    if (country === undefined) {
        country = "il"
    }
    response.status(200).json({ country });


});
router.get('/email', async (request, response) => {
    const query = request.query
    const email = query.email
    try {
        const check = await bl.valid_email(email)
      
            response.status(200).json(check)
        
    }

    catch (error) {
        response.status(503).json({ "e": "yes", "status": e })
    }

});

router.post('/login', async (request, response) => {

    const forwardedFor = request.headers['x-forwarded-for'];
    const clientIPs = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : [];
    const ip = clientIPs.length > 0 ? clientIPs[0] : undefined;
    const userAgent = request.headers['user-agent'];
    const email = request.body.email;
    const password = request.body.password;

    try {
        // בדיקת תקינות קלט
        if (!email || !password) {
            throw new Error('Invalid email or password');
        }

        // קריאה לשירות חיצוני עם נתונים המקושרים לקלט
        const datas = await bl.login(email, password, ip, userAgent);

        if (datas.e === "yes") {
            // החזרת תגובת שגיאה במקרה של שגיאה מהשירות החיצוני
            response.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            // הגדרת טוקן ושליחתו בעוגיה
            const token = datas.jwt;
            response.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
            });

            // בניית הקישור לדף Swagger
            const swaggerUrl = 'https://skyrocket.onrender.com/search_form.html';

            // הפניה לדף Swagger בתגובה המוחזרת
            response.status(200).json({ "e": datas.e, "jwt": datas.jwt, "swaggerUrl": swaggerUrl });
        }

    } catch (error) {
        // טיפול בשגיאה במידה והיא מתרחשת
        response.status(503).json({ 'error': 'The request failed, try again later', error: error.message });
    }

});

router.post('/signup', async (request, response) => {
    try {
        console.log("tt",request.body);
        
        const email = request.body.email;
        const password = request.body.password;
        const authProvider=request.body.authProvider;
        const loginUrl = 'https://skyrocket.onrender.com/login.html';
        const user = await bl.signup(email, password,authProvider)
        console.log("2925",user);
        
        if (user.e === "yes") {
            response.status(409).json({ "e": "yes", "error": `${user.error}`, "loginUrl": loginUrl });

        }
        else {
            if (user.response.mongo_id !== undefined) {

                // הפניה לדף login בתגובה המוחזרת
                response.status(200).json({ "e": "no", "id": user.response.id });
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
    console.log("ראטור",query);
    
    // const username = query.username
    // const password = query.password
    // const id = query.id
    // let search = email ? email : username ? username : password ? password : id;
    // let type = search !== undefined ? (search === email ? "email" : search === username ? "username" : search === password ? "password" : "id") : undefined;

    try {
        const user = await bl.get_by_email_user(email)
        console.log("user",user);

        if (!user ||user == null) {
            return response.status(404).json({ error: `Cannot find user with email: '${email}'` });
        }
    
        
        return response.status(200).json({ e: "no", status: true, authProvider: user });

     
    }
    catch (error) {
        console.error("Error fetching user:", error);
        response.status(500).json({ error: "Internal Server Error. Please try again later." });
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
    const signupUrl = 'https://skyrocket.onrender.com/login.html';

    const new_user = request.body
    const user = await bl.new_customer(new_user)
    if (user) {
        response.status(201).json({ "e": "no", "signupUrl": signupUrl })
    }
    else {
        response.status(409).json({ "e": "yes", "error": `There is a customer with the details I mentioned` })
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

//role_users/chairs

router.get('/chairs/:id', async (request, response) => {
    const id = parseInt(request.params.id)
    console.log(id);
    const result = await bl.get_all_chairs_by_flight(id)
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








