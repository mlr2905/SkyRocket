const facebook = require('./facebook_auth');
const github = require('./github_auth');
const google = require('./google_auth');
const tiktok = require('./tiktok_auth');

function getCookieData(req) {
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').map(cookie => cookie.trim()) : [];
    const cookieMap = Object.fromEntries(cookies.map(cookie => cookie.split('=')));
    if (!cookieMap.axeptio_cookies || !cookieMap.axeptio_authorized_vendors || !cookieMap.axeptio_all_vendors) {
        return { error: "Cookies must be reconfirmed" };
    }

    try {
        const decodedSkyToken = decodeURIComponent(cookieMap.axeptio_cookies);
        const parsedSkyToken = JSON.parse(decodedSkyToken);
        return parsedSkyToken 
           
    } catch (error) {
        console.error("Error decoding cookie:", error);
        return { error: "Failed to decode cookie data" };
    }
}

function check(req, name,app) {
    const cookieData = getCookieData(req);
    if (!cookieData) {
        return { 'send': 'Internal Server Error', 'n': 500 };
    }
    const a = name
    console.log('a',a);
    if (cookieData.hasOwnProperty(name)) {
        switch (name) {
            case "github":
                return github.auth(app);
            case "google":
                return google.auth(app);
            case "facebook":
                return facebook.auth(app);
        }
    } else {
        return { 'send': `The ${name} cookie is not approved by you`, 'n': 400 };
    }
}

module.exports = {check};
