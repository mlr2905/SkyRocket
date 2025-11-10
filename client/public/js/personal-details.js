
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Selecting elements ---
    const form = document.getElementById('details-form');
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const messageContainer = document.getElementById('message-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Division into 2 separate areas
    const personalFieldsFieldset = document.getElementById('personal-fields-fieldset');
    const paymentFieldsFieldset = document.getElementById('payment-fields-fieldset');

    // Personal details
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');

    // Payment details (view)
    const creditCardDisplay = document.getElementById('credit_card_display');
    const expiryDateDisplay = document.getElementById('expiry_date_display');

    // CVV verification gateway
    const cvvGate = document.getElementById('cvv-gate');
    const cvvVerificationInput = document.getElementById('cvv_verification_input');
    const cvvVerifyButton = document.getElementById('cvv_verify_button');
    const cvvVerifyError = document.getElementById('cvv_verify_error');

    // Payment edit fields
    const creditCardInput = document.getElementById('credit_card');
    const expiryDateInput = document.getElementById('expiry_date');
    const cvvInput = document.getElementById('cvv');
    const creditCardError = document.getElementById('credit_card_error');
    
    // State management
    let currentUserId = null; 
    let customerExists = false; 
    let debounceTimer;

    // --- 2. Function to display messages ---
    function showMessage(message, type = 'danger') {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type}`;
        messageContainer.style.display = 'block';
        window.scrollTo(0, 0); // גלול לראש הדף להצגת ההודעה
    }

    // --- 3. Initial data loading ---
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
                phoneInput.value = customer.phone || '';
                creditCardDisplay.value = customer.credit_card || 'לא הוזן כרטיס';
                expiryDateDisplay.value = customer.expiry_date || 'N/A';
                customerExists = true;
            } else if (customerRes.status === 404) {
                customerExists = false; 
                showMessage('נראה שזו הפעם הראשונה שלך כאן. אנא מלא את פרטי הלקוח.', 'info');
                toggleEdit(true); 
            } else {
                const errData = await customerRes.json();
                throw new Error(errData.error || 'שגיאה בטעינת פרטי הלקוח');
            }
        } catch (error) {
            if (error.message === 'Not authenticated') {
                showMessage('אינך מחובר. הנך מועבר לדף התחברות.', 'warning');
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                showMessage(error.message, 'danger');
            }
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- 4. Function to open/lock the form ---
    function toggleEdit(enable = true) {
        personalFieldsFieldset.disabled = !enable; 
        
        if (enable) {
            editButton.style.display = 'none';
            saveButton.style.display = 'block';
            
            if (customerExists && creditCardDisplay.value !== 'לא הוזן כרטיס') {
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

    // --- 5. New function: CVV verification ---
    async function handleCvvVerification() {
        const cvv = cvvVerificationInput.value.trim();
        if (!cvv || cvv.length < 3) {
            cvvVerifyError.textContent = 'יש להזין CVV (3-4 ספרות).';
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
                throw new Error(errData.error || 'CVV לא תקין');
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

    // --- 6. Function to handle form submission (update or create) ---
    async function handleFormSubmit(event) {
        event.preventDefault(); 
        if (!currentUserId) return;

        if (creditCardError.textContent !== '') {
            showMessage('לא ניתן לשמור. אנא תקן את שגיאת כרטיס האשראי.', 'danger');
            creditCardInput.focus();
            return;
        }

        loadingSpinner.style.display = 'block';
        messageContainer.style.display = 'none';

        
        const dataToSubmit = {
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            address: addressInput.value,
            phone: phoneInput.value,
            user_id: currentUserId 
        };

        if (paymentFieldsFieldset.disabled === false) {
            if (creditCardInput.value) {
                dataToSubmit.credit_card = creditCardInput.value;
            }
            if (expiryDateInput.value) {
                dataToSubmit.expiry_date = expiryDateInput.value;
            }
            if (cvvInput.value) {
                dataToSubmit.cvv = cvvInput.value;
            }
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
                throw new Error(errData.error || 'שגיאה בשמירת הפרטים');
            }

            const result = await response.json();
            
            showMessage('הפרטים נשמרו בהצלחה!', 'success');
            toggleEdit(false); 
            
            if (!customerExists) customerExists = true;

            if (result.credit_card) {
                creditCardDisplay.value = result.credit_card;
            }
            if (result.data && result.data.expiry_date) {
                 expiryDateDisplay.value = result.data.expiry_date;
            } else if (dataToSubmit.expiry_date) {
                 expiryDateDisplay.value = dataToSubmit.expiry_date;
            }
            
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
    
    // --- 7. Active credit card check (when editing) ---
    async function handleCreditCardBlur() {
        const card = creditCardInput.value.trim();
        clearTimeout(debounceTimer);
        
        if (card === '') {
            creditCardError.textContent = '';
            return;
        }

        debounceTimer = setTimeout(async () => {
            creditCardError.textContent = 'card checker...';
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
                creditCardError.textContent = 'Error checking the card.';
            }
        }, 500);
    }

    editButton.addEventListener('click', () => toggleEdit(true));
    form.addEventListener('submit', handleFormSubmit);
    cvvVerifyButton.addEventListener('click', handleCvvVerification);
    creditCardInput.addEventListener('input', handleCreditCardBlur); 

    fetchUserAndCustomerData();
});