const bl = require('../bl/bl_role_users');
const Log = require('../logger/logManager'); // שינוי: שימוש במנהל הלוגים

const FILE = 'usersController';

// --- Internal helper function for ID translation ---
/**
* Calls BL to translate the mongo_id (from the token) to the PostgreSQL numeric ID.
* @param {object} req - the Express request object, containing req.user
* @returns {Promise<number>} - the numeric ID (e.g. 49)
* @throws {Error} - if the user is not found
*/
async function getNumericIdFromToken(req) {
    const func = 'getNumericIdFromToken';
    const mongoIdFromToken = req.user.id; // This is the Mongo ID (string)

    // Calling BL to get the full user information
    const user = await bl.get_by_id_user(mongoIdFromToken);

    if (user && user.id) {
        return user.id;
    }

    Log.warn(FILE, func, mongoIdFromToken, 'User not found in PostgreSQL DB');
    throw new Error(`User not found for token.`);
}

// --- Authentication and WebAuthn functions (public) ---

exports.signupWebAuthn = async (req, res) => {
    const func = 'signupWebAuthn';
    Log.info(FILE, func, null, 'WebAuthn registration request received');
    
    try {
        const result = await bl.signupWebAuthn(req);
        Log.debug(FILE, func, null, `BL result: ${result.message || result.error}`);

        if (result && result.success === false) {
            Log.warn(FILE, func, null, `Registration failed: ${result.error}`);
            return res.status(400).json({ "e": "yes", "error": result.error, "success": false });
        } else {
            Log.info(FILE, func, null, 'Registration successful');

            const token = result.data?.token;
            if (token) {
                Log.info(FILE, func, null, 'Setting login cookie after registration');
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
        Log.error(FILE, func, null, 'Internal server error', error);
        res.status(500).json({ "e": "yes", "error": "Internal server error", "success": false });
    }
};

exports.loginWebAuthn = async (req, res) => {
    const func = 'loginWebAuthn';
    const { email, credentialID, signature, clientDataJSON } = req.body;

    Log.info(FILE, func, email, 'Login attempt');

    if (!email || !credentialID || !signature || !clientDataJSON) {
        Log.warn(FILE, func, email, 'Missing required fields');
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
                Log.info(FILE, func, user.id, `Login successful (Email: ${email})`);

                // 1. Setting the secure cookie
                res.cookie('sky', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
                });
                
                res.status(200).json({
                    "e": "no",
                    "jwt": token,
                    "id": user.id,
                    "mongo_id": user.mongo_id,
                    "email": user.email,
                    "redirectUrl": "https://skyrocket.onrender.com"
                });
            } else {
                Log.warn(FILE, func, email, 'Auth succeeded but no token/user received');
                res.status(500).json({ "e": "yes", "error": "Auth succeeded but no token/user received" });
            }
        } else {
            Log.warn(FILE, func, email, `Login failed: ${result.error}`);
            res.status(401).json({ "e": "yes", "error": result.error || "Authentication failed" });
        }
    } catch (error) {
        Log.error(FILE, func, email, 'Internal server error', error);
        res.status(500).json({ "e": "yes", "error": "Internal server error" });
    }
};


