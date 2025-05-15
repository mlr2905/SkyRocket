const axios = require('axios');
const winston = require('winston');

// Create a logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

class HandAuth {
  static async processLogin(req, res, email, password, authProvider) {
    logger.info(`Processing ${authProvider} login for email: ${email}`);
    
    try {
      logger.info(`Checking if user exists: ${email}`);
      const Check = await axios.get(
        `https://skyrocket.onrender.com/role_users/users/search?email=${email}`,
        {
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      const data = Check.data;
      logger.debug(`User check response: ${JSON.stringify(data)}`);

      if (data.error) {
        logger.info(`User not found, proceeding with signup for: ${email}`);

        try {
          logger.info(`Creating new user with ${authProvider} authentication`);
          await axios.post('https://skyrocket.onrender.com/role_users/signup', {
            email: email,
            password: password,
            authProvider: authProvider
          });
          
          logger.info(`User successfully registered: ${email}`);
          return res.redirect('https://skyrocket.onrender.com/search_form.html');
        } catch (signupError) {
          logger.error(`Signup failed for ${email}: ${signupError.message}`);
          if (signupError.response) {
            logger.error(`Signup error response: ${JSON.stringify(signupError.response.data)}`);
          }
          throw signupError;
        }
      }

      if (data.e === "no" && data.status === true) {
        logger.info(`User exists, verifying authentication provider for: ${email}`);
        
        if (data.authProvider !== authProvider) {
          logger.warn(`Authentication provider mismatch for ${email}. Used: ${authProvider}, Required: ${data.authProvider}`);
          return res
            .status(403)
            .send(`Access denied. Please log in using ${data.authProvider}.`);
        }

        logger.info(`Authenticating existing user: ${email}`);
        try {
          const loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
            email: email,
            password: password,
            authProvider: authProvider
          });

          const token = loginResponse.data.jwt;
          logger.info(`Authentication successful for: ${email}`);
          
          // Set JWT cookie
          res.cookie('sky', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3:15 שעות
          });
          
          logger.info(`Redirecting authenticated user to search form: ${email}`);
          return res.redirect('https://skyrocket.onrender.com/search_form.html');
        } catch (loginError) {
          logger.error(`Login failed for ${email}: ${loginError.message}`);
          if (loginError.response) {
            logger.error(`Login error response: ${JSON.stringify(loginError.response.data)}`);
          }
          throw loginError;
        }
      } else {
        logger.warn(`Unexpected user data format for ${email}: ${JSON.stringify(data)}`);
        return res.status(400).send('Invalid user data format');
      }
    } catch (error) {
      logger.error(`Error during authentication process for ${email}: ${error.message}`);
      
      // Log detailed error information but avoid exposing it in the response
      if (error.response) {
        logger.error(`Error response: ${JSON.stringify(error.response.data)}`);
        logger.error(`Error status: ${error.response.status}`);
      } else if (error.request) {
        logger.error('No response received from authentication server');
      }
      
      // Check if response has already been sent
      if (!res.headersSent) {
        return res.status(500).send('Error during signup or login');
      }
    }
  }
}

// Log module initialization
logger.info('HandAuth authentication handler initialized');

module.exports = HandAuth;