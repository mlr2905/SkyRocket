const bl = require('../bl/bl_role_users');
const logger = require('../logger/my_logger');
// const qrcode = require('qrcode');

// exports.signupWebAuthn = async (req, res) => {
//     try {
//         const datas = await bl.signupWebAuthn(req)
//         if (datas.e) {


//         }
//     } catch (error) {
//         logger.error('Error in auth code generation:', error)
//         res.status(503).json({ 'error': 'The request failed, try again later', error });
//     }
// }

// exports.loginWebAuthn = async (req, res) => {
//     try {
//         const datas = await bl.loginWebAuthn(req)

//         if (datas.e === "yes") {
//             // החזרת תגובת שגיאה במקרה של שגיאה מהשירות החיצוני
//             logger.warn(`Login failed for ${email}: ${datas.error}`)
//             res.status(409).json({ "e": "yes", "error": datas.error });
//         } else {
//             // הגדרת טוקן ושליחתו בעוגיה
//             logger.info(`Login successful for ${email}`)
//             const token = datas.jwt;
//             res.cookie('sky', token, {
//                 httpOnly: true,
//                 sameSite: 'strict',
//                 maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות במילישניות
//             });
//             logger.debug(`JWT cookie set for ${email}`)

//             // בניית הקישור לדף Swagger
//             const swaggerUrl = 'https://skyrocket.onrender.com/search_form.html';

//             // הפניה לדף Swagger בתגובה המוחזרת
//             res.status(200).json({ "e": datas.e, "jwt": datas.jwt, "swaggerUrl": swaggerUrl });

//         }
//     } catch (error) {
//         logger.error('Error in auth code generation:', error)
//         res.status(503).json({ 'error': 'The request failed, try again later', error });
//     }
// }

exports.signupWebAuthn = async (req) => {
    console.log("כניסה א");
    
    try {
        logger.info('WebAuthn registration request received');
        
        // קריאה ל-Business Logic
        const result = await bl.signupWebAuthn(req);
        
        // אם ה-BL כבר שלח תגובה, לא נשלח שוב
        if (res.headersSent) {
            return;
        }

        // טיפול בתגובה מה-BL (במקרה שהוא מחזיר ולא שולח ישירות)
        if (result) {
            if (result.e === "yes") {
                logger.warn(`Registration failed: ${result.error}`);
                return res.status(400).json({ 
                    "e": "yes", 
                    "error": result.error 
                });
            } else {
                logger.info('Registration successful');
                return res.status(201).json(result);
            }
        }

    } catch (error) {
        logger.error('Error in WebAuthn registration:', error);
        
        // בדיקה אם כבר נשלחה תגובה
        if (!res.headersSent) {
            res.status(503).json({ 
                'e': 'yes',
                'error': 'Registration service temporarily unavailable, please try again later'
            });
        }
    }
};

/**
 * Router function for WebAuthn authentication
 */
exports.loginWebAuthn = async (req) => {
    const email = req.body?.email || 'unknown';
    
    try {
        logger.info(`WebAuthn login attempt for: ${email}`);
        
        // קריאה ל-Business Logic
        const result = await bl.loginWebAuthn(req);
        
        // אם ה-BL כבר שלח תגובה, לא נשלח שוב
        if (res.headersSent) {
            return;
        }

        // טיפול בתגובה מה-BL (במקרה שהוא מחזיר ולא שולח ישירות)
        if (result) {
            if (result.e === "yes") {
                logger.warn(`Login failed for ${email}: ${result.error}`);
                return res.status(401).json({ 
                    "e": "yes", 
                    "error": result.error 
                });
            } else if (result.e === "no" && result.jwt) {
                logger.info(`Login successful for ${email}`);
                
                // הגדרת JWT בעוגיה
                const token = result.jwt;
                res.cookie('sky', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // HTTPS בפרודקשן
                    sameSite: 'strict',
                    maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות
                });
                
                logger.debug(`JWT cookie set for ${email}`);

                // בניית תגובה מוצלחת
                const response = {
                    "e": "no",
                    "code": "login_succeeded",
                    "message": "Authentication successful",
                    "jwt": token,
                    "user": result.user,
                    "redirectUrl": "https://skyrocket.onrender.com/search_form.html"
                };

                return res.status(200).json(response);
            }
        }

        // במקרה של תגובה לא צפויה
        logger.error(`Unexpected response format from BL for ${email}`);
        return res.status(500).json({
            "e": "yes",
            "error": "Unexpected authentication response"
        });

    } catch (error) {
        logger.error(`Error in WebAuthn login for ${email}:`, error);
        
        // בדיקה אם כבר נשלחה תגובה
        if (!res.headersSent) {
            res.status(503).json({ 
                'e': 'yes',
                'error': 'Authentication service temporarily unavailable, please try again later'
            });
        }
    }
};


