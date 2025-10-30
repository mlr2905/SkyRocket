// File: searchService.js
import * as C from '../utils/constants.js';

/**
 * Checks login status against the server.
 */
export async function checkActivationStatus() {
    try {
        const response = await fetch(C.API_ACTIVATION_URL);
        return response.status;
    } catch (error) {
        console.error('Problem executing activation check:', error);
        return 500;
    }
}

/**
 * Fetches the list of unique origin countries from the server.
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export async function fetchOriginCountries() {
    console.log("Fetching origin countries from:", C.API_ORIGIN_COUNTRIES_URL);
    try {
        const response = await fetch(C.API_ORIGIN_COUNTRIES_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        localStorage.setItem('uniqueCountries', JSON.stringify(data));
        console.log("Stored unique countries:", data);
        return data;
    } catch (error) {
        console.error("Error fetching origin countries:", error);
        return [];
    }
}

/**
 * Fetches possible destinations from a specific origin ID.
 * @param {number} originId
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export async function fetchDestinations(originId) {
    if (!originId) return [];
    const url = `${C.API_DESTINATIONS_URL}?origin_id=${originId}`;
    console.log("Fetching destinations from:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching destinations for origin ${originId}:`, error);
        return [];
    }
}

/**
 * Searches for flights directly from the server based on filters.
 * @param {object} filters
 * @returns {Promise<Array<Object>>}
 */
export async function searchFlights(filters) {
    const url = new URL(C.API_FLIGHTS_SEARCH_URL, window.location.origin);
    url.searchParams.append('origin_country_id', filters.origin_id);
    url.searchParams.append('destination_country_id', filters.destination_id);
    if (filters.date) {
        url.searchParams.append('date', filters.date);
    }
    console.log("Searching flights from server:", url.toString());
    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error searching flights:", error);
        return [];
    }
}

/**
 * Fetches the list of taken seats for a specific flight.
 * @param {number} flightId
 * @returns {Promise<Array<{char_id: number}>>} Expects an array of objects with the numeric seat ID.
 */
export async function getTakenSeats(flightId) {
    // Uses the existing C.API_CHAIRS_URL, assumes the GET /chairs/:id endpoint works
    const url = `${C.API_CHAIRS_URL}/${flightId}`;
    console.log("Fetching taken seats from:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Expects response like [{ char_id: 1 }, { char_id: 15 }, ...]
        return await response.json();
    } catch (error) {
        console.error(`Error fetching taken seats for flight ${flightId}:`, error);
        return [];
    }
}
