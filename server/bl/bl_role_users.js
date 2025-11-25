const dal_0 = require('../dals/dal_all_tables');
const dal_1 = require('../dals/dal_table_users');
const dal_4 = require('../dals/dal_table_customers');
const dal_5 = require('../dals/dal_table_flights');
const dal_6 = require('../dals/dal_table_chairs_taken');
const dal_7 = require('../dals/dal_table_tickets');
const dal_8 = require('../dals/dal_table_passengers');
const Log = require('../logger/logManager');

const FILE = 'bl_role_users';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET;

Log.info(FILE, 'init', null, 'Role Users BL module initialized');

async function signupWebAuthn(registrationData) {
    const func = 'signupWebAuthn';
    const email = registrationData.user.email;
    const API_REGISTER_URL = 'https://jwt-node-mongodb.onrender.com/register';


    if (!INTERNAL_SECRET) {
        Log.error(FILE, func, email, 'Configuration Error: INTERNAL_SERVICE_SECRET is missing');
        throw new Error('Server configuration error: Missing internal secret');
    }

    try {
        const payload = {
            email: email,
            credentialID: registrationData.body.credentialID,
            publicKey: registrationData.body.attestationObject,
            credentialName: registrationData.body.credentialName || `Access Key ${new Date().toLocaleDateString()}`
        };

        Log.debug(FILE, func, email, 'Sending registration request to auth server');

        const response = await fetch(API_REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-internal-secret': INTERNAL_SECRET
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const textResponse = await response.text();
            Log.error(FILE, func, email, `Non-JSON response received: ${textResponse.substring(0, 200)}`);
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }

        if (!response.ok) {
            if (response.status === 403) {
                Log.error(FILE, func, email, 'Security Breach: Internal Service rejected the secret key');
            }
            throw new Error(`Registration failed: ${response.status} - ${result.error || response.statusText}`);
        }

        if (result.e === 'no' && result.code === 'credential_registered') {
            Log.info(FILE, func, email, 'Access key registered successfully');
            return {
                success: true,
                data: result,
                message: 'Access key registered successfully'
            };
        } else if (result.e === 'yes') {
            throw new Error(result.error || 'Registration failed');
        }

        return {
            success: true,
            data: result,
            message: 'Registration completed'
        };

    } catch (error) {
        Log.error(FILE, func, email, 'Registration BL Error', error);
        return {
            success: false,
            error: error.message,
            message: 'Registration failed'
        };
    }
}

async function loginWebAuthn(authData) {
    const func = 'loginWebAuthn';
    const API_LOGIN_URL = 'https://jwt-node-mongodb.onrender.com/loginWith';


    if (!INTERNAL_SECRET) {
        Log.error(FILE, func, authData?.email, 'Configuration Error: INTERNAL_SERVICE_SECRET is missing');
        return {
            success: false,
            error: 'Server configuration error',
            message: 'Authentication failed due to server error'
        };
    }

    Log.info(FILE, func, authData?.email, 'Starting WebAuthn login process');

    try {
        if (!authData) {
            throw new Error("Authentication data is missing");
        }

        const { credentialID, email, authenticatorData, clientDataJSON, signature } = authData;
        const missingFields = [];
        if (!credentialID) missingFields.push('credentialID');
        if (!email) missingFields.push('email');
        if (!signature) missingFields.push('signature');

        if (missingFields.length > 0) {
            const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
            Log.warn(FILE, func, email, errorMsg);
            throw new Error(errorMsg);
        }

        const requestPayload = {
            credentialID, email, authenticatorData, clientDataJSON, signature
        };

        Log.debug(FILE, func, email, 'Sending authentication request to internal server');

        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-internal-secret': INTERNAL_SECRET
            },
            body: JSON.stringify(requestPayload),
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            Log.error(FILE, func, email, 'Failed to parse JSON response', parseError);
            throw new Error(`Failed to parse response as JSON. Status: ${response.status}`);
        }

        if (!response.ok) {
            if (response.status === 403) {
                Log.error(FILE, func, email, 'CRITICAL: Internal Service rejected the secret key (403 Forbidden)');
                throw new Error('Internal communication error');
            }

            Log.warn(FILE, func, email, `Authentication failed status: ${response.status}`);
            throw new Error(`Authentication failed: ${responseData.error || response.statusText}`);
        }

        if (responseData.e === 'no' && responseData.code === 'login_succeeded') {
            Log.info(FILE, func, email, 'WebAuthn authentication successful');
            return {
                success: true,
                data: responseData,
                user: responseData.user,
                token: responseData.jwt,
                message: 'Authentication successful'
            };
        } else if (responseData.e === 'yes') {
            Log.warn(FILE, func, email, `Server returned logical error: ${responseData.error}`);
            throw new Error(responseData.error || 'Authentication failed');
        }

        Log.warn(FILE, func, email, 'Unexpected response format from internal server');
        return {
            success: true,
            data: responseData,
            message: 'Authentication completed'
        };

    } catch (error) {
        Log.error(FILE, func, authData?.email, 'Error in WebAuthn login process', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Authentication failed'
        };
    }
}

