// File: main.js
import { LoginController } from './classes/LoginController.js';

// הפעלת הקונטרולר רק לאחר שה-DOM נטען במלואו
document.addEventListener('DOMContentLoaded', () => {
    // יצירת מופע של הקלאס.
    // ה-constructor יאתחל אוטומטית את כל המאזינים והבדיקות.
    new LoginController();
});