exports.authCode = async (req, res) => {
    const func = 'authCode';
    try {
        const email = req.user.email;
        Log.info(FILE, func, email, 'Processing auth code request');

        if (!email) {
            Log.warn(FILE, func, null, 'Auth code request with no email (from token)');
            return res.status(400).json({ "e": "yes", "error": "Authenticated user has no email" });
        }

        const datas = await bl.authcode(email);
        if (datas.e === "yes") {
            Log.warn(FILE, func, email, `Generation failed: ${datas.error}`);
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            Log.info(FILE, func, email, 'Successfully generated');
            res.status(200).json({ e: "no", datas });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error generating auth code', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.validation = async (req, res) => {
    const func = 'validation';
    try {
        const email = req.body.email;
        const code = req.body.code;
        Log.info(FILE, func, email, 'Processing code validation');

        const datas = await bl.login_code(email, code);
        if (datas.e === "yes") {
            Log.warn(FILE, func, email, `Validation failed: ${datas.error}`);
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            Log.info(FILE, func, email, 'Validation successful');
            const token = datas.jwt;

            // 1. Setting the secure cookie
            res.cookie('sky', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            });

            res.status(200).json({
                "e": "no",
                "jwt": token,
                "id": datas.id,
                "mongo_id": datas.mongo_id,
                "email": datas.email,
                "redirectUrl": 'https://skyrocket.onrender.com'
            });
        }
    } catch (error) {
        Log.error(FILE, func, req.body.email, 'Error during validation', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.login = async (req, res) => {
    const func = 'login';
    Log.info(FILE, func, null, 'Processing login request');
    
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim();
    const userAgent = req.headers['user-agent'];

    Log.debug(FILE, func, email, `[IP: ${ip}] - Login attempt`);

    try {
        if (!email || !password) {
            Log.warn(FILE, func, email, 'Login failed: invalid credentials');
            return res.status(400).json({ "e": "yes", "error": "Invalid email or password" });
        }

        const datas = await bl.login(email, password, ip, userAgent);

        if (datas.e === "yes") {
            Log.warn(FILE, func, email, `Login failed: ${datas.error}`);
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            Log.info(FILE, func, datas.id, `Login successful (Email: ${email})`);
            const token = datas.jwt;

            res.status(200).json({
                "e": datas.e,
                "jwt": token,
                "id": datas.id,
                "mongo_id": datas.mongo_id,
                "email": datas.email,
                "redirectUrl": 'https://skyrocket.onrender.com'
            });
        }
    } catch (error) {
        Log.error(FILE, func, email, 'Error during login', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error: error.message });
    }
};

exports.signup = async (req, res) => {
    const func = 'signup';
    try {
        const { email, password, authProvider } = req.body;
        Log.info(FILE, func, email, 'Processing signup request');

        const user = await bl.signup(email, password, authProvider);
        
        if (user.e === "yes") {
            Log.warn(FILE, func, email, `Signup failed: ${user.error}`);
            res.status(409).json({ "e": "yes", "error": user.error, "loginUrl": 'https://skyrocket.onrender.com/login.html' });
        } else {
            Log.info(FILE, func, user.res.id, 'Signup successful');
            res.status(200).json({ "e": "no", "id": user.res.id });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error during signup', error);
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

// --- Search functions (public) ---

exports.ip = async (req, res) => {
    const func = 'ip';
    const COUNTRY_API_URL = 'https://restcountries.com/v3.1/alpha/';
    const API_FIELDS = '?fields=name';
    const defaultResponse = { id: "IL", name: "Israel" };

    try {
        const countryCode = req.headers['cf-ipcountry'];
        
        if (!countryCode) {
            Log.debug(FILE, func, null, 'No header, returning default');
            return res.status(200).json(defaultResponse);
        }

        Log.debug(FILE, func, null, `Received code: ${countryCode}`);

        try {
            const externalResponse = await fetch(`${COUNTRY_API_URL}${countryCode}${API_FIELDS}`);
            
            if (!externalResponse.ok) {
                Log.warn(FILE, func, countryCode, `External API error. Status: ${externalResponse.status}`);
                return res.status(200).json(defaultResponse);
            }

            const data = await externalResponse.json();
            
            if (data && data.name && data.name.common) {
                const countryName = data.name.common;
                Log.debug(FILE, func, countryCode, `Found: ${countryName}`);
                return res.status(200).json({ id: countryCode, name: countryName });
            } else {
                Log.warn(FILE, func, countryCode, 'External API malformed');
                return res.status(200).json(defaultResponse);
            }

        } catch (fetchError) {
            Log.error(FILE, func, countryCode, 'Fetch Error', fetchError);
            return res.status(200).json(defaultResponse);
        }

    } catch (error) {
        Log.error(FILE, func, null, 'General Error', error);
        return res.status(200).json(defaultResponse);
    }
};

exports.email = async (req, res) => {
    const func = 'email';
    const email = req.query.email;
    Log.info(FILE, func, email, 'Validation request');
    try {
        const check = await bl.valid_email(email);
        res.status(200).json(check);
    } catch (error) {
        Log.error(FILE, func, email, 'Error', error);
        res.status(503).json({ "e": "yes", "status": error });
    }
};

exports.usersSearch = async (req, res) => {
    const func = 'usersSearch';
    const email = req.query.email;
    Log.info(FILE, func, email, 'Search request');
    try {
        const user = await bl.get_by_email_user(email);
        if (!user) {
            Log.warn(FILE, func, email, 'User not found');
            return res.status(404).json({ error: `Cannot find user with email: '${email}'` });
        }
        Log.info(FILE, func, email, 'User found');
        return res.status(200).json({ e: "no", status: true, authProvider: user });
    } catch (error) {
        Log.error(FILE, func, email, 'Error', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAllOriginCountries = async (req, res) => {
    const func = 'getAllOriginCountries';
    Log.info(FILE, func, null, 'Request received');
    try {
        const countries = await bl.get_all_origin_countries();
        res.status(200).json(countries);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(500).json({ "error": "The request failed, try again later" });
    }
};

exports.getDestinationsFromOrigin = async (req, res) => {
    const func = 'getDestinationsFromOrigin';
    Log.info(FILE, func, null, 'Request received');
    try {
        const originId = req.query.origin_id;
        const destinations = await bl.get_destinations_from_origin(originId);
        res.status(200).json(destinations);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(500).json({ "error": "The request failed, try again later" });
    }
};

exports.getFilteredFlights = async (req, res) => {
    const func = 'getFilteredFlights';
    Log.info(FILE, func, null, 'Request received');
    try {
        const filters = {
            origin_country_id: req.query.origin_country_id,
            destination_country_id: req.query.destination_country_id,
            date: req.query.date
        };
        const flights = await bl.get_filtered_flights(filters);
        res.status(200).json(flights);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(500).json({ "error": "The request failed, try again later" });
    }
};

exports.get_all_flights = async (req, res) => {
    const func = 'get_all_flights';
    Log.info(FILE, func, null, 'Retrieving all flights');
    try {
        const flights = await bl.get_all_flights();
        res.json(flights);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.json({ 'error': JSON.stringify(error) });
    }
};

exports.getFlightById = async (req, res) => {
    const func = 'getFlightById';
    const flight_id = parseInt(req.params.id);
    Log.info(FILE, func, flight_id, 'Request received');
    try {
        const flight = await bl.get_by_id_flights(flight_id);
        if (flight) {
            res.json(flight);
        } else {
            res.status(404).json({ "error": `Cannot find flight with id ${flight_id}` });
        }
    } catch (error) {
        Log.error(FILE, func, flight_id, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

// --- Secure paths (requires 'protect' middleware) ---

exports.getMyDetails = async (req, res) => {
    const func = 'getMyDetails';
    const mongoIdFromToken = req.user.id;
    Log.info(FILE, func, mongoIdFromToken, 'Fetching details');

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
        Log.error(FILE, func, mongoIdFromToken, 'Error', error);
        res.status(503).json({ "error": "Failed to retrieve user details", error });
    }
};

exports.usersById = async (req, res) => {
    const func = 'usersById';
    const user_id = req.params.id;
    Log.info(FILE, func, user_id, 'Request received');
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
        Log.error(FILE, func, user_id, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later '${error}'` });
    }
};

exports.createUser = async (req, res) => {
    const func = 'createUser';
    Log.info(FILE, func, null, 'Creating new user');
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
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later ${error}` });
    }
};

exports.updateUser = async (req, res) => {
    const func = 'updateUser';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Attempting self-update');

        const updated_user_req = req.body;
        const result = await bl.update_user(numeric_id, updated_user_req);
        if (result) {
            Log.info(FILE, func, numeric_id, 'Updated successfully');
            res.status(201).json(result);
        } else {
            Log.warn(FILE, func, numeric_id, `Update failed (email exists?): ${updated_user_req.email}`);
            res.status(409).json({ "error": `${updated_user_req.email} already exists` });
        }
    } catch (error) {
        // getNumericIdFromToken throws error if not found, catching here
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later ${error.message}` });
    }
};

exports.deleteMe = async (req, res) => {
    const func = 'deleteMe';
    const mongo_id_from_token = req.user.id;
    Log.info(FILE, func, mongo_id_from_token, 'Attempting self-deletion');

    try {
        const user = await bl.get_by_id_user(mongo_id_from_token);
        if (user && user.id) {
            const numeric_id = user.id;
            const result = await bl.delete_account(numeric_id);
            Log.info(FILE, func, numeric_id, 'Deleted successfully');

            res.clearCookie('sky');
            res.status(200).json({ message: result });
        } else {
            Log.warn(FILE, func, mongo_id_from_token, 'User not found');
            res.status(404).json({ "error": `User not found` });
        }
    } catch (error) {
        Log.error(FILE, func, mongo_id_from_token, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.deleteUser = async (req, res) => {
    const func = 'deleteUser';
    const target_id = req.params.id;
    Log.warn(FILE, func, target_id, 'Manual delete request (Admin?)');

    try {
        const numeric_id = parseInt(target_id, 10);
        if (isNaN(numeric_id)) {
            return res.status(400).json({ error: "Invalid numeric ID" });
        }

        const numeric_id_from_token = await getNumericIdFromToken(req);
        if (numeric_id !== numeric_id_from_token) {
            Log.warn(FILE, func, numeric_id_from_token, `Security violation: Tried to delete ${numeric_id}`);
            return res.status(403).json({ error: "You can only delete your own account." });
        }

        return exports.deleteMe(req, res);

    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later ${error.message}` });
    }
};

// --- Secure paths (client) ---
exports.verifyCustomerCvv = async (req, res) => {
    const func = 'verifyCustomerCvv';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Verifying CVV');

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
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.customersById = async (req, res) => {
    const func = 'customersById';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Fetching customer details');

        const customer = await bl.get_by_id_customer(numeric_id);
        if (customer) {
            Log.info(FILE, func, numeric_id, 'Customer found');
            res.status(200).json(customer);
        } else {
            Log.warn(FILE, func, numeric_id, 'Customer not found');
            res.status(404).json({ "error": `Cannot find customer for user` });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.createCustomer = async (req, res) => {
    const func = 'createCustomer';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Creating customer');
        
        const new_customer = req.body;
        new_customer.user_id = numeric_id;

        const user = await bl.new_customer(new_customer);
        if (user) {
            Log.info(FILE, func, numeric_id, 'Customer created');
            res.status(201).json({ "e": "no" });
        } else {
            Log.warn(FILE, func, numeric_id, 'Creation failed (BL returned falsy)');
            res.status(409).json({ "e": "yes", "error": `Failed to create customer` });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        if (error.message && error.message.includes('unique constraint')) {
            res.status(409).json({ "e": "yes", "error": "A customer with these details (e.g., credit card) already exists." });
        } else {
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    }
};

exports.updateCustomer = async (req, res) => {
    const func = 'updateCustomer';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Updating customer');
        
        const updated_customer_req = req.body;
        const result = await bl.update_customer(numeric_id, updated_customer_req);
        
        Log.info(FILE, func, numeric_id, 'Updated successfully');
        res.json(updated_customer_req);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

// --- Secure paths (order creation) ---

exports.createChairAssignment = async (req, res) => {
    const func = 'createChairAssignment';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Creating assignment');
        
        const chairData = req.body;
        chairData.user_id = numeric_id;

        const assignment = await bl.new_chair_assignment(chairData);
        res.status(201).json(assignment);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        if (error.code === '23505') {
            res.status(409).json({ "error": "This seat is already taken." });
        } else {
            res.status(500).json({ "error": "The request failed, try again later" });
        }
    }
};

exports.createTicket = async (req, res) => {
    const func = 'createTicket';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Creating ticket');
        
        const new_ticket = req.body;
        new_ticket.user_id = numeric_id;
        const customer = await bl.get_by_id_customer(numeric_id);

        if (!customer || !customer.id) {
            Log.warn(FILE, func, numeric_id, 'No customer record found');
            return res.status(404).json({ error: "Customer details not found. Please complete your profile first." });
        }

        new_ticket.customer_id = customer.id;

        const result = await bl.purchase_ticket(new_ticket);
        Log.info(FILE, func, numeric_id, 'Ticket purchased');
        res.status(201).json(result);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.deleteMyTicket = async (req, res) => {
    const func = 'deleteMyTicket';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        const ticket_id = parseInt(req.params.id, 10);
        
        Log.info(FILE, func, numeric_id, `[TicketID: ${ticket_id}] - Delete request`);

        if (isNaN(ticket_id)) {
            return res.status(400).json({ error: "Invalid ticket ID." });
        }

        const result = await bl.cancel_ticket(numeric_id, ticket_id);

        res.status(200).json(result);

    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        if (error.message.includes("Not authorized")) {
            res.status(403).json({ "error": error.message });
        } else {
            res.status(503).json({ "error": `The request failed, try again later` });
        }
    }
};

exports.createPassenger = async (req, res) => {
    const func = 'createPassenger';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Creating passenger');

        const new_passenger = req.body;
        new_passenger.user_id = numeric_id;

        const result = await bl.new_passenger(new_passenger);
        Log.info(FILE, func, numeric_id, 'Passenger created');
        res.status(201).json(result);
    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

// --- Secure paths (reading information) ---

exports.getAllChairsByFlightId = async (req, res) => {
    const func = 'getAllChairsByFlightId';
    const id = parseInt(req.params.id);
    Log.info(FILE, func, id, 'Request received');
    try {
        const result = await bl.get_all_chairs_by_flight(id);
        res.status(200).json(result);
    } catch (error) {
        Log.error(FILE, func, id, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.getMyTickets = async (req, res) => {
    const func = 'getMyTickets';
    try {
        const numeric_id = await getNumericIdFromToken(req);
        Log.info(FILE, func, numeric_id, 'Fetching tickets');

        const tickets = await bl.get_my_tickets(numeric_id);

        res.status(200).json(tickets);

    } catch (error) {
        Log.error(FILE, func, null, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};

exports.PassengerById = async (req, res) => {
    const func = 'PassengerById';
    const passenger_id = parseInt(req.params.id);
    Log.info(FILE, func, passenger_id, 'Request received');
    try {
        const passenger = await bl.get_by_id_passenger(passenger_id);
        if (passenger) {
            res.status(200).json(passenger);
        } else {
            res.status(404).json({ "error": `Cannot find passenger with id ${passenger_id}` });
        }
    } catch (error) {
        Log.error(FILE, func, passenger_id, 'Error', error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};