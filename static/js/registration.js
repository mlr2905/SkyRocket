
function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}

// חישוב תאריכים
let today = new Date();
let minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
let maxDate = addDays(new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()), -1);

// הגדרת המינימום והמקסימום



function initializeIntlTelInput(countryCode) {
    const input = document.querySelector("#phone");
    const iti = window.intlTelInput(input, { initialCountry: countryCode });
    window.iti = iti;
}

async function countryCode() {
    let country = "en"; // במקרה שה-fetching נכשל, נשאיר את הערך הנוכחי כ"en"
    try {
        const response = await fetch('https://skyrocket.onrender.com/role_users/ip');
        const data = await response.json();
         country = String.prototype.toLowerCase.call(data.country);

        return initializeIntlTelInput(country);

    } catch (error) {
        console.error('Error fetching IP information:', error);
        return initializeIntlTelInput(country);

    }

}
countryCode()

// הפעלת הפונקציה עם קוד מדינה כפרמטר

function cardcvv(input) {
    input.classList.remove('invalid');

}
function data(input) {
    input.classList.remove('invalid');
    document.getElementById('nextBtn').className = 'nextBtn2';


}
function formatExpiryDate(input) {
    input.classList.remove('invalid');

    document.getElementById("card_").style.display = "none";

    const currentDate = new Date();
    const currentYear = parseInt(currentDate.getFullYear().toString().substring(2));

    const value = input.value.replace(/\D/g, ''); // Remove all non-digit characters
    let formattedValue = '';

    if (value.length >= 1) {
        // Validate and format the month
        let month = value.substring(0, 2);
        if (month.length === 1) {
            if (month > '1') {
                month = '0' + month;
            }
        } else if (month.length === 2) {
            if (month > '12') {
                month = '12';
            }
        }
        formattedValue = month;
    }

    if (value.length > 2) {
        formattedValue += '/';
        // Validate and format the year
        let year = value.substring(2, 4);
        if (year.length === 1) {
            if (year < '2') {
                year = '2' + year;
            }
        } else if (year.length === 2) {
            const inputYear = parseInt(year);
            if (inputYear < currentYear || inputYear === currentYear) {
                year = (currentYear + 1).toString().substr(-2);
            } else if (inputYear > currentYear + 7) {
                year = (currentYear + 7).toString().substr(-2);
            }
        }
        formattedValue += year;
    }

    // Set the value only if it matches the expected format
    if (/^\d{0,2}\/\d{0,2}$/.test(formattedValue)) {
        input.value = formattedValue;
    }
}



function togglePasswordVisibility(icon) {
    // Get the input field (assuming the icon is next to the input field)
    let passwordField = icon.previousElementSibling;

    // Check if the previous sibling is indeed an input field of type password or text
    if (passwordField && (passwordField.type === "password" || passwordField.type === "text")) {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            icon.src = "/eye.png";  // Change icon to indicate visibility
        } else {
            passwordField.type = "password";
            icon.src = "/eye.gif";  // Change icon back to original state
        }
    } else {
        console.error("Previous sibling is not a password field.");
    }
}

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {

    // document.getElementById("nextBtn").disabled = true
    document.getElementById('nextBtn').className = 'nextBtn';
    // This function will display the specified tab of the form...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    //... and fix the Back/Next buttons:
    if (n == 0) {
        document.getElementById("backBtn").style.display = "none";
    } else {
        document.getElementById("backBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Finish";
        document.getElementById("nextBtn").onclick = signup; // Assigning the signup function
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    //... and run a function that will display the correct step indicator:
    fixStepIndicator(n)
} async function signup() {
    document.getElementById('loading-icon').style.display = 'block';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/role_users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.e === "yes") {
            const successMessage = document.getElementById('success-message');
            successMessage.textContent = data.error;
            window.location.href = data.loginUrl;
        } else {
            if (data.id) {
                return registration(data.id);
            }
        }
    } catch (error) {
        document.getElementById('loading-icon').style.display = 'none';
        console.error('Error:', error);
    }
}

