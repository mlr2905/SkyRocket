
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Selecting elements ---
    const form = document.getElementById('details-form');
    const fieldset = document.getElementById('form-fieldset');
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const messageContainer = document.getElementById('message-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Inputs
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');
    const creditCardDisplay = document.getElementById('credit_card_display');
    const creditCardInput = document.getElementById('credit_card');
    const expiryDateInput = document.getElementById('expiry_date');
    const cvvInput = document.getElementById('cvv');

    let currentUserId = null; // ID רגיל (ל-PUT ו-POST)
    let customerExists = false; 

    // --- 2. Function to display messages ---
    function showMessage(message, type = 'danger') {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type}`;
        messageContainer.style.display = 'block';
    }

    // --- 3. Function to load user and client data ---
    async function fetchUserAndCustomerData() {
        loadingSpinner.style.display = 'block';
        try {
            // Step 1: Get the logged in user information
            const userRes = await fetch('/role_users/me', {
                credentials: 'include' 
            });
            
            if (!userRes.ok) {
                showMessage('אינך מחובר. הנך מועבר לדף התחברות.', 'warning');
                setTimeout(() => window.location.href = '/login.html', 2000);
                return;
            }

            const user = await userRes.json();
            
            currentUserId = user.id; 

            // Fill in the account fields (read only)
            emailInput.value = user.email || '';
            usernameInput.value = user.username || '';

            // Step 2: Using the standard ID for the GET request
            const customerRes = await fetch(`/role_users/customers/${currentUserId}`, {
                credentials: 'include' 
            });

            if (customerRes.ok) {
                const customer = await customerRes.json();
                
                // Fill in the customer fields (for editing)
                firstNameInput.value = customer.first_name || '';
                lastNameInput.value = customer.last_name || '';
                addressInput.value = customer.address || '';
                phoneInput.value = customer.phone || '';
                creditCardDisplay.value = customer.credit_card || 'לא הוזן כרטיס';
                
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
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- 4. Function to open/lock the form ---
    function toggleEdit(enable = true) {
        fieldset.disabled = !enable;
        if (enable) {
            editButton.style.display = 'none';
            saveButton.style.display = 'block';
        } else {
            editButton.style.display = 'block';
            saveButton.style.display = 'none';
        }
    }

    // --- 5. Function to handle form submission (update or create) ---
    async function handleFormSubmit(event) {
        event.preventDefault(); 
        
        if (!currentUserId) {
            showMessage('שגיאה בזיהוי משתמש, נסה לרענן את הדף.', 'danger');
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

        // Add credit card details only if the user has entered them
        if (creditCardInput.value) {
            dataToSubmit.credit_card = creditCardInput.value;
        }
        if (expiryDateInput.value) {
            dataToSubmit.expiry_date = expiryDateInput.value;
        }
        if (cvvInput.value) {
            dataToSubmit.cvv = cvvInput.value;
        }

        try {
            let url;
            let method;

            if (customerExists) {
                url = `/role_users/customers/${currentUserId}`; 
                method = 'PUT';
            } else {
                url = `/role_users/customers`; 
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method, 
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSubmit)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'שגיאה בשמירת הפרטים');
            }

            const result = await response.json();
            
            showMessage('הפרטים נשמרו בהצלחה!', 'success');
            toggleEdit(false); 
            
            if (!customerExists) {
                customerExists = true;
            }

            // Clear sensitive payment fields
            creditCardInput.value = '';
            expiryDateInput.value = '';
            cvvInput.value = '';
            
            // Update the card view if it has changed
            if (result.credit_card) {
                creditCardDisplay.value = result.credit_card;
            }

        } catch (error) {
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- 6. Connecting event listeners ---
    editButton.addEventListener('click', () => toggleEdit(true));
    form.addEventListener('submit', handleFormSubmit);

    // --- 7. Initial operation ---
    fetchUserAndCustomerData();
});