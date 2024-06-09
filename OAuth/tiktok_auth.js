const express = require('express');
const app = express()
const axios = require('axios');
const qs = require('qs');
const session = require('express-session');

const router = express.Router();

// קונפיגורציה
const tiktok_clientId = '7376326045954738181';
const tiktok_clientSecret = 'K04uYOnkpIwiVv84vcOAXzqUWG3iTGgj';


const clientId = tiktok_clientId 
const clientSecret = tiktok_clientSecret 
const redirectUri = 'https://skyrocket.onrender.com/tiktok';


const auth = () => {

    // שלב 1: הכוונת המשתמש לאישור בטיקטוק
    app.get('/tiktok', (req, res) => {
        const authorizationUrl = `https://www.tiktok.com/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic,user.info.email`;
        res.redirect(authorizationUrl);
    });

    // שלב 2: קבלת קוד האישור וחילופי לקוד גישה
    app.get('/tiktok/callback', async (req, res) => {
        const authorizationCode = req.query.code;

        if (!authorizationCode) {
            return res.status(400).send('No authorization code provided');
        }

        try {
            const tokenResponse = await axios.post('https://open-api.tiktok.com/oauth/access_token', qs.stringify({
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

            const accessToken = tokenResponse.data.data.access_token;
            if (!accessToken) {
                throw new Error('Failed to obtain access token');
            }

            // בקשת מידע על המשתמש
            const userInfoResponse = await axios.get('https://open-api.tiktok.com/user/info/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const userInfo = userInfoResponse.data.data;
            const userEmail = userInfo.email || 'לא זמין';
            const profilePicture = userInfo.avatar || '';

            // הצגת המידע שהתקבל
            res.send(`
                <h1>מידע משתמש</h1>
                <p><strong>אימייל:</strong> ${userEmail}</p>
                ${profilePicture ? `<p><strong>תמונת פרופיל:</strong> <img src="${profilePicture}" alt="Profile Picture" /></p>` : ''}
                <p><strong>Access Token:</strong> ${accessToken}</p>
            `);
        } catch (error) {
            console.error('Error fetching access token or user info:', error.response ? error.response.data : error.message);
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};

module.exports = {auth};