exports.authCode = async (req, res) => {
    try {
        logger.info('Processing auth code request')
        const email = req.body.email;
        logger.debug(`Auth code requested for email: ${email}`)

        const datas = await bl.authcode(email)
        if (datas.e === "yes") {
            logger.warn(`Auth code generation failed for ${email}: ${datas.error}`)
            res.status(409).json({ "e": "yes", "errors": `${datas.error}` });
        } else {
            if (datas.code !== undefined) {
                logger.info(`Auth code successfully generated for ${email}`)
                res.status(200).json({ datas });
            }
        }
    } catch (error) {
        logger.error('Error in auth code generation:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
}

exports.validation = async (req, res) => {
    try {
        const email = req.body.email;
        const code = req.body.code;
        logger.info(`Processing code validation for email: ${email}`)
        logger.debug(`Validating code for ${email}`)

        const datas = await bl.login_code(email, code)
        if (datas.e === "yes") {
            logger.warn(`Code validation failed for ${email}: ${datas.error}`)
            res.status(409).json({ "e": "yes", "error": `${datas.error}` });
        }
        else {
            logger.info(`Code validation successful for ${email}`)
            const token = datas.jwt
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות במילישניות
            });
            logger.debug(`JWT cookie set for ${email}`)

            // בניית הקישור לדף Swagger
            const swaggerUrl = 'https://skyrocket.onrender.com/search_form.html';

            // הפניה לדף Swagger בתגובה המוחזרת
            res.status(200).json({ datas, swaggerUrl });
        }
    }
    catch (error) {
        logger.error('Error in code validation:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.ip = async (req, res) => {
    logger.debug('IP lookup request received')

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIPs = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : [];
    const ip = clientIPs.length > 0 ? clientIPs[0] : undefined;
    let country = req.headers['cf-ipcountry'];

    if (country === undefined) {
        logger.debug('Country code not found in headers, defaulting to "il"')
        country = "il"
    } else {
        logger.debug(`Country code identified as: ${country}`)
    }

    res.status(200).json({ country });
};

exports.email = async (req, res) => {
    const query = req.query
    const email = query.email
    logger.info(`Email validation request for: ${email}`)

    try {
        const check = await bl.valid_email(email)
        logger.debug(`Email validation result for ${email}: ${JSON.stringify(check)}`)
        res.status(200).json(check)
    }
    catch (error) {
        logger.error(`Email validation error for ${email}:`, error)
        res.status(503).json({ "e": "yes", "status": error })
    }
};

exports.login = async (req, res) => {
    logger.info('Processing login request')

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIPs = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : [];
    const ip = clientIPs.length > 0 ? clientIPs[0] : undefined;
    const userAgent = req.headers['user-agent'];
    const email = req.body.email;
    const password = req.body.password;

    logger.debug(`Login attempt for email: ${email}, IP: ${ip}`)

    try {
        // בדיקת תקינות קלט
        if (!email || !password) {
            logger.warn(`Login failed - invalid credentials: email=${!!email}, password=${!!password}`)
            throw new Error('Invalid email or password');
        }

        // קריאה לשירות חיצוני עם נתונים המקושרים לקלט
        const datas = await bl.login(email, password, ip, userAgent);

        if (datas.e === "yes") {
            // החזרת תגובת שגיאה במקרה של שגיאה מהשירות החיצוני
            logger.warn(`Login failed for ${email}: ${datas.error}`)
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            // הגדרת טוקן ושליחתו בעוגיה
            logger.info(`Login successful for ${email}`)
            const token = datas.jwt;
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות במילישניות
            });
            logger.debug(`JWT cookie set for ${email}`)

            // בניית הקישור לדף Swagger
            const swaggerUrl = 'https://skyrocket.onrender.com/search_form.html';

            // הפניה לדף Swagger בתגובה המוחזרת
            res.status(200).json({ "e": datas.e, "jwt": datas.jwt, "swaggerUrl": swaggerUrl });
        }
    } catch (error) {
        // טיפול בשגיאה במידה והיא מתרחשת
        logger.error('Login error:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error: error.message });
    }
};

exports.signup = async (req, res) => {
    try {
        logger.info('Processing signup request')
        logger.debug(`Signup request body: ${JSON.stringify(req.body)}`)

        const email = req.body.email;
        const password = req.body.password;
        const authProvider = req.body.authProvider;
        const loginUrl = 'https://skyrocket.onrender.com/login.html';

        logger.debug(`Attempting signup for ${email} with auth provider: ${authProvider}`)
        const user = await bl.signup(email, password, authProvider)
        logger.debug(`Signup response: ${JSON.stringify(user)}`)

        if (user.e === "yes") {
            logger.warn(`Signup failed for ${email}: ${user.error}`)
            res.status(409).json({ "e": "yes", "error": `${user.error}`, "loginUrl": loginUrl });
        }
        else {
            if (user.res.mongo_id !== undefined) {
                logger.info(`Signup successful for ${email} with ID: ${user.res.id}`)
                // הפניה לדף login בתגובה המוחזרת
                res.status(200).json({ "e": "no", "id": user.res.id });
            }
        }
    }
    catch (error) {
        logger.error('Signup error:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.usersSearch = async (req, res) => {
    const query = req.query
    const email = query.email
    logger.info(`User search request for email: ${email}`)
    logger.debug(`Search query: ${JSON.stringify(query)}`)

    try {
        const user = await bl.get_by_email_user(email)
        logger.debug(`Search result for ${email}: ${JSON.stringify(user)}`)

        if (!user) {
            logger.warn(`User not found for email: ${email}`)
            return res.status(404).json({ error: `Cannot find user with email: '${email}'` });
        }

        logger.info(`User found for email: ${email}`)
        return res.status(200).json({ e: "no", status: true, authProvider: user });
    }
    catch (error) {
        logger.error(`User search error for ${email}:`, error)
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
};

exports.usersById = async (req, res) => {
    const user_id = parseInt(req.params.id)
    logger.info(`User details request for ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_user('id', user_id)
        if (user) {
            if (user !== 'Postponed') {
                logger.info(`User details found for ID: ${user_id}`)
                res.status(200).json(user)
            }
            else {
                logger.warn(`Access denied for user ID: ${user_id}`)
                res.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id '${user_id}'` })
            }
        }
        else {
            logger.warn(`User not found for ID: ${user_id}`)
            res.status(404).json({ "error": `cannot find user with id '${user_id}'` })
        }
    }
    catch (error) {
        logger.error(`Error fetching user ID: ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later '${error}'` })
    }
};


