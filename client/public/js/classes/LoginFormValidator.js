export class FormValidator {
    #emailInput;
    #passwordInput;
    #verificationCodeInput;
    #toggleAuthButton;
    #forgotPasswordLink;
    #emailCheckIcon;
    #emailErrorIcon;
    #passContainer;
    #passCheckIcon;
    #passErrorIcon;
    #codeCheckIcon;
    #codeErrorIcon;
    #connectButton;
    #changeButton;

    constructor(elements) {
        this.#emailInput = elements.emailInput;
        this.#passwordInput = elements.passwordInput;
        this.#verificationCodeInput = elements.verificationCodeInput;
        this.#toggleAuthButton = elements.toggleAuthButton;
        this.#forgotPasswordLink = elements.forgotPasswordLink;
        this.#emailCheckIcon = elements.emailCheckIcon;
        this.#emailErrorIcon = elements.emailErrorIcon;
        this.#passContainer = elements.passContainer;
        this.#passCheckIcon = elements.passCheckIcon;
        this.#passErrorIcon = elements.passErrorIcon;
        this.#codeCheckIcon = elements.codeCheckIcon;
        this.#codeErrorIcon = elements.codeErrorIcon;
        this.#connectButton = elements.connectButton;
        this.#changeButton = elements.changeButton;
    }

    validateEmail() {
        const email = this.#emailInput.value.trim();
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        
        if (emailRegex.test(email)) {
            this.#emailInput.className = '';
            this.#toggleAuthButton.className = 'change2';
            this.#passContainer.style.display = "block"; 
            this.#forgotPasswordLink.href = `password?email=${encodeURIComponent(email)}`;
            this.#emailCheckIcon.style.display = "block";
            this.#emailErrorIcon.style.display = "none";
            this.#passwordInput.disabled = false;
            this.#passErrorIcon.style.display = "block";
            this.#toggleAuthButton.disabled = false;
            return true;
        } else {
            this.#toggleAuthButton.className = 'change';
            this.#forgotPasswordLink.href = "#";
            this.#passContainer.style.display = "none";
            this.#emailInput.className = 'invalid';
            this.#toggleAuthButton.disabled = true;
            this.#passwordInput.disabled = true;
            this.#emailErrorIcon.style.display = "block";
            this.#emailCheckIcon.style.display = "none";
            return false;
        }
    }

    validateCode() {
        this.#verificationCodeInput.value = this.#verificationCodeInput.value.replace(/\D/g, '').slice(0, 6);
        const code = this.#verificationCodeInput.value.trim();
        const codeRegex = /^[0-9]{6}$/;

        if (codeRegex.test(code)) {
            this.#connectButton.disabled = false;
            this.#verificationCodeInput.classList.remove('invalid');
            this.#codeCheckIcon.style.display = "block";
            this.#codeErrorIcon.style.display = "none";
            this.#connectButton.className = 'connect2';
            return true;
        } else {
            this.#connectButton.className = 'connect';
            this.#connectButton.disabled = true;
            this.#verificationCodeInput.classList.add('invalid');
            this.#codeErrorIcon.style.display = "block";
            this.#codeCheckIcon.style.display = "none";
            return false;
        }
    }

    validatePassword() {
        this.#emailCheckIcon.style.display = "none";
        const password = this.#passwordInput.value.trim();
        const lengthRegex = /^.{8,}$/;
        const LowerCase = /[a-z]/;
        const uppercaseRegex = /[A-Z]/;
        const Numbers = /[0-9]/;
        const specialCharRegex = /[~!@$^*?=_-]/;
        const forbidden_characters = /["|'()]/;
        
        let errorMessage = "";
        let successMessage = "";
        this.#emailInput.disabled = true;
        this.#changeButton.style.display = 'block';

        const check = (regex, message) => {
            if (!regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <span class="red-text">${message}</span></P>`;
            else successMessage += `<p><b class="green-v">&#10004;</b> <span class="green-text">${message}</span></P>`;
        };
        const check2 = (regex, message) => {
            if (regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <span class="red-text">${message}</span></p>`;
            else successMessage += `<p><b class="green-v">&#10004;</b> <span class="green-text">${message}</span></P>`;
        };
        
        check(lengthRegex, "At least 8 characters");
        check(LowerCase, "LowerCase letters [a-z]");
        check(uppercaseRegex, "Upper case letters [A-Z]");
        check(Numbers, "Numbers [0-9]");
        check(specialCharRegex, "Special characters [~!@$^*?=_-]");
        check2(forbidden_characters, `Forbidden characters [ " ' ()]`);

        this.#passwordInput.classList.toggle('invalid', errorMessage !== "");
        this.#passErrorIcon.innerHTML = errorMessage;
        this.#passErrorIcon.style.display = errorMessage ? "block" : "none";
        this.#passCheckIcon.innerHTML = successMessage;
        this.#passCheckIcon.style.display = successMessage ? "block" : "none";
        
        const isValid = errorMessage === "";
        this.#connectButton.disabled = !isValid;
        this.#connectButton.className = !isValid ? 'connect' : 'connect2';
        return isValid;
    }
}