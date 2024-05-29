function changeText() {
    document.getElementById("email").disabled = false;
    document.getElementById('Change').style.display = 'none';
}

function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}

window.addEventListener('load', function () {
    // Hide the loading icon when the page is fully loaded
    document.getElementById('loading-icon').style.display = 'none';
});
let interval;

function authcode() {
    event.preventDefault(); // מונע מהפורמולר לשלוח את הבקשה באופן רגיל, מה שמונע מהדף להתאפס

    const email = document.getElementById('email').value;
    const successMessage = document.getElementById('success-message');
    const timerElement = document.getElementById('timer');
    const timerDiv = document.getElementById('timer_');
    const resendMessageElement = document.getElementById('resend-message');
    document.getElementById('loading-icon').style.display = 'block';

    resendMessageElement.style.display = 'none';

    fetch('https://skyrocket.onrender.com/role_users/authcode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email
        })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading-icon').style.display = 'none';

            const codeInput = document.getElementById('verification-code-input');
            const change = document.getElementById('toggle-auth-type');
            if (data.datas.code === "succeeded") {
                document.getElementById('Verification').style.display = 'none';
                codeInput.style.display = 'block';
                change.style.display = 'none';

                successMessage.textContent = "Code sent successfully! Will expire in: ";
                document.getElementById("verification-code").removeAttribute("readonly");
                successMessage.style.display = 'block';

                if (interval !== undefined) {
                    clearInterval(interval);
                    timerDiv.textContent = '';
                }

                let totalSeconds = 5 * 60; // 5 minutes in seconds
                interval = setInterval(function () {
                    let minutes = parseInt(totalSeconds / 60, 10);
                    let seconds = parseInt(totalSeconds % 60, 10);
                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;
                    timerDiv.textContent = minutes + ":" + seconds;
                    if (--totalSeconds < 0) {
                        clearInterval(interval);
                        timerDiv.textContent = "Expired";
                    }
                }, 1000);

                startTimer(1 * 30, timerElement, resendMessageElement);
                timerElement.style.display = 'block';
            } else {
                successMessage.textContent = "Failed to send code. Please try again.";
            }
        })
        .catch(error => {
            successMessage.textContent = `Try again! Error: ${error}`;
        });
}

function startTimer(duration, display, resendDisplay) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) {
            clearInterval(interval);
            display.style.display = 'none';
            resendDisplay.style.display = 'block';
        }
    }, 1000);
}

function validation() {
    event.preventDefault(); // מונע מהפורמולר לשלוח את הבקשה באופן רגיל, מה שמונע מהדף להתאפס

    const email = document.getElementById('email').value;
    const code = document.getElementById('verification-code').value;
    document.getElementById('loading-icon').style.display = 'block';

    fetch('https://skyrocket.onrender.com/role_users/validation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            code: code
        })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading-icon').style.display = 'none';

            if (data.swaggerUrl) {
                localStorage.setItem('sky', JSON.stringify(data.datas.jwt));
                const successMessage = document.getElementById('success-message');
                successMessage.textContent = data.datas.code;
                window.location.href = data.swaggerUrl;
            }
        })
        .catch(error => {
            const successMessage = document.getElementById('success-message');
            successMessage.textContent = data.datas.code;
            console.error('Error:', error);
        });
}

async function connect() {
    event.preventDefault(); // מונע מהפורמולר לשלוח את הבקשה באופן רגיל, מה שמונע מהדף להתאפס

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    document.getElementById('loading-icon').style.display = 'block';

    try {
        const response = await fetch('https://skyrocket.onrender.com/role_users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (response.ok) {
            document.getElementById('loading-icon').style.display = 'none';


            const data = await response.json();

            console.log(data);

            if (data.e === "no") {
                localStorage.setItem('sky', JSON.stringify(data.jwt));
                const successMessage = document.getElementById('success-message');
                successMessage.textContent = 'Login successful!';
                window.location.href = data.swaggerUrl;
            } else {
                const successMessage = document.getElementById('success-message');
                successMessage.textContent = data.error;
            }
        }
        else {
            document.getElementById('loading-icon').style.display = 'none';

            const successMessage = document.getElementById('success-message');
            successMessage.textContent = error.message;  // יש לשנות את ההודעה לשגיאה באופן ידידותי למשתמש

        }
    } catch (error) {
        document.getElementById('loading-icon').style.display = 'none';

        const successMessage = document.getElementById('success-message');
        successMessage.textContent = error.message;  // יש לשנות את ההודעה לשגיאה באופן ידידותי למשתמש
    }
}

