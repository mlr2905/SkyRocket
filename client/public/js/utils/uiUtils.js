/**
 * Displays a temporary message on a specific element.
 * @param {HTMLElement} element 
 * @param {string} message 
 * @param {string} type - css class suffix
 */
export function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = 'message ' + type;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}


export function showRegistrationAlert() {
    let alertElement = document.getElementById('registration-alert');
    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.id = 'registration-alert';
        alertElement.innerHTML = `
            <div class="alert-overlay">
                <div class="alert-content">
                    <div class="alert-icon"><div class="spinner"></div></div>
                    <h3>Registering New Device</h3>
                    <p id="alert-message">Processing registration...</p>
                    <div class="alert-progress"><div class="progress-bar"></div></div>
                </div>
            </div>
        `;
        document.body.appendChild(alertElement);
    }
    alertElement.style.display = 'flex';
    setTimeout(() => alertElement.classList.add('show'), 10);
}

export function updateRegistrationAlert(message) {
    const messageElement = document.getElementById('alert-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

export function hideRegistrationAlert() {
    const alertElement = document.getElementById('registration-alert');
    if (alertElement) {
        alertElement.style.opacity = '0';
        alertElement.style.transform = 'scale(0.9)';
        setTimeout(() => alertElement.remove(), 300);
    }
}

export function showCustomAlert(title, message, type = 'info') {
    let alertElement = document.getElementById('custom-alert');
    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.id = 'custom-alert';
        document.body.appendChild(alertElement);
    }

    const iconMap = { 'info': '🔄', 'success': '✅', 'error': '❌', 'warning': '⚠️' };
    alertElement.innerHTML = `
        <div class="alert-overlay">
            <div class="alert-content ${type}">
                <div class="alert-icon"><span class="icon">${iconMap[type] || '🔄'}</span></div>
                <h3>${title}</h3>
                <p>${message}</p>
                ${type === 'info' ? '<div class="alert-progress"><div class="progress-bar"></div></div>' : ''}
                ${type !== 'info' ? '<button id="custom-alert-close-btn" class="alert-button">Close</button>' : ''}
            </div>
        </div>
    `;
    alertElement.style.display = 'flex';

    const closeButton = document.getElementById('custom-alert-close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', hideCustomAlert);
    }
}

export function hideCustomAlert() {
    const alertElement = document.getElementById('custom-alert');
    if (alertElement) {
        alertElement.remove();
    }
}

export function showNotification() {
    let timerInterval;
    const fiveMinutes = 5 * 60 * 1000;

    if (typeof Swal === 'undefined' || typeof moment === 'undefined') {
        console.error('Swal or Moment.js is not loaded.');
        return;
    }

    Swal.fire({
        title: "Proactive Disconnection",
        html: "Due to inactivity, you will be disconnected in: <b></b> minutes.",
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