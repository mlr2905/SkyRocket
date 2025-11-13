const bl = require('../bl/bl_role_users');
const logger = require('../logger/my_logger');

// --- Internal helper function for ID translation ---
/**
* Calls BL to translate the mongo_id (from the token) to the PostgreSQL numeric ID.
* @param {object} req - the Express request object, containing req.user
* @returns {Promise<number>} - the numeric ID (e.g. 49)
* @throws {Error} - if the user is not found
*/
async function getNumericIdFromToken(req) {
    const mongoIdFromToken = req.user.id; // This is the Mongo ID (string)

    // Calling BL to get the full user information
    const user = await bl.get_by_id_user(mongoIdFromToken);

    if (user && user.id) {
        return user.id;
    }

    logger.warn(`User in token (mongo_id: ${mongoIdFromToken}) not found in PostgreSQL DB.`);
    throw new Error(`User not found for token.`);
}

// --- Authentication and WebAuthn functions (public) ---

exports.signupWebAuthn = async (req, res) => {
    logger.info('WebAuthn registration request received');
    try {
        const result = await bl.signupWebAuthn(req);
        logger.debug("BL signupWebAuthn result:", result);


        if (result && result.success === false) {

            logger.warn(`Registration failed: ${result.error}`);
            return res.status(400).json({ "e": "yes", "error": result.error, "success": false });

        } else {
            logger.info('Registration successful');

            const token = result.data?.token;

            if (token) {
                logger.info('Setting login cookie after registration');
                res.cookie('sky', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
                });
            }

            return res.status(201).json(result.data);
        }
    } catch (error) {
        logger.error('Error in WebAuthn registration:', error);
        res.status(500).json({ "e": "yes", "error": "Internal server error", "success": false });
    }
};


exports.loginWebAuthn = async (req, res) => {
const { email, credentialID, signature, clientDataJSON } = req.body;

logger.info(`WebAuthn login attempt for: ${email || 'unknown'}`);

if (!email || !credentialID || !signature || !clientDataJSON) {
    logger.warn(`Missing required fields for ${email || 'unknown'}.`);
    logger.debug(`[Debug] Email: ${!!email}, CredID: ${!!credentialID}, Sig: ${!!signature}, CData: ${!!clientDataJSON}`);
    return res.status(400).json({ "e": "yes", "error": "Missing required fields" });
}


try {
    const { authenticatorData } = req.body;

    const authData = { credentialID, email, signature, authenticatorData, clientDataJSON };
    const result = await bl.loginWebAuthn(authData); 

    if (result && result.success === true) {
        const token = result.token || result.data?.jwt;
        const user = result.user || result.data?.user;

        if (token && user) {
            logger.info(`WebAuthn login successful for ${email}`);

            // 1. Setting the secure cookie
            res.cookie('sky', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            });
            logger.debug(`JWT cookie set for ${email}`);

            res.status(200).json({
                "e": "no",
                "jwt": token,
                "id": user.id,
                "mongo_id": user.mongo_id,
                "email": user.email,
                "redirectUrl": "https://skyrocket.onrender.com/search_form.html"
            });
        } else {
            logger.warn(`No JWT/user object in successful response for ${email}`);
            res.status(500).json({ "e": "yes", "error": "Auth succeeded but no token/user received" });
        }
    } else {
        logger.warn(`WebAuthn login failed for ${email}: ${result.error}`);
        res.status(401).json({ "e": "yes", "error": result.error || "Authentication failed" });
    }
} catch (error) {
    logger.error(`Error in WebAuthn login for ${email}:`, error);
    res.status(500).json({ "e": "yes", "error": "Internal server error" });
}
};

