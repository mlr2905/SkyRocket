const express = require('express');
const axios = require('axios');
const passport = require('passport');

const qs = require('qs');


// קונפיגורציה
const facebook_appId = '1156854418774447';
const facebook_appSecret = '7bd06b4a0356ba8fba5ef8365f37e718';

const clientId = facebook_appId; // Replace with your Facebook App ID
const clientSecret = facebook_appSecret; // Replace with your Facebook App Secret
const redirectUri = 'https://skyrocket.onrender.com/facebook'; // Replace with your redirect URI

const facebook_auth = (app) => {

  // Step 1: Redirect user for Facebook authorization
  app.get('/facebook', (req, res) => {
    const authorizationUrl = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email`;
    res.redirect(authorizationUrl);
  });

  // Step 2: Handle callback URL and exchange code for access token
  app.get('/facebook/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
      return res.status(400).send('No authorization code provided');
    }

    try {
      const tokenResponse = await axios.post('https://graph.facebook.com/v13.0/oauth/access_token', qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new Error('Failed to obtain access token');
      }

      // Use the access token to fetch user information (replace with your desired API call)
      const userInfoResponse = await axios.get('https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken);
      const userInfo = userInfoResponse.data;
      const userId = userInfo.id;
      const userName = userInfo.name;
      const userEmail = userInfo.email;

      // Display the received information (modify based on your needs)
      res.send(`
        <h1>Facebook User Information</h1>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>User Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Access Token:</strong> ${accessToken}</p>
      `);
    } catch (error) {
      console.error('Error fetching access token or user info:', error.response ? error.response.data : error.message);
      res.status(500).send(`Error: ${error.message}`);
    }
  });
};

module.exports = facebook_auth;