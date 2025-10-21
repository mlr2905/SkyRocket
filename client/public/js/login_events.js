/**
 * קובץ זה מרכז את כל מאזיני האירועים (Event Listeners)
 * עבור הטופס בקובץ login.html.
 * זה מחליף את כל 속성 ה-oninput, onclick, onkeypress וכו'
 * שהיו מוטמעים ישירות ב-HTML.
 */
document.addEventListener('DOMContentLoaded', function() {

    // --- שדה אימייל ---
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', () => validateEmail(emailInput));
        emailInput.addEventListener('keypress', function(event) {
            // תיקון לשגיאת ה-RegEx שהייתה ב-HTML
            if (!/^[a-z0-9._\-@]$/.test(event.key)) {
                event.preventDefault();
            }
        });
    }

    const changeButton = document.getElementById('Change');
    if (changeButton) {
        changeButton.addEventListener('click', changeText);
    }

    // --- שדה סיסמה ---
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => validatePassword(passwordInput));
        passwordInput.addEventListener('keypress', function(event) {
            if (this.value.length >= 9 || event.key.match(/[^\x00-\x7F]/) || event.key === '#' || event.key === '%' || event.key === '&' || event.key === '+' || event.key === '\\' || event.key === '/' || event.key === ',' || event.key === '`' || event.key === '.' || event.key === '[' || event.key === ']' || event.key === '{' || event.key === '}' || event.key === '<' || event.key === '>') {
                event.preventDefault();
            }
        });
    }

    // --- כפתור העין (מה-script הפנימי) ---
    const eyeIcon = document.getElementById('eyeicon');
    if (eyeIcon) {
        eyeIcon.addEventListener("click", () => {
            const password = document.getElementById("password");
            if (password.type == "password") {
                password.type = "text";
                eyeIcon.src = "./img/eye.png";
            } else {
                password.type = "password";
                eyeIcon.src = "./img/eye.gif";
            }
        });
    }

    // --- כפתורי אימות ---
    const toggleAuthButton = document.getElementById('toggle-auth-type');
    if (toggleAuthButton) {
        toggleAuthButton.addEventListener('click', toggleAuthType);
    }

    const verificationButton = document.getElementById('Verification');
    if (verificationButton) {
        verificationButton.addEventListener('click', authcode);
    }

    // --- שדה קוד אימות ---
    const codeInput = document.getElementById('verification-code');
    if (codeInput) {
        codeInput.addEventListener('input', () => validateCode(codeInput));
    }

    const resendButton = document.getElementById('resend-message');
    if (resendButton) {
        resendButton.addEventListener('click', authcode);
    }

    const connectButton = document.getElementById('connect-button');
    if (connectButton) {
        // הסרת ה-onclick הישן והוספת listener נקי
        connectButton.removeAttribute('onclick');
        connectButton.addEventListener('click', connect);
    }

    // --- כפתורי התחברות צד-שלישי ---
    const gitButton = document.getElementById('git');
    if (gitButton) {
        gitButton.addEventListener('click', login_git);
    }

    const biometricButton = document.getElementById('face');
    if (biometricButton) {
        biometricButton.addEventListener('click', loginWithBiometric);
    }

    // זיהוי כפתור גוגל (לא היה לו ID, אז נזהה לפי התמונה שבתוכו)
    const googleButton = document.querySelector('button img[alt="google logo"]');
    if (googleButton) {
        // ה-listener צריך להיות על הכפתור עצמו (ההורה של התמונה)
        googleButton.parentElement.addEventListener('click', login_google);
    }
});