// File: SearchController.js
import * as C from '../utils/constants.js';
import * as SearchService from '../services/searchService.js';
import { SearchUIHandler } from './SearchUIHandler.js';

export class SearchController {
    #elements = {};
    #state = {
        currentNumber: 1,
        selectedOutboundFlightID: null,
        selectedReturnFlightID: null,
        allFlightsCache: [],
        uniqueCountriesCache: []
    };
    #ui;

    constructor() {
        this.#selectDOMElements();
        // Pass the collected elements to the UI Handler
        this.#ui = new SearchUIHandler(this.#elements);
        this.#attachEventListeners();
        this.#initializePage();
    }

    #selectDOMElements() {
        // Consolidate all element selections here
        this.#elements = {
            logoutButton: document.getElementById('logout-button'),
            loginButton: document.getElementById('login-button'),
            // Selecting the specific form-group for search might be better than the first one
            searchFormGroup: document.querySelector('.search-form-group'), // Added selector
            formRow: document.querySelector('.search-form-group .form-row'), // Adjusted selector
            flightContainer: document.querySelector('.main-container'),
            fromInput: document.getElementById('from'),
            toInput: document.getElementById('to'),
            dateRangeInput: document.getElementById('daterange'),
            numberElement: document.getElementById('number'),
            subtractButton: document.getElementById('button-subtract'),
            addButton: document.getElementById('button-add'),
            fromList: document.getElementById('from-list'),
            toList: document.getElementById('to-list'),
            loadingIcon: document.getElementById('loading-icon'),
            searchButton: document.getElementById('search'),
            outboundContainer: document.getElementById('flights-container'),
            returnContainer: document.getElementById('flights-container2'),
            outboundSection: document.getElementById('outbound'),
            returnSection: document.getElementById('return')
        };
    }

    async #initializePage() {
        this.#ui.showLoading(true);
        this.#ui.updateInputDisabledState(); // Ensure inputs start disabled correctly
        this.#ui.toggleSearchView(false); // Start by showing the search form

        // Check login status
        try {
            const status = await SearchService.checkActivationStatus();
            this.#ui.updateLoginStatus(status === 200);
        } catch (error) {
             console.error("Failed to check activation status:", error);
             this.#ui.updateLoginStatus(false); // Assume logged out on error
        }


        // Load initial flight data and countries
        try {
            await SearchService.fetchAndStoreFlights();
            this.#state.allFlightsCache = await SearchService.getAllFlightsFromDB();
            this.#state.uniqueCountriesCache = SearchService.getUniqueCountries();
             console.log("Initialization complete. Countries:", this.#state.uniqueCountriesCache.length, "Flights:", this.#state.allFlightsCache.length);
        } catch (error) {
            console.error("Failed to initialize flight data:", error);
            // Optionally show an error message to the user
        }

        // Initialize daterangepicker
        if (typeof $ === 'function' && typeof $.fn.daterangepicker === 'function') {
             try {
                $(this.#elements.dateRangeInput).daterangepicker({ opens: 'left' });
            } catch(e) {
                 console.error("Failed to initialize daterangepicker:", e);
            }
        } else {
            console.error('jQuery or daterangepicker plugin not loaded');
        }

        this.#ui.showLoading(false);
    }


    #attachEventListeners() {
        // Logout Button
        this.#elements.logoutButton?.addEventListener('click', this.#handleLogout);

        // Passenger Count Buttons
        this.#elements.subtractButton?.addEventListener('click', (e) => this.#handlePassengerChange(e, 'subtract'));
        this.#elements.addButton?.addEventListener('click', (e) => this.#handlePassengerChange(e, 'add'));

        // Search Button
        this.#elements.searchButton?.addEventListener('click', this.#handleSearch); // Use bound method

        // Form Input Fields (Autocomplete and State Update)
        this.#elements.fromInput?.addEventListener('input', (e) => this.#handleFromInput(e.target.value));
        this.#elements.fromInput?.addEventListener('focus', this.#handleFromFocus);
        // Close autocomplete when clicking outside
         document.addEventListener('click', (e) => {
             if (!this.#elements.fromInput?.contains(e.target) && !this.#elements.fromList?.contains(e.target)) {
                 this.#ui.clearAutocomplete(this.#elements.fromList);
            }
             if (!this.#elements.toInput?.contains(e.target) && !this.#elements.toList?.contains(e.target)) {
                 this.#ui.clearAutocomplete(this.#elements.toList);
            }
        });


        this.#elements.toInput?.addEventListener('input', (e) => this.#handleToInput(e.target.value));
        this.#elements.toInput?.addEventListener('focus', this.#handleToFocus);
    }

    // --- Event Handlers ---

    #handleLogout = () => { // Using arrow function for auto-binding
        alert("You have been logged out!");
        // TODO: Add actual logout logic (e.g., clear tokens, redirect)
         this.#ui.updateLoginStatus(false);
    }

    #handlePassengerChange = (event, action) => { // Using arrow function
        event.preventDefault();
        if (action === 'add') {
            this.#state.currentNumber++;
        } else if (action === 'subtract' && this.#state.currentNumber > 1) {
            this.#state.currentNumber--;
        }
        this.#ui.updatePassengerCount(this.#state.currentNumber);
    }

    // --- Autocomplete Logic ---
    #handleFromInput = (query) => { // Using arrow function
        this.#ui.updateInputDisabledState(); // Update disabled states based on input
        const filteredCountries = this.#state.uniqueCountriesCache.filter(country =>
             country && country.toLowerCase().includes(query.toLowerCase()) // Add safety check for country
        );
        this.#ui.renderAutocompleteList(this.#elements.fromList, filteredCountries, this.#handleAutocompleteSelectFrom);
    }

     #handleAutocompleteSelectFrom = (selected) => { // Using arrow function
         if (this.#elements.fromInput) {
             this.#elements.fromInput.value = selected;
        }
         this.#ui.updateInputDisabledState();
         this.#ui.clearAutocomplete(this.#elements.fromList); // Clear list after selection
         // Trigger focus on 'to' input maybe? Or update 'to' list?
         this.#handleToFocus(); // Show relevant destinations immediately
    }


    #handleFromFocus = () => { // Using arrow function
        // Show all unique countries on focus
        this.#ui.renderAutocompleteList(this.#elements.fromList, this.#state.uniqueCountriesCache, this.#handleAutocompleteSelectFrom);
    }


     #handleToInput = (query) => { // Using arrow function
         this.#ui.updateInputDisabledState();
         const originCountry = this.#elements.fromInput?.value;
         if (!originCountry) return; // Don't filter if origin isn't set

        // Filter destinations based on selected origin AND the current query in the 'to' input
         const destinations = this.#state.allFlightsCache
            .filter(flight => flight.origin_country_name === originCountry)
            .map(flight => flight.destination_country_name)
            .filter(dest => dest && dest.toLowerCase().includes(query.toLowerCase())); // Add safety check and query filter

         this.#ui.renderAutocompleteList(this.#elements.toList, destinations, this.#handleAutocompleteSelectTo);
    }

     #handleAutocompleteSelectTo = (selected) => { // Using arrow function
         if (this.#elements.toInput) {
             this.#elements.toInput.value = selected;
        }
         this.#ui.updateInputDisabledState();
         this.#ui.clearAutocomplete(this.#elements.toList); // Clear list after selection
    }

    #handleToFocus = () => { // Using arrow function
        const originCountry = this.#elements.fromInput?.value;
        if (!originCountry) {
            this.#ui.clearAutocomplete(this.#elements.toList); // Clear if no origin selected
            return;
        }

        // Show all possible destinations from the selected origin
        const destinations = this.#state.allFlightsCache
            .filter(flight => flight.origin_country_name === originCountry)
            .map(flight => flight.destination_country_name)
            .filter(Boolean); // Filter out any undefined/null destinations

        this.#ui.renderAutocompleteList(this.#elements.toList, destinations, this.#handleAutocompleteSelectTo);
    }

    // --- Search and Results Logic ---
    #handleSearch = async () => { // Using arrow function
         console.log("Search button clicked");
         this.#ui.toggleSearchView(true); // Show results view
         this.#ui.showLoading(true);

        const from = this.#elements.fromInput?.value;
        const to = this.#elements.toInput?.value;

        if (!from || !to) {
            console.error("Origin or destination not selected");
            this.#ui.showLoading(false);
            // Optionally show user message
            return;
        }

        try {
            // Fetch flights (should be fast from IndexedDB)
            const outboundFlights = await SearchService.getOutboundFlights(from, to);
            const returnFlights = await SearchService.getReturnFlights(from, to);
             console.log("Outbound flights found:", outboundFlights.length);
             console.log("Return flights found:", returnFlights.length);


            // Render flight cards using the UI handler
            this.#ui.renderFlightCards(
                this.#elements.outboundContainer,
                outboundFlights,
                this.#handleFlightSelect // Pass the bound method
            );

            this.#ui.renderFlightCards(
                this.#elements.returnContainer,
                returnFlights,
                 (flight, card) => this.#handleFlightSelect(flight, card, 'return') // Use wrapper for return type
            );

             // Reset selections and ensure return section is hidden initially
             this.#state.selectedOutboundFlightID = null;
             this.#state.selectedReturnFlightID = null;
             this.#ui.selectedOutboundCard = null;
             this.#ui.selectedReturnCard = null;
             if(this.#elements.outboundSection) this.#elements.outboundSection.style.display = 'block';
             if(this.#elements.returnSection) this.#elements.returnSection.style.display = 'none';


        } catch (error) {
            console.error("Error during flight search:", error);
            // Optionally display an error message in the UI
        } finally {
            this.#ui.showLoading(false);
        }
    }


     #handleFlightSelect = (flight, card, type = 'outbound') => { // Added default type
         console.log(`${type} flight selected: ID ${flight.id}`);

         this.#ui.updateSelectedCardVisuals(card, type); // Update visuals first

        if (type === 'outbound') {
            this.#state.selectedOutboundFlightID = flight.id;
            this.#ui.showReturnFlightsSection(); // Tell UI handler to show the return section
        } else {
            this.#state.selectedReturnFlightID = flight.id;
            // Both flights selected, proceed to next step (e.g., summary, booking)
            alert(`Selection Complete!\nOutbound Flight ID: ${this.#state.selectedOutboundFlightID}\nReturn Flight ID: ${this.#state.selectedReturnFlightID}`);
            // TODO: Implement next step logic here
        }
    }
}