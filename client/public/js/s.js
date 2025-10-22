const API_LOGIN_URL = "https://skyrocket.onrender.com/role_users/loginWebAuthn";
const API_REG_URL = "https://skyrocket.onrender.com/role_users/signupwebauthn";

// משתנים גלובליים
let isWebAuthnSupported = false;
let storedEmail = localStorage.getItem('userEmail');
let storedcredentialID = localStorage.getItem('credentialID');
  const credentialID = bufferToBase64(credential.rawId);
        const clientDataJSON = bufferToBase64(credential.response.clientDataJSON);
        const attestationObject = bufferToBase64(credential.response.attestationObject);