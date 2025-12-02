const bl = require('../bl/bl_role_users');
const Log = require('../logger/logManager');

const FILE = 'clientHelper';
Log.info(FILE, 'init', null, 'Client Helper module initialized');

function extractClientInfo(req) {
    Log.debug(FILE, 'extractClientInfo', null, 'Extracting client info from headers');

    const headers = req.headers;
    
    const ip = headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress || 'unknown';

    const userAgent = headers['user-agent'] || 'unknown';

    let os = 'Unknown OS';
    if (headers['sec-ch-ua-platform']) {
        os = headers['sec-ch-ua-platform'].replace(/"/g, '');
    } else {
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
        else if (userAgent.includes('Macintosh')) os = 'Mac';
        else if (userAgent.includes('Linux')) os = 'Linux';
    }

    let browser = 'Unknown Browser';
    if (headers['sec-ch-ua']) {
        const brands = headers['sec-ch-ua'];
        if (brands.includes('Google Chrome')) browser = 'Chrome';
        else if (brands.includes('Edg')) browser = 'Edge';
        else if (brands.includes('Opera')) browser = 'Opera';
        else if (brands.includes('Chromium')) browser = 'Chromium';
    } 
    
    if (browser === 'Unknown Browser') {
        if (userAgent.includes('Edg')) browser = 'Edge';
        else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    }

    const isMobile = headers['sec-ch-ua-mobile'] === '?1';
    if (isMobile) {
        os += ' (Mobile)';
    }

    return { ip, userAgent, os, browser };
}

async function getNumericIdFromToken(req) {
    const func = 'getNumericIdFromToken';
    const mongoIdFromToken = req.user.id; 

    Log.info(FILE, func, mongoIdFromToken, 'Resolving numeric ID from SQL DB');

    const user = await bl.get_by_id_user(mongoIdFromToken);

    if (user && user.id) {
        Log.debug(FILE, func, mongoIdFromToken, `Resolved numeric ID: ${user.id}`);
        return user.id;
    }

    Log.warn(FILE, func, mongoIdFromToken, 'User not found in PostgreSQL DB');
    throw new Error(`User not found for token.`);
}

module.exports = { extractClientInfo, getNumericIdFromToken };