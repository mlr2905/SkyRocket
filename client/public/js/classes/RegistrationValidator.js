import * as AuthService from '../services/authService.js';

export class RegistrationValidator {
    #elements;

    constructor(elements) {
        this.#elements = elements;
    }

    // --- Tab 0: Terms ---
    validateTerms() {
        const isValid = this.#elements.termsCheckbox.checked;
        this.#elements.nextBtn.disabled = !isValid;
        this.#elements.nextBtn.className = isValid ? 'nextBtn2' : 'nextBtn';
        return isValid;
    }

    // --- Tab 1: User Details ---
    async validateEmail() {
        this.#elements.loadingIcon.style.display = 'block';
        const email = this.#elements.email.value.trim();
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

        const updateUI = (inputClass, passwordDisabled, errMsg, passwordValid) => {
            this.#elements.email.className = inputClass;
            this.#elements.password.disabled = passwordDisabled;
            this.#elements.password2.disabled = passwordDisabled;
            
            const errEl = this.#elements.emailErrorIcon;
            const validEl = this.#elements.emailCheckIcon;

            if (errMsg) {
                errEl.style.display = "block";
                errEl.querySelector("spam").textContent = errMsg;
                validEl.style.display = "none";
            } else {
                errEl.style.display = "none";
                validEl.style.display = "block";
            }
            this.#elements.passErrorContainer.style.display = passwordValid ? "block" : "none";
        };

        if (!emailRegex.test(email)) {
            updateUI('invalid', true, "Invalid email format", false);
            this.#elements.loginButton.style.display = "none";
            this.#elements.loadingIcon.style.display = 'none';
            return false;
        }

        try {
            const data = await AuthService.checkEmailExists(email);
            if (data.status === true) {
                updateUI('invalid', true, "The email already exists", false);
                this.#elements.passContainer.style.display = 'none';
                this.#elements.loginButton.style.display = 'block';
                this.#elements.loadingIcon.style.display = 'none';
                return false;
            }

            const check = await AuthService.checkEmailDomain(email);
            let [name, domain] = email.split('@');

            if (check.e === "no") {
                if (check.dmarc_record === false) {
                    updateUI('invalid', true, `'${domain}' does not exist `, false);
                } else if (check.valid === false && check.dmarc_record === true) {
                    updateUI('invalid', true, ` '${name}' not exist in '${domain}' `, false);
                } else if (check.valid === true && check.dmarc_record === true) {
                    updateUI('', false, "", true);
                    this.#elements.loginButton.style.display = "none";
                    this.#elements.passContainer.style.display = "block";
                    this.#elements.loadingIcon.style.display = 'none';
                    return true;
                }
            } else {
                updateUI('invalid', true, `The email did not go through correctly`, true);
            }

            this.#elements.loginButton.style.display = "none";
            this.#elements.loadingIcon.style.display = 'none';
            return false;
            
        } catch (error) {
            updateUI('invalid', true, "An error occurred", false);
            this.#elements.loginButton.style.display = "none";
            this.#elements.loadingIcon.style.display = 'none';
            return false;
        }
    }

