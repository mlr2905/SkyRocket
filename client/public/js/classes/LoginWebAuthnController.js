
import * as uiUtils from '../utils/uiUtils.js';
import * as base64 from '../utils/formatters.js';
import * as AuthService from '../services/authService.js';

export class WebAuthnController {
    #biometricStatus;
    #emailInput;
    #isWebAuthnSupported = false;
    #credentialID;

    constructor(elements, initialCredentialID) {
        this.#biometricStatus = elements.biometricStatus;
        this.#emailInput = elements.emailInput;
        this.#credentialID = initialCredentialID;
        this.#checkWebAuthnSupport();
    }


    #showAlert(message, type, title) {
        if (type === 'success') {
            uiUtils.showCustomAlert(title || 'הצלחה', message, 'success');
        } else if (type === 'error') {
            uiUtils.showCustomAlert(title || 'שגיאה', message, 'error');
        } else {
            uiUtils.showCustomAlert(title || 'מידע', message, 'warning');
        }
    }

    get isWebAuthnSupported() {
        return this.#isWebAuthnSupported;
    }

    get credentialID() {
        return this.#credentialID;
    }

    set credentialID(id) {
        this.#credentialID = id;
    }

    #checkWebAuthnSupport() {
        if (!this.#biometricStatus) return;

        if (window.PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then((available) => {
                    if (available) {
                        this.#isWebAuthnSupported = true;
                        this.#biometricStatus.textContent = '✅ Your device supports biometric authentication';
                        this.#biometricStatus.style.color = 'green';
                    } else {
                        this.#biometricStatus.textContent = '❌ Your device does not support biometric authentication';
                        this.#biometricStatus.style.color = 'red';
                    }
                })
                .catch(error => {
                    console.error('Error checking WebAuthn support:', error);
                    this.#biometricStatus.textContent = '❌ An error occurred while checking biometric authentication support';
                    this.#biometricStatus.style.color = 'red';
                });
        } else {
            this.#biometricStatus.textContent = '❌ Your browser does not support biometric authentication';
            this.#biometricStatus.style.color = 'red';
        }
    }

    async handleRegisterBiometric(email) {
        if (!email) {
            this.#showAlert('You must enter an email or register first', 'error', 'error');
            return;
        }

        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKeyOptions = {
                challenge: challenge,
                rp: { name: "SkyRocket", id: window.location.hostname },
                user: { id: new TextEncoder().encode(email), name: email, displayName: email },
                pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    requireResidentKey: true,
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "none"
            };

            const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });

            uiUtils.showRegistrationAlert();
            uiUtils.updateRegistrationAlert('Sending data to server...');

            const credentialID = base64.bufferToBase64(credential.rawId);
            const clientDataJSON = base64.bufferToBase64(credential.response.clientDataJSON);
            const attestationObject = base64.bufferToBase64(credential.response.attestationObject);

            const data = await AuthService.registerBiometricAPI(credentialID, attestationObject, clientDataJSON);
            uiUtils.hideRegistrationAlert();

            if (data && (data.success === true || data.code === 'credential_registered')) {
                this.#showAlert('טביעת האצבע נרשמה בהצלחה!', 'success', 'רישום הושלם');
                this.credentialID = credentialID;
                return credentialID;
            } else {
                this.#showAlert(data.error || 'An error occurred', 'error', 'שגיאה ברישום');
                return;
            }
        } catch (error) {
            console.error('Error in biometric identification registration:', error);
            uiUtils.hideRegistrationAlert();

            if (error.name === 'NotAllowedError') {
                this.#showAlert('תהליך רישום טביעת האצבע בוטל על ידך.', 'info', 'הרישום בוטל');
            } else {
                this.#showAlert('אירעה שגיאה: ' + error.message, 'error', 'שגיאה ברישום');
            }
            return;
        }
    }

    async handleLoginBiometric(email) {
        if (!email) {
            this.#showAlert('You must enter an email.', 'error', 'שגיאה');
            return { success: false };
        }

        try {
            const credentialID = this.#credentialID;
            if (!credentialID || credentialID === "null") {
                console.warn("No credentialID found in local storage. User must register first.");
                return { success: false, code: 'MUST_REGISTER' };
            }

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            const publicKeyOptions = {
                challenge: challenge,
                rpId: window.location.hostname,
                allowCredentials: [{ id: base64.base64ToBuffer(credentialID), type: 'public-key' }],
                timeout: 60000,
                userVerification: "required"
            };

            const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });

            const assertionId = base64.bufferToBase64(assertion.rawId);
            const clientDataJSON = base64.bufferToBase64(assertion.response.clientDataJSON);
            const authenticatorData = base64.bufferToBase64(assertion.response.authenticatorData);
            const signature = base64.bufferToBase64(assertion.response.signature);
            const data = await AuthService.loginBiometricAPI(assertionId, email, authenticatorData, clientDataJSON, signature);

            if (!data.e || data.e === 'no') {
                return { success: true, jwt: data.jwt, redirectUrl: data.redirectUrl, message: 'Login successful!' };
            } else {
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Error connecting with biometric identification:', error);

            if (error.name === 'NotAllowedError') {
                this.#showAlert('תהליך ההתחברות בוטל.', 'info', 'ההתחברות בוטלה');
                return { success: false, message: 'Login canceled.' };
            } else {
                this.#showAlert('אירעה שגיאה: ' + error.message, 'error', 'שגיאה בהתחברות');
                return { success: false, message: error.message };
            }
        }
    }
}