exports.authCode = async (req, res) => {
    try {
        const email = req.body.email;
        logger.info(`Processing auth code request for ${email}`);
        if (!email) {
            logger.warn('Auth code request with no email');
            return res.status(400).json({ "e": "yes", "error": "Email is required" });
        }

        const datas = await bl.authcode(email);
        if (datas.e === "yes") {
            logger.warn(`Auth code generation failed for ${email}: ${datas.error}`);
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            logger.info(`Auth code successfully generated for ${email}`);
            res.status(200).json({ e: "no", datas });
        }
    } catch (error) {
        logger.error('Error in auth code generation:', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.validation = async (req, res) => {
    try {
        const email = req.body.email;
        const code = req.body.code;
        logger.info(`Processing code validation for email: ${email}`);

        const datas = await bl.login_code(email, code);
        if (datas.e === "yes") {
            logger.warn(`Code validation failed for ${email}: ${datas.error}`);
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            logger.info(`Code validation successful for ${email}`);
            const token = datas.jwt;

            // 1. Setting the secure cookie
            res.cookie('sky', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            });
            logger.debug(`JWT cookie set for ${email}`);


            res.status(200).json({
                "e": "no",
                "jwt": token,
                "id": datas.id,
                "mongo_id": datas.mongo_id,
                "email": datas.email,
                "redirectUrl": 'https://skyrocket.onrender.com/search_form.html'
            });
        }
    } catch (error) {
        logger.error('Error in code validation:', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.login = async (req, res) => {
    logger.info('Processing login request');
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim();
    const userAgent = req.headers['user-agent'];

    logger.debug(`Login attempt for email: ${email}, IP: ${ip}`);

    try {
        if (!email || !password) {
            logger.warn(`Login failed - invalid credentials`);
            return res.status(400).json({ "e": "yes", "error": "Invalid email or password" });
        }

        const datas = await bl.login(email, password, ip, userAgent);

        if (datas.e === "yes") {
            logger.warn(`Login failed for ${email}: ${datas.error}`);
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            logger.info(`Login successful for ${email}`);
            const token = datas.jwt;

            logger.debug(`Returning JWT and user data to caller (HandleAuth) for ${email}`);

            res.status(200).json({
                "e": datas.e,
                "jwt": token,
                "id": datas.id,
                "mongo_id": datas.mongo_id,
                "email": datas.email,
                "redirectUrl": 'https://skyrocket.onrender.com/search_form.html'
            });
        }
    } catch (error) {
        logger.error('Login error:', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error: error.message });
    }
};

exports.signup = async (req, res) => {
    try {
        logger.info('Processing signup request');
        const { email, password, authProvider } = req.body;

        const user = await bl.signup(email, password, authProvider);
        logger.debug(`Signup response: ${JSON.stringify(user)}`);

        if (user.e === "yes") {
            logger.warn(`Signup failed for ${email}: ${user.error}`);
            res.status(409).json({ "e": "yes", "error": user.error, "loginUrl": 'https://skyrocket.onrender.com/login.html' });
        } else {
            logger.info(`Signup successful for ${email} with ID: ${user.res.id}`);
            res.status(200).json({ "e": "no", "id": user.res.id });
        }
    } catch (error) {
        logger.error('Signup error:', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

// --- Search functions (public) ---

exports.ip = async (req, res) => {
    let country = req.headers['cf-ipcountry'] || "il";
    logger.debug(`IP lookup request. Country code: ${country}`);
    res.status(200).json({ country });
};

exports.email = async (req, res) => {
    const email = req.query.email;
    logger.info(`Email validation request for: ${email}`);
    try {
        const check = await bl.valid_email(email);
        res.status(200).json(check);
    } catch (error) {
        logger.error(`Email validation error for ${email}:`, error);
        res.status(503).json({ "e": "yes", "status": error });
    }
};

exports.usersSearch = async (req, res) => {
    const email = req.query.email;
    logger.info(`User search request for email: ${email}`);
    try {
        const user = await bl.get_by_email_user(email);
        if (!user) {
            logger.warn(`User not found for email: ${email}`);
            return res.status(404).json({ error: `Cannot find user with email: '${email}'` });
        }
        logger.info(`User found for email: ${email}`);
        return res.status(200).json({ e: "no", status: true, authProvider: user });
    } catch (error) {
        logger.error(`User search error for ${email}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAllOriginCountries = async (req, res) => {
    logger.info('Received request for all origin countries');
    try {
        const countries = await bl.get_all_origin_countries();
        res.status(200).json(countries);
    } catch (error) {
        logger.error('Error in getAllOriginCountries controller:', error);
        res.status(500).json({ "error": "The request failed, try again later" });
    }
};

exports.getDestinationsFromOrigin = async (req, res) => {
    logger.info('Received request for destinations from origin');
    try {
        const originId = req.query.origin_id;
        const destinations = await bl.get_destinations_from_origin(originId);
        res.status(200).json(destinations);
    } catch (error) {
        logger.error('Error in getDestinationsFromOrigin controller:', error);
        res.status(500).json({ "error": "The request failed, try again later" });
    }
};

exports.getFilteredFlights = async (req, res) => {
    logger.info('Received request for filtered flights');
    try {
        const filters = {
            origin_country_id: req.query.origin_country_id,
            destination_country_id: req.query.destination_country_id,
            date: req.query.date
        };
        const flights = await bl.get_filtered_flights(filters);
        res.status(200).json(flights);
    } catch (error) {
        logger.error('Error in getFilteredFlights controller:', error);
        res.status(500).json({ "error": "The request failed, try again later" });
    }
};

exports.get_all_flights = async (req, res) => {
    logger.info('Retrieving all flights');
    try {
        const flights = await bl.get_all_flights();
        res.json(flights);
    } catch (error) {
        logger.error('Error retrieving flights:', error);
        res.json({ 'error': JSON.stringify(error) });
    }
};

exports.getFlightById = async (req, res) => {
    const flight_id = parseInt(req.params.id);
    logger.info(`Flight details request for ID: ${flight_id}`);
    try {
        const flight = await bl.get_by_id_flights(flight_id);
        if (flight) {
            res.json(flight);
        } else {
            res.status(404).json({ "error": `Cannot find flight with id ${flight_id}` });
        }
    } catch (error) {
        logger.error(`Error fetching flight ID: ${flight_id}:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

// --- Secure paths (requires 'protect' middleware) ---

exports.getMyDetails = async (req, res) => {
    const mongoIdFromToken = req.user.id;
    logger.info(`Fetching details for user (mongo_id): ${mongoIdFromToken}`);

    try {
        const user = await bl.get_by_id_user(mongoIdFromToken);
        if (user && user !== 'Postponed' && user !== false) {
            res.status(200).json({
                id: user.id,
                username: user.username,
                email: user.email,
                mongo_id: user.mongo_id,
                role_id: user.role_id
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        logger.error(`Error fetching user details for mongo_id: ${mongoIdFromToken}:`, error);
        res.status(503).json({ "error": "Failed to retrieve user details", error });
    }
};

exports.usersById = async (req, res) => {
    // This is a secure path, but it reads details by ID from the URL
    // This is useful for admins, but for a regular user it is better to use /me
    const user_id = req.params.id;
    logger.info(`User details request for ID: ${user_id}`);
    try {
        const user = await bl.get_by_id_user(user_id);
        if (user && user !== 'Postponed') {
            res.status(200).json(user);
        } else if (user === false) {
            res.status(404).json({ "error": `Cannot find user with id '${user_id}'` });
        } else {
            res.status(403).json({ "error": `Access denied` });
        }
    } catch (error) {
        res.status(503).json({ "error": `The request failed, try again later '${error}'` });
    }
};

exports.createUser = async (req, res) => {
    logger.info('Creating new user (createUser)');
    try {
        const result = await bl.create_user(req.body);
        if (result.ok) {
            res.status(201).json(result);
        } else if (result === 'rejected') {
            res.status(409).json({ "error": `Username ${req.body.username} or email ${req.body.email} exist` });
        } else {
            res.status(503).json({ "error": `The request failed` });
        }
    } catch (error) {
        logger.error('Error creating user:', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.updateUser = async (req, res) => {
    logger.info(`Attempting user self-update`);
    try {
        const numeric_id = await getNumericIdFromToken(req);

        const updated_user_req = req.body;
        logger.debug(`Update data for user ID ${numeric_id}: ${JSON.stringify(updated_user_req)}`);

        const result = await bl.update_user(numeric_id, updated_user_req);
        if (result) {
            logger.info(`User ${numeric_id} updated successfully`);
            res.status(201).json(result);
        } else {
            logger.warn(`User update failed - email already exists: ${updated_user_req.email}`);
            res.status(409).json({ "error": `${updated_user_req.email} already exists` });
        }
    } catch (error) {
        logger.error(`Error updating user:`, error);
        res.status(503).json({ "error": `The request failed, try again later ${error.message}` });
    }
};

exports.deleteMe = async (req, res) => {
    const mongo_id_from_token = req.user.id;
    logger.info(`Attempting self-deletion for user (mongo_id): ${mongo_id_from_token}`);

    try {
        const user = await bl.get_by_id_user(mongo_id_from_token);
        if (user && user.id) {
            const numeric_id = user.id;
            logger.debug(`Found numeric ID ${numeric_id} for mongo_id ${mongo_id_from_token}`);

            const result = await bl.delete_account(numeric_id);
            logger.info(`User ${numeric_id} deleted successfully`);

            res.clearCookie('sky');
            res.status(200).json({ message: result });
        } else {
            logger.warn(`User self-deletion failed - user not found: ${mongo_id_from_token}`);
            res.status(404).json({ "error": `User not found` });
        }
    } catch (error) {
        logger.error(`Error deleting user ${mongo_id_from_token}:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.deleteUser = async (req, res) => {

    logger.warn(`Manual delete request for user ID: ${req.params.id}. This should be an admin function.`);
    try {
        const numeric_id = parseInt(req.params.id, 10);
        if (isNaN(numeric_id)) {
            return res.status(400).json({ error: "Invalid numeric ID" });
        }

        const numeric_id_from_token = await getNumericIdFromToken(req);
        if (numeric_id !== numeric_id_from_token) {
            logger.warn(`Security violation: User ${numeric_id_from_token} tried to delete user ${numeric_id}`);
            return res.status(403).json({ error: "You can only delete your own account." });
        }

        return exports.deleteMe(req, res);

    } catch (error) {
        logger.error(`Error deleting user:`, error);
        res.status(503).json({ "error": `The request failed, try again later ${error.message}` });
    }
};

// --- Secure paths (client) ---
exports.verifyCustomerCvv = async (req, res) => {
    logger.info('Received request to verify CVV');
    try {
        const numeric_id = await getNumericIdFromToken(req);

        const { cvv } = req.body;
        if (!cvv) {
            return res.status(400).json({ "e": "yes", "error": "No CVV provided." });
        }

        const result = await bl.verify_cvv(numeric_id, cvv);

        if (!result.success) {
            res.status(401).json({ "e": "yes", "error": result.message });
        } else {

            res.status(200).json({ "e": "no", "message": result.message });
        }

    } catch (error) {
        logger.error('Error in verifyCustomerCvv controller:', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.customersById = async (req, res) => {
    logger.info(`Customer details request`);
    try {
        const numeric_id = await getNumericIdFromToken(req);

        const customer = await bl.get_by_id_customer(numeric_id);
        if (customer) {
            logger.info(`Customer details found for user ID: ${numeric_id}`);
            res.status(200).json(customer);
        } else {
            logger.warn(`Customer not found for user ID: ${numeric_id}`);
            res.status(404).json({ "error": `Cannot find customer for user` });
        }
    } catch (error) {
        logger.error(`Error fetching customer for user:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.createCustomer = async (req, res) => {
    logger.info('Creating new customer');
    try {
        const numeric_id = await getNumericIdFromToken(req);
        const new_customer = req.body;
        new_customer.user_id = numeric_id;

        logger.debug(`New customer data for user ${numeric_id}: ${JSON.stringify(new_customer)}`);

        const user = await bl.new_customer(new_customer);
        if (user) {
            logger.info('Customer created successfully');
            res.status(201).json({ "e": "no" });
        } else {
            logger.warn('Customer creation failed (BL returned falsy)');
            res.status(409).json({ "e": "yes", "error": `Failed to create customer` });
        }
    } catch (error) {
        logger.error('Error creating customer:', error);
        if (error.message && error.message.includes('unique constraint')) {
            res.status(409).json({ "e": "yes", "error": "A customer with these details (e.g., credit card) already exists." });
        } else {
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    }
};

exports.updateCustomer = async (req, res) => {
    logger.info(`Updating customer`);
    try {
        const numeric_id = await getNumericIdFromToken(req);
        const updated_customer_req = req.body;

        logger.debug(`Update data for customer (user_id ${numeric_id}): ${JSON.stringify(updated_customer_req)}`);

        const result = await bl.update_customer(numeric_id, updated_customer_req);
        logger.info(`Customer for user ID ${numeric_id} updated successfully`);
        res.json(updated_customer_req);
    } catch (error) {
        logger.error(`Error updating customer for user:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

// --- Secure paths (order creation) ---

exports.createChairAssignment = async (req, res) => {
    logger.info('Received request to create chair assignment');
    try {
        const numeric_id = await getNumericIdFromToken(req);
        const chairData = req.body;
        chairData.user_id = numeric_id;

        logger.debug(`Chair assignment data for user ${numeric_id}: ${JSON.stringify(chairData)}`);

        const assignment = await bl.new_chair_assignment(chairData);
        res.status(201).json(assignment);
    } catch (error) {
        logger.error('Error in createChairAssignment controller:', error);
        if (error.code === '23505') {
            res.status(409).json({ "error": "This seat is already taken." });
        } else {
            res.status(500).json({ "error": "The request failed, try again later" });
        }
    }
};

exports.createTicket = async (req, res) => {
    logger.info('Creating new ticket');
    try {
        const numeric_id = await getNumericIdFromToken(req);
        const new_ticket = req.body;
        new_ticket.user_id = numeric_id;
        const customer = await bl.get_by_id_customer(numeric_id);

        if (!customer || !customer.id) {
            logger.warn(`Cannot create ticket: No customer record found for user_id: ${numeric_id}`);
            return res.status(404).json({ error: "Customer details not found. Please complete your profile first." });
        }

        new_ticket.customer_id = customer.id;
        logger.debug(`New ticket data for user ${numeric_id}: ${JSON.stringify(new_ticket)}`);

        const result = await bl.purchase_ticket(new_ticket);
        logger.info('Ticket purchased successfully');
        res.status(201).json(result);
    } catch (error) {
        logger.error('Error purchasing ticket:', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.deleteMyTicket = async (req, res) => {
    logger.info('Controller: Received request to delete my-ticket');
    try {
        const numeric_id = await getNumericIdFromToken(req);

        const ticket_id = parseInt(req.params.id, 10);
        if (isNaN(ticket_id)) {
            return res.status(400).json({ error: "Invalid ticket ID." });
        }

        const result = await bl.cancel_ticket(numeric_id, ticket_id);

        res.status(200).json(result);

    } catch (error) {
        logger.error('Error in deleteMyTicket controller:', error);
        if (error.message.includes("Not authorized")) {
            res.status(403).json({ "error": error.message });
        } else {
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    }
};

exports.createPassenger = async (req, res) => {
    logger.info('Creating new passenger');
    try {
        const numeric_id = await getNumericIdFromToken(req);
        const new_passenger = req.body;
        new_passenger.user_id = numeric_id;

        logger.debug(`New passenger data for user ${numeric_id}: ${JSON.stringify(new_passenger)}`);

        const result = await bl.new_passenger(new_passenger);
        logger.info('Passenger created successfully');
        res.status(201).json(result);
    } catch (error) {
        logger.error('Error creating passenger:', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

// --- Secure paths (reading information) ---

exports.getAllChairsByFlightId = async (req, res) => {
    const id = parseInt(req.params.id);
    logger.info(`Retrieving chairs for flight ID: ${id} (Protected)`);
    try {
        const result = await bl.get_all_chairs_by_flight(id);
        res.status(200).json(result);
    } catch (error) {
        logger.error(`Error retrieving chairs for flight ${id}:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.getMyTickets = async (req, res) => {
    logger.info('Controller: Received request for my-tickets');
    try {
        const numeric_id = await getNumericIdFromToken(req);

        const tickets = await bl.get_my_tickets(numeric_id);

        res.status(200).json(tickets);

    } catch (error) {
        logger.error('Error in getMyTickets controller:', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.PassengerById = async (req, res) => {

    const passenger_id = parseInt(req.params.id);
    logger.info(`Passenger details request for ID: ${passenger_id} (Protected)`);
    try {
        const passenger = await bl.get_by_id_passenger(passenger_id);
        if (passenger) {
            res.status(200).json(passenger);
        } else {
            res.status(404).json({ "error": `Cannot find passenger with id ${passenger_id}` });
        }
    } catch (error) {
        logger.error(`Error fetching passenger ID: ${passenger_id}:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};