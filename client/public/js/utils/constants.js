// File: constants.js

// --- Login Endpoints ---
export const API_LOGIN_URL = "https://skyrocket.onrender.com/role_users/loginWebAuthn";
export const API_REG_URL = "https://skyrocket.onrender.com/role_users/signupwebauthn";
export const API_AUTH_CODE_URL = "https://skyrocket.onrender.com/role_users/authcode";
export const API_VALIDATE_CODE_URL = "https://skyrocket.onrender.com/role_users/validation";
export const API_LOGIN_PASSWORD_URL = "https://skyrocket.onrender.com/role_users/login";
export const GOOGLE_AUTH_URL = "https://skyrocket.onrender.com/google";
export const GIT_AUTH_URL = "https://skyrocket.onrender.com/git";
export const LOGIN_PAGE_URL = "https://skyrocket.onrender.com/login.html";

// --- Registration Endpoints ---
export const API_IP_URL = "https://skyrocket.onrender.com/role_users/ip";
export const API_SIGNUP_URL = "/role_users/signup";
export const API_CUSTOMERS_URL = "/role_users/customers";
export const API_USER_SEARCH_URL = "role_users/users/search";
export const API_EMAIL_CHECK_URL = "role_users/email";

// --- Search Form Endpoints & Constants ---
export const API_ACTIVATION_URL = "activation";
export const API_FLIGHTS_URL = "role_users/flights";
export const API_FLIGHTS_SEARCH_URL = 'role_users/flights/search'; 
export const API_ORIGIN_COUNTRIES_URL = 'role_users/countries/origins'; 
export const API_DESTINATIONS_URL = 'role_users/countries/destinations'; 
export const DB_NAME = 'FlightDB';
export const DB_VERSION = 1;
export const FLIGHT_STORE_NAME = 'flights';

export const API_PASSENGERS_URL = 'role_users/passengers'; // ליצירת נוסע חדש
export const API_CHAIRS_URL = 'role_users/chairs';         // לשמירת כיסא (POST) ולטעינת כיסאות תפוסים (GET)
export const API_TICKETS_URL = 'role_users/tickets';