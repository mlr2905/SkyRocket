// cookies.js
function getCookieData(req) {
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').map(cookie => cookie.trim()) : [];
    const cookieMap = Object.fromEntries(cookies.map(cookie => cookie.split('=')));
    console.log("cookieMap", cookieMap);
    if (!cookieMap.axeptio_cookies || !cookieMap.axeptio_authorized_vendors || !cookieMap.axeptio_all_vendors) {
        return { error: "Cookies must be reconfirmed" };
    }

    try {
        const decodedSkyToken = decodeURIComponent(cookieMap.axeptio_cookies);
        console.log("decodedSkyToken", decodedSkyToken);
        const parsedSkyToken = JSON.parse(decodedSkyToken);
        console.log("parsedSkyToken", parsedSkyToken);
        return parsedSkyToken 
           
    } catch (error) {
        console.error("Error decoding cookie:", error);
        return { error: "Failed to decode cookie data" };
    }
}

function check(req, name) {
    console.log("check", req, name);
    const cookieData = getCookieData(req);

    if (!cookieData) {
        return { 'send': 'Internal Server Error', 'n': 500 };
    }

    if (cookieData.name) {
        console.log("ok");
        switch (name) {
            case "github":
                return github_auth(app);
            case "google":
                return google_auth(app);
            case "facebook":
                return facebook_auth(app);
        }
    } else {
        return { 'send': `The ${name} cookie is not approved by you`, 'n': 400 };
    }
}

module.exports = {
    check: check
};
