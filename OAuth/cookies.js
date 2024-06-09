const facebook = require('./facebook_auth');
const github = require('./github_auth');
const google = require('./google_auth');
const tiktok = require('./tiktok_auth');

function getCookieData(req,res) {
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').map(cookie => cookie.trim()) : [];
    const cookieMap = Object.fromEntries(cookies.map(cookie => cookie.split('=')));
    if (!cookieMap.axeptio_cookies || !cookieMap.axeptio_authorized_vendors || !cookieMap.axeptio_all_vendors) {
        return res.status(500).send({ error: "Cookies must be reconfirmed" }); ;
    }

    try {
        const decodedSkyToken = decodeURIComponent(cookieMap.axeptio_cookies);
        const parsedSkyToken = JSON.parse(decodedSkyToken);
        return parsedSkyToken 
           
    } catch (error) {
        console.error("Error decoding cookie:", error);
         return res.status(500).send({ error: "Cookies must be reconfirmed" }); ;

    }
}

function check(req, res,name) {
    const cookieData = getCookieData(req);
    if (!cookieData) {
        return res.status(500).send({ error: "Failed to decode cookie data" }); ;


    }
    const a = name
    console.log('a',a);
    if (cookieData.hasOwnProperty(name)) {
        switch (name) {
            case "github":
                return github.auth();
            case "google":
                return google.auth();
            case "facebook":
                return facebook.auth();
        }
    } else {
        return res.status(400).send({ error: "The ${name} cookie is not approved by you`," }); ;

    }
}

module.exports = {check};
