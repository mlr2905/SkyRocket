const axios = require('axios');

class HandAuth {
  static async processLogin(req, res, email, password,authProvider) {
    try {
      const Check = await axios.get(
        `https://skyrocket.onrender.com/role_users/users/search?email=${email}`,
        {
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      const data = Check.data;

      if (data.error) {
        console.log("הרשמה");

        await axios.post('https://skyrocket.onrender.com/role_users/signup', {
          email: email,
          password: password,
          authProvider: authProvider
        });

        return res.redirect('https://skyrocket.onrender.com/search_form.html');
      }

      if (data.e === "no" && data.status === true) {
        if (data.authProvider !== authProvider) {
          return res
            .status(403)
            .send(`Access denied. Please log in using ${data.authProvider}.`);
        }

        const loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
          email: email,
          password: password,
          authProvider: authProvider
        });

        const token = loginResponse.data.jwt;

        res.cookie('sky', token, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3:15 שעות
        });

        return res.redirect('https://skyrocket.onrender.com/search_form.html');
      }
    } catch (error) {
      console.error('Error during signup or login:', error);
      return res.status(500).send('Error during signup or login');
    }
  }
}

module.exports = HandAuth;
