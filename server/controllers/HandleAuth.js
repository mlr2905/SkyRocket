const axios = require('axios');
const Log = require('../logger/logManager'); // ייבוא המנהל

const FILE = 'HandleAuth';

class HandAuth {
    static async processLogin(req, res, email, password, authProvider) {
        const func = 'processLogin';
        Log.info(FILE, func, email, `Processing ${authProvider} login`);

        try {
            Log.info(FILE, func, email, 'Checking if user exists');
            const Check = await axios.get(
                `https://skyrocket.onrender.com/role_users/users/search?email=${email}`,
                {
                    validateStatus: function (status) {
                        return status < 500;
                    }
                }
            );

            const data = Check.data;
            Log.debug(FILE, func, email, `User check response: ${JSON.stringify(data)}`);

            if (data.error) {
                Log.info(FILE, func, email, 'User not found, proceeding with signup');

                try {
                    Log.info(FILE, func, email, `Creating new user with ${authProvider}`);
                    await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                        email: email,
                        password: password,
                        authProvider: authProvider
                    });

                    Log.info(FILE, func, email, 'User successfully registered');
                    return res.redirect('https://skyrocket.onrender.com');
                } catch (signupError) {
                    Log.error(FILE, func, email, 'Signup failed', signupError);
                    if (signupError.response) {
                        Log.error(FILE, func, email, `Signup error response: ${JSON.stringify(signupError.response.data)}`);
                    }
                    throw signupError;
                }
            }

            if (data.e === "no" && data.status === true) {
                Log.info(FILE, func, email, 'User exists, verifying authentication provider');

                if (data.authProvider !== authProvider) {
                    Log.warn(FILE, func, email, `Provider mismatch. Used: ${authProvider}, Required: ${data.authProvider}`);
                    return res
                        .status(403)
                        .send(`Access denied. Please log in using ${data.authProvider}.`);
                }

                Log.info(FILE, func, email, 'Authenticating existing user');
                try {
                    const loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                        email: email,
                        password: password,
                        authProvider: authProvider
                    });

                    const token = loginResponse.data.jwt;
                    Log.info(FILE, func, email, 'Authentication successful');

                    // Set JWT cookie
                    res.cookie('sky', token, {
                        httpOnly: true,
                        sameSite: 'strict',
                        maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3:15 שעות
                    });

                    Log.info(FILE, func, email, 'Redirecting authenticated user to search form');
                    return res.redirect('https://skyrocket.onrender.com');
                } catch (loginError) {
                    Log.error(FILE, func, email, 'Login failed', loginError);
                    if (loginError.response) {
                        Log.error(FILE, func, email, `Login error response: ${JSON.stringify(loginError.response.data)}`);
                    }
                    throw loginError;
                }
            } else {
                Log.warn(FILE, func, email, `Unexpected user data format: ${JSON.stringify(data)}`);
                return res.status(400).send('Invalid user data format');
            }
        } catch (error) {
            Log.error(FILE, func, email, 'Error during authentication process', error);

            // Log detailed error information
            if (error.response) {
                Log.error(FILE, func, email, `Error response: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                Log.error(FILE, func, email, 'No response received from authentication server');
            }

            // Check if response has already been sent
            if (!res.headersSent) {
                return res.status(500).send('Error during signup or login');
            }
        }
    }
}

module.exports = HandAuth;