function toggleAuthType() {
    document.getElementById("email_").style.display = "none";
    const passwordInput = document.getElementById('pass');
    const toggleButton = document.getElementById('toggle-auth-type');
    const submitButton = document.getElementById('connect-button');
    if (passwordInput.style.display === 'block') {
        document.getElementById("email").disabled = true;
        document.getElementById("pass_").style.display = "none";
        document.getElementById('Verification').style.display = 'block';
        passwordInput.style.display = 'none';
        toggleButton.textContent = "Enter a password";
        submitButton.textContent = 'connect';
        submitButton.removeAttribute('onclick');
        submitButton.addEventListener('click', validation);
        document.getElementById('connect-button').className =  'connect';

    } else {
        document.getElementById("email").disabled = false;
        document.getElementById("pass_").style.display = "block";
        submitButton.removeAttribute('onclick');
        submitButton.addEventListener('click', connect);
        toggleButton.textContent = "code by email";
        document.getElementById('Verification').style.display = 'none';
        passwordInput.style.display = 'block';
        submitButton.textContent = 'connect';
    }
}

function validateEmail(input) {
    const emailInput = document.getElementById('email');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const emailhref = encodeURIComponent(emailInput.value);
    const email = input.value.trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (emailRegex.test(email)) {
        input.className = '';
        document.getElementById('toggle-auth-type').className = 'change2';
        document.getElementById("pass_").style.display = "block";
        forgotPasswordLink.href = `https://skyrocket.onrender.com/password?email=${emailhref}`;
        document.getElementById("email_").style.display = "block";
        document.getElementById("email_error").style.display = "none";
        document.getElementById("password").disabled = false;
        document.getElementById("password_error").style.display = "block";
        document.getElementById("toggle-auth-type").disabled = false;
    } else {
        document.getElementById('toggle-auth-type').className = 'change';
        forgotPasswordLink.href = "#";
        document.getElementById("pass_").style.display = "none";
        input.className = 'invalid';
        document.getElementById("toggle-auth-type").disabled = true;
        document.getElementById("password").disabled = true;
        document.getElementById("email_error").style.display = "block";
        document.getElementById("email_").style.display = "none"
    }
}

function validateCode(input) {
    // מסנן רק מספרים ומקטין ל-6 תווים בלבד
    input.value = input.value.replace(/\D/g, '').slice(0, 6);

    const code = input.value.trim();
    const codeRegex = /^[0-9]{6}$/;

    if (codeRegex.test(code)) {
        document.getElementById("connect-button").disabled = false;
        input.classList.remove('invalid');
        document.getElementById("code_").style.display = "block";
        document.getElementById("code_error").style.display = "none";
        document.getElementById('connect-button').className = 'connect2';


    } else {
        document.getElementById('connect-button').className = 'connect';
        document.getElementById("connect-button").disabled = true;
        input.classList.add('invalid');
        document.getElementById("code_error").style.display = "block";
        document.getElementById("code_").style.display = "none";
    }
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
    let errorMessage = "";
    let successMessage = "";
    document.getElementById("email").disabled = true;
    document.getElementById('Change').style.display = 'block';

    const check = (regex, message) => {
        if (!regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <spam class ="red-text">${message}</spam></P>`;
        else successMessage += `<p><b class="green-v">&#10004;</b> <spam class ="green-text">${message}</spam></P>`;
    };
    const check2 = (regex, message) => {
        if (regex.test(password)) errorMessage += `<p><b class="red-x">&#10006;</b> <span class="red-text">${message}</span></p>`;
        else successMessage += `<p><b class="green-v">&#10004;</b> <spam class ="green-text">${message}</spam></P>`;

    };
    check(lengthRegex, "At least 8 characters");
    check(LowerCase, "LowerCase letters [a-z]");
    check(uppercaseRegex, "Upper case letters [A-Z]");
    check(Numbers, "Numbers [0-9]");
    check(specialCharRegex, "Special characters [~!@$^*?=_-]");
    check2(forbidden_characters, `Forbidden characters [ " ' ()]`);
    input.classList.toggle('invalid', errorMessage !== "");
    document.getElementById("password_error").innerHTML = errorMessage;
    document.getElementById("password_error").style.display = errorMessage ? "block" : "none";
    document.getElementById("password_").innerHTML = successMessage;
    document.getElementById("password_").style.display = successMessage ? "block" : "none";
    document.getElementById("connect-button").disabled = !!errorMessage;
    document.getElementById('connect-button').className = !!errorMessage ? 'connect' : 'connect2';



}




function showNotification() {
    let timerInterval;
    const fiveMinutes = 5 * 60 * 1000;

    Swal.fire({
        title: "proactive disconnection!",
        html: "Due to inactivity, the user will be disconnected. in: <b></b> minutes.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        timer: fiveMinutes,
        timerProgressBar: true,
        showConfirmButton: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                const remainingTime = moment.utc(Swal.getTimerLeft());
                const formattedTime = remainingTime.format("mm:ss");
                timer.textContent = formattedTime;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        },
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            location.reload();
        }
    });
}