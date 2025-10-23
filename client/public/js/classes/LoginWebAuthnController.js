import * as Utils from '../utils/utils.js';
import * as AuthService from '../services/authService.js';

export class WebAuthnController {
    #biometricStatus;
    #messageElement;
    #emailInput;
    #isWebAuthnSupported = false;
    #credentialID = null; // Private state for this controller

    constructor(elements, initialCredentialID) {
        this.#biometricStatus = elements.biometricStatus;
        this.#messageElement = elements.messageElement;
        this.#emailInput = elements.emailInput;
        this.#credentialID = initialCredentialID;
        this.#checkWebAuthnSupport();
    }

    // Getter for support status
    get isWebAuthnSupported() {
        return this.#isWebAuthnSupported;
    }

    // Getter/Setter for credentialID to sync with LoginController and localStorage
    get credentialID() {
        return this.#credentialID;
    }

    set credentialID(id) {
        this.#credentialID = id;
        // The LoginController will be responsible for saving to localStorage
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
            Utils.showMessage(this.#messageElement, 'You must enter an email or register first', 'error');
            return null;
        }

        Utils.showRegistrationAlert();

        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKeyOptions = {
                challenge: challenge,
                rp: { name: "Your biometric authentication system", id: window.location.hostname },
                user: { id: new TextEncoder().encode(email), name: email, displayName: email },
                pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
                authenticatorSelection: { authenticatorAttachment: "platform", requireResidentKey: false, userVerification: "required" },
                timeout: 60000,
                attestation: "none"
            };

            const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
            
            Utils.updateRegistrationAlert('Sending data to server...');

            const credentialID = Utils.bufferToBase64(credential.rawId);
            const clientDataJSON = Utils.bufferToBase64(credential.response.clientDataJSON);
            const attestationObject = Utils.bufferToBase64(credential.response.attestationObject);

            const data = await AuthService.registerBiometricAPI(email, credentialID, attestationObject, clientDataJSON);

            Utils.hideRegistrationAlert();

            if (!data.e || data.e === 'no') {
                Utils.showMessage(this.#messageElement, 'Biometric identification registration completed successfully!', 'success');
                this.credentialID = credentialID; // Update internal state
                return credentialID; // Return new ID to LoginController
            } else {
                Utils.showMessage(this.#messageElement, 'Error in biometric registration: ' + (data.error || 'An error occurred'), 'error');
                return null;
            }
        } catch (error) {
            console.error('Error in biometric identification registration:', error);
            Utils.hideRegistrationAlert();
            Utils.showMessage(this.#messageElement, 'An error occurred: ' + error.message, 'error');
            return null;
        }
    }

    async handleLoginBiometric(email) {
        if (!email) {
            Utils.showMessage(this.#messageElement, 'You must enter an email.', 'error');
            return { success: false };
        }

        try {
            const credentialID = this.#credentialID;
            if (!credentialID) {
                // If no ID, trigger registration
                const newCredentialID = await this.handleRegisterBiometric(email);
                return { success: false, newCredentialID: newCredentialID }; // Inform controller registration happened
            }

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKeyOptions = {
                challenge: challenge,
                rpId: window.location.hostname,
                allowCredentials: [{ id: Utils.base64ToBuffer(credentialID), type: 'public-key' }],
                timeout: 60000,
                userVerification: "required"
            };

            const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });

            const assertionId = Utils.bufferToBase64(assertion.rawId);
            const clientDataJSON = Utils.bufferToBase64(assertion.response.clientDataJSON);
            const authenticatorData = Utils.bufferToBase64(assertion.response.authenticatorData);
            const signature = Utils.bufferToBase64(assertion.response.signature);

            const data = await AuthService.loginBiometricAPI(assertionId, email, authenticatorData, clientDataJSON, signature);

            if (!data.e || data.e === 'no') {
                Utils.showMessage(this.#messageElement, 'You have successfully logged in with biometric identification!', 'success');
                return { success: true, jwt: data.jwt, redirectUrl: data.redirectUrl, message: 'Login successful!' };
            } else {
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Error connecting with biometric identification:', error);
            Utils.showMessage(this.#messageElement, 'An error occurred during the login process: ' + error.message, 'error');
            return { success: false, message: error.message };
        }
    }
}