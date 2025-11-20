/**
 * Converts a buffer to a Base64 string.
 * @param {ArrayBuffer} buffer 
 * @returns {string}
 */
export function bufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64 
 * @returns {ArrayBuffer}
 */
export function base64ToBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Adds days to a specific date object.
 * @param {Date} date 
 * @param {number} days 
 * @returns {Date}
 */
export function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}


/**
 * Starts a countdown timer on a specific element.
 * @param {number} duration - Duration in seconds
 * @param {HTMLElement} display - Element to show the time
 * @param {HTMLElement} resendDisplay - Element to show when time is up
 * @returns {number} Interval ID (to allow clearing it later)
 */
export function startTimer(duration, display, resendDisplay) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        if (display) display.textContent = minutes + ":" + seconds;
        
        if (--timer < 0) {
            clearInterval(interval);
            if (display) display.style.display = 'none';
            if (resendDisplay) resendDisplay.style.display = 'block';
        }
    }, 1000);
    return interval;
}

/**
 * Prevents non-numeric input in text fields.
 * @param {Event} event 
 */
export function restrictToNumbers(event) {
    if (event.charCode < 48 || event.charCode > 57) {
        event.preventDefault();
    }
}