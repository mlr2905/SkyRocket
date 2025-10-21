/**
 * קובץ זה מרכז את כל מאזיני האירועים (Event Listeners)
 * עבור הטופס בקובץ registration.html.
 * זה מחליף את כל 속성 ה-oninput, onclick, onkeypress וכו'
 * שהיו מוטמעים ישירות ב-HTML.
 */
document.addEventListener('DOMContentLoaded', function() {

    // פונקציית עזר למניעת הקלדת תווים שאינם מספרים
    function restrictToNumbers(event) {
        if (event.charCode < 48 || event.charCode > 57) {
            event.preventDefault();
        }
    }

    // פונקציית עזר להסרת class 'invalid' בהקלדה
    function removeInvalidClass(event) {
        event.target.classList.remove('invalid');
    }

    // --- טאב 1: תנאי שימוש ---
    const termsCheckbox = document.querySelector('input[name="vehicle3"]');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('input', () => checkboxv(termsCheckbox));
    }

    // --- טאב 2: פרטי משתמש ---
    const firstName = document.getElementById('first_name');
    if (firstName) {
        firstName.addEventListener('input', removeInvalidClass);
    }

    const lastName = document.getElementById('last_name');
    if (lastName) {
        lastName.addEventListener('input', removeInvalidClass);
    }

    const email = document.getElementById('email');
    if (email) {
        email.addEventListener('input', () => validateEmail(email));
        email.addEventListener('keypress', function(event) {
    if (!/^[a-z0-9._\-@]$/.test(event.key)) {
                    event.preventDefault();
            }
        });
    }

    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            location.href = 'https://skyrocket.onrender.com/login.html';
        });
    }

    const password = document.getElementById('password');
    if (password) {
        password.addEventListener('input', () => validatePassword(password));
        password.addEventListener('keypress', function(event) {
            if (this.value.length >= 9 || event.key.match(/[^\x00-\x7F]/) || event.key === '#' || event.key === '%' || event.key === '&' || event.key === '+' || event.key === '\\' || event.key === '/' || event.key === ',' || event.key === '`' || event.key === '.' || event.key === '[' || event.key === ']' || event.key === '{' || event.key === '}' || event.key === '<' || event.key === '>') {
                event.preventDefault();
            }
        });
    }

    const eyeIcon1 = document.getElementById('eyeicon');
    if (eyeIcon1) {
        eyeIcon1.addEventListener('click', () => togglePasswordVisibility(eyeIcon1));
    }

    const password2 = document.getElementById('password2');
    if (password2) {
        password2.addEventListener('input', () => Checking_password(password2));
        password2.addEventListener('keypress', function(event) {
            if (this.value.length >= 9 || event.key.match(/[^\x00-\x7F]/)) {
                event.preventDefault();
            }
        });
        password2.addEventListener('paste', (event) => event.preventDefault());
    }

    const eyeIcon2 = document.getElementById('eyeicon2');
    if (eyeIcon2) {
        eyeIcon2.addEventListener('click', () => togglePasswordVisibility(eyeIcon2));
    }

    // --- טאב 3: פרטי קשר ותשלום ---
    const phone = document.getElementById('phone');
    if (phone) {
        phone.addEventListener('input', () => validatePhone(phone));
    }

    // שים לב: ב-HTML השתמשת ב-name="id_number" ולא ב-id
    const idNumber = document.querySelector('input[name="id_number"]');
    if (idNumber) {
        idNumber.addEventListener('input', () => validateIdNumber(idNumber));
        idNumber.addEventListener('keypress', restrictToNumbers);
    }

    const creditCard = document.getElementById('credit_card');
    if (creditCard) {
        creditCard.addEventListener('input', () => checkCreditCardValidity(creditCard));
        creditCard.addEventListener('keypress', restrictToNumbers);
    }

    const expiryDate = document.getElementById('expiry_date');
    if (expiryDate) {
        expiryDate.addEventListener('input', () => formatExpiryDate(expiryDate));
        expiryDate.addEventListener('keypress', restrictToNumbers);
    }

    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', () => cardcvv(cvv));
        cvv.addEventListener('keypress', restrictToNumbers);
    }

    const birthday = document.getElementById('birthday');
    if (birthday) {
        birthday.addEventListener('input', () => data(birthday));
    }

    // --- כפתורי ניווט ---
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => nextPrev(-1));
    }

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => nextPrev(1));
    }

});