async function authcode(email) {
    const func = 'authcode';
    Log.info(FILE, func, email, 'Sending authentication code');

    let url = 'https://jwt-node-mongodb.onrender.com/authcode';
    const data = { email: email };

    let requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': INTERNAL_SECRET
        },

        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();

        if (responseData.e === "yes") {
            Log.warn(FILE, func, email, `Auth code request failed: ${responseData.error}`);
            return { "e": "yes", "error": responseData.error || "Unknown error" };
        } else {
            Log.info(FILE, func, email, 'Authentication code successfully sent');
            return responseData;
        }
    } catch (error) {
        Log.error(FILE, func, email, 'Error sending authentication code', error);
        return { "e": "yes", "error": error.message || "Network error" };
    }
}

async function login_code(email, code) {
    const func = 'login_code';
    Log.info(FILE, func, email, 'Verifying authentication code');

    let url = 'https://jwt-node-mongodb.onrender.com/verifyCode';
    const data = { email: email, code: code };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': INTERNAL_SECRET
        },
        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(url, requestOptions);
        const user = await response.json();

        if (user.e === "yes") {
            Log.warn(FILE, func, email, `Code verification failed: ${user.error}`);
            return { "e": "yes", "error": user.error };
        } else {
            Log.info(FILE, func, email, 'Code verification successful');
            return user;
        }
    } catch (error) {
        Log.error(FILE, func, email, 'Error verifying authentication code', error);
        return { "e": "yes", "error": error.message || "Network error" };
    }
}

async function login(email, password, ip, userAgent, deviceId) {
    const func = 'login';
    Log.info(FILE, func, email, 'Processing login request');
    Log.debug(FILE, func, email, `IP: ${ip}, User-Agent: ${userAgent}`);

    const url = 'https://jwt-node-mongodb.onrender.com/login';
    const data = { email, password, ip, userAgent, deviceId };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': INTERNAL_SECRET
        },

        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(url, requestOptions);
        const user = await response.json();

        if (!response.ok) {
            Log.warn(FILE, func, email, `Login failed: Response not OK (${response.status})`);
            throw new Error('Failed to login: ' + (user.message || response.statusText));
        }

        if (user.errors) {
            Log.warn(FILE, func, email, `Login failed: ${JSON.stringify(user.errors)}`);
            throw new Error('Failed to login: ' + (user.errors.email || JSON.stringify(user.errors)));
        }

        Log.info(FILE, func, email, `Login successful for user ID: ${user.id}`);
        return { e: "no", jwt: user.jwt, id: user.id, email: user.email };

    } catch (error) {
        Log.error(FILE, func, email, 'Login error', error);
        return { e: "yes", error: error.message || "Unknown error" };
    }
}