async function registration(id) {

    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const phone = document.getElementById('phone').value;
    const credit_card = document.getElementById('credit_card').value;
    const expiry_date = document.getElementById('expiry_date').value;
    const cvv = document.getElementById('cvv').value;

    try {
        const response = await fetch('/role_users/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: first_name,
                last_name: last_name,
                phone: phone,
                credit_card: credit_card,
                expiry_date: expiry_date,
                cvv: cvv,
                user_id: id
            })
        });

        const data = await response.json();
        document.getElementById('loading-icon').style.display = 'none';

        if (data.e === "yes") {
            const successMessage = document.getElementById('success-message');
            successMessage.textContent = data.error;
        } else {
            if (data.signupUrl) {
                const successMessage = document.getElementById('success-message');
                successMessage.textContent = 'signup successful!';
                window.location.href = data.signupUrl;
            } else {
                document.getElementById('loading-icon').style.display = 'none';
            }
        }
    } catch (error) {
        document.getElementById('loading-icon').style.display = 'none';
        console.error('Error:', error);
    }
}

function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
        // ... the form gets submitted:
        const submitButton = document.getElementById('nextBtn');

        submitButton.textContent = 'connect';
        submitButton.removeAttribute('onclick');
        submitButton.addEventListener('click', registration);
        document.getElementById('nextBtn').className = 'nextBtn2';
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}

function handleResponse(data) {
    console.log("data.err", data.err);
    console.log("data loginUrl", data.loginUrl);

    const successMessage = document.getElementById('success-message');
    if (data.err === "yes") {
        successMessage.textContent = data.error;
        window.location.href = data.loginUrl;
    } else if (data.loginUrl) {
        successMessage.textContent = 'Signup successful!';
        window.location.href = data.loginUrl;
    }
}
function validateForm() {
    // פונקציה זו מטפלת בבדיקת תקינות של השדות בטופס
    document.getElementById("h1").style.display = "block";

    var x, y, i, valid = true;
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");
    // לולאה שבודקת כל שדה קלט בטאב הנוכחי:
    for (i = 0; i < y.length; i++) {
        // אם השדה ריק או שיש לו מחלקה "invalid"...
        if (y[i].value == "" || y[i].classList.contains("invalid")) {
            // שנה את סטטוס התקינות הנוכחי ל-false
            if (y[i].classList.contains("iti__search-input")) {
                continue; // דלג על שדה זה
            } else {
                valid = false;
                y[i].classList.add("invalid");
            }


        }
    }
    // אם הסטטוס התקין הוא true, סמן את הצעד כהושלם ותקין:
    if (valid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid; // החזר את סטטוס התקינות
}

function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class on the current step:
    x[n].className += " active";
}
// Function to check if the ID number is valid
function checkIdNumber(inputNumber) {
    let isValid;
    let numSum = 0;

    try {
        // Validate inputNumber length
        if (inputNumber.length !== 9) {
            throw "Input number must be 9 digits long";
        }

        // Calculate the sum according to the algorithm
        for (let i = 0; i < 9; i++) {
            let digit = parseInt(inputNumber.charAt(i));
            let factor = (i % 2 === 0) ? 1 : 2;
            let product = digit * factor;
            // Add digits of products over 9
            numSum += (product > 9) ? product - 9 : product;
        }

        // Check if the sum is divisible by 10
        isValid = (numSum % 10 === 0);
    } catch (error) {
        // If any error occurs, consider the ID invalid
        isValid = false;
        console.error("Error:", error);
    }
    return isValid;
}



// פונקציה שמתבצעת כאשר מתבצעת הקלטה בשדה
function validateIdNumber(input) {
    // קבלת הערך של ה-ID number מהשדה
    let inputNumber = input.value.trim();

    // בדיקה האם הערך תקין
    if (/^\d{9}$/.test(inputNumber)) {
        // התראה על תוקף המספר
        if (checkIdNumber(inputNumber)) {
            input.className = '';
            document.getElementById("id_number_error").style.display = "none";
            document.getElementById("id_number").style.display = "block";
        } else {
            input.className = 'invalid';
            document.getElementById("id_number_error").style.display = "block";
            document.getElementById("phone_").style.display = "none";
        }
    } else {
        input.className = 'invalid';
        // התראה על אורך לא תקין או תווים לא תקינים
        document.getElementById("id_number_error").style.display = "block";
        document.getElementById("phone_").style.display = "none";
    }
}
// הוספת אירוע 'change' לשדה ה-ID number
document.getElementsByName("id_number")[0].addEventListener("change", validateIdNumber);

