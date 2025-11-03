
import * as Utils from '../utils/utils.js';
import * as AuthService from '../services/authService.js';
import { FormValidator } from './LoginFormValidator.js';
import { WebAuthnController } from './LoginWebAuthnController.js';
import { UIHandler } from './LoginUIHandler.js';

export class LoginController {
    #storedEmail;
    #storedCredentialID;
    #authCodeInterval;
    #resendTimerInterval;
    #loginForm;
    #emailInput;
    #passwordInput;
    #verificationCodeInput;
    #connectButton;
    #gitButton;
    #biometricButton;
    #googleButton;
    #messageElement;
    #successMessage;
    #loadingIcon;
    #timerElement;
    #timerDiv;
    #resendButton;
    #verificationButton;
    #codeInputContainer;

    #validator;
    #webAuthn;
    #ui;

    #boundHandleConnect;
    #boundHandleValidation;

    constructor() {
        this.#selectDOMElements();
        this.#loadStateFromStorage();

        // --- Instantiate Sub-Controllers ---
        this.#validator = new FormValidator({
            emailInput: this.#emailInput,
            passwordInput: this.#passwordInput,
            verificationCodeInput: this.#verificationCodeInput,
            toggleAuthButton: document.getElementById('toggle-auth-type'),
            forgotPasswordLink: document.getElementById('forgot-password-link'),
            emailCheckIcon: document.getElementById('email_'),
            emailErrorIcon: document.getElementById('email_error'),
            passContainer: document.getElementById('pass_'),
            passCheckIcon: document.getElementById('password_'),
            passErrorIcon: document.getElementById('password_error'),
            codeCheckIcon: document.getElementById('code_'),
            codeErrorIcon: document.getElementById('code_error'),
            connectButton: this.#connectButton,
            changeButton: document.getElementById('Change')
        });

        this.#webAuthn = new WebAuthnController({
            biometricStatus: document.getElementById('biometricStatus'),
            messageElement: this.#messageElement,
            emailInput: this.#emailInput,
        }, this.#storedCredentialID);

        this.#ui = new UIHandler({
            emailInput: this.#emailInput,
            passwordInput: this.#passwordInput,
            changeButton: document.getElementById('Change'),
            eyeIcon: document.getElementById('eyeicon'),
            toggleAuthButton: document.getElementById('toggle-auth-type'),
            verificationButton: this.#verificationButton,
            connectButton: this.#connectButton,
            emailCheckIcon: document.getElementById('email_'),
            passContainer: document.getElementById('pass_')
        });

       
        this.#boundHandleConnect = this.#handleConnect.bind(this);
        this.#boundHandleValidation = this.#handleValidation.bind(this);

        this.#ui.setConnectHandler(this.#boundHandleConnect);
        this.#ui.setValidationHandler(this.#boundHandleValidation);

        this.#attachEventListeners();

        this.#loadingIcon.style.display = 'none';
        if (this.#storedEmail) {
            this.#validator.validateEmail(); 
        }
    }

    // --- Getters & Setters for State ---
    get userEmail() {
        return this.#storedEmail;
    }

    set userEmail(email) {
        this.#storedEmail = email;
        localStorage.setItem('userEmail', email);
    }

    get credentialID() {
        return this.#storedCredentialID;
    }

    set credentialID(id) {
        this.#storedCredentialID = id;
        localStorage.setItem('credentialID', id);
        if (this.#webAuthn) {
            this.#webAuthn.credentialID = id; // Keep WebAuthn controller in sync
        }
    }

    // --- Setup ---
    #selectDOMElements() {
        this.#loginForm = document.getElementById('login-form');
        this.#emailInput = document.getElementById('email');
        this.#passwordInput = document.getElementById('password');
        this.#verificationCodeInput = document.getElementById('verification-code');
        this.#connectButton = document.getElementById('connect-button');
        this.#gitButton = document.getElementById('git');
        this.#biometricButton = document.getElementById('face');
        this.#googleButton = document.querySelector('button img[alt="google logo"]');
        this.#messageElement = document.getElementById('Message');
        this.#successMessage = document.getElementById('success-message');
        this.#loadingIcon = document.getElementById('loading-icon');
        this.#timerElement = document.getElementById('timer');
        this.#timerDiv = document.getElementById('timer_');
        this.#resendButton = document.getElementById('resend-message');
        this.#verificationButton = document.getElementById('Verification');
        this.#codeInputContainer = document.getElementById('verification-code-input');
    }

    #loadStateFromStorage() {
        this.userEmail = localStorage.getItem('userEmail');
        this.credentialID = localStorage.getItem('credentialID');
    }

    #attachEventListeners() {
        this.#loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
        });
        // --- Validation Listeners (delegated to Validator) ---
        
        this.#emailInput.addEventListener('input', () => this.#validator.validateEmail());
        this.#passwordInput.addEventListener('input', () => this.#validator.validatePassword());
        this.#verificationCodeInput.addEventListener('input', () => this.#validator.validateCode());

        // --- UI Handlers (delegated to UIHandler) ---
        document.getElementById('Change').addEventListener('click', () => this.#ui.changeEmail());
        document.getElementById('eyeicon').addEventListener('click', () => this.#ui.togglePasswordVisibility());
        document.getElementById('toggle-auth-type').addEventListener('click', () => this.#ui.toggleAuthType());

        // --- Auth Action Listeners (handled by this Controller) ---
        this.#verificationButton.addEventListener('click', (e) => this.#handleAuthCode(e));
        this.#resendButton.addEventListener('click', (e) => this.#handleAuthCode(e));

        this.#connectButton.removeAttribute('onclick');

        this.#connectButton.addEventListener('click', this.#boundHandleConnect); // Default handler

        // --- Other Auth ---

        this.#gitButton.addEventListener('click', (event) => {
            AuthService.redirectToGit();
            event.preventDefault(); 

        });

        this.#googleButton.parentElement.addEventListener('click', (event) => {
            AuthService.redirectToGoogle();
            event.preventDefault(); 

        });

        this.#biometricButton.addEventListener('click', (event) => {
            this.#handleBiometricLogin();
            redirectToGoogle
            event.preventDefault();
        });
    
    }

    // --- Main Auth Handlers ---
    async #handleBiometricLogin() {
        const email = this.#emailInput.value || this.userEmail;
        const result = await this.#webAuthn.handleLoginBiometric(email);

        if (result.success) {
            console.log("DDDDDD", JSON.stringify(result));

            localStorage.setItem('sky', JSON.stringify(result.jwt));
            localStorage.setItem('userId', result.id);
            localStorage.setItem('userEmail', result.email);

            this.#successMessage.textContent = result.message;
            window.location.href = result.redirectUrl;

        } else if (result.newCredentialID) {
            this.credentialID = result.newCredentialID;
        } else if (result.message) {
            this.#successMessage.textContent = result.message;
        }
    }
    async #handleAuthCode(event) {
        event.preventDefault();
        const email = this.#emailInput.value;

        this.#loadingIcon.style.display = 'block';
        this.#resendButton.style.display = 'none';

        try {
            const data = await AuthService.sendAuthCodeAPI(email);
            this.#loadingIcon.style.display = 'none';

            if (data.datas.code === "succeeded") {
                this.#verificationButton.style.display = 'none';
                this.#codeInputContainer.style.display = 'block';
                document.getElementById('toggle-auth-type').style.display = 'none';
                this.#successMessage.textContent = "Code sent successfully! Will expire in: ";
                this.#verificationCodeInput.removeAttribute("readonly");
                this.#successMessage.style.display = 'block';

                if (this.#authCodeInterval) clearInterval(this.#authCodeInterval);
                if (this.#resendTimerInterval) clearInterval(this.#resendTimerInterval);

                let totalSeconds = 5 * 60;
                this.#authCodeInterval = setInterval(() => {
                    let minutes = parseInt(totalSeconds / 60, 10);
                    let seconds = parseInt(totalSeconds % 60, 10);
                    this.#timerDiv.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
                    if (--totalSeconds < 0) {
                        clearInterval(this.#authCodeInterval);
                        this.#timerDiv.textContent = "Expired";
                    }
                }, 1000);

                this.#resendTimerInterval = Utils.startTimer(1 * 30, this.#timerElement, this.#resendButton);
                this.#timerElement.style.display = 'block';
            } else {
                this.#successMessage.textContent = "Failed to send code. Please try again.";
            }
        } catch (error) {
            this.#loadingIcon.style.display = 'none';
            this.#successMessage.textContent = `Try again! Error: ${error.message}`;
        }
    }

    async #handleValidation(event) {
        event.preventDefault();
        const email = this.#emailInput.value;
        const code = this.#verificationCodeInput.value;
        this.#loadingIcon.style.display = 'block';

        try {
            const data = await AuthService.validateCodeAPI(email, code);
            this.#loadingIcon.style.display = 'none';

            if (data.redirectUrl) {

                localStorage.setItem('sky', JSON.stringify(data.datas.jwt));
                localStorage.setItem('userId', data.datas.id);
                localStorage.setItem('userEmail', data.datas.email);


                this.#successMessage.textContent = data.datas.code;
                window.location.href = data.redirectUrl;
            } else {
                this.#successMessage.textContent = data.datas.code || "Validation failed";
            }
        } catch (error) {
            this.#loadingIcon.style.display = 'none';
            this.#successMessage.textContent = error.message;
            console.error('Error:', error);
        }
    }

    async #handleConnect(event) {
        event.preventDefault();
        const email = this.#emailInput.value;
        const password = this.#passwordInput.value;
        this.#loadingIcon.style.display = 'block';

        try {
            const data = await AuthService.loginWithPasswordAPI(email, password);
            this.#loadingIcon.style.display = 'none';

            if (data.e === "no") {
                localStorage.setItem('sky', JSON.stringify(data.jwt));
                this.userEmail = email; 
                this.#successMessage.textContent = 'Login successful!';
                window.location.href = data.redirectUrl;
            } else {
                this.#successMessage.textContent = data.error;
            }
        } catch (error) {
            this.#loadingIcon.style.display = 'none';
            this.#successMessage.textContent = error.message;
        }
    }
}