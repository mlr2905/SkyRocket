import * as C from '../utils/constants.js';
import * as Utils from '../utils/utils.js';
import * as AuthService from '../services/authService.js';
import { RegistrationValidator } from './RegistrationValidator.js';
import { RegistrationUIHandler } from './RegistrationUIHandler.js';

export class RegistrationController {
    #currentTab = 0;
    #iti; // Instance for intl-tel-input
    #elements = {}; // Object to hold all DOM elements
    
    // --- Sub-Controllers ---
    #validator;
    #ui;

    // --- Bound Handlers ---
    #boundNextPrev;
    #boundSubmitForm;

    constructor() {
        this.#selectDOMElements();
        this.#validator = new RegistrationValidator(this.#elements);
        
        // Handlers must be bound before being passed to UIHandler
        this.#boundNextPrev = this.#nextPrev.bind(this);
        this.#boundSubmitForm = this.#submitForm.bind(this);
        
        // Pass bound handlers to elements object
        this.#elements.nextPrevHandler = this.#boundNextPrev;
        this.#elements.submitHandler = this.#boundSubmitForm;

        this.#ui = new RegistrationUIHandler(this.#elements);

        this.#initializePage();
        this.#attachEventListeners();
    }

    #selectDOMElements() {
        // Form Tabs
        this.#elements.tabs = document.getElementsByClassName("tab");
        this.#elements.steps = document.getElementsByClassName("step");
        
        // Navigation
        this.#elements.backBtn = document.getElementById('backBtn');
        this.#elements.nextBtn = document.getElementById('nextBtn');
        
        // Tab 0 (Terms)
        this.#elements.termsCheckbox = document.getElementById('terms_checkbox');
        
        // Tab 1 (User)
        this.#elements.firstName = document.getElementById('first_name');
        this.#elements.lastName = document.getElementById('last_name');
        this.#elements.email = document.getElementById('email');
        this.#elements.loginButton = document.getElementById('login-button');
        this.#elements.password = document.getElementById('password');
        this.#elements.password2 = document.getElementById('password2');
        this.#elements.eyeIcon1 = document.getElementById('eyeicon');
        this.#elements.eyeIcon2 = document.getElementById('eyeicon2');
        this.#elements.emailErrorIcon = document.getElementById('email_error');
        this.#elements.emailCheckIcon = document.getElementById('email_');
        this.#elements.passContainer = document.getElementById('pass');
        this.#elements.passErrorContainer = document.getElementById('password_error');
        this.#elements.passSuccessContainer = document.getElementById('password_');

        // Tab 2 (Contact/Payment)
        this.#elements.phone = document.getElementById('phone');
        this.#elements.idNumber = document.getElementById('id_number_input'); 
        this.#elements.creditCard = document.getElementById('credit_card');
        this.#elements.expiryDate = document.getElementById('expiry_date');
        this.#elements.cvv = document.getElementById('cvv');
        this.#elements.birthday = document.getElementById('birthday');
        this.#elements.phoneErrorIcon = document.getElementById('phone_error');
        this.#elements.phoneCheckIcon = document.getElementById('phone_');
        this.#elements.idNumberErrorIcon = document.getElementById('id_number_error');
        this.#elements.idNumberCheckIcon = document.getElementById('id_number');
        this.#elements.cardErrorIcon = document.getElementById('card_error');
        this.#elements.cardCheckIcon = document.getElementById('card_');
        
        // General
        this.#elements.loadingIcon = document.getElementById('loading-icon');
        this.#elements.successMessage = document.getElementById('success-message');
    }

    async #initializePage() {
        this.#ui.hideLoading();
        this.#ui.showTab(this.#currentTab, this.#boundSubmitForm);
        this.#setupDatePickers();

        try {
            const data = await AuthService.getCountryCode();
            const country = String.prototype.toLowerCase.call(data.country);
            this.#initializeIntlTelInput(country);
        } catch (error) {
            console.error('Error fetching IP:', error);
            this.#initializeIntlTelInput('en'); // Fallback
        }
    }

    #initializeIntlTelInput(countryCode) {
        if (window.intlTelInput) {
            this.#iti = window.intlTelInput(this.#elements.phone, { initialCountry: countryCode });
        } else {
            console.error("intlTelInput library not loaded");
        }
    }

    #setupDatePickers() {
        
    }

    #attachEventListeners() {
        // --- Tab 0 ---
        this.#elements.termsCheckbox.addEventListener('input', () => this.#validator.validateTerms());

        // --- Tab 1 ---
        this.#elements.firstName.addEventListener('input', (e) => this.#validator.validateSimpleInput(e.target));
        this.#elements.lastName.addEventListener('input', (e) => this.#validator.validateSimpleInput(e.target));
        this.#elements.email.addEventListener('input', () => this.#validator.validateEmail());
        this.#elements.email.addEventListener('keypress', (e) => {
             if (!/^[a-z0-9._\-@]$/.test(e.key)) e.preventDefault();
        });
        this.#elements.loginButton.addEventListener('click', () => { location.href = C.LOGIN_PAGE_URL; });
        this.#elements.password.addEventListener('input', () => this.#validator.validatePassword());
        this.#elements.password2.addEventListener('input', () => this.#validator.confirmPassword());
        this.#elements.password2.addEventListener('paste', (e) => e.preventDefault());
        this.#elements.eyeIcon1.addEventListener('click', () => this.#ui.togglePasswordVisibility(this.#elements.eyeIcon1));
        this.#elements.eyeIcon2.addEventListener('click', () => this.#ui.togglePasswordVisibility(this.#elements.eyeIcon2));

        // --- Tab 2 ---
        this.#elements.phone.addEventListener('input', () => this.#validator.validatePhone());
        this.#elements.idNumber.addEventListener('input', () => this.#validator.validateID());
        this.#elements.idNumber.addEventListener('keypress', Utils.restrictToNumbers);
        this.#elements.creditCard.addEventListener('input', () => this.#validator.validateCreditCard());
        this.#elements.creditCard.addEventListener('keypress', Utils.restrictToNumbers);
        this.#elements.expiryDate.addEventListener('input', () => this.#validator.formatExpiry());
        this.#elements.expiryDate.addEventListener('change', () => this.#validator.validateExpiry()); // Validate on blur
        this.#elements.expiryDate.addEventListener('keypress', Utils.restrictToNumbers);
        this.#elements.cvv.addEventListener('input', (e) => this.#validator.validateSimpleInput(e.target));
        this.#elements.cvv.addEventListener('keypress', Utils.restrictToNumbers);
        this.#elements.birthday.addEventListener('input', (e) => this.#validator.validateSimpleInput(e.target));

        // --- Navigation ---
        this.#elements.backBtn.addEventListener('click', () => this.#nextPrev(-1));
        this.#elements.nextBtn.addEventListener('click', this.#boundNextPrev); // Default handler
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
        if (n === 1 && !(await this.#validateCurrentTab())) {
            return false; 
        }

        this.#elements.tabs[this.#currentTab].style.display = "none";
        this.#currentTab = this.#currentTab + n;

        if (this.#currentTab >= this.#elements.tabs.length) {
            return;
        }

        
        this.#ui.showTab(this.#currentTab, this.#boundSubmitForm);
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
                if (signupData.loginUrl) window.location.href = signupData.loginUrl;
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
                this.#ui.showMessage('Signup successful!');
                window.location.href = registrationData.signupUrl;
            }

        } catch (error) {
            this.#ui.hideLoading();
            this.#ui.showMessage(`An error occurred: ${error.message}`);
            console.error('Error submitting form:', error);
        }
    }
}