function validatePhone(input) {
    const phone_ = input.value.trim();
    // הסרת תווים שאינם מספרים מהטלפון
    const phone = phone_.replace(/\D/g, '');
    // קבלת ה-pattern והסרת התווים "( ) -"
    const pattern = input.placeholder.replace(/[\(\)\-\s]/g, '');
    // בניית התבנית הרגולרית מה-pattern שלא כוללת את התווים "( ) -"
    if (phone.length === pattern.length) {
        input.classList.remove('invalid');
        document.getElementById("phone_").style.display = "block";
        document.getElementById("phone_error").style.display = "none";
    } else {
        input.classList.add('invalid');
        document.getElementById("phone_error").style.display = "block";
        document.getElementById("phone_").style.display = "none";
    }
}



async function validateEmail(input) {
    document.getElementById('loading-icon').style.display = 'block';

    const email = input.value.trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
    
    if (!emailRegex.test(email)) {
        updateUI('invalid', true, "Invalid email format", false);
        document.getElementById("login-button").style.display = "none"
        document.getElementById('loading-icon').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`role_users/users/search?email=${email}`);
        const data = await response.json();
        if (data === "ok") {
            updateUI('invalid', true, "The email already exists", false);
            document.getElementById('loading-icon').style.display = 'none';

        } else {
            let [name, domain] = email.split('@');

            const response = await fetch(`role_users/email?email=${email}`);
            const check = await response.json();
            if (check.e === "no") {
                if (check.status === "disposable") {
                    updateUI('invalid', true, `'${domain}' does not exist `, false);
                    document.getElementById('loading-icon').style.display = 'none';
                    document.getElementById("login-button").style.display = "none"        
                }
                if (check.status === "invalid") {
                    updateUI('invalid', true, ` '${name}' not exist in '${domain}' `, false);
                    document.getElementById('loading-icon').style.display = 'none';
                    document.getElementById("login-button").style.display = "none"        
                }
                if (check.status === "valid") {
                    updateUI('', false, "", true);
                    document.getElementById('loading-icon').style.display = 'none';
                    document.getElementById("login-button").style.display = "none"        
                }
               
            }
            if (check.e === "yes") {
                
                updateUI('invalid', true, `errer:'${check.status}' `, false);
                document.getElementById('loading-icon').style.display = 'none';
                document.getElementById("login-button").style.display = "none"
            }
          
         
        }
    } catch (error) {
        updateUI('invalid', true, "An error occurred", false);
        document.getElementById("login-button").style.display = "none"
        document.getElementById('loading-icon').style.display = 'none';



    }
}


function updateUI(inputClass, passwordDisabled, emailErrorMessage, passwordValid) {
    document.getElementById('email').className = inputClass;

    document.getElementById("password").disabled = passwordDisabled;

    const emailErrorElement = document.getElementById("email_error");
    const emailValidElement = document.getElementById("email_");

    if (emailErrorMessage) {
        emailErrorElement.style.display = "block";
        emailErrorElement.querySelector("spam").textContent = emailErrorMessage;
        emailValidElement.style.display = "none";
    } else {
        emailErrorElement.style.display = "none";
        emailValidElement.style.display = "block";
    }

    document.getElementById("password_error").style.display = passwordValid ? "block" : "none";
}

