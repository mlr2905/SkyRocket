import * as C from '../utils/constants.js';

/**
 * פונקציית עזר גנרית לביצוע בקשות fetch
 * @param {string} url
 * @param {object} options
 */
async function apiRequest(url, options) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // ננסה לקרוא את גוף השגיאה, אם קיים
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: 'Unknown server error' };
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        // זורק את השגיאה הלאה כדי שה-Controller יטפל בה
        throw error;
    }
}

export function redirectToGoogle() {
    window.location.href = C.GOOGLE_AUTH_URL;
}

export function redirectToGit() {
    window.location.href = C.GIT_AUTH_URL;
}

export async function registerBiometricAPI(email, credentialID, publicKey, clientData) {
    return apiRequest(C.API_REG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credentialID, publicKey, clientData }),
    });
}

export async function loginBiometricAPI(credentialID, email, authenticatorData, clientData, signature) {
    return apiRequest(C.API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialID, email, authenticatorData, clientData, signature }),
    });
}

export async function sendAuthCodeAPI(email) {
    return apiRequest(C.API_AUTH_CODE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
}

export async function validateCodeAPI(email, code) {
    return apiRequest(C.API_VALIDATE_CODE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
    });
}

export async function loginWithPasswordAPI(email, password) {
    return apiRequest(C.API_LOGIN_PASSWORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
}