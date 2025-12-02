import * as C from '../utils/constants.js';
import * as formatters from '../utils/formatters.js';
import * as AuthService from '../services/authService.js';
import { RegistrationValidator } from './RegistrationValidator.js';
import { RegistrationUIHandler } from './RegistrationUIHandler.js';

export class RegistrationController {
    #currentTab = 0;
    #iti; 
    #elements = {}; 
    #validator;
    #ui;
    #libraryStyleLink = null; // New: Store reference to the dynamically loaded CSS

    #bound = {
        submitForm: null,
        validateTerms: null,
        validateFirstName: null,
        validateLastName: null,
        validateEmail: null,
        goToLogin: null,
        validatePassword: null,
        confirmPassword: null,
        preventPaste: null,
        togglePass1: null,
        togglePass2: null,
        validatePhone: null,
        validateID: null,
        restrictToNumbers: null,
        validateCreditCard: null,
        formatExpiry: null,
        validateExpiry: null,
        validateCVV: null,
        validateBirthday: null,
        handleBack: null,
        handleNext: null
    };

    init() {
        this.#currentTab = 0;
        this.#selectDOMElements();
        
        // New: Load the 3rd party library CSS specifically for this view
        this.#loadLibraryCSS();

        this.#validator = new RegistrationValidator(this.#elements);
        this.#bindEventHandlers();
        this.#elements.nextPrevHandler = this.#bound.handleNext;
        this.#elements.submitHandler = this.#bound.submitForm;
        this.#ui = new RegistrationUIHandler(this.#elements);
        this.#initializePage();
        this.#attachEventListeners();
    }

    destroy() {
        this.#removeEventListeners();
        
        if (this.#iti) {
            this.#iti.destroy();
            this.#iti = null;
        }

        // New: Remove the 3rd party library CSS to avoid conflicts/pollution
        this.#removeLibraryCSS();

        this.#elements = {};
        this.#validator = null;
        this.#ui = null;
        this.#bound = {};
        this.#libraryStyleLink = null;
    }

    #selectDOMElements() {
        this.#elements = {
            tabs: document.getElementsByClassName("tab"),
            steps: document.getElementsByClassName("step"),
            backBtn: document.getElementById('backBtn'),
            nextBtn: document.getElementById('nextBtn'),
            termsCheckbox: document.getElementById('terms_checkbox'),
            firstName: document.getElementById('first_name'),
            lastName: document.getElementById('last_name'),
            email: document.getElementById('email'),
            loginButton: document.getElementById('login-button'),
            password: document.getElementById('password'),
            password2: document.getElementById('password2'),
            eyeIcon1: document.getElementById('eyeicon'),
            eyeIcon2: document.getElementById('eyeicon2'),
            emailErrorIcon: document.getElementById('email_error'),
            emailCheckIcon: document.getElementById('email_'),
            passContainer: document.getElementById('pass'),
            passErrorContainer: document.getElementById('password_error'),
            passSuccessContainer: document.getElementById('password_'),
            phone: document.getElementById('phone'),
            idNumber: document.getElementById('id_number_input'), 
            creditCard: document.getElementById('credit_card'),
            expiryDate: document.getElementById('expiry_date'),
            cvv: document.getElementById('cvv'),
            birthday: document.getElementById('birthday'),
            phoneErrorIcon: document.getElementById('phone_error'),
            phoneCheckIcon: document.getElementById('phone_'),
            idNumberErrorIcon: document.getElementById('id_number_error'),
            idNumberCheckIcon: document.getElementById('id_number'),
            cardErrorIcon: document.getElementById('card_error'),
            cardCheckIcon: document.getElementById('card_'),
            loadingIcon: document.getElementById('loading-icon'),
            successMessage: document.getElementById('success-message')
        };
    }

    #bindEventHandlers() {
        this.#bound.submitForm = () => this.#submitForm();
        this.#bound.validateTerms = () => this.#validator.validateTerms();
        this.#bound.validateFirstName = (e) => this.#validator.validateSimpleInput(e.target);
        this.#bound.validateLastName = (e) => this.#validator.validateSimpleInput(e.target);
        this.#bound.validateEmail = () => this.#validator.validateEmail();
        this.#bound.goToLogin = () => this.#goToPage(C.LOGIN_PAGE_URL);
        this.#bound.validatePassword = () => this.#validator.validatePassword();
        this.#bound.confirmPassword = () => this.#validator.confirmPassword();
        this.#bound.preventPaste = (e) => e.preventDefault();
        this.#bound.togglePass1 = () => this.#ui.togglePasswordVisibility(this.#elements.eyeIcon1);
        this.#bound.togglePass2 = () => this.#ui.togglePasswordVisibility(this.#elements.eyeIcon2);
        this.#bound.validatePhone = () => this.#validator.validatePhone();
        this.#bound.validateID = () => this.#validator.validateID();
        this.#bound.restrictToNumbers = (e) => formatters.restrictToNumbers(e);
        this.#bound.validateCreditCard = () => this.#validator.validateCreditCard();
        this.#bound.formatExpiry = () => this.#validator.formatExpiry();
        this.#bound.validateExpiry = () => this.#validator.validateExpiry();
        this.#bound.validateCVV = (e) => this.#validator.validateSimpleInput(e.target);
        this.#bound.validateBirthday = (e) => this.#validator.validateSimpleInput(e.target);
        this.#bound.handleBack = () => this.#nextPrev(-1);
        this.#bound.handleNext = () => this.#nextPrev(1);
    }

    #attachEventListeners() {
        this.#elements.termsCheckbox?.addEventListener('input', this.#bound.validateTerms);
        this.#elements.firstName?.addEventListener('input', this.#bound.validateFirstName);
        this.#elements.lastName?.addEventListener('input', this.#bound.validateLastName);
        this.#elements.email?.addEventListener('input', this.#bound.validateEmail);
        this.#elements.email?.addEventListener('keypress', (e) => {
             if (!/^[a-z0-9._\-@]$/.test(e.key)) e.preventDefault();
        });
        this.#elements.loginButton?.addEventListener('click', this.#bound.goToLogin);
        this.#elements.password?.addEventListener('input', this.#bound.validatePassword);
        this.#elements.password2?.addEventListener('input', this.#bound.confirmPassword);
        this.#elements.password2?.addEventListener('paste', this.#bound.preventPaste);
        this.#elements.eyeIcon1?.addEventListener('click', this.#bound.togglePass1);
        this.#elements.eyeIcon2?.addEventListener('click', this.#bound.togglePass2);
        this.#elements.phone?.addEventListener('input', this.#bound.validatePhone);
        this.#elements.idNumber?.addEventListener('input', this.#bound.validateID);
        this.#elements.idNumber?.addEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.creditCard?.addEventListener('input', this.#bound.validateCreditCard);
        this.#elements.creditCard?.addEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.expiryDate?.addEventListener('input', this.#bound.formatExpiry);
        this.#elements.expiryDate?.addEventListener('change', this.#bound.validateExpiry);
        this.#elements.expiryDate?.addEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.cvv?.addEventListener('input', this.#bound.validateCVV);
        this.#elements.cvv?.addEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.birthday?.addEventListener('input', this.#bound.validateBirthday);
        this.#elements.backBtn?.addEventListener('click', this.#bound.handleBack);
        this.#elements.nextBtn?.addEventListener('click', this.#bound.handleNext);
    }

    #removeEventListeners() {
        this.#elements.termsCheckbox?.removeEventListener('input', this.#bound.validateTerms);
        this.#elements.firstName?.removeEventListener('input', this.#bound.validateFirstName);
        this.#elements.lastName?.removeEventListener('input', this.#bound.validateLastName);
        this.#elements.email?.removeEventListener('input', this.#bound.validateEmail);
        this.#elements.loginButton?.removeEventListener('click', this.#bound.goToLogin);
        this.#elements.password?.removeEventListener('input', this.#bound.validatePassword);
        this.#elements.password2?.removeEventListener('input', this.#bound.confirmPassword);
        this.#elements.password2?.removeEventListener('paste', this.#bound.preventPaste);
        this.#elements.eyeIcon1?.removeEventListener('click', this.#bound.togglePass1);
        this.#elements.eyeIcon2?.removeEventListener('click', this.#bound.togglePass2);
        this.#elements.phone?.removeEventListener('input', this.#bound.validatePhone);
        this.#elements.idNumber?.removeEventListener('input', this.#bound.validateID);
        this.#elements.idNumber?.removeEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.creditCard?.removeEventListener('input', this.#bound.validateCreditCard);
        this.#elements.creditCard?.removeEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.expiryDate?.removeEventListener('input', this.#bound.formatExpiry);
        this.#elements.expiryDate?.removeEventListener('change', this.#bound.validateExpiry);
        this.#elements.expiryDate?.removeEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.cvv?.removeEventListener('input', this.#bound.validateCVV);
        this.#elements.cvv?.removeEventListener('keypress', this.#bound.restrictToNumbers);
        this.#elements.birthday?.removeEventListener('input', this.#bound.validateBirthday);
        this.#elements.backBtn?.removeEventListener('click', this.#bound.handleBack);
        this.#elements.nextBtn?.removeEventListener('click', this.#bound.handleNext);
        this.#elements.nextBtn?.removeEventListener('click', this.#bound.submitForm);
    }

    #goToPage(path) {
        history.pushState(null, null, path);
        window.dispatchEvent(new PopStateEvent('popstate')); 
    }

    /**
     * Dynamically injects the intl-tel-input CSS file into the head.
     */
    #loadLibraryCSS() {
        const cssPath = '/build/css/intlTelInput.css'; 
        
        if (!document.querySelector(`link[href="${cssPath}"]`)) {
            this.#libraryStyleLink = document.createElement('link');
            this.#libraryStyleLink.rel = 'stylesheet';
            this.#libraryStyleLink.href = cssPath;
            document.head.appendChild(this.#libraryStyleLink);
        }
    }

    /**
     * Removes the dynamically injected CSS.
     */
    #removeLibraryCSS() {
        if (this.#libraryStyleLink && this.#libraryStyleLink.parentNode) {
            this.#libraryStyleLink.parentNode.removeChild(this.#libraryStyleLink);
        }
    }

    async #initializePage() {
        this.#ui.hideLoading();
        this.#ui.showTab(this.#currentTab, this.#bound.submitForm);

        try {
            const data = await AuthService.getCountryCode();
            const country = String.prototype.toLowerCase.call(data.id);
            this.#initializeIntlTelInput(country);
        } catch (error) {
            console.error('Error fetching IP:', error);
            this.#initializeIntlTelInput('us');
        }
    }

    #initializeIntlTelInput(countryCode) {
        if (window.intlTelInput && this.#elements.phone) {
            this.#iti = window.intlTelInput(this.#elements.phone, { 
                initialCountry: countryCode,
                utilsScript: "/build/js/intlTelInputWithUtils.js",
                separateDialCode: true 
            });
        } else {
            console.error("intlTelInput library not loaded or phone element not found");
        }
    }

    async #validateCurrentTab() {
        let isValid = true;
        
        switch (this.#currentTab) {
            case 0:
                isValid = this.#validator.validateTerms();
                break;
            case 1:
                const validEmail = await this.#validator.validateEmail();
                const validPass = this.#validator.validatePassword();
                const validConfirm = this.#validator.confirmPassword();
                const validFirstName = this.#validator.validateSimpleInput(this.#elements.firstName);
                const validLastName = this.#validator.validateSimpleInput(this.#elements.lastName);
                isValid = validEmail && validPass && validConfirm && validFirstName && validLastName;
                break;
            case 2:
                const validPhone = this.#validator.validatePhone();
                const validID = this.#validator.validateID();
                const validCard = this.#validator.validateCreditCard();
                const validExpiry = this.#validator.validateExpiry();
                const validCVV = this.#validator.validateSimpleInput(this.#elements.cvv);
                const validBday = this.#validator.validateSimpleInput(this.#elements.birthday);
                isValid = validPhone && validID && validCard && validExpiry && validCVV && validBday;
                break;
        }

        if (isValid) {
            this.#ui.markStepAsFinished(this.#currentTab);
        }
        return isValid;
    }

    async #nextPrev(n) {
        if (this.#currentTab === 0 && n === -1) {
            return;
        }

        if (n === 1 && !(await this.#validateCurrentTab())) {
            return false; 
        }

        if(this.#elements.tabs[this.#currentTab]) {
            this.#elements.tabs[this.#currentTab].style.display = "none";
        }
        
        this.#currentTab = this.#currentTab + n;

        if (this.#currentTab >= this.#elements.tabs.length) {
            this.#currentTab = this.#elements.tabs.length - 1; 
            return;
        }

        this.#ui.showTab(this.#currentTab, this.#bound.submitForm);
    }

    async #submitForm() {
        if (!(await this.#validateCurrentTab())) {
            return false;
        }

        this.#ui.showLoading();

        try {
            const signupData = await AuthService.signupUser(
                this.#elements.email.value,
                this.#elements.password.value
            );

            if (signupData.e === "yes") {
                this.#ui.showMessage(signupData.error);
                if (signupData.loginUrl) this.#goToPage(C.LOGIN_PAGE_URL); 
                this.#ui.hideLoading();
                return;
            }
            
            if (!signupData.id) {
                throw new Error("Signup succeeded but did not return a user ID.");
            }

            const customerData = {
                first_name: this.#elements.firstName.value,
                last_name: this.#elements.lastName.value,
                phone: this.#iti.getNumber(),
                credit_card: this.#elements.creditCard.value.replace(/\s/g, ''),
                expiry_date: this.#elements.expiryDate.value,
                cvv: this.#elements.cvv.value,
                user_id: signupData.id,
                id_number: this.#elements.idNumber.value,
                birthday: this.#elements.birthday.value
            };

            const registrationData = await AuthService.registerCustomer(customerData);
            
            this.#ui.hideLoading();

            if (registrationData.e === "yes") {
                this.#ui.showMessage(registrationData.error);
            } else if (registrationData.signupUrl) { 
                this.#ui.showMessage('Signup successful! Redirecting to login...');
                this.#goToPage(registrationData.signupUrl.replace('.html', ''));
            }

        } catch (error) {
            this.#ui.hideLoading();
            this.#ui.showMessage(`An error occurred: ${error.message}`);
            console.error('Error submitting form:', error);
        }
    }
}