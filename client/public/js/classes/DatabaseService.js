// File: DatabaseService.js
import * as C from '../utils/constants.js';

export class DatabaseService {
    #db = null;

    /**
     * Opens the database and handles upgrades.
     * @returns {Promise<IDBDatabase>}
     */
    async #openDB() {
        if (this.#db) return this.#db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(C.DB_NAME, C.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(C.FLIGHT_STORE_NAME)) {
                    db.createObjectStore(C.FLIGHT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve(this.#db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Clears the store and inserts new data.
     * @param {Array<Object>} flightsData
     * @returns {Promise<void>}
     */
    async clearAndStoreFlights(flightsData) {
        const db = await this.#openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(C.FLIGHT_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(C.FLIGHT_STORE_NAME);

            const clearRequest = store.clear(); // Clear old data

            clearRequest.onsuccess = () => {
                // Add new data only after clearing is successful
                let count = 0;
                flightsData.forEach(flight => {
                    const addRequest = store.add(flight);
                    addRequest.onsuccess = () => {
                        count++;
                        if (count === flightsData.length) {
                            // This check might be redundant if transaction.oncomplete works reliably
                        }
                    };
                    addRequest.onerror = (event) => {
                         console.error('Error adding flight to store:', event.target.error);
                         // Don't reject immediately, try adding others
                    };
                });
            };
             clearRequest.onerror = (event) => {
                 console.error('Error clearing store:', event.target.error);
                 reject(event.target.error); // Reject if clearing fails
                 return; // Stop processing
            };


            transaction.oncomplete = () => {
                console.log('Data stored successfully in IndexedDB');
                resolve();
            };

            transaction.onerror = (event) => {
                // This might catch errors not caught by individual add requests
                console.error('Transaction error during storage:', event.target.error);
                reject(event.target.error);
            };
        });
    }


    /**
     * Retrieves all flights from the DB.
     * @returns {Promise<Array<Object>>}
     */
    async getAllFlights() {
        const db = await this.#openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(C.FLIGHT_STORE_NAME, 'readonly');
            const store = transaction.objectStore(C.FLIGHT_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('Request error getting all flights:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Searches flights by origin and destination.
     * @param {string} origin
     * @param {string} destination
     * @returns {Promise<Array<Object>>}
     */
    async getFilteredFlights(origin, destination) {
        const db = await this.#openDB();
        // Ensure case-insensitivity *before* the loop
        const originLower = origin.toLowerCase();
        const destLower = destination.toLowerCase();
        const results = [];

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(C.FLIGHT_STORE_NAME, 'readonly');
            const store = transaction.objectStore(C.FLIGHT_STORE_NAME);
            const request = store.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const flight = cursor.value;
                    // Check properties safely
                    const flightOrigin = flight.origin_country_name ? flight.origin_country_name.toLowerCase() : '';
                    const flightDest = flight.destination_country_name ? flight.destination_country_name.toLowerCase() : '';

                    if (flightOrigin === originLower && flightDest === destLower) {
                        results.push(flight);
                    }
                    cursor.continue();
                } else {
                    // Cursor finished
                    resolve(results);
                }
            };

            request.onerror = (event) => {
                console.error('Cursor error during filtering:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}