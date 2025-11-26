
import * as formatters from '../utils/formatters.js';
import * as AuthService from '../services/authService.js';
import { FormValidator } from './LoginFormValidator.js';
import { WebAuthnController } from './LoginWebAuthnController.js';
import { UIHandler } from './LoginUIHandler.js';

export class LoginController {
    #storedEmail;
    #storedCredentialID;
    #authCodeInterval;
    #resendTimerInterval;

    #elements = {};
    #validator;
    #webAuthn;
    #ui;

    #bound = {
        validateEmail: null,
        validatePassword: null,
        validateCode: null,
        changeEmail: null,
        togglePassword: null,
        toggleAuthType: null,
        handleAuthCode: null,
        handleConnect: null,
        handleValidation: null,
        handleBiometricLogin: null,
        handleGitLogin: null,
        handleGoogleLogin: null,
    };

    init() {
        this.#selectDOMElements();
        this.#loadStateFromStorage();

        this.#validator = new FormValidator({
            emailInput: this.#elements.emailInput,
            passwordInput: this.#elements.passwordInput,
            verificationCodeInput: this.#elements.verificationCodeInput,
            toggleAuthButton: this.#elements.toggleAuthButton,
            forgotPasswordLink: document.getElementById('forgot-password-link'),
            emailCheckIcon: document.getElementById('email_'),
            emailErrorIcon: document.getElementById('email_error'),
            passContainer: document.getElementById('pass_'),
            passCheckIcon: document.getElementById('password_'),
            passErrorIcon: document.getElementById('password_error'),
            codeCheckIcon: document.getElementById('code_'),
            codeErrorIcon: document.getElementById('code_error'),
            connectButton: this.#elements.connectButton,
            changeButton: this.#elements.changeButton
        });

        this.#webAuthn = new WebAuthnController({
            biometricStatus: document.getElementById('biometricStatus'),
            messageElement: this.#elements.messageElement,
            emailInput: this.#elements.emailInput,
        }, this.#storedCredentialID);

        this.#ui = new UIHandler({
            emailInput: this.#elements.emailInput,
            passwordInput: this.#elements.passwordInput,
            changeButton: this.#elements.changeButton,
            eyeIcon: this.#elements.eyeIcon,
            toggleAuthButton: this.#elements.toggleAuthButton,
            verificationButton: this.#elements.verificationButton,
            connectButton: this.#elements.connectButton,
            emailCheckIcon: document.getElementById('email_'),
            passContainer: this.#elements.passContainer
        });

        this.#bindEventHandlers();
        this.#ui.setConnectHandler(this.#bound.handleConnect);
        this.#ui.setValidationHandler(this.#bound.handleValidation);
        this.#attachEventListeners();

        if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';

        if (this.#storedEmail) {
            this.#elements.emailInput.value = this.#storedEmail;
            this.#validator.validateEmail();
        }
    }

    destroy() {
        this.#removeEventListeners();

        if (this.#authCodeInterval) clearInterval(this.#authCodeInterval);
        if (this.#resendTimerInterval) clearInterval(this.#resendTimerInterval);

        this.#elements = {};
        this.#validator = null;
        this.#webAuthn = null;
        this.#ui = null;
        this.#bound = {};
    }

    #selectDOMElements() {
        this.#elements = {
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            verificationCodeInput: document.getElementById('verification-code'),
            connectButton: document.getElementById('connect-button'),
            gitButton: document.getElementById('git'),
            biometricButton: document.getElementById('fingerprint'),
            googleButton: document.getElementById('google'),
            messageElement: document.getElementById('Message'),
            successMessage: document.getElementById('success-message'),
            loadingIcon: document.getElementById('loading-icon'),
            timerElement: document.getElementById('timer'),
            timerDiv: document.getElementById('timer_'),
            resendButton: document.getElementById('resend-message'),
            verificationButton: document.getElementById('Verification'),
            codeInputContainer: document.getElementById('verification-code-input'),
            changeButton: document.getElementById('Change'),
            eyeIcon: document.getElementById('eyeicon'),
            toggleAuthButton: document.getElementById('toggle-auth-type'),
            passContainer: document.getElementById('pass_')
        };
    }

    #loadStateFromStorage() {
        this.userEmail = localStorage.getItem('userEmail');
        this.credentialID = localStorage.getItem('credentialID');
    }

    #bindEventHandlers() {
        this.#bound.validateEmail = () => this.#validator.validateEmail();
        this.#bound.validatePassword = () => this.#validator.validatePassword();
        this.#bound.validateCode = () => this.#validator.validateCode();
        this.#bound.changeEmail = () => this.#ui.changeEmail();
        this.#bound.togglePassword = () => this.#ui.togglePasswordVisibility();
        this.#bound.toggleAuthType = () => this.#ui.toggleAuthType();
        this.#bound.handleAuthCode = (e) => this.#handleAuthCode(e);
        this.#bound.handleConnect = (e) => this.#handleConnect(e);
        this.#bound.handleValidation = (e) => this.#handleValidation(e);
        this.#bound.handleBiometricLogin = (e) => this.#handleBiometricLogin(e);
        this.#bound.handleGitLogin = (e) => AuthService.redirectToGit(e);
        this.#bound.handleGoogleLogin = (e) => AuthService.redirectToGoogle(e);
    }

    #attachEventListeners() {
        this.#elements.emailInput?.addEventListener('input', this.#bound.validateEmail);
        this.#elements.passwordInput?.addEventListener('input', this.#bound.validatePassword);
        this.#elements.verificationCodeInput?.addEventListener('input', this.#bound.validateCode);
        this.#elements.changeButton?.addEventListener('click', this.#bound.changeEmail);
        this.#elements.eyeIcon?.addEventListener('click', this.#bound.togglePassword);
        this.#elements.toggleAuthButton?.addEventListener('click', this.#bound.toggleAuthType);
        this.#elements.verificationButton?.addEventListener('click', this.#bound.handleAuthCode);
        this.#elements.resendButton?.addEventListener('click', this.#bound.handleAuthCode);
        this.#elements.connectButton?.addEventListener('click', this.#bound.handleConnect);
        this.#elements.gitButton?.addEventListener('click', this.#bound.handleGitLogin);
        this.#elements.googleButton?.addEventListener('click', this.#bound.handleGoogleLogin);
        this.#elements.biometricButton?.addEventListener('click', this.#bound.handleBiometricLogin);
    }

    #removeEventListeners() {
        this.#elements.emailInput?.removeEventListener('input', this.#bound.validateEmail);
        this.#elements.passwordInput?.removeEventListener('input', this.#bound.validatePassword);
        this.#elements.verificationCodeInput?.removeEventListener('input', this.#bound.validateCode);
        this.#elements.changeButton?.removeEventListener('click', this.#bound.changeEmail);
        this.#elements.eyeIcon?.removeEventListener('click', this.#bound.togglePassword);
        this.#elements.toggleAuthButton?.removeEventListener('click', this.#bound.toggleAuthType);
        this.#elements.verificationButton?.removeEventListener('click', this.#bound.handleAuthCode);
        this.#elements.resendButton?.removeEventListener('click', this.#bound.handleAuthCode);
        this.#elements.connectButton?.removeEventListener('click', this.#bound.handleConnect);
        this.#elements.connectButton?.removeEventListener('click', this.#bound.handleValidation);
        this.#elements.gitButton?.removeEventListener('click', this.#bound.handleGitLogin);
        this.#elements.googleButton?.removeEventListener('click', this.#bound.handleGoogleLogin);
        this.#elements.biometricButton?.removeEventListener('click', this.#bound.handleBiometricLogin);
    }

    get userEmail() {
        return this.#storedEmail;
    }

    set userEmail(email) {
        this.#storedEmail = email;
        if (email) {
            localStorage.setItem('userEmail', email);
        } else {
            localStorage.removeItem('userEmail');
        }
    }

    get credentialID() {
        return this.#storedCredentialID;
    }

    set credentialID(id) {
        this.#storedCredentialID = id;
        if (id) {
            localStorage.setItem('credentialID', id);
        } else {
            localStorage.removeItem('credentialID');
        }
        if (this.#webAuthn) {
            this.#webAuthn.credentialID = id;
        }
    }

    async #handleBiometricLogin(event) {
        event.preventDefault();
        const email = this.#elements.emailInput.value || this.userEmail;
        if (!email) {
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = 'Please enter an email first.';
            return;
        }

        const result = await this.#webAuthn.handleLoginBiometric(email);

        if (result.success) {
            this.userEmail = email;
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = result.message;
            history.pushState(null, null, result.redirectUrl);
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (result.code === 'MUST_REGISTER') {
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = 'This device is not registered. The domain must be registered through the personal domain.';

        } else if (result.newCredentialID) {
            this.credentialID = result.newCredentialID;
        } else if (result.message) {
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = result.message;
        }
    }

    async #handleAuthCode(event) {
        event.preventDefault();
        const email = this.#elements.emailInput.value;

        if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'block';
        if (this.#elements.resendButton) this.#elements.resendButton.style.display = 'none';

        try {
            const data = await AuthService.sendAuthCodeAPI(email);
            if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';

            if (data.datas.code === "succeeded") {
                if (this.#elements.verificationButton) this.#elements.verificationButton.style.display = 'none';
                if (this.#elements.codeInputContainer) this.#elements.codeInputContainer.style.display = 'block';
                if (this.#elements.toggleAuthButton) this.#elements.toggleAuthButton.style.display = 'none';
                if (this.#elements.successMessage) this.#elements.successMessage.textContent = "Code sent successfully! Will expire in: ";
                if (this.#elements.verificationCodeInput) this.#elements.verificationCodeInput.removeAttribute("readonly");
                if (this.#elements.successMessage) this.#elements.successMessage.style.display = 'block';

                if (this.#authCodeInterval) clearInterval(this.#authCodeInterval);
                if (this.#resendTimerInterval) clearInterval(this.#resendTimerInterval);

                let totalSeconds = 5 * 60;
                this.#authCodeInterval = setInterval(() => {
                    let minutes = parseInt(totalSeconds / 60, 10);
                    let seconds = parseInt(totalSeconds % 60, 10);
                    if (this.#elements.timerDiv) this.#elements.timerDiv.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
                    if (--totalSeconds < 0) {
                        clearInterval(this.#authCodeInterval);
                        if (this.#elements.timerDiv) this.#elements.timerDiv.textContent = "Expired";
                    }
                }, 1000);

                if (this.#elements.timerElement && this.#elements.resendButton) {
                    this.#resendTimerInterval = formatters.startTimer(1 * 30, this.#elements.timerElement, this.#elements.resendButton);
                    this.#elements.timerElement.style.display = 'block';
                }
            } else {
                if (this.#elements.successMessage) this.#elements.successMessage.textContent = "Failed to send code. Please try again.";
            }
        } catch (error) {
            if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = `Try again! Error: ${error.message}`;
        }
    }

    async #handleValidation(event) {
        event.preventDefault();
        const email = this.#elements.emailInput.value;
        const code = this.#elements.verificationCodeInput.value;
        if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'block';

        try {
            const data = await AuthService.validateCodeAPI(email, code);
            if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';

            if (data.redirectUrl) {
                this.userEmail = email;

                if (this.#elements.successMessage) {
                    this.#elements.successMessage.textContent = data.message || 'Login successful';
                }
                history.pushState(null, null, data.redirectUrl);
                window.dispatchEvent(new PopStateEvent('popstate'));
            } else {
                if (this.#elements.successMessage) this.#elements.successMessage.textContent = data.datas.code || "Validation failed";
            }
        } catch (error) {
            if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = error.message;
            console.error('Error:', error);
        }
    }

    async #handleConnect(event) {
        event.preventDefault();
        const email = this.#elements.emailInput.value;;
        const password = this.#elements.passwordInput.value;
        if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'block';

        try {
            const data = await AuthService.loginWithPasswordAPI(email, password);
            if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';

            if (data.e === "no") {
                this.userEmail = email;

                if (this.#elements.successMessage) this.#elements.successMessage.textContent = 'Login successful!';
                history.pushState(null, null, data.redirectUrl);
                window.dispatchEvent(new PopStateEvent('popstate'));
            } else {
                if (this.#elements.successMessage) this.#elements.successMessage.textContent = data.error;
            }
        } catch (error) {
            if (this.#elements.loadingIcon) this.#elements.loadingIcon.style.display = 'none';
            if (this.#elements.successMessage) this.#elements.successMessage.textContent = error.message;
        }
    }
}