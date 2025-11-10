// File: js/personal-details.js
// (Fixed: Now displays expiry date correctly)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Element Selection ---
    const form = document.getElementById('details-form');
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const messageContainer = document.getElementById('message-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    const personalFieldsFieldset = document.getElementById('personal-fields-fieldset');
    const paymentFieldsFieldset = document.getElementById('payment-fields-fieldset');

    // Personal Details
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const addressInput = document.getElementById('address');
    
    const phonePrefixSelect = document.getElementById('phone_prefix');
    const phoneInput = document.getElementById('phone_number');
    const phoneError = document.getElementById('phone_error');

    // Payment Display
    const creditCardDisplay = document.getElementById('credit_card_display');
    // --- הוספנו את השורה הבאה ---
    const expiryDateDisplay = document.getElementById('expiry_date_display');

    // CVV Gate
    const cvvGate = document.getElementById('cvv-gate');
    const cvvVerificationInput = document.getElementById('cvv_verification_input');
    const cvvVerifyButton = document.getElementById('cvv_verify_button');
    const cvvVerifyError = document.getElementById('cvv_verify_error');

    // Payment Edit Fields
    const creditCardInput = document.getElementById('credit_card');
    const expiryDateInput = document.getElementById('expiry_date');
    const cvvInput = document.getElementById('cvv');
    const creditCardError = document.getElementById('credit_card_error');
    const expiryDateError = document.getElementById('expiry_date_error');
    
    // State Management
    let currentUserId = null; 
    let customerExists = false; 
    let debounceTimer;

    // --- 2. Show Messages ---
    function showMessage(message, type = 'danger') {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type}`;
        messageContainer.style.display = 'block';
        window.scrollTo(0, 0); 
    }

    // --- 3. Initial Data Load ---
    async function fetchUserAndCustomerData() {
        loadingSpinner.style.display = 'block';
        try {
            const userRes = await fetch('/role_users/me', { credentials: 'include' });
            if (!userRes.ok) throw new Error('Not authenticated');

            const user = await userRes.json();
            currentUserId = user.id; 
            emailInput.value = user.email || '';
            usernameInput.value = user.username || '';

            const customerRes = await fetch(`/role_users/customers/${currentUserId}`, { credentials: 'include' });

            if (customerRes.ok) {
                const customer = await customerRes.json();
                firstNameInput.value = customer.first_name || '';
                lastNameInput.value = customer.last_name || '';
                addressInput.value = customer.address || '';
                
                const fullPhone = customer.phone || '';
                let foundPrefix = false;
                for (const option of phonePrefixSelect.options) {
                    if (fullPhone.startsWith(option.value)) {
                        phonePrefixSelect.value = option.value;
                        phoneInput.value = fullPhone.substring(option.value.length);
                        foundPrefix = true;
                        break;
                    }
                }
                if (!foundPrefix) {
                    phoneInput.value = fullPhone;
                }

                creditCardDisplay.value = customer.credit_card || 'No card on file';
                expiryDateDisplay.value = customer.expiry_date || 'N/A';

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
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                showMessage(error.message, 'danger');
            }
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- 4. Toggle Form Edit State ---
    function toggleEdit(enable = true) {
        personalFieldsFieldset.disabled = !enable;
        
        if (enable) {
            editButton.style.display = 'none';
            saveButton.style.display = 'block';
            if (customerExists && creditCardDisplay.value !== 'No card on file') {
                cvvGate.style.display = 'block';
            } else {
                paymentFieldsFieldset.style.display = 'block';
                paymentFieldsFieldset.disabled = false;
            }
        } else {
            editButton.style.display = 'block';
            saveButton.style.display = 'none';
            cvvGate.style.display = 'none';
            paymentFieldsFieldset.style.display = 'none';
            paymentFieldsFieldset.disabled = true;
            cvvVerificationInput.value = '';
        }
    }

    // --- 5. CVV Verification ---
    // (הלוגיקה הזו נשארת זהה)
    async function handleCvvVerification() {
        const cvv = cvvVerificationInput.value.trim();
        if (!cvv || cvv.length < 3) {
            cvvVerifyError.textContent = 'Please enter a CVV (3 digits).';
            return;
        }
        
        loadingSpinner.style.display = 'block';
        cvvVerifyError.textContent = '';
        
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

            cvvGate.style.display = 'none';
            paymentFieldsFieldset.style.display = 'block';
            paymentFieldsFieldset.disabled = false;

        } catch (error) {
            cvvVerifyError.textContent = error.message;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- 6. Handle Form Submit (Create/Update) ---
    // (הלוגיקה הזו נשארת זהה)
    async function handleFormSubmit(event) {
        event.preventDefault(); 
        if (!currentUserId) return;

        if (creditCardError.textContent !== '') {
            showMessage('Cannot save. Please correct the credit card error.', 'danger');
            creditCardInput.focus();
            return;
        }
        if (paymentFieldsFieldset.disabled === false && expiryDateInput.value && !validateExpiryDate()) {
             showMessage('Cannot save. The credit card expiration date is invalid.', 'danger');
             expiryDateInput.focus();
             return;
        }
        if (phoneInput.value && phoneInput.value.startsWith('0')) {
            phoneError.textContent = 'Please enter the number without a leading 0.';
            phoneInput.focus();
            return;
        }

        loadingSpinner.style.display = 'block';
        messageContainer.style.display = 'none';

        const fullPhone = phonePrefixSelect.value + phoneInput.value;

        const dataToSubmit = {
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            address: addressInput.value,
            phone: fullPhone,
            user_id: currentUserId 
        };

        if (paymentFieldsFieldset.disabled === false) {
            if (creditCardInput.value) dataToSubmit.credit_card = creditCardInput.value;
            if (expiryDateInput.value) dataToSubmit.expiry_date = expiryDateInput.value;
            if (cvvInput.value) dataToSubmit.cvv = cvvInput.value;
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

            // --- תיקון: עדכן את שני שדות התצוגה ---
            if (result.credit_card) { // ה-DAL מחזיר 'credit_card' מפורמט
                creditCardDisplay.value = result.credit_card;
            }
            // אם השרת החזיר תוקף מעודכן (מה-DAL), הצג אותו
            if (result.expiry_date) { 
                 expiryDateDisplay.value = result.expiry_date;
            } else if (dataToSubmit.expiry_date) { // אחרת, הצג מה שהמשתמש הזין
                 expiryDateDisplay.value = dataToSubmit.expiry_date;
            }
            // --- סוף התיקון ---
            
            creditCardInput.value = '';
            expiryDateInput.value = '';
            cvvInput.value = '';
            cvvVerificationInput.value = '';

        } catch (error) {
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }
    
    // --- 7. Real-time Credit Card Check ---
    // (הלוגיקה הזו נשארת זהה)
    async function handleCreditCardBlur() {
        const card = creditCardInput.value.trim();
        clearTimeout(debounceTimer);
        
        if (card === '') {
            creditCardError.textContent = '';
            return;
        }

        debounceTimer = setTimeout(async () => {
            creditCardError.textContent = 'Checking card...';
            try {
                const response = await fetch('/role_users/customers/check-card', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credit_card: card })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    creditCardError.textContent = errData.error;
                } else {
                    creditCardError.textContent = ''; 
                }
            } catch (error) {
                creditCardError.textContent = 'Error checking card.';
            }
        }, 500);
    }

    // --- 8. Input Formatters & Validators ---
    // (כל הלוגיקה הזו נשארת זהה)
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
            expiryDateError.textContent = '';
        }
    }
    
    function validateExpiryDate() {
        const value = expiryDateInput.value;
        if (value.length !== 5) {
             expiryDateError.textContent = 'Date must be in MM/YY format.';
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
            expiryDateError.textContent = `Expiration date must be at least ${currentMonth}/${minValidYear % 100} (3 years from now).`;
            return false;
        }

        expiryDateError.textContent = '';
        return true;
    }

    // --- 9. Attach Event Listeners ---
    editButton.addEventListener('click', () => toggleEdit(true));
    form.addEventListener('submit', handleFormSubmit);
    cvvVerifyButton.addEventListener('click', handleCvvVerification); 
    creditCardInput.addEventListener('input', handleCreditCardBlur); 

    expiryDateInput.addEventListener('input', formatExpiryDate);
    cvvInput.addEventListener('input', formatNumericOnly);
    cvvVerificationInput.addEventListener('input', formatNumericOnly);
    phoneInput.addEventListener('input', formatNumericOnly);
    
    expiryDateInput.addEventListener('blur', validateExpiryDate);
    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.startsWith('0')) {
            phoneError.textContent = 'Please enter the number without a leading 0.';
        } else {
            phoneError.textContent = '';
        }
    });

    // --- 10. Initial Load ---
    fetchUserAndCustomerData();
});