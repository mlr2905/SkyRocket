import * as C from '../utils/constants.js';

export class PersonalDetailsController {
    constructor() {
        this.elements = {};
        this.boundHandlers = {};
        this.debounceTimer = null;
        this.currentUserId = null;
        this.customerExists = false;
    }

    init() {
        this.currentUserId = null;
        this.customerExists = false;
        this.selectDOMElements();
        this.bindEventHandlers();
        this.attachEventListeners();
        this.fetchUserAndCustomerData();
    }

    destroy() {
        this.removeEventListeners();
        clearTimeout(this.debounceTimer);
        this.elements = {};
        this.boundHandlers = {};
    }

    selectDOMElements() {
        this.elements = {
            form: document.getElementById('details-form'),
            editButton: document.getElementById('edit-button'),
            saveButton: document.getElementById('save-button'),
            messageContainer: document.getElementById('message-container'),
            loadingSpinner: document.getElementById('loading-spinner'),
            personalFieldsFieldset: document.getElementById('personal-fields-fieldset'),
            paymentFieldsFieldset: document.getElementById('payment-fields-fieldset'),
            emailInput: document.getElementById('email'),
            usernameInput: document.getElementById('username'),
            firstNameInput: document.getElementById('first_name'),
            lastNameInput: document.getElementById('last_name'),
            addressInput: document.getElementById('address'),
            phonePrefixSelect: document.getElementById('phone_prefix'),
            phoneInput: document.getElementById('phone_number'),
            phoneError: document.getElementById('phone_error'),
            creditCardDisplay: document.getElementById('credit_card_display'),
            expiryDateDisplay: document.getElementById('expiry_date_display'),
            cvvGate: document.getElementById('cvv-gate'),
            cvvVerificationInput: document.getElementById('cvv_verification_input'),
            cvvVerifyButton: document.getElementById('cvv_verify_button'),
            cvvVerifyError: document.getElementById('cvv_verify_error'),
            creditCardInput: document.getElementById('credit_card'),
            expiryDateInput: document.getElementById('expiry_date'),
            cvvInput: document.getElementById('cvv'),
            creditCardError: document.getElementById('credit_card_error'),
            expiryDateError: document.getElementById('expiry_date_error'),
        };
    }

    bindEventHandlers() {
        this.boundHandlers = {
            toggleEdit: () => this.toggleEdit(true),
            handleFormSubmit: (e) => this.handleFormSubmit(e),
            handleCvvVerification: () => this.handleCvvVerification(),
            handleCreditCardBlur: () => this.handleCreditCardBlur(),
            formatExpiryDate: (e) => this.formatExpiryDate(e),
            formatNumericOnly: (e) => this.formatNumericOnly(e),
            validateExpiryDate: () => this.validateExpiryDate(),
            validatePhoneBlur: () => {
                if (this.elements.phoneInput && this.elements.phoneInput.value.startsWith('0')) {
                    if (this.elements.phoneError) this.elements.phoneError.textContent = 'Please enter the number without a leading 0.';
                } else {
                    if (this.elements.phoneError) this.elements.phoneError.textContent = '';
                }
            }
        };
    }

    attachEventListeners() {
        this.elements.editButton?.addEventListener('click', this.boundHandlers.toggleEdit);
        this.elements.form?.addEventListener('submit', this.boundHandlers.handleFormSubmit);
        this.elements.cvvVerifyButton?.addEventListener('click', this.boundHandlers.handleCvvVerification);
        this.elements.creditCardInput?.addEventListener('input', this.boundHandlers.handleCreditCardBlur);
        this.elements.expiryDateInput?.addEventListener('input', this.boundHandlers.formatExpiryDate);
        this.elements.cvvInput?.addEventListener('input', this.boundHandlers.formatNumericOnly);
        this.elements.cvvVerificationInput?.addEventListener('input', this.boundHandlers.formatNumericOnly);
        this.elements.phoneInput?.addEventListener('input', this.boundHandlers.formatNumericOnly);
        this.elements.expiryDateInput?.addEventListener('blur', this.boundHandlers.validateExpiryDate);
        this.elements.phoneInput?.addEventListener('blur', this.boundHandlers.validatePhoneBlur);
    }

