// קובץ: js/personal-details.js

// הפעלה כאשר ה-DOM נטען
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. בחירת אלמנטים ---
    const form = document.getElementById('details-form');
    const fieldset = document.getElementById('form-fieldset');
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const messageContainer = document.getElementById('message-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // קלטות (Inputs)
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
    
    // --- שינוי: הוספנו "דגל" לניהול מצב ---
    let customerExists = false; // נניח שלא קיים עד שנוכיח אחרת

    // --- 2. פונקציה להצגת הודעות ---
    function showMessage(message, type = 'danger') {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type}`;
        messageContainer.style.display = 'block';
    }

    // --- 3. פונקציה לטעינת נתוני משתמש ולקוח ---
    async function fetchUserAndCustomerData() {
        loadingSpinner.style.display = 'block';
        try {
            // שלב א': קבלת פרטי המשתמש המחובר (מזהה אותו מהעוגייה)
            const userRes = await fetch('/role_users/me');
            
            if (!userRes.ok) {
                showMessage('אינך מחובר. הנך מועבר לדף התחברות.', 'warning');
                setTimeout(() => window.location.href = '/login.html', 2000);
                return;
            }

            const user = await userRes.json();
            
            currentUserId = user.id; // שומרים את ה-ID הרגיל (e.g. 49)

            // מילוי שדות החשבון (לקריאה בלבד)
            emailInput.value = user.email || '';
            usernameInput.value = user.username || '';

            // שלב ב': שימוש ב-ID הרגיל עבור בקשת ה-GET
            const customerRes = await fetch(`/role_users/customers/${currentUserId}`);

            if (customerRes.ok) {
                const customer = await customerRes.json();
                
                // מילוי שדות הלקוח (לעריכה)
                firstNameInput.value = customer.first_name || '';
                lastNameInput.value = customer.last_name || '';
                addressInput.value = customer.address || '';
                phoneInput.value = customer.phone || '';
                creditCardDisplay.value = customer.credit_card || 'לא הוזן כרטיס';
                
                // --- שינוי: עדכון הדגל ---
                customerExists = true;
                
            } else if (customerRes.status === 404) {
                // --- שינוי: עדכון הדגל ---
                customerExists = false; // הלקוח לא קיים
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

    // --- 4. פונקציה לפתיחה/נעילת הטופס ---
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

    // --- 5. פונקציה לטיפול בשליחת הטופס (עדכון או יצירה) ---
    async function handleFormSubmit(event) {
        event.preventDefault(); // מניעת רענון דף
        
        if (!currentUserId) {
            showMessage('שגיאה בזיהוי משתמש, נסה לרענן את הדף.', 'danger');
            return;
        }

        loadingSpinner.style.display = 'block';
        messageContainer.style.display = 'none';

        // איסוף נתונים מהטופס
        const dataToSubmit = {
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            address: addressInput.value,
            phone: phoneInput.value,
            user_id: currentUserId // חובה לשלוח את מזהה המשתמש
        };

        // הוספת פרטי כרטיס אשראי רק אם המשתמש הזין אותם
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
            // --- שינוי: לוגיקה דינאמית של POST / PUT ---
            let url;
            let method;

            if (customerExists) {
                // אם הלקוח קיים, בצע עדכון (PUT)
                url = `/role_users/customers/${currentUserId}`; // הנתיב דורש ID רגיל
                method = 'PUT';
            } else {
                // אם הלקוח חדש, בצע יצירה (POST)
                url = `/role_users/customers`; // הנתיב לא דורש ID ב-URL
                method = 'POST';
            }
            // --- סוף שינוי ---

            const response = await fetch(url, {
                method: method, // שימוש במתודה הדינאמית
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
            
            // הצלחה
            showMessage('הפרטים נשמרו בהצלחה!', 'success');
            toggleEdit(false); // נעל בחזרה את הטופס
            
            // --- שינוי: אם יצרנו לקוח חדש, נעדכן את הדגל ---
            if (!customerExists) {
                customerExists = true;
            }
            // --- סוף שינוי ---

            // נקה שדות תשלום רגישים
            creditCardInput.value = '';
            expiryDateInput.value = '';
            cvvInput.value = '';
            
            // עדכן את תצוגת הכרטיס אם הוא השתנה
            if (result.credit_card) {
                creditCardDisplay.value = result.credit_card;
            }

        } catch (error) {
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- 6. חיבור מאזיני אירועים ---
    editButton.addEventListener('click', () => toggleEdit(true));
    form.addEventListener('submit', handleFormSubmit);

    // --- 7. הפעלה ראשונית ---
    fetchUserAndCustomerData();
});