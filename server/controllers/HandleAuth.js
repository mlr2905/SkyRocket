const bl = require('../bl/bl_role_users');
const Log = require('../logger/logManager');

const FILE = 'HandleAuth';

class HandAuth {
  static async processLogin(req, res, email, password, authProvider) {
    const func = 'processLogin';
    Log.info(FILE, func, email, `Processing ${authProvider} login (Internal BL call)`);

    try {
      Log.info(FILE, func, email, 'Checking if user exists via BL');

      const existingAuthProvider = await bl.get_by_email_user(email);

      if (existingAuthProvider && existingAuthProvider.error) {
        throw new Error(existingAuthProvider.error);
      }

      if (!existingAuthProvider) {
        Log.info(FILE, func, email, `User not found, proceeding with signup via BL`);

        try {
          Log.info(FILE, func, email, `Creating new user with ${authProvider}`);

          const signupResult = await bl.signup(email, password, authProvider);

          if (signupResult.e === "yes") {
            throw new Error(signupResult.error);
          }

          Log.info(FILE, func, email, 'User successfully registered');
          return res.redirect('/search.html');
        } catch (signupError) {
          Log.error(FILE, func, email, 'Signup failed', signupError);
          throw signupError;
        }
      }

      else {
        Log.info(FILE, func, email, `User exists (Provider: ${existingAuthProvider}), verifying provider`);

        if (existingAuthProvider !== authProvider) {
          Log.warn(FILE, func, email, `Provider mismatch. Used: ${authProvider}, Required: ${existingAuthProvider}`);
          return res.status(403).send(`Access denied. Please log in using ${existingAuthProvider}.`);
        }

        Log.info(FILE, func, email, 'Authenticating existing user via BL');
        try {
          const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
          const userAgent = req.headers['user-agent'];

          const loginResult = await bl.login(email, password, ip, userAgent,authProvider);

          if (loginResult.e === "yes") {
            throw new Error(loginResult.error);
          }

          const token = loginResult.jwt;
          Log.info(FILE, func, email, 'Authentication successful');

          res.cookie('sky', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3:15 hours
          });

          Log.info(FILE, func, email, 'Redirecting authenticated user');
          return res.redirect('/search.html');
        } catch (loginError) {
          Log.error(FILE, func, email, 'Login failed', loginError);
          throw loginError;
        }
      }
    } catch (error) {
      Log.error(FILE, func, email, 'Error during authentication process', error);

      if (!res.headersSent) {
        return res.status(500).send('Error during signup or login: ' + error.message);
      }
    }
  }
}

module.exports = HandAuth;