    removeEventListeners() {
        this.elements.editButton?.removeEventListener('click', this.boundHandlers.toggleEdit);
        this.elements.form?.removeEventListener('submit', this.boundHandlers.handleFormSubmit);
        this.elements.cvvVerifyButton?.removeEventListener('click', this.boundHandlers.handleCvvVerification);
        this.elements.creditCardInput?.removeEventListener('input', this.boundHandlers.handleCreditCardBlur);
        this.elements.expiryDateInput?.removeEventListener('input', this.boundHandlers.formatExpiryDate);
        this.elements.cvvInput?.removeEventListener('input', this.boundHandlers.formatNumericOnly);
        this.elements.cvvVerificationInput?.removeEventListener('input', this.boundHandlers.formatNumericOnly);
        this.elements.phoneInput?.removeEventListener('input', this.boundHandlers.formatNumericOnly);
        this.elements.expiryDateInput?.removeEventListener('blur', this.boundHandlers.validateExpiryDate);
        this.elements.phoneInput?.removeEventListener('blur', this.boundHandlers.validatePhoneBlur);
    }

    showMessage(message, type = 'danger') {
        if (this.elements.messageContainer) {
            this.elements.messageContainer.textContent = message;
            this.elements.messageContainer.className = `alert alert-${type}`;
            this.elements.messageContainer.style.display = 'block';
            window.scrollTo(0, 0);
        }
    }

    async fetchUserAndCustomerData() {
        if (this.elements.loadingSpinner) this.elements.loadingSpinner.style.display = 'block';
        try {
            const userRes = await fetch(C.API_ACTIVATION_URL, { credentials: 'include' });
            if (!userRes.ok) throw new Error('Not authenticated');

            const user = await userRes.json();
            this.currentUserId = user.id;
            if (this.elements.emailInput) this.elements.emailInput.value = user.email || '';
            if (this.elements.usernameInput) this.elements.usernameInput.value = user.username || '';

            const customerRes = await fetch(`${C.API_CUSTOMERS_URL}/${this.currentUserId}`, { credentials: 'include' });

            if (customerRes.ok) {
                const customer = await customerRes.json();
                this.populateCustomerData(customer);
            } else if (customerRes.status === 404) {
                this.customerExists = false;
                this.showMessage('It looks like this is your first time here. Please fill in your customer details.', 'info');
                this.toggleEdit(true);
            } else {
                const errData = await customerRes.json();
                throw new Error(errData.error || 'Error loading customer details');
            }
        } catch (error) {
            this.handleFetchError(error);
        } finally {
            if (this.elements.loadingSpinner) this.elements.loadingSpinner.style.display = 'none';
        }
    }

    populateCustomerData(customer) {
        if (this.elements.firstNameInput) this.elements.firstNameInput.value = customer.first_name || '';
        if (this.elements.lastNameInput) this.elements.lastNameInput.value = customer.last_name || '';
        if (this.elements.addressInput) this.elements.addressInput.value = customer.address || '';

        const fullPhone = customer.phone || '';
        let foundPrefix = false;
        if (this.elements.phonePrefixSelect) {
            for (const option of this.elements.phonePrefixSelect.options) {
                if (fullPhone.startsWith(option.value)) {
                    this.elements.phonePrefixSelect.value = option.value;
                    if (this.elements.phoneInput) this.elements.phoneInput.value = fullPhone.substring(option.value.length);
                    foundPrefix = true;
                    break;
                }
            }
        }
        if (!foundPrefix && this.elements.phoneInput) {
            this.elements.phoneInput.value = fullPhone;
        }

        if (this.elements.creditCardDisplay) this.elements.creditCardDisplay.value = customer.credit_card || 'No card on file';

        let expiry = customer.expiry_date || 'N/A';
        if (expiry && expiry.length === 4 && !expiry.includes('/')) {
            expiry = expiry.substring(0, 2) + '/' + expiry.substring(2, 4);
        }
        if (this.elements.expiryDateDisplay) this.elements.expiryDateDisplay.value = expiry;
        this.customerExists = true;
    }