async function signup(email, password, authProvider) {
    const func = 'signup';

    const URL_NODE_MONGO = process.env.AUTH_SERVICE_URL || 'https://jwt-node-mongodb.onrender.com/signup';
    const URL_SPRING_PG = process.env.BIZ_SERVICE_URL || "https://spring-postgresql.onrender.com"; // Add specific endpoint if needed, e.g., /api/users

    if (!INTERNAL_SECRET) {
        Log.error(FILE, func, email, 'Configuration Error: INTERNAL_SERVICE_SECRET is missing');
        return { "e": "yes", "error": "Server configuration error" };
    }

    Log.info(FILE, func, email, `Processing signup request (${authProvider})`);

    const signupData = { email, password, authProvider };

    try {
        const authResponse = await fetch(URL_NODE_MONGO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': INTERNAL_SECRET
            },
            body: JSON.stringify(signupData)
        });

        const authResult = await authResponse.json();

        if (authResult.errors || authResult.e === 'yes') {
            const errorMsg = authResult.errors
                ? (authResult.errors.email || authResult.errors.password)
                : (authResult.error || 'Unknown auth error');

            Log.warn(FILE, func, email, `Signup failed at Auth Service: ${errorMsg}`);
            return { "e": "yes", "error": errorMsg };
        }

        if (!authResult.mongo_id) {
            Log.error(FILE, func, email, 'Auth service returned success but missing mongo_id');
            return { "e": "yes", "error": "Invalid response from authentication service" };
        }

        Log.debug(FILE, func, email, 'Identity created, propagating to Business Service (Spring/PG)');

        const businessPayload = {
            ...authResult,
            role_id: 1
        };

        try {
            const bizResponse = await fetch(URL_SPRING_PG, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': INTERNAL_SECRET
                },
                body: JSON.stringify(businessPayload)
            });

            if (!bizResponse.ok) {
                throw new Error(`Business service returned ${bizResponse.status}`);
            }

            const bizResult = await bizResponse.json();

            Log.info(FILE, func, email, 'Signup workflow completed successfully');
            return { "e": "no", "response": bizResult };

        } catch (bizError) {

            Log.error(FILE, func, email, 'CRITICAL: Data Inconsistency - User created in Auth but failed in Business DB', bizError);

            return {
                "e": "yes",
                "error": "Account created but profile setup failed. Please contact support."
            };
        }

    } catch (error) {
        Log.error(FILE, func, email, 'Signup orchestration error', error);
        return { "e": "yes", "error": error.message || "Network error" };
    }
}

async function create_user(user) {
    const func = 'create_user';
    Log.info(FILE, func, user.username, 'Creating new user');

    try {
        const user_name = await dal_1.get_by_name(user.username);

        if (user_name === undefined) {
            Log.debug(FILE, func, user.username, 'Username is available, proceeding');
            const new_user = await dal_1.new_user_role1(user);

            if (typeof new_user === 'string' && new_user.length === 8) {
                Log.info(FILE, func, user.username, 'User created with generated password');
                return { 'OK': `'${user.username}' successfully created, This is the generated password, '${new_user}'` };
            }

            if (new_user === true) {
                Log.info(FILE, func, user.username, 'User created successfully');
                return { 'OK': `'${user.username}' successfully created` };
            }

            Log.warn(FILE, func, user.username, 'Unexpected result when creating user');
            return new_user;
        } else {
            Log.warn(FILE, func, user.username, 'Username already exists');
            return 'rejected';
        }
    } catch (error) {
        Log.error(FILE, func, user.username, 'Error creating user', error);
        return error;
    }
}

async function valid_email(email) {
    const func = 'valid_email';
    Log.info(FILE, func, email, 'Validating email');

    let url = `https://www.ipqualityscore.com/api/json/email/goCQBJHwMYjYULVaNcy82xFcdNEhqUIz/${email}`;

    try {
        const response = await fetch(url);
        const check = await response.json();

        Log.debug(FILE, func, email, `Validation result: valid=${check.valid}`);
        return { "e": "no", "valid": check.valid, "dmarc_record": check.dmarc_record };
    } catch (error) {
        Log.error(FILE, func, email, 'Error validating email', error);
        return { "e": "yes", "err": error.message || "Network error" };
    }
}

async function get_by_id_user(id) {
    const func = 'get_by_id_user';

    Log.info(FILE, func, id, 'Looking up user by id');
    let url = `https://spring-postgresql.onrender.com/${id}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': INTERNAL_SECRET
            },
        });

        if (!response.ok) {
            Log.warn(FILE, func, id, `No user found (Status: ${response.status})`);
            return false;
        }

        const data = await response.json();
        Log.info(FILE, func, id, 'User found');
        return data;

    } catch (error) {
        Log.error(FILE, func, id, 'Error fetching user data', error);
        return { error: error.message || "Network error" };
    }
}

async function get_by_email_user(email) {
    const func = 'get_by_email_user';
    Log.info(FILE, func, email, 'Looking up user by email');

    let url = `https://jwt-node-mongodb.onrender.com/search?email=${email}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': INTERNAL_SECRET
            }
        }); const data = await response.json();

        if (data && !data.status) {
            Log.info(FILE, func, email, 'User found');
            return data.authProvider;
        }

        Log.warn(FILE, func, email, 'No user found');
        return false;
    } catch (error) {
        Log.error(FILE, func, email, 'Error fetching user data', error);
        return { error: error.message || "Network error" };
    }
}

