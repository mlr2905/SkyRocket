import * as C from '../utils/constants.js';

/**
* Generic helper function for performing fetch requests
 * @param {string} url
 * @param {object} options
 */
async function apiRequest(url, options) {
    try {
        ensureDeviceId();

        const response = await fetch(url, options);

        const contentType = response.headers.get("content-type");

        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            const textResponse = await response.text();
            console.error('Expected JSON but received non-JSON response:', textResponse);
            throw new Error('Server returned an invalid response format (HTML/Text instead of JSON). Check your API URL.');
        }

        if (!response.ok) {
            const errorMessage = data.error || `HTTP error! status: ${response.status}`;
            return errorMessage;
        }


        return data;

    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setForeverCookie(name, value) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 10);
    const expires = "expires=" + d.toUTCString();

    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function ensureDeviceId() {
    let deviceId = getCookie('auth_device_id');

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        setForeverCookie('auth_device_id', deviceId);
    } else {

        setForeverCookie('auth_device_id', deviceId);
    }

    return deviceId;
}

export function redirectToGit() {
    ensureDeviceId();

    window.location.href = C.GIT_AUTH_URL;
}

export function redirectToGoogle() {
    ensureDeviceId();

    window.location.href = C.GOOGLE_AUTH_URL;
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


export async function loginWithPasswordAPI(email, password, deviceId) {
    return apiRequest(C.API_LOGIN_PASSWORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }),
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