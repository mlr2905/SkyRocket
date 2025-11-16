
export class UIHandler {
    #emailInput;
    #passwordInput;
    #changeButton;
    #eyeIcon;
    #toggleAuthButton;
    #verificationButton;
    #connectButton;
    #emailCheckIcon;
    #passContainer;
    #passwordFormContainer; 
    #validationHandler; 
    #connectHandler; 

    constructor(elements) {
        this.#emailInput = elements.emailInput;
        this.#passwordInput = elements.passwordInput;
        this.#changeButton = elements.changeButton;
        this.#eyeIcon = elements.eyeIcon;
        this.#toggleAuthButton = elements.toggleAuthButton;
        this.#verificationButton = elements.verificationButton;
        this.#connectButton = elements.connectButton;
        this.#emailCheckIcon = elements.emailCheckIcon;
        this.#passContainer = elements.passContainer;
        this.#passwordFormContainer = document.getElementById('pass'); 
    }

    setValidationHandler(handler) {
        this.#validationHandler = handler;
    }
    setConnectHandler(handler) {
        this.#connectHandler = handler;
    }

    changeEmail() {
        this.#emailInput.disabled = false;
        this.#changeButton.style.display = 'none';
        this.#emailCheckIcon.style.display = "block";
    }

    togglePasswordVisibility() {
        if (this.#passwordInput.type === "password") {
            this.#passwordInput.type = "text";
            this.#eyeIcon.src = "./img/eye.png";
        } else {
            this.#passwordInput.type = "password";
            this.#eyeIcon.src = "./img/eye.gif";
        }
    }

    toggleAuthType() {
        this.#emailCheckIcon.style.display = "none";
        
        if (this.#passwordFormContainer.style.display === 'block') {
            // Switch to code mode
            this.#emailInput.disabled = true;
            this.#passContainer.style.display = "none";
            this.#verificationButton.style.display = 'block';
            this.#passwordFormContainer.style.display = 'none';
            this.#toggleAuthButton.textContent = "Enter a password";
            this.#connectButton.textContent = 'connect';
            
            // Re-bind connect button to validation handler
            if (this.#connectHandler) this.#connectButton.removeEventListener('click', this.#connectHandler);
            if (this.#validationHandler) this.#connectButton.addEventListener('click', this.#validationHandler);
            
            this.#connectButton.className = 'connect';
        } else {
            // Switch to password mode
            this.#emailInput.disabled = false;
            this.#passContainer.style.display = "block";

            // Re-bind connect button to connect handler
            if (this.#validationHandler) this.#connectButton.removeEventListener('click', this.#validationHandler);
            if (this.#connectHandler) this.#connectButton.addEventListener('click', this.#connectHandler);

            this.#toggleAuthButton.textContent = "code by email";
            this.#verificationButton.style.display = 'none';
            this.#passwordFormContainer.style.display = 'block';
            this.#connectButton.textContent = 'connect';
        }
    }
}