function validatePassword(input) {
    document.getElementById("email_").style.display = "none";
    const password = input.value.trim();
    const lengthRegex = /^.{8,}$/;
    const LowerCase = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const Numbers = /[0-9]/
    const specialCharRegex = /[~!@$^*?=_-]/;
    const forbidden_characters = /["|'()]/;
    // התבנית הבאה מייחסת רק לתווים באנגלית
    const englishOnlyRegex = /^[a-zA-Z0-9@$!%*?&]*$/;
    let errorMessage = "";
    let successMessage = "";
    document.getElementById("email").disabled = true;

    const check = (regex, message) => {
        if (!regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <spam class ="red-text">${message}</spam></P>`;
        else successMessage += `<p><b class="green-v">&#10004;</b> <spam class ="green-text">${message}</spam></P>`;
    };
    const check2 = (regex, message) => {
        if (regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <span class="red-text">${message}</span></p>`;
        else successMessage += `<p><b class="green-v">&#10004;</b> <spam class ="green-text">${message}</spam></P>`;
    };

    check(lengthRegex, "At least 8 characters");
    check(LowerCase, "LowerCase letters (a-z)");
    check(uppercaseRegex, "Upper case letters (A-Z)");
    check(Numbers, "Numbers (0-9)");
    check(specialCharRegex, "Special characters [~!@$^*?=_-]");
    check2(forbidden_characters, `Forbidden characters [ " ' ()]`);

    // הוסף את הבדיקה של התבנית הרגולרית של התווים באנגלית

    input.classList.toggle('invalid', errorMessage !== "");
    document.getElementById("password_error").innerHTML = errorMessage;
    document.getElementById("password_error").style.display = errorMessage ? "block" : "none";
    document.getElementById("password_").innerHTML = successMessage;
    document.getElementById("password_").style.display = successMessage ? "block" : "none";
    document.getElementById("password2").disabled = errorMessage ? true : false


}


function Checking_password(input) {


    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (password === password2) {

        document.getElementById("password_").innerHTML = `<p><b class="green-v">&#10004;</b>
        <spam class="green-text">The passwords are the same</spam></p>`;
        document.getElementById("password_error").style.display = "block" ? "none" : "none";
        document.getElementById("password_").style.display = "none" ? "block" : "none";
        // document.getElementById("nextBtn").disabled = false
        document.getElementById('nextBtn').className = 'nextBtn2';
        input.classList.remove('invalid');





    } else {
        input.classList.add('invalid');
        document.getElementById('nextBtn').className = 'nextBtn';
        document.getElementById("password_error").innerHTML = `<p><b class="red-x">&#10006;</b>
        <spam class="red-text">The passwords are not the same</spam></p>`;
        document.getElementById("password_error").style.display = "none" ? "block" : "none";
        document.getElementById("password_").style.display = "block" ? "none" : "none";
    }

}
function checkCreditCardValidity(input) {
    let CardNumber = input.value.trim();

    let isValid;
    let totalSum = 0;
    let isSecond = false;

    // Remove any spaces from the credit card number
    CardNumber = CardNumber.replace(/\s/g, '');

    if (CardNumber.length !== 16) {
        isValid = false
    }
    else {

        if (!/\D/.test(CardNumber)) {
            for (let i = CardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(CardNumber.charAt(i));

                if (isSecond) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }

                totalSum += digit;
                isSecond = !isSecond;
            }

            if (totalSum % 10 === 0) {
                isValid = true;
            }
        }

    }
    if (isValid) {
        input.className = '';

        document.getElementById("card_").style.display = "block";
        document.getElementById("card_error").style.display = "none";
    } else {
        input.className = 'invalid';

        document.getElementById("card_error").style.display = "block";
        document.getElementById("card_").style.display = "none";
        document.getElementById("id_number").style.display = "none";



    }
}
function validateCreditCard(input) {
    const expiryDate = input.value.trim();
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/; // MM/YY format
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() returns zero-based month
    const currentYear = today.getFullYear() % 100; // getYear() returns full year, so we get only the last two digits

    if (expiryRegex.test(expiryDate)) {
        const parts = expiryDate.split('/');
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);

        if (year > currentYear || (year === currentYear && month >= currentMonth)) {
            input.className = '';
            document.getElementById("card_").style.display = "block";
            document.getElementById("card_error").style.display = "none";
            // ניתן להוסיף פעולות נוספות כאן במידת הצורך
        } else {
            input.className = 'invalid';
            document.getElementById("card_error").style.display = "block";
            document.getElementById("card_").style.display = "none";
            // ניתן להוסיף פעולות נוספות כאן במידת הצורך
        }
    } else {
        input.className = 'invalid';
        document.getElementById("card_error").style.display = "block";
        document.getElementById("card_").style.display = "none";
        // ניתן להוסיף פעולות נוספות כאן במידת הצורך
    }
}
function checkboxv(input) {
    if (input.checked) {
        document.getElementById('nextBtn').className = 'nextBtn2';
        document.getElementById('nextBtn').disabled = false;
    } else {
        document.getElementById('nextBtn').className = 'nextBtn';
        document.getElementById('nextBtn').disabled = true;
    }
}
window.addEventListener('load', function () {
    // Hide the loading icon when the page is fully loaded
    document.getElementById('loading-icon').style.display = 'none';
});