exports.createUser = async (req, res) => {
    const new_user = req.body
    logger.info('Creating new user')
    logger.debug(`New user data: ${JSON.stringify(new_user)}`)

    try {
        const result = await bl.create_user(new_user)
        if (result.ok) {
            logger.info(`User created successfully: ${new_user.username || new_user.email}`)
            res.status(201).json(result)
        }
        else if (result === 'rejected') {
            logger.warn(`User creation rejected - duplicate user: ${new_user.username || new_user.email}`)
            res.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` })
        }
        else {
            logger.error('User creation failed')
            res.status(503).json({ "error": `The request failed, try again later` })
        }
    } catch (error) {
        logger.error('Error creating user:', error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.updateUser = async (req, res) => {
    const user_id = parseInt(req.params.id)
    logger.info(`Updating user with ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_user('id', user_id)
        if (user) {
            const updated_user_req = req.body
            logger.debug(`Update data for user ID ${user_id}: ${JSON.stringify(updated_user_req)}`)

            const result = await bl.update_user(user_id, updated_user_req)
            if (result) {
                logger.info(`User ${user_id} updated successfully`)
                res.status(201).json(result)
            }
            else {
                logger.warn(`User update failed - email already exists: ${updated_user_req.email}`)
                res.status(409).json({ "error": `${updated_user_req.email} already exists` })
            }
        }
        else {
            logger.warn(`User update failed - user not found: ${user_id}`)
            res.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` })
            return
        }
    }
    catch (error) {
        logger.error(`Error updating user ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.deleteUser = async (req, res) => {
    const user_id = parseInt(req.params.id)
    logger.info(`Deleting user with ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_user(user_id)
        if (user) {
            const result = await bl.delete_account(user_id)
            logger.info(`User ${user_id} deleted successfully`)
            res.status(204).json({ result })
        }
        else {
            logger.warn(`User deletion failed - user not found: ${user_id}`)
            res.status(404).json({ "error": `The ID ${user_id} you specified does not exist ` })
        }
    }
    catch (error) {
        logger.error(`Error deleting user ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};


exports.customersById = async (req, res) => {
    const user_id = parseInt(req.params.id)
    logger.info(`Customer details request for ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_customer(user_id)
        if (user) {
            logger.info(`Customer details found for ID: ${user_id}`)
            res.status(200).json(user)
        }
        else {
            logger.warn(`Customer not found for ID: ${user_id}`)
            res.status(404).json({ "error": `cannot find user with id ${user_id}` })
        }
    }
    catch (error) {
        logger.error(`Error fetching customer ID: ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.createCustomer = async (req, res) => {
    const signupUrl = 'https://skyrocket.onrender.com/login.html';
    const new_user = req.body
    logger.info('Creating new customer')
    logger.debug(`New customer data: ${JSON.stringify(new_user)}`)

    try {
        const user = await bl.new_customer(new_user)
        if (user) {
            logger.info('Customer created successfully')
            res.status(201).json({ "e": "no", "signupUrl": signupUrl })
        }
        else {
            logger.warn('Customer creation failed - duplicate customer')
            res.status(409).json({ "e": "yes", "error": `There is a customer with the details I mentioned` })
        }
    }
    catch (error) {
        logger.error('Error creating customer:', error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.updateCustomer = async (req, res) => {
    const user_id = parseInt(req.params.id)
    const updated_user_req = req.body
    logger.info(`Updating customer with ID: ${user_id}`)
    logger.debug(`Update data for customer ID ${user_id}: ${JSON.stringify(updated_user_req)}`)

    try {
        // user exists ==> perform update
        const result = await bl.update_customer(user_id, updated_user_req)
        logger.info(`Customer ${user_id} updated successfully`)
        res.json(updated_user_req)
    }
    catch (error) {
        logger.error(`Error updating customer ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.get_all_flights = async (req, res) => {
    logger.info('Retrieving all flights')
    try {
        const flights = await bl.get_all_flights()
        logger.debug(`Retrieved ${flights.length} flights`)
        res.json(flights)
    }
    catch (error) {
        logger.error('Error retrieving flights:', error)
        res.json({ 'error': JSON.stringify(error) })
    }
};

exports.getFlightById = async (req, res) => {
    const flight_id = parseInt(req.params.id)
    logger.info(`Flight details request for ID: ${flight_id}`)

    try {
        const flight = await bl.get_by_id_flights(flight_id)
        if (flight) {
            logger.info(`Flight details found for ID: ${flight_id}`)
            res.json(flight)
        }
        else {
            logger.warn(`Flight not found for ID: ${flight_id}`)
            res.status(404).json({ "error": `cannot find flight with id ${flight_id}` })
        }
    }
    catch (error) {
        logger.error(`Error fetching flight ID: ${flight_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.createTicket = async (req, res) => {
    const new_ticket = req.body
    logger.info('Creating new ticket')
    logger.debug(`New ticket data: ${JSON.stringify(new_ticket)}`)

    try {
        const result = await bl.purchase_ticket(new_ticket)
        logger.info('Ticket purchased successfully')
        res.status(201).json(result)
    }
    catch (error) {
        logger.error('Error purchasing ticket:', error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.getAllChairsByFlightId = async (req, res) => {
    const id = parseInt(req.params.id)
    logger.info(`Retrieving chairs for flight ID: ${id}`)

    try {
        const result = await bl.get_all_chairs_by_flight(id)
        logger.debug(`Retrieved ${result.length} chairs for flight ${id}`)
        res.status(201).json(result)
    }
    catch (error) {
        logger.error(`Error retrieving chairs for flight ${id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.createPassenger = async (req, res) => {
    const new_passenger = req.body
    logger.info('Creating new passenger')
    logger.debug(`New passenger data: ${JSON.stringify(new_passenger)}`)

    try {
        const result = await bl.new_passenger(new_passenger)
        logger.info('Passenger created successfully')
        res.status(201).json(result)
    }
    catch (error) {
        logger.error('Error creating passenger:', error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.PassengerById = async (req, res) => {
    const passenger_id = parseInt(req.params.id)
    logger.info(`Passenger details request for ID: ${passenger_id}`)

    try {
        const passenger = await bl.get_by_id_passenger(passenger_id)
        if (passenger) {
            logger.info(`Passenger details found for ID: ${passenger_id}`)
            res.status(200).json(passenger)
        }
        else {
            logger.warn(`Passenger not found for ID: ${passenger_id}`)
            res.status(404).json({ "error": `cannot find passenger with id ${passenger_id}` })
        }
    }
    catch (error) {
        logger.error(`Error fetching passenger ID: ${passenger_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
}; 