    validatePassword() {
        this.#elements.emailCheckIcon.style.display = "none";
        const password = this.#elements.password.value.trim();
        const lengthRegex = /^.{8,}$/, LowerCase = /[a-z]/, uppercaseRegex = /[A-Z]/, Numbers = /[0-9]/, specialCharRegex = /[~!@$^*?=_-]/, forbidden_characters = /["|'()]/;
        let errorMessage = "", successMessage = "";
        this.#elements.email.disabled = true;

        const check = (regex, message) => {
            if (!regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <spam class ="red-text">${message}</spam></P>`;
            else successMessage += `<p><b class="green-v">&#10004;</b> <spam class ="green-text">${message}</spam></P>`;
        };
        const check2 = (regex, message) => {
            if (regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <span class="red-text">${message}</span></p>`;
            else successMessage += `<p><b class="green-v">&#10004;</b> <spam class ="green-text">${message}</spam></P>`;
        };

        check(lengthRegex, "At least 8 characters");
        check(LowerCase, "LowerCase letters (a-z)");
        check(uppercaseRegex, "Upper case letters (A-Z)");
        check(Numbers, "Numbers (0-9)");
        check(specialCharRegex, "Special characters [~!@$^*?=_-]");
        check2(forbidden_characters, `Forbidden characters [ " ' ()]`);

        this.#elements.password.classList.toggle('invalid', errorMessage !== "");
        this.#elements.passErrorContainer.innerHTML = errorMessage;
        this.#elements.passErrorContainer.style.display = errorMessage ? "block" : "none";
        this.#elements.passSuccessContainer.innerHTML = successMessage;
        this.#elements.passSuccessContainer.style.display = successMessage ? "block" : "none";
        
        const isValid = errorMessage === "";
        this.#elements.password2.disabled = !isValid;
        return isValid;
    }

    confirmPassword() {
        const pass1 = this.#elements.password.value;
        const pass2 = this.#elements.password2.value;

        if (pass1 === pass2 && pass1 !== "") {
            this.#elements.passSuccessContainer.innerHTML = `<p><b class="green-v">&#10004;</b> <spam class="green-text">The passwords are the same</spam></p>`;
            this.#elements.passErrorContainer.style.display = "none";
            this.#elements.passSuccessContainer.style.display = "block";
            this.#elements.nextBtn.className = 'nextBtn2';
            this.#elements.password2.classList.remove('invalid');
            return true;
        } else {
            this.#elements.password2.classList.add('invalid');
            this.#elements.nextBtn.className = 'nextBtn';
            this.#elements.passErrorContainer.innerHTML = `<p><b class="red-x">&#10006;</b> <spam class="red-text">The passwords are not the same</spam></p>`;
            this.#elements.passErrorContainer.style.display = "block";
            this.#elements.passSuccessContainer.style.display = "none";
            return false;
        }
    }

    // --- Tab 2: Contact & Payment ---
    validatePhone() {
        const phone_ = this.#elements.phone.value.trim();
        const phone = phone_.replace(/\D/g, '');
        const pattern = this.#elements.phone.placeholder.replace(/[\(\)\-\s]/g, '');

        if (phone.length === pattern.length) {
            this.#elements.phone.classList.remove('invalid');
            this.#elements.phoneCheckIcon.style.display = "block";
            this.#elements.phoneErrorIcon.style.display = "none";
            return true;
        } else {
            this.#elements.phone.classList.add('invalid');
            this.#elements.phoneErrorIcon.style.display = "block";
            this.#elements.phoneCheckIcon.style.display = "none";
            return false;
        }
    }

    validateID() {
        const inputNumber = this.#elements.idNumber.value.trim();
        let isValid = false;
        
        if (/^\d{9}$/.test(inputNumber)) {
            let numSum = 0;
            try {
                for (let i = 0; i < 9; i++) {
                    let digit = parseInt(inputNumber.charAt(i));
                    let factor = (i % 2 === 0) ? 1 : 2;
                    let product = digit * factor;
                    numSum += (product > 9) ? product - 9 : product;
                }
                isValid = (numSum % 10 === 0);
            } catch (error) {
                isValid = false;
            }
        }
        
        if (isValid) {
            this.#elements.idNumber.className = '';
            this.#elements.idNumberErrorIcon.style.display = "none";
            this.#elements.idNumberCheckIcon.style.display = "block";
        } else {
            this.#elements.idNumber.className = 'invalid';
            this.#elements.idNumberErrorIcon.style.display = "block";
            this.#elements.idNumberCheckIcon.style.display = "none";
        }
        return isValid;
    }

    validateCreditCard() {
        let CardNumber = this.#elements.creditCard.value.replace(/\s/g, '');
        let isValid = false;
        
        if (CardNumber.length === 16 && !/\D/.test(CardNumber)) {
            let totalSum = 0;
            let isSecond = false;
            for (let i = CardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(CardNumber.charAt(i));
                if (isSecond) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                totalSum += digit;
                isSecond = !isSecond;
            }
            if (totalSum % 10 === 0) isValid = true;
        }

        if (isValid) {
            this.#elements.creditCard.className = '';
            this.#elements.cardCheckIcon.style.display = "block";
            this.#elements.cardErrorIcon.style.display = "none";
        } else {
            this.#elements.creditCard.className = 'invalid';
            this.#elements.cardErrorIcon.style.display = "block";
            this.#elements.cardCheckIcon.style.display = "none";
        }
        return isValid;
    }

    formatExpiry() {
        const input = this.#elements.expiryDate;
        input.classList.remove('invalid');
        this.#elements.cardCheckIcon.style.display = "none"; // Hide general check icon

        const currentDate = new Date();
        const currentYear = parseInt(currentDate.getFullYear().toString().substring(2));
        const value = input.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length >= 1) {
            let month = value.substring(0, 2);
            if (month.length === 1 && month > '1') month = '0' + month;
            if (month.length === 2 && month > '12') month = '12';
            formattedValue = month;
        }
        if (value.length > 2) {
            formattedValue += '/';
            let year = value.substring(2, 4);
            if (year.length === 2) {
                 const inputYear = parseInt(year);
                 if (inputYear < currentYear) year = currentYear.toString();
                 else if (inputYear > currentYear + 10) year = (currentYear + 10).toString();
            }
            formattedValue += year;
        }
        input.value = formattedValue;
    }

    validateExpiry() {
        const input = this.#elements.expiryDate;
        const expiryDate = input.value.trim();
        const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/; // MM/YY
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear() % 100;
        let isValid = false;

        if (expiryRegex.test(expiryDate)) {
            const parts = expiryDate.split('/');
            const month = parseInt(parts[0], 10);
            const year = parseInt(parts[1], 10);
            if (year > currentYear || (year === currentYear && month >= currentMonth)) {
                isValid = true;
            }
        }
        
        if (isValid) {
            input.className = '';
        } else {
            input.className = 'invalid';
        }
        return isValid;
    }

    /**
     * @param {HTMLElement} input 
     * @returns {boolean} 
     */
    validateSimpleInput(input) {
        if (input.value.trim() !== "") {
            input.classList.remove('invalid');
            return true;
        } else {
            input.classList.add('invalid');
            return false;
        }
    }
}