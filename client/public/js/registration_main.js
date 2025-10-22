// File: registration_main.js (נקודת כניסה עבור Registration)
import { RegistrationController } from './classes/RegistrationController.js';

// הפעלת הקונטרולר רק לאחר שה-DOM נטען במלואו
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationController();
});