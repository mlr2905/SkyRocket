// js/personal_details.js (Refactored)

// Store elements and handlers so we can clean them up
let elements = {};
let boundHandlers = {};
let debounceTimer;
let currentUserId = null; 
let customerExists = false; 

/**
 * NEW: Called by the router to initialize the page
 */
export function init() {
    // 1. Reset state
    currentUserId = null;
    customerExists = false;

    // 2. Select DOM elements
    selectDOMElements();
    
    // 3. Bind all event handlers
    bindEventHandlers();
    
    // 4. Attach event listeners
    attachEventListeners();
    
    // 5. Initial Load
    fetchUserAndCustomerData();
}

/**
 * NEW: Called by the router to clean up the page
 */
export function destroy() {
    removeEventListeners();
    clearTimeout(debounceTimer);
    elements = {};
    boundHandlers = {};
}

// --- Setup Functions ---

function selectDOMElements() {
    elements = {
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

function bindEventHandlers() {
    boundHandlers = {
        toggleEdit: () => toggleEdit(true),
        handleFormSubmit: (e) => handleFormSubmit(e),
        handleCvvVerification: () => handleCvvVerification(),
        handleCreditCardBlur: () => handleCreditCardBlur(),
        formatExpiryDate: (e) => formatExpiryDate(e),
        formatNumericOnly: (e) => formatNumericOnly(e),
        validateExpiryDate: () => validateExpiryDate(),
        validatePhoneBlur: () => {
            if (elements.phoneInput && elements.phoneInput.value.startsWith('0')) {
                if(elements.phoneError) elements.phoneError.textContent = 'Please enter the number without a leading 0.';
            } else {
                if(elements.phoneError) elements.phoneError.textContent = '';
            }
        }
    };
}

function attachEventListeners() {
    elements.editButton?.addEventListener('click', boundHandlers.toggleEdit);
    elements.form?.addEventListener('submit', boundHandlers.handleFormSubmit);
    elements.cvvVerifyButton?.addEventListener('click', boundHandlers.handleCvvVerification); 
    elements.creditCardInput?.addEventListener('input', boundHandlers.handleCreditCardBlur); 
    elements.expiryDateInput?.addEventListener('input', boundHandlers.formatExpiryDate);
    elements.cvvInput?.addEventListener('input', boundHandlers.formatNumericOnly);
    elements.cvvVerificationInput?.addEventListener('input', boundHandlers.formatNumericOnly);
    elements.phoneInput?.addEventListener('input', boundHandlers.formatNumericOnly);
    elements.expiryDateInput?.addEventListener('blur', boundHandlers.validateExpiryDate);
    elements.phoneInput?.addEventListener('blur', boundHandlers.validatePhoneBlur);
}

function removeEventListeners() {
    elements.editButton?.removeEventListener('click', boundHandlers.toggleEdit);
    elements.form?.removeEventListener('submit', boundHandlers.handleFormSubmit);
    elements.cvvVerifyButton?.removeEventListener('click', boundHandlers.handleCvvVerification); 
    elements.creditCardInput?.removeEventListener('input', boundHandlers.handleCreditCardBlur); 
    elements.expiryDateInput?.removeEventListener('input', boundHandlers.formatExpiryDate);
    elements.cvvInput?.removeEventListener('input', boundHandlers.formatNumericOnly);
    elements.cvvVerificationInput?.removeEventListener('input', boundHandlers.formatNumericOnly);
    elements.phoneInput?.removeEventListener('input', boundHandlers.formatNumericOnly);
    elements.expiryDateInput?.removeEventListener('blur', boundHandlers.validateExpiryDate);
    elements.phoneInput?.removeEventListener('blur', boundHandlers.validatePhoneBlur);
}

// --- All your original functions remain ---
// (Make sure they use the 'elements' object now)

function showMessage(message, type = 'danger') {
    if (elements.messageContainer) {
        elements.messageContainer.textContent = message;
        elements.messageContainer.className = `alert alert-${type}`;
        elements.messageContainer.style.display = 'block';
        window.scrollTo(0, 0); 
    }
}

async function fetchUserAndCustomerData() {
    if(elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
    try {
        const userRes = await fetch('/role_users/me', { credentials: 'include' });
        if (!userRes.ok) throw new Error('Not authenticated');

        const user = await userRes.json();
        currentUserId = user.id; 
        if(elements.emailInput) elements.emailInput.value = user.email || '';
        if(elements.usernameInput) elements.usernameInput.value = user.username || '';

        const customerRes = await fetch(`/role_users/customers/${currentUserId}`, { credentials: 'include' });

        if (customerRes.ok) {
            const customer = await customerRes.json();
            if(elements.firstNameInput) elements.firstNameInput.value = customer.first_name || '';
            if(elements.lastNameInput) elements.lastNameInput.value = customer.last_name || '';
            if(elements.addressInput) elements.addressInput.value = customer.address || '';
            
            const fullPhone = customer.phone || '';
            let foundPrefix = false;
            if(elements.phonePrefixSelect) {
                for (const option of elements.phonePrefixSelect.options) {
                    if (fullPhone.startsWith(option.value)) {
                        elements.phonePrefixSelect.value = option.value;
                        if(elements.phoneInput) elements.phoneInput.value = fullPhone.substring(option.value.length);
                        foundPrefix = true;
                        break;
                    }
                }
            }
            if (!foundPrefix) {
                if(elements.phoneInput) elements.phoneInput.value = fullPhone;
            }

           if(elements.creditCardDisplay) elements.creditCardDisplay.value = customer.credit_card || 'No card on file';

            let expiry = customer.expiry_date || 'N/A';
            if (expiry && expiry.length === 4 && !expiry.includes('/')) {
                expiry = expiry.substring(0, 2) + '/' + expiry.substring(2, 4);
            }
            if(elements.expiryDateDisplay) elements.expiryDateDisplay.value = expiry;
            customerExists = true;
            
        } else if (customerRes.status === 404) {
            customerExists = false; 
            showMessage('It looks like this is your first time here. Please fill in your customer details.', 'info');
            toggleEdit(true); 
        } else {
            const errData = await customerRes.json();
            throw new Error(errData.error || 'Error loading customer details');
        }
    } catch (error) {
        if (error.message === 'Not authenticated') {
            showMessage('You are not logged in. Redirecting to login page.', 'warning');
            setTimeout(() => {
                history.pushState(null, null, '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 2000);
        } else {
            showMessage(error.message, 'danger');
        }
    } finally {
        if(elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
    }
}

function toggleEdit(enable = true) {
    if(elements.personalFieldsFieldset) elements.personalFieldsFieldset.disabled = !enable;
    
    if (enable) {
        if(elements.editButton) elements.editButton.style.display = 'none';
        if(elements.saveButton) elements.saveButton.style.display = 'block';
        if (customerExists && elements.creditCardDisplay && elements.creditCardDisplay.value !== 'No card on file') {
            if(elements.cvvGate) elements.cvvGate.style.display = 'block';
        } else {
            if(elements.paymentFieldsFieldset) {
                elements.paymentFieldsFieldset.style.display = 'block';
                elements.paymentFieldsFieldset.disabled = false;
            }
        }
    } else {
        if(elements.editButton) elements.editButton.style.display = 'block';
        if(elements.saveButton) elements.saveButton.style.display = 'none';
        if(elements.cvvGate) elements.cvvGate.style.display = 'none';
        if(elements.paymentFieldsFieldset) {
            elements.paymentFieldsFieldset.style.display = 'none';
            elements.paymentFieldsFieldset.disabled = true;
        }
        if(elements.cvvVerificationInput) elements.cvvVerificationInput.value = '';
    }
}

async function handleCvvVerification() {
    const cvv = elements.cvvVerificationInput.value.trim();
    if (!cvv || cvv.length < 3) {
        if(elements.cvvVerifyError) elements.cvvVerifyError.textContent = 'Please enter a CVV (3 digits).';
        return;
    }
    
    if(elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
    if(elements.cvvVerifyError) elements.cvvVerifyError.textContent = '';
    
    try {
        const response = await fetch('/role_users/customers/verify-cvv', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cvv: cvv })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Invalid CVV');
        }

        if(elements.cvvGate) elements.cvvGate.style.display = 'none';
        if(elements.paymentFieldsFieldset) {
            elements.paymentFieldsFieldset.style.display = 'block';
            elements.paymentFieldsFieldset.disabled = false;
        }

    } catch (error) {
        if(elements.cvvVerifyError) elements.cvvVerifyError.textContent = error.message;
    } finally {
        if(elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
    }
}

async function handleFormSubmit(event) {
    event.preventDefault(); 
    if (!currentUserId) return;

    if (elements.creditCardError && elements.creditCardError.textContent !== '') {
        showMessage('Cannot save. Please correct the credit card error.', 'danger');
        elements.creditCardInput.focus();
        return;
    }
    if (elements.paymentFieldsFieldset && elements.paymentFieldsFieldset.disabled === false && elements.expiryDateInput.value && !validateExpiryDate()) {
         showMessage('Cannot save. The credit card expiration date is invalid.', 'danger');
         elements.expiryDateInput.focus();
         return;
    }
    if (elements.phoneInput && elements.phoneInput.value && elements.phoneInput.value.startsWith('0')) {
        if(elements.phoneError) elements.phoneError.textContent = 'Please enter the number without a leading 0.';
        elements.phoneInput.focus();
        return;
    }

    if(elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
    if(elements.messageContainer) elements.messageContainer.style.display = 'none';

    const fullPhone = elements.phonePrefixSelect.value + elements.phoneInput.value;

    const dataToSubmit = {
        first_name: elements.firstNameInput.value,
        last_name: elements.lastNameInput.value,
        address: elements.addressInput.value,
        phone: fullPhone,
        user_id: currentUserId 
    };

    if (elements.paymentFieldsFieldset && elements.paymentFieldsFieldset.disabled === false) {
        if (elements.creditCardInput.value) dataToSubmit.credit_card = elements.creditCardInput.value;
        if (elements.expiryDateInput.value) dataToSubmit.expiry_date = elements.expiryDateInput.value;
        if (elements.cvvInput.value) dataToSubmit.cvv = elements.cvvInput.value;
    }

    try {
        let url = customerExists ? `/role_users/customers/${currentUserId}` : `/role_users/customers`;
        let method = customerExists ? 'PUT' : 'POST';

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
        
        showMessage('Details saved successfully!', 'success');
        toggleEdit(false); 
        
        if (!customerExists) customerExists = true;

        if (result.credit_card) {
            if(elements.creditCardDisplay) elements.creditCardDisplay.value = result.credit_card;
        }
        if (result.expiry_date) { 
             if(elements.expiryDateDisplay) elements.expiryDateDisplay.value = result.expiry_date;
        } else if (dataToSubmit.expiry_date) {
             if(elements.expiryDateDisplay) elements.expiryDateDisplay.value = dataToSubmit.expiry_date;
        }
        
        if(elements.creditCardInput) elements.creditCardInput.value = '';
        if(elements.expiryDateInput) elements.expiryDateInput.value = '';
        if(elements.cvvInput) elements.cvvInput.value = '';
        if(elements.cvvVerificationInput) elements.cvvVerificationInput.value = '';

    } catch (error) {
        showMessage(error.message, 'danger');
    } finally {
        if(elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
    }
}
    
async function handleCreditCardBlur() {
    const card = elements.creditCardInput.value.trim();
    clearTimeout(debounceTimer);
    
    if (card === '') {
        if(elements.creditCardError) elements.creditCardError.textContent = '';
        return;
    }

    debounceTimer = setTimeout(async () => {
        if(elements.creditCardError) elements.creditCardError.textContent = 'Checking card...';
        try {
            const response = await fetch('/role_users/customers/check-card', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credit_card: card })
            });

            if (!response.ok) {
                const errData = await response.json();
                if(elements.creditCardError) elements.creditCardError.textContent = errData.error;
            } else {
                if(elements.creditCardError) elements.creditCardError.textContent = ''; 
            }
        } catch (error) {
            if(elements.creditCardError) elements.creditCardError.textContent = 'Error checking card.';
        }
    }, 500);
}

function formatNumericOnly(event) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
}

function formatExpiryDate(event) {
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
        validateExpiryDate();
    } else {
        if(elements.expiryDateError) elements.expiryDateError.textContent = '';
    }
}

function validateExpiryDate() {
    const value = elements.expiryDateInput.value;
    if (value.length !== 5) {
         if(elements.expiryDateError) elements.expiryDateError.textContent = 'Date must be in MM/YY format.';
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
        if(elements.expiryDateError) elements.expiryDateError.textContent = `Expiration date must be at least ${currentMonth}/${minValidYear % 100} (3 years from now).`;
        return false;
    }

    if(elements.expiryDateError) elements.expiryDateError.textContent = '';
    return true;
}