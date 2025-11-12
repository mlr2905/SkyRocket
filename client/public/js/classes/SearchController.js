// File: SearchController.js
import * as C from '../utils/constants.js';
import * as SearchService from '../services/searchService.js';
import { SearchUIHandler } from './SearchUIHandler.js';
import { PLANE_LAYOUTS } from '../planeLayouts.js';

export class SearchController {
    #elements = {};
    #state = {
        currentNumber: 1,
        tripType: 'round-trip',
        selectedOutboundFlight: null,
        selectedReturnFlight: null,
        selectedOrigin: { id: null, name: '' },
        selectedDestination: { id: null, name: '' },
        uniqueCountriesCache: [],
        destinationsCache: []
    };
    #ui;

    constructor() {
        this.#selectDOMElements();
        this.#ui = new SearchUIHandler(this.#elements);
        this.#attachEventListeners();
        this.#initializePage();
    }

    #selectDOMElements() {
        this.#elements = {

            logoutButton: document.getElementById('logout-button'),
            loginButton: document.getElementById('login-button'),
            signupButton: document.getElementById('signup-button'),
            deleteAccountLink: document.getElementById('delete-account-link'),
            personalAreaDropdown: document.getElementById('personal-area-dropdown'),
            searchFormGroup: document.getElementById('search-form-group'),
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
            returnSection: document.getElementById('return'),
            roundTripRadio: document.getElementById('trip-type-roundtrip'),
            oneWayRadio: document.getElementById('trip-type-oneway'),
            mainFlightContainer: document.querySelector('.main-container'),
            passengerDetailsSection: document.getElementById('passenger-details-section'),
            passengerFormsContainer: document.getElementById('passenger-forms-container'),
            confirmBookingButton: document.getElementById('confirm-booking-btn'),
            backToFlightsButton: document.getElementById('back-to-flights-btn'),
            seatMapModal: document.getElementById('seat-map-modal'),
            seatMapGrid: document.getElementById('seat-map-grid'),
            seatMapTitle: document.getElementById('seat-map-title'),
            confirmSeatButton: document.getElementById('confirm-seat-btn')
        };
    }

    async #initializePage() {
        this.#ui.showLoading(true);
        this.#ui.updateInputDisabledState();
        this.#ui.toggleSearchView(false);
        this.#ui.togglePassengerView(false);

        try {
            const status = await SearchService.checkActivationStatus();
            this.#ui.updateLoginStatus(status === 200);
        } catch (error) {
            console.error("Failed to check activation status:", error);
            this.#ui.updateLoginStatus(false);
        }

        try {
            this.#state.uniqueCountriesCache = await SearchService.fetchOriginCountries();
            console.log("Initialization complete. Countries loaded:", this.#state.uniqueCountriesCache.length);
        } catch (error) {
            console.error("Failed to initialize origin countries:", error);
        }

        if (typeof $ === 'function' && typeof $.fn.daterangepicker === 'function') {
            try {
                $(this.#elements.dateRangeInput).daterangepicker({
                    opens: 'left', singleDatePicker: true, autoUpdateInput: false,
                    locale: { format: "YYYY-MM-DD", cancelLabel: 'Clear' }
                });
                $(this.#elements.dateRangeInput).on('apply.daterangepicker', function (ev, picker) { $(this).val(picker.startDate.format('YYYY-MM-DD')); });
                $(this.#elements.dateRangeInput).on('cancel.daterangepicker', function (ev, picker) { $(this).val(''); });
            } catch (e) { console.error("Failed to initialize daterangepicker:", e); }
        } else { console.error('jQuery or daterangepicker plugin not loaded'); }

        this.#ui.showLoading(false);
    }

    #attachEventListeners() {
        this.#elements.logoutButton?.addEventListener('click', this.#handleLogout);
        this.#elements.loginButton?.addEventListener('click', () => { window.location.href = '/login.html'; });
        this.#elements.signupButton?.addEventListener('click', () => { window.location.href = '/registration.html'; });
        this.#elements.deleteAccountLink?.addEventListener('click', this.#handleDeleteAccount);
        this.#elements.subtractButton?.addEventListener('click', (e) => this.#handlePassengerChange(e, 'subtract'));
        this.#elements.addButton?.addEventListener('click', (e) => this.#handlePassengerChange(e, 'add'));
        this.#elements.searchButton?.addEventListener('click', this.#handleSearch);
        this.#elements.fromInput?.addEventListener('input', (e) => this.#handleFromInput(e.target.value));
        this.#elements.fromInput?.addEventListener('focus', this.#handleFromFocus);
        document.addEventListener('click', (e) => {
            if (!this.#elements.fromInput?.contains(e.target) && !this.#elements.fromList?.contains(e.target)) this.#ui.clearAutocomplete(this.#elements.fromList);
            if (!this.#elements.toInput?.contains(e.target) && !this.#elements.toList?.contains(e.target)) this.#ui.clearAutocomplete(this.#elements.toList);
        });
        this.#elements.toInput?.addEventListener('input', (e) => this.#handleToInput(e.target.value));
        this.#elements.toInput?.addEventListener('focus', this.#handleToFocus);
        this.#elements.roundTripRadio?.addEventListener('change', this.#handleTripTypeChange);
        this.#elements.oneWayRadio?.addEventListener('change', this.#handleTripTypeChange);
        this.#elements.backToFlightsButton?.addEventListener('click', this.#handleBackToFlights);
        this.#elements.confirmBookingButton?.addEventListener('click', this.#handleConfirmBooking);
        this.#elements.passengerFormsContainer?.addEventListener('click', this.#handleSelectSeatClick);
    }

    #handleLogout = () => { alert("You have been logged out!"); this.#ui.updateLoginStatus(false); }

    #handleDeleteAccount = async (event) => {
        event.preventDefault();

        const isConfirmed = confirm("Are you sure you want to delete the account?\nThis action is final and cannot be undone.");

        if (!isConfirmed) {
            return;
        }

        this.#ui.showLoading(true);

        try {
            const response = await fetch('/role_users/me', {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error deleting account');
            }

            alert('Account successfully deleted. You are being redirected to the home page.');
            window.location.href = '/';

        } catch (error) {

            console.error('Delete account failed:', error.message);

            alert('Account deletion failed. Please contact customer service.');


        } finally {
            this.#ui.showLoading(false);
        }
    }
    #handlePassengerChange = (e, action) => { e.preventDefault(); if (action === 'add') this.#state.currentNumber++; else if (action === 'subtract' && this.#state.currentNumber > 1) this.#state.currentNumber--; this.#ui.updatePassengerCount(this.#state.currentNumber); }
    #handleTripTypeChange = (e) => { if (e.target.checked) { this.#state.tripType = e.target.value; console.log("Trip type set to:", this.#state.tripType); } }

    // --- Autocomplete ---
    #handleFromInput = (q) => { this.#ui.updateInputDisabledState(); const f = this.#state.uniqueCountriesCache.filter(c => c.name?.toLowerCase().includes(q.toLowerCase())); this.#ui.renderAutocompleteList(this.#elements.fromList, f.map(c => c.name), this.#handleAutocompleteSelectFrom); }
    #handleAutocompleteSelectFrom = async (n) => { if (this.#elements.fromInput) this.#elements.fromInput.value = n; const s = this.#state.uniqueCountriesCache.find(c => c.name === n); this.#state.selectedOrigin = s || { id: null, name: n }; this.#state.selectedDestination = { id: null, name: '' }; if (this.#elements.toInput) this.#elements.toInput.value = ''; this.#state.destinationsCache = []; this.#ui.updateInputDisabledState(); this.#ui.clearAutocomplete(this.#elements.fromList); await this.#handleToFocus(); this.#elements.toInput?.focus(); }
    #handleFromFocus = () => { this.#ui.renderAutocompleteList(this.#elements.fromList, this.#state.uniqueCountriesCache.map(c => c.name), this.#handleAutocompleteSelectFrom); }
    #handleToInput = (q) => { this.#ui.updateInputDisabledState(); if (!this.#state.selectedOrigin.id) return; const f = this.#state.destinationsCache.filter(d => d.name?.toLowerCase().includes(q.toLowerCase())); this.#ui.renderAutocompleteList(this.#elements.toList, f.map(c => c.name), this.#handleAutocompleteSelectTo); }
    #handleAutocompleteSelectTo = (n) => { if (this.#elements.toInput) this.#elements.toInput.value = n; const s = this.#state.destinationsCache.find(c => c.name === n); this.#state.selectedDestination = s || { id: null, name: n }; this.#ui.updateInputDisabledState(); this.#ui.clearAutocomplete(this.#elements.toList); }
    #handleToFocus = async () => { const oId = this.#state.selectedOrigin.id; if (!oId) { this.#ui.clearAutocomplete(this.#elements.toList); return; } if (this.#state.destinationsCache.length === 0) { this.#ui.showLoading(true); this.#state.destinationsCache = await SearchService.fetchDestinations(oId); this.#ui.showLoading(false); } this.#ui.renderAutocompleteList(this.#elements.toList, this.#state.destinationsCache.map(c => c.name), this.#handleAutocompleteSelectTo); }

    // --- Search ---
    #handleSearch = async () => {
        console.log("Search button clicked");
        this.#ui.toggleSearchView(true); this.#ui.togglePassengerView(false); this.#ui.showLoading(true);
        const originId = this.#state.selectedOrigin.id; const destId = this.#state.selectedDestination.id;
        const date = this.#elements.dateRangeInput?.value || null; const tripType = this.#state.tripType;
        if (!originId || !destId) { alert("Please select origin and destination."); this.#ui.showLoading(false); this.#ui.toggleSearchView(false); return; }
        try {
            let outbound = []; let returns = [];
            const outFilters = { origin_id: originId, destination_id: destId, date: date };
            if (tripType === 'round-trip') { const retFilters = { origin_id: destId, destination_id: originId, date: date };[outbound, returns] = await Promise.all([SearchService.searchFlights(outFilters), SearchService.searchFlights(retFilters)]); }
            else { outbound = await SearchService.searchFlights(outFilters); }
            console.log("Outbound flights:", outbound.length, "Return flights:", returns.length);
            this.#ui.renderFlightCards(this.#elements.outboundContainer, outbound, this.#handleFlightSelect);
            this.#ui.renderFlightCards(this.#elements.returnContainer, returns, (f, c) => this.#handleFlightSelect(f, c, 'return'));
            this.#state.selectedOutboundFlight = null; this.#state.selectedReturnFlight = null; this.#ui.selectedOutboundCard = null; this.#ui.selectedReturnCard = null;
            if (this.#elements.outboundSection) this.#elements.outboundSection.style.display = 'block'; if (this.#elements.returnSection) this.#elements.returnSection.style.display = 'none';
        } catch (error) { console.error("Flight search error:", error); } finally { this.#ui.showLoading(false); }
    }

    // --- Passenger/Seat Logic ---
    #handleFlightSelect = (flight, card, type = 'outbound') => {
        console.log(`${type} flight selected: ID ${flight.id}, Plane ID: ${flight.plane_id}`);
        this.#ui.updateSelectedCardVisuals(card, type);
        if (type === 'outbound') {
            this.#state.selectedOutboundFlight = flight;
            if (this.#state.tripType === 'round-trip') this.#ui.showReturnFlightsSection();
            else this.#showPassengerDetailsForm();
        } else {
            this.#state.selectedReturnFlight = flight;
            this.#showPassengerDetailsForm();
        }
    }

    #showPassengerDetailsForm = () => { console.log("Showing passenger details form for", this.#state.currentNumber); this.#ui.togglePassengerView(true); this.#ui.renderPassengerForms(this.#state.currentNumber, this.#state.tripType); }
    #handleBackToFlights = () => { this.#ui.togglePassengerView(false); }

    #handleSelectSeatClick = (e) => {
        const target = e.target;
        if (target.classList.contains('select-seat-btn')) {
            const pIndex = target.dataset.passengerIndex; const fType = target.dataset.flightType || 'outbound';
            const flight = (fType === 'outbound') ? this.#state.selectedOutboundFlight : this.#state.selectedReturnFlight;
            if (!flight) { alert("Error: Flight not selected"); return; }
            console.log(`Opening seat map for P${pIndex}, Type: ${fType}, Flight: ${flight.id}`);
            this.#openSeatMap(pIndex, fType, flight);
        }
    }

    #openSeatMap = async (passengerIndex, flightType, flight) => {
        this.#ui.showLoading(true);
        this.#elements.seatMapTitle.textContent = `Select Seat (Passenger ${passengerIndex}, ${flightType === 'outbound' ? 'Outbound' : 'Return'})`;
        this.#elements.seatMapGrid.innerHTML = 'Loading seat map...';

        const planeId = flight.plane_id;
        const flightIdForTaken = flight.id;

        const seatLayout = PLANE_LAYOUTS[planeId];
        if (!seatLayout) { alert(`Error: Seat layout not found for plane ID ${planeId}`); this.#elements.seatMapGrid.innerHTML = 'Error loading map layout.'; this.#ui.showLoading(false); return; }

        let allAssignments = [];
        try {
            allAssignments = await SearchService.getTakenSeats(flightIdForTaken);
        } catch (error) { console.error("Error loading seat assignments:", error); this.#elements.seatMapGrid.innerHTML = 'Error loading seat assignments.'; this.#ui.showLoading(false); return; }

        const takenSeatIds = new Set(allAssignments.filter(a => a.passenger_id !== null).map(a => a.char_id));
        console.log("Taken Seat IDs Set (Filtered):", takenSeatIds);

        this.#elements.seatMapGrid.innerHTML = '';

        seatLayout.forEach(seat => {
            const seatDiv = document.createElement('div');
            seatDiv.className = 'seat available';
            seatDiv.textContent = seat.name;
            seatDiv.dataset.seatId = seat.id;
            if (takenSeatIds.has(seat.id)) { seatDiv.classList.replace('available', 'taken'); }
            else { seatDiv.addEventListener('click', () => { this.#elements.seatMapGrid.querySelector('.seat.selected')?.classList.remove('selected'); seatDiv.classList.add('selected'); }); }
            this.#elements.seatMapGrid.appendChild(seatDiv);
        });

        this.#ui.showLoading(false);
        const modal = new bootstrap.Modal(this.#elements.seatMapModal);
        const newConfirmBtn = this.#elements.confirmSeatButton.cloneNode(true);
        this.#elements.confirmSeatButton.parentNode.replaceChild(newConfirmBtn, this.#elements.confirmSeatButton);
        this.#elements.confirmSeatButton = newConfirmBtn;

        this.#elements.confirmSeatButton.addEventListener('click', () => {
            const selected = this.#elements.seatMapGrid.querySelector('.seat.selected');
            if (selected) {
                const seatId = selected.dataset.seatId;
                const seatName = selected.textContent;
                console.log(`Seat ID ${seatId} (Name ${seatName}) confirmed for P${passengerIndex}, Type ${flightType}`);
                document.getElementById(`seat-selection-${flightType}-${passengerIndex}`).textContent = ` (${seatName})`;
                const form = document.querySelector(`.passenger-form[data-index="${passengerIndex}"]`);
                form.dataset[flightType === 'outbound' ? 'seatOutbound' : 'seatReturn'] = seatId;
                modal.hide();
            } else { alert("Please select a seat."); }
        });
        modal.show();
    }

    //
    #handleConfirmBooking = async () => {
        console.log("Confirming booking...");
        this.#ui.showLoading(true);
        const forms = this.#elements.passengerFormsContainer.querySelectorAll('.passenger-form');
        let dataToSubmit = [];

        for (const form of forms) {
            const idx = form.dataset.index;
            const data = {
                index: idx,
                first_name: form.querySelector('[name="first_name"]').value.trim(),
                last_name: form.querySelector('[name="last_name"]').value.trim(),
                passport_number: form.querySelector('[name="passport_number"]').value.trim(),
                date_of_birth: form.querySelector('[name="date_of_birth"]').value,
                seatOutbound: form.dataset.seatOutbound ? parseInt(form.dataset.seatOutbound, 10) : null,
                seatReturn: form.dataset.seatReturn ? parseInt(form.dataset.seatReturn, 10) : null
            };

            if (!data.first_name || !data.last_name || !data.passport_number || !data.date_of_birth || !data.seatOutbound) {
                alert(`Please fill in all details (including D.O.B. and outbound seat) for passenger ${idx}.`);
                this.#ui.showLoading(false);
                return;
            }
            if (this.#state.tripType === 'round-trip' && !data.seatReturn) {
                alert(`Please select a return seat for passenger ${idx}.`);
                this.#ui.showLoading(false);
                return;
            }
            dataToSubmit.push(data);
        }
        console.log("Data collected to submit (seat IDs are from 'seats' table):", dataToSubmit);

        try {

            for (const data of dataToSubmit) {
                // --- 1. Create Passenger ---
                const pRes = await fetch(C.API_PASSENGERS_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        passport_number: data.passport_number,
                        flight_id: this.#state.selectedOutboundFlight.id,
                        date_of_birth: data.date_of_birth,
                    })
                });
                const newPassenger = await pRes.json();
                if (!pRes.ok) throw new Error(`Passenger creation failed: ${newPassenger.error || 'Unknown error'}`);
                const passengerId = newPassenger.id;

                // --- 2. Assign Outbound Seat ---
                const outboundSeatId = data.seatOutbound;
                const cOutRes = await fetch(C.API_CHAIRS_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flight_id: this.#state.selectedOutboundFlight.id,
                        char_id: outboundSeatId,
                        passenger_id: passengerId
                    })
                });
                if (!cOutRes.ok) { const err = await cOutRes.json(); throw new Error(`Outbound seat assignment failed: ${err.error || cOutRes.statusText}`); }

                // --- 3. Assign Return Seat (if applicable) ---
                let returnSeatId = null;
                if (data.seatReturn) {
                    returnSeatId = data.seatReturn;
                    const cRetRes = await fetch(C.API_CHAIRS_URL, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            flight_id: this.#state.selectedReturnFlight.id,
                            char_id: returnSeatId,
                            passenger_id: passengerId
                        })
                    });
                    if (!cRetRes.ok) { const err = await cRetRes.json(); throw new Error(`Return seat assignment failed: ${err.error || cRetRes.statusText}`); }
                }
                // --- 4. Creating separate tickets ---

                // Creating a return ticket
                const tOutRes = await fetch(C.API_TICKETS_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flight_id: this.#state.selectedOutboundFlight.id,
                        passenger_id: passengerId,
                        chair_id: outboundSeatId
                    })
                });
                if (!tOutRes.ok) { const err = await tOutRes.json(); throw new Error(`Outbound ticket creation failed: ${err.error || tOutRes.statusText}`); }

                // Create a return ticket (if one exists)
                if (this.#state.tripType === 'round-trip' && returnSeatId) {
                    const tRetRes = await fetch(C.API_TICKETS_URL, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            flight_id: this.#state.selectedReturnFlight.id, 
                            passenger_id: passengerId,
                            chair_id: returnSeatId 
                        })
                    });
                    if (!tRetRes.ok) { const err = await tRetRes.json(); throw new Error(`Return ticket creation failed: ${err.error || tRetRes.statusText}`); }
                }
            }

            alert("Booking was successful!");
            window.location.href = '/my-tickets.html'; 

        } catch (error) {
            console.error("Booking failed:", error);
            alert(`Booking Error: ${error.message}`);
        } finally {
            this.#ui.showLoading(false);
        }
    }
}