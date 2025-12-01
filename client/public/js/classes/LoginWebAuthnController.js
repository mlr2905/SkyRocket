import * as uiUtils from '../utils/uiUtils.js';
import * as base64 from '../utils/formatters.js';
import * as AuthService from '../services/authService.js';

let isWebAuthnTransactionPending = false;

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
    
    #acquireLock() {
        if (isWebAuthnTransactionPending) {
            console.warn('WebAuthn operation blocked: Another request is already pending.');
            return false;
        }
        isWebAuthnTransactionPending = true;
        return true;
    }

    #releaseLock() {
        isWebAuthnTransactionPending = false;
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

    if (!this.#acquireLock()) {
        this.#showAlert('תהליך אחר רץ ברקע, אנא המתן...', 'warning', 'פעולה חסומה');
        return;
    }

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const publicKeyOptions = {
            challenge: challenge,
            rp: { name: "SkyRocket", id: window.location.hostname },
            user: { 
                id: new TextEncoder().encode(email), 
                name: email, 
                displayName: email 
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            
            authenticatorSelection: {
                authenticatorAttachment: "platform", // משתמש ב-TouchID/Windows Hello של המכשיר
                
                // ✅ השינוי החשוב: הגדרת Passkey מודרנית
                residentKey: "required",      // מכריח יצירת מפתח ששמור במכשיר (Passkey)
                requireResidentKey: true,     // תמיכה לאחור בדפדפנים ישנים
                
                userVerification: "required"  // מחייב זיהוי ביומטרי/PIN (לא סתם לחיצה)
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
            
            // הערה: מכיוון שעברנו ל-Passkeys, השמירה ב-localStorage היא אופציונלית.
            // היא טובה כדי להציג ב-UI שהמשתמש רשום, אבל הלוגין יעבוד גם בלעדיה.
            localStorage.setItem('credentialID', credentialID);
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
        } else if (error.name === 'InvalidStateError') {
            this.#showAlert('מכשיר זה כבר רשום במערכת.', 'warning', 'כפילות');
        } else {
            this.#showAlert('אירעה שגיאה: ' + error.message, 'error', 'שגיאה ברישום');
        }
        return;
    } finally {
        this.#releaseLock();
    }
}

async handleLoginBiometric() {

    if (!this.#acquireLock()) {
        return { success: false, message: 'Request pending' };
    }

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const publicKeyOptions = {
            challenge: challenge,
            rpId: window.location.hostname,
            allowCredentials: [],
            userVerification: "required",
            timeout: 60000
        };

        const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });

        const assertionId = base64.bufferToBase64(assertion.rawId);
        const clientDataJSON = base64.bufferToBase64(assertion.response.clientDataJSON);
        const authenticatorData = base64.bufferToBase64(assertion.response.authenticatorData);
        const signature = base64.bufferToBase64(assertion.response.signature);
        
        const data = await AuthService.loginBiometricAPI(
            assertionId, 
            authenticatorData, 
            clientDataJSON, 
            signature
        );

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
    } finally {
        this.#releaseLock();
    }
}
}