async function get_qr(id) {
    const func = 'get_qr';
    Log.info(FILE, func, id, 'Generating QR code');

    try {
        const qrData = await dal_0.get_qr(id);
        Log.debug(FILE, func, id, 'QR code generation successful');
        return qrData;
    } catch (error) {
        Log.error(FILE, func, id, 'Error generating QR code', error);
        throw error;
    }
}

async function verify_cvv(user_id, cvv) {
    const func = 'verify_cvv';
    Log.info(FILE, func, user_id, 'Verifying CVV');
    try {
        const isCorrect = await dal_4.verify_cvv(user_id, cvv);

        if (!isCorrect) {
            Log.warn(FILE, func, user_id, 'CVV verification failed');
            return { success: false, message: 'CVV שגוי' };
        }

        Log.info(FILE, func, user_id, 'CVV verification successful');
        return { success: true, message: 'CVV אומת' };

    } catch (error) {
        Log.error(FILE, func, user_id, 'Error in verify_cvv', error);
        throw error;
    }
}

async function update_user(id, user) {
    const func = 'update_user';
    Log.info(FILE, func, id, 'Updating user');

    try {
        const user_id = await dal_1.get_by_id('id', id);

        if (user_id) {
            const update_user = await dal_1.update_user(id, user);
            Log.info(FILE, func, id, `User updated successfully`);
            return { 'ok': `${user_id.username}${update_user}` };
        } else {
            Log.warn(FILE, func, id, 'Update failed - user not found');
            return false;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error updating user', error);
        throw error;
    }
}

async function delete_account(id) {
    const func = 'delete_account';
    Log.info(FILE, func, id, 'Deleting user account');

    try {
        const user_id = await dal_1.get_by_id('id', id);

        if (user_id) {
            const delete_user = await dal_1.delete_user(id);
            Log.info(FILE, func, id, `User deleted successfully`);
            return `User '${user_id.username}' deleted successfully `;
        } else {
            Log.warn(FILE, func, id, 'Deletion failed - user not found');
            return `The ID ${id} you specified does not exist`;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error deleting user', error);
        throw error;
    }
}

async function new_customer(new_cus) {
    const func = 'new_customer';
    const userId = new_cus.user_id;
    Log.info(FILE, func, userId, 'Creating new customer');

    try {
        const Credit_check = await dal_4.credit_check(new_cus.credit_card, new_cus.user_id);

        if (Credit_check) {
            Log.debug(FILE, func, userId, 'Credit card validated');
            const new_customer = await dal_4.new_customer(new_cus);

            if (new_customer) {
                Log.info(FILE, func, userId, 'Customer created successfully');
                return new_cus;
            } else {
                Log.warn(FILE, func, userId, 'Customer creation failed (DAL)');
                return null;
            }
        } else {
            Log.warn(FILE, func, userId, `Invalid credit card number (last 4: ${new_cus.credit_card.slice(-4)})`);
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, userId, 'Error creating customer', error);
        throw error;
    }
}

async function get_by_id_customer(id) {
    const func = 'get_by_id_customer';
    Log.info(FILE, func, id, 'Getting customer');

    try {
        const customer = await dal_4.get_by_id(id);

        if (customer) {
            Log.debug(FILE, func, id, 'Customer found');
            return customer;
        } else {
            Log.debug(FILE, func, id, 'No customer found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error getting customer', error);
        throw error;
    }
}

async function update_customer(user_id, update_data) {
    const func = 'update_customer';
    Log.info(FILE, func, user_id, 'Updating customer');

    try {
        if (update_data.credit_card) {
            Log.debug(FILE, func, user_id, 'Validating new credit card');
            const check = await dal_4.credit_check(update_data.credit_card, user_id);

            if (!check.available) {
                Log.warn(FILE, func, user_id, `Credit card validation failed: ${check.message}`);
                return { success: false, error: check.message };
            }
        }

        const result = await dal_4.update_customer(user_id, update_data);

        if (result === null) {
            Log.warn(FILE, func, user_id, 'Update failed. Customer not found in DAL');
            return { success: false, error: 'Customer not found in DAL' };
        }

        Log.info(FILE, func, user_id, 'Customer update successful');
        return { success: true, data: { rowsAffected: result } };

    } catch (error) {
        Log.error(FILE, func, user_id, 'Error in update_customer', error);
        throw error;
    }
}

async function get_all_flights() {
    const func = 'get_all_flights';
    Log.info(FILE, func, null, 'Getting all flights');

    try {
        const flights = await dal_5.get_all();
        Log.debug(FILE, func, null, `Retrieved ${flights ? flights.length : 0} flights`);
        return flights;
    } catch (error) {
        Log.error(FILE, func, null, 'Error getting all flights', error);
        throw error;
    }
}

async function get_all_origin_countries() {
    const func = 'get_all_origin_countries';
    Log.info(FILE, func, null, 'Processing request for all origin countries');
    try {
        const countries = await dal_5.get_all_origin_countries();
        Log.info(FILE, func, null, `Retrieved ${countries.length} origin countries`);
        return countries;
    } catch (error) {
        Log.error(FILE, func, null, 'Error processing origin countries', error);
        throw error;
    }
}

async function get_destinations_from_origin(originId) {
    const func = 'get_destinations_from_origin';
    Log.info(FILE, func, originId, 'Processing request for destinations');

    if (!originId || isNaN(parseInt(originId))) {
        Log.warn(FILE, func, originId, 'Invalid or missing originId');
        return [];
    }

    try {
        const destinations = await dal_5.get_destinations_from_origin(originId);
        Log.info(FILE, func, originId, `Retrieved ${destinations.length} destinations`);
        return destinations;
    } catch (error) {
        Log.error(FILE, func, originId, 'Error processing destinations', error);
        throw error;
    }
}

async function get_filtered_flights(filters) {
    const func = 'get_filtered_flights';
    Log.info(FILE, func, null, 'Processing filtered flights request');
    Log.debug(FILE, func, null, `Filters: ${JSON.stringify(filters)}`);

    try {
        const flights = await dal_5.get_filtered_flights(filters);
        Log.info(FILE, func, null, `Retrieved ${flights.length} filtered flights`);
        return flights;
    } catch (error) {
        Log.error(FILE, func, null, 'Error processing filtered flights', error);
        throw error;
    }
}

async function get_by_id_flights(id) {
    const func = 'get_by_id_flights';
    Log.info(FILE, func, id, 'Getting flight');

    try {
        const flight = await dal_5.get_by_id(id);

        if (flight) {
            Log.debug(FILE, func, id, 'Flight found');
            return flight;
        } else {
            Log.warn(FILE, func, id, 'No flight found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error getting flight', error);
        throw error;
    }
}

async function get_all_chairs_by_flight(id) {
    const func = 'get_all_chairs_by_flight';
    Log.info(FILE, func, id, 'Getting all chairs for flight');

    try {
        const chairs = await dal_6.get_all_chairs_by_flight(id);
        Log.debug(FILE, func, id, `Retrieved ${chairs ? chairs.length : 0} chair assignments`);
        return chairs;
    } catch (error) {
        Log.error(FILE, func, id, 'Error getting chairs', error);
        throw error;
    }
}

async function new_chair_assignment(chairData) {
    const func = 'new_chair_assignment';
    Log.info(FILE, func, chairData.user_id, 'Processing new chair assignment');

    try {
        const assignment = await dal_6.new_chair(chairData);
        Log.info(FILE, func, chairData.user_id, `Successfully assigned chair ${chairData.char_id}`);
        return assignment;
    } catch (error) {
        Log.error(FILE, func, chairData.user_id, 'Error processing chair assignment', error);
        throw error;
    }
}

async function get_my_tickets(numeric_id) {
    const func = 'get_my_tickets';
    Log.info(FILE, func, numeric_id, 'Fetching tickets');
    try {
        const tickets = await dal_7.get_tickets_by_user_id(numeric_id);
        return tickets;
    } catch (error) {
        Log.error(FILE, func, numeric_id, 'Error getting tickets', error);
        throw error;
    }
}

async function purchase_ticket(new_ticket, test) {
    const func = 'purchase_ticket';
    const userId = new_ticket.user_id;
    Log.info(FILE, func, userId, 'Processing ticket purchase');

    try {
        const flight = await dal_5.get_by_id(new_ticket.flight_id);

        if (flight) {
            if (flight.remaining_tickets > 0) {
                const id = parseInt(flight.id);

                if (test === undefined) {
                    await dal_5.update_remaining_tickets(id);
                } else {
                    Log.debug(FILE, func, userId, 'Test mode: skipping ticket update');
                }

                const result = await dal_7.new_ticket(new_ticket);
                Log.info(FILE, func, userId, `Ticket purchased successfully for flight ${flight.id}`);
                return result;
            } else {
                Log.warn(FILE, func, userId, `Purchase failed - no tickets left for flight ${flight.id}`);
                return Error('no tickets left');
            }
        } else {
            Log.warn(FILE, func, userId, `Purchase failed - flight ${new_ticket.flight_id} does not exist`);
            throw Error('flight does not exist');
        }
    } catch (error) {
        Log.error(FILE, func, userId, 'Error purchasing ticket', error);
        throw error;
    }
}

async function get_by_id_ticket(id) {
    const func = 'get_by_id_ticket';
    Log.info(FILE, func, id, 'Getting ticket');

    try {
        const ticket = await dal_7.get_by_id(id);

        if (ticket) {
            Log.debug(FILE, func, id, 'Ticket found');
            return ticket;
        } else {
            Log.debug(FILE, func, id, 'No ticket found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error getting ticket', error);
        throw error;
    }
}

async function new_passenger(new_p) {
    const func = 'new_passenger';
    Log.info(FILE, func, new_p.user_id, 'Creating new passenger');

    try {
        const new_passenger = await dal_8.new_passenger(new_p);
        Log.info(FILE, func, new_p.user_id, `Passenger created successfully with ID: ${new_passenger.id}`);
        return new_passenger;
    } catch (error) {
        Log.error(FILE, func, new_p.user_id, 'Error creating passenger', error);
        throw error;
    }
}

async function get_by_id_passenger(id) {
    const func = 'get_by_id_passenger';
    Log.info(FILE, func, id, 'Getting passenger');

    try {
        const passenger = await dal_8.get_by_id_passenger(id);

        if (passenger) {
            Log.debug(FILE, func, id, 'Passenger found');
            return passenger;
        } else {
            Log.debug(FILE, func, id, 'No passenger found');
            return null;
        }
    } catch (error) {
        Log.error(FILE, func, id, 'Error getting passenger', error);
        throw error;
    }
}

async function cancel_ticket(numeric_user_id, ticket_id) {
    const func = 'cancel_ticket';
    Log.info(FILE, func, numeric_user_id, `Attempting to cancel ticket ${ticket_id}`);
    try {
        const ticket = await dal_7.get_by_id(ticket_id);
        if (!ticket) {
            throw new Error("Ticket not found.");
        }

        if (ticket.user_id !== numeric_user_id) {
            Log.warn(FILE, func, numeric_user_id, `Auth failed. User does not own ticket ${ticket_id}`);
            throw new Error("You are not authorized to cancel this ticket.");
        }

        await dal_6.delete_chair_assignment(ticket.flight_id, ticket.chair_id);
        await dal_7.delete_ticket(ticket_id);

        Log.info(FILE, func, numeric_user_id, `Ticket ${ticket_id} successfully cancelled`);
        return { success: true, message: "Ticket cancelled successfully." };

    } catch (error) {
        Log.error(FILE, func, numeric_user_id, `Error cancelling ticket ${ticket_id}`, error);
        throw error;
    }
}

module.exports = {
    signupWebAuthn,
    loginWebAuthn,
    get_all_chairs_by_flight,
    valid_email,
    verify_cvv,
    authcode,
    login_code,
    login,
    signup,
    get_my_tickets,
    purchase_ticket,
    create_user,
    get_by_email_user,
    get_by_id_flights,
    get_all_flights,
    get_by_id_user,
    update_user,
    delete_account,
    new_customer,
    get_by_id_customer,
    update_customer,
    get_by_id_ticket,
    get_by_id_passenger,
    new_passenger,
    get_qr,
    get_filtered_flights,
    get_all_origin_countries,
    get_destinations_from_origin,
    new_chair_assignment,
    cancel_ticket
};