    handleFetchError(error) {
        if (error.message === 'Not authenticated') {
            this.showMessage('You are not logged in. Redirecting to login page.', 'warning');
            setTimeout(() => {
                history.pushState(null, null, C.API_LOGOUT_URL);
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 2000);
        } else {
            this.showMessage(error.message, 'danger');
        }
    }

    toggleEdit(enable = true) {
        if (this.elements.personalFieldsFieldset) this.elements.personalFieldsFieldset.disabled = !enable;

        if (enable) {
            if (this.elements.editButton) this.elements.editButton.style.display = 'none';
            if (this.elements.saveButton) this.elements.saveButton.style.display = 'block';
            if (this.customerExists && this.elements.creditCardDisplay && this.elements.creditCardDisplay.value !== 'No card on file') {
                if (this.elements.cvvGate) this.elements.cvvGate.style.display = 'block';
            } else {
                if (this.elements.paymentFieldsFieldset) {
                    this.elements.paymentFieldsFieldset.style.display = 'block';
                    this.elements.paymentFieldsFieldset.disabled = false;
                }
            }
        } else {
            if (this.elements.editButton) this.elements.editButton.style.display = 'block';
            if (this.elements.saveButton) this.elements.saveButton.style.display = 'none';
            if (this.elements.cvvGate) this.elements.cvvGate.style.display = 'none';
            if (this.elements.paymentFieldsFieldset) {
                this.elements.paymentFieldsFieldset.style.display = 'none';
                this.elements.paymentFieldsFieldset.disabled = true;
            }
            if (this.elements.cvvVerificationInput) this.elements.cvvVerificationInput.value = '';
        }
    }

    async handleCvvVerification() {
        const cvv = this.elements.cvvVerificationInput.value.trim();
        if (!cvv || cvv.length < 3) {
            if (this.elements.cvvVerifyError) this.elements.cvvVerifyError.textContent = 'Please enter a CVV (3 digits).';
            return;
        }

        if (this.elements.loadingSpinner) this.elements.loadingSpinner.style.display = 'block';
        if (this.elements.cvvVerifyError) this.elements.cvvVerifyError.textContent = '';

        try {
            const response = await fetch(C.API_VERIFY_CVV_URL, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvv: cvv })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Invalid CVV');
            }

            if (this.elements.cvvGate) this.elements.cvvGate.style.display = 'none';
            if (this.elements.paymentFieldsFieldset) {
                this.elements.paymentFieldsFieldset.style.display = 'block';
                this.elements.paymentFieldsFieldset.disabled = false;
            }

        } catch (error) {
            if (this.elements.cvvVerifyError) this.elements.cvvVerifyError.textContent = error.message;
        } finally {
            if (this.elements.loadingSpinner) this.elements.loadingSpinner.style.display = 'none';
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        if (!this.currentUserId) return;

        if (this.elements.creditCardError && this.elements.creditCardError.textContent !== '') {
            this.showMessage('Cannot save. Please correct the credit card error.', 'danger');
            this.elements.creditCardInput.focus();
            return;
        }
        if (this.elements.paymentFieldsFieldset && !this.elements.paymentFieldsFieldset.disabled && this.elements.expiryDateInput.value && !this.validateExpiryDate()) {
            this.showMessage('Cannot save. The credit card expiration date is invalid.', 'danger');
            this.elements.expiryDateInput.focus();
            return;
        }
        if (this.elements.phoneInput && this.elements.phoneInput.value.startsWith('0')) {
            if (this.elements.phoneError) this.elements.phoneError.textContent = 'Please enter the number without a leading 0.';
            this.elements.phoneInput.focus();
            return;
        }

        if (this.elements.loadingSpinner) this.elements.loadingSpinner.style.display = 'block';
        if (this.elements.messageContainer) this.elements.messageContainer.style.display = 'none';

        const fullPhone = this.elements.phonePrefixSelect.value + this.elements.phoneInput.value;

        const dataToSubmit = {
            first_name: this.elements.firstNameInput.value,
            last_name: this.elements.lastNameInput.value,
            address: this.elements.addressInput.value,
            phone: fullPhone,
            user_id: this.currentUserId
        };

        if (this.elements.paymentFieldsFieldset && !this.elements.paymentFieldsFieldset.disabled) {
            if (this.elements.creditCardInput.value) dataToSubmit.credit_card = this.elements.creditCardInput.value;
            if (this.elements.expiryDateInput.value) dataToSubmit.expiry_date = this.elements.expiryDateInput.value;
            if (this.elements.cvvInput.value) dataToSubmit.cvv = this.elements.cvvInput.value;
        }

        try {
            let url = this.customerExists ? `${C.API_CUSTOMERS_URL}/${this.currentUserId}` : C.API_CUSTOMERS_URL;
            let method = this.customerExists ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error saving details');
            }

            const result = await response.json();

            this.showMessage('Details saved successfully!', 'success');
            this.toggleEdit(false);

            if (!this.customerExists) this.customerExists = true;
            this.updatePostSaveUI(result, dataToSubmit);

        } catch (error) {
            this.showMessage(error.message, 'danger');
        } finally {
            if (this.elements.loadingSpinner) this.elements.loadingSpinner.style.display = 'none';
        }
    }

    updatePostSaveUI(result, dataToSubmit) {
        if (result.credit_card && this.elements.creditCardDisplay) {
            this.elements.creditCardDisplay.value = result.credit_card;
        }
        if (result.expiry_date && this.elements.expiryDateDisplay) {
            this.elements.expiryDateDisplay.value = result.expiry_date;
        } else if (dataToSubmit.expiry_date && this.elements.expiryDateDisplay) {
            this.elements.expiryDateDisplay.value = dataToSubmit.expiry_date;
        }

        if (this.elements.creditCardInput) this.elements.creditCardInput.value = '';
        if (this.elements.expiryDateInput) this.elements.expiryDateInput.value = '';
        if (this.elements.cvvInput) this.elements.cvvInput.value = '';
        if (this.elements.cvvVerificationInput) this.elements.cvvVerificationInput.value = '';
    }

    async handleCreditCardBlur() {
        const card = this.elements.creditCardInput.value.trim();
        clearTimeout(this.debounceTimer);

        if (card === '') {
            if (this.elements.creditCardError) this.elements.creditCardError.textContent = '';
            return;
        }

        this.debounceTimer = setTimeout(async () => {
            if (this.elements.creditCardError) this.elements.creditCardError.textContent = 'Checking card...';
            try {
                const response = await fetch(C.API_CHECK_CARD_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credit_card: card })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    if (this.elements.creditCardError) this.elements.creditCardError.textContent = errData.error;
                } else {
                    if (this.elements.creditCardError) this.elements.creditCardError.textContent = '';
                }
            } catch (error) {
                if (this.elements.creditCardError) this.elements.creditCardError.textContent = 'Error checking card.';
            }
        }, 500);
    }

    formatNumericOnly(event) {
        const input = event.target;
        input.value = input.value.replace(/[^0-9]/g, '');
    }

    formatExpiryDate(event) {
        const input = event.target;
        let value = input.value.replace(/[^0-9]/g, '');

        if (value.length > 0) {
            if (value.length >= 2) {
                let month = parseInt(value.substring(0, 2), 10);
                if (month > 12) value = '1' + value.substring(1);
                if (month === 0) value = '0';
            }

            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
        }
        input.value = value;

        if (value.length === 5) {
            this.validateExpiryDate();
        } else {
            if (this.elements.expiryDateError) this.elements.expiryDateError.textContent = '';
        }
    }

    validateExpiryDate() {
        const value = this.elements.expiryDateInput.value;
        if (value.length !== 5) {
            if (this.elements.expiryDateError) this.elements.expiryDateError.textContent = 'Date must be in MM/YY format.';
            return false;
        }

        const [mm, yy] = value.split('/');
        const month = parseInt(mm, 10);
        const year = parseInt(`20${yy}`, 10);

        const now = new Date();
        const minValidYear = now.getFullYear() + 3;
        const currentMonth = now.getMonth() + 1;

        let isValid = true;
        if (year < minValidYear) {
            isValid = false;
        } else if (year === minValidYear && month < currentMonth) {
            isValid = false;
        }

        if (!isValid) {
            if (this.elements.expiryDateError) this.elements.expiryDateError.textContent = `Expiration date must be at least ${currentMonth}/${minValidYear % 100} (3 years from now).`;
            return false;
        }

        if (this.elements.expiryDateError) this.elements.expiryDateError.textContent = '';
        return true;
    }
}