// File: searchService.js
import * as C from '../utils/constants.js';
import { DatabaseService } from '../classes/DatabaseService.js';

/**
 * Checks login status against the server.
 */
export async function checkActivationStatus() {
    try {
        const response = await fetch(C.API_ACTIVATION_URL);
        return response.status; // e.g., 200, 404, 500
    } catch (error) {
        console.error('Problem executing activation check:', error);
        return 500; // Assume error if fetch fails
    }
}

/**
 * Fetches flights from the server and stores them in IndexedDB.
 * Returns the list of unique origin countries.
 * @returns {Promise<Array<string> | undefined>}
 */
export async function fetchAndStoreFlights() {
    console.log("Attempting to fetch flights from:", C.API_FLIGHTS_URL);
    try {
        const response = await fetch(C.API_FLIGHTS_URL);
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched flights data:", data);


        if (!Array.isArray(data)) {
             console.error("Fetched data is not an array:", data);
             throw new Error("Invalid data format received from server.");
        }


        const dbService = new DatabaseService();
        await dbService.clearAndStoreFlights(data);

        // Store unique countries in localStorage
        const countrySet = new Set(data.map(flight => flight.origin_country_name).filter(Boolean)); // Filter out undefined/null
        const uniqueCountries = Array.from(countrySet);
        localStorage.setItem('uniqueCountries', JSON.stringify(uniqueCountries));
        console.log("Stored unique countries:", uniqueCountries);
        
        return uniqueCountries;
    } catch (error) {
        console.error("Error fetching or storing flight data:", error);
        // Consider returning an empty array or undefined, or re-throwing
        return undefined;
    }
}

/**
 * Retrieves unique countries from localStorage.
 * @returns {Array<string>}
 */
export function getUniqueCountries() {
    const countries = localStorage.getItem('uniqueCountries');
    return countries ? JSON.parse(countries) : [];
}

/**
 * Retrieves all flights from the local database.
 * @returns {Promise<Array<Object>>}
 */
export async function getAllFlightsFromDB() {
    const dbService = new DatabaseService();
    return dbService.getAllFlights();
}

/**
 * Searches for outbound flights in the local database.
 * @param {string} from
 * @param {string} to
 * @returns {Promise<Array<Object>>}
 */
export async function getOutboundFlights(from, to) {
    const dbService = new DatabaseService();
    return dbService.getFilteredFlights(from, to);
}

/**
 * Searches for return flights in the local database.
 * @param {string} from - The original departure country
 * @param {string} to - The original destination country
 * @returns {Promise<Array<Object>>}
 */
export async function getReturnFlights(from, to) {
    const dbService = new DatabaseService();
    // Note the reversed order for return flights
    return dbService.getFilteredFlights(to, from);
}