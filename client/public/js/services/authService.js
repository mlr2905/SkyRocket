import * as C from '../utils/constants.js';

/**
* Generic helper function for performing fetch requests
 * @param {string} url
 * @param {object} options
 */
 async function apiRequest(url, options) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
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
        throw error;
    }
}

export function redirectToGoogle() {
    window.location.href = C.GOOGLE_AUTH_URL;
}

export function redirectToGit() {
    window.location.href = C.GIT_AUTH_URL;
}
export async function logoutAPI() {
    return apiRequest(C.API_LOGOUT_URL, {
        method: 'POST',
        credentials: 'include' 
    });
}

export async function registerBiometricAPI(credentialID, attestationObject, clientDataJSON) {
    return apiRequest(C.API_REG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            credentialID, 
            attestationObject,
            clientDataJSON
        }),
    });
}

export async function loginBiometricAPI(credentialID, email, authenticatorData, clientData, signature) {
    return apiRequest(C.API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            credentialID, 
            email, 
            authenticatorData, 
            clientDataJSON: clientData, 
            signature 
        }),


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


export async function loginWithPasswordAPI(email, password,deviceId) {
    return apiRequest(C.API_LOGIN_PASSWORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password ,deviceId}),
    });
}


export async function getCountryCode() {
    return apiRequest(C.API_IP_URL);
}

export async function checkEmailExists(email) {
    return apiRequest(`${C.API_USER_SEARCH_URL}?email=${email}`);
}

export async function checkEmailDomain(email) {
    return apiRequest(`${C.API_EMAIL_CHECK_URL}?email=${email}`);
}

export async function signupUser(email, password) {
    return apiRequest(C.API_SIGNUP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
}

export async function registerCustomer(customerData) {
    return apiRequest(C.API_CUSTOMERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
    });
}