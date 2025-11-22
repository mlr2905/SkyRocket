import * as C from '../utils/constants.js';
import * as SearchService from '../services/searchService.js';
import * as AuthService from '../services/authService.js';
import * as uiUtils from '../utils/uiUtils.js';

import { SearchUIHandler } from './SearchUIHandler.js';
import { PLANE_LAYOUTS } from '../utils/planeLayouts.js';
import { WebAuthnController } from './LoginWebAuthnController.js';

export class SearchController {
    _elements = {};
    _state = {};
    _ui;
    _webAuthn;
    _bound = {};
    _isActive = false;


    init() {
        this._isActive = true;

        this._state = {
            currentNumber: 1,
            tripType: 'round-trip',
            selectedOutboundFlight: null,
            selectedReturnFlight: null,
            selectedOrigin: { id: null, name: '' },
            selectedDestination: { id: null, name: '' },
            email: null,
            uniqueCountriesCache: [],
            destinationsCache: []
        };

        this._selectDOMElements();
        this._ui = new SearchUIHandler(this._elements);
        this._webAuthn = new WebAuthnController({
            biometricStatus: null,
            messageElement: this._elements.webAuthnMessage,
            emailInput: null
        });

        this._bindEventHandlers();
        this._attachEventListeners();
        this._initializePage();
    }

    destroy() {
        this._isActive = false;
        this._removeEventListeners();

        if (this._seatMapModalInstance) {
            this._seatMapModalInstance.dispose();
            this._seatMapModalInstance = null;
        }

        if (this._elements.dateRangeInput && $(this._elements.dateRangeInput).data('daterangepicker')) {
            $(this._elements.dateRangeInput).data('daterangepicker').remove();
        }

        this._elements = {};
        this._ui = null;
        this._webAuthn = null;
        this._bound = {};
    }

    _selectDOMElements() {
        this._elements = {
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
            confirmSeatButton: document.getElementById('confirm-seat-btn'),
            registerBiometricLink: document.getElementById('register-biometric-link'),
            webAuthnMessage: document.getElementById('webauthn-message-area')
        };
    }

    _bindEventHandlers() {
        this._bound.handleLogout = () => this._handleLogout();
        this._bound.goToLogin = () => this._goToPage(C.LOGIN_PAGE_URL);
        this._bound.goToRegister = () => this._goToPage(C.REGISTER_PAGE_URL);
        this._bound.handleDeleteAccount = (e) => this._handleDeleteAccount(e);
        this._bound.handlePassengerChangeSubtract = (e) => this._handlePassengerChange(e, 'subtract');
        this._bound.handlePassengerChangeAdd = (e) => this._handlePassengerChange(e, 'add');
        this._bound.handleSearch = () => this._handleSearch();
        this._bound.handleFromInput = (e) => this._handleFromInput(e.target.value);
        this._bound.handleFromFocus = () => this._handleFromFocus();
        this._bound.handleToInput = (e) => this._handleToInput(e.target.value);
        this._bound.handleToFocus = () => this._handleToFocus();
        this._bound.handleTripTypeChange = (e) => this._handleTripTypeChange(e);
        this._bound.handleBackToFlights = () => this._handleBackToFlights();
        this._bound.handleConfirmBooking = () => this._handleConfirmBooking();
        this._bound.handleSelectSeatClick = (e) => this._handleSelectSeatClick(e);
        this._bound.handleRegisterBiometricClick = (e) => this._handleRegisterBiometricClick(e);

        this._handleAutocompleteSelectFrom = this._handleAutocompleteSelectFrom.bind(this);
        this._handleAutocompleteSelectTo = this._handleAutocompleteSelectTo.bind(this);
        this._handleFlightSelectOutbound = (flight, card) => this._handleFlightSelect(flight, card, 'outbound');
        this._handleFlightSelectReturn = (flight, card) => this._handleFlightSelect(flight, card, 'return');

        this._bound.handleDocumentClick = (e) => {
            if (!this._isActive) return;
            if (!this._elements.fromInput?.contains(e.target) && !this._elements.fromList?.contains(e.target) && this._elements.fromList) {
                this._ui.clearAutocomplete(this._elements.fromList);
            }
            if (!this._elements.toInput?.contains(e.target) && !this._elements.toList?.contains(e.target) && this._elements.toList) {
                this._ui.clearAutocomplete(this._elements.toList);
            }
        };
    }

    _attachEventListeners() {
        document.getElementById('logout-button')?.addEventListener('click', this._bound.handleLogout);
        document.getElementById('login-button')?.addEventListener('click', this._bound.goToLogin);
        document.getElementById('signup-button')?.addEventListener('click', this._bound.goToRegister);
        document.getElementById('delete-account-link')?.addEventListener('click', this._bound.handleDeleteAccount);
        document.getElementById('register-biometric-link')?.addEventListener('click', this._bound.handleRegisterBiometricClick);

        this._elements.subtractButton?.addEventListener('click', this._bound.handlePassengerChangeSubtract);
        this._elements.addButton?.addEventListener('click', this._bound.handlePassengerChangeAdd);
        this._elements.searchButton?.addEventListener('click', this._bound.handleSearch);
        this._elements.fromInput?.addEventListener('input', this._bound.handleFromInput);
        this._elements.fromInput?.addEventListener('focus', this._bound.handleFromFocus);
        document.addEventListener('click', this._bound.handleDocumentClick);
        this._elements.toInput?.addEventListener('input', this._bound.handleToInput);
        this._elements.toInput?.addEventListener('focus', this._bound.handleToFocus);
        this._elements.roundTripRadio?.addEventListener('change', this._bound.handleTripTypeChange);
        this._elements.oneWayRadio?.addEventListener('change', this._bound.handleTripTypeChange);
        this._elements.backToFlightsButton?.addEventListener('click', this._bound.handleBackToFlights);
        this._elements.confirmBookingButton?.addEventListener('click', this._bound.handleConfirmBooking);
        this._elements.passengerFormsContainer?.addEventListener('click', this._bound.handleSelectSeatClick);

        this._ui.setAutocompleteCallbacks(this._handleAutocompleteSelectFrom, this._handleAutocompleteSelectTo);
        this._ui.setFlightSelectCallbacks(this._handleFlightSelectOutbound, this._handleFlightSelectReturn);
    }

    _removeEventListeners() {
        document.getElementById('logout-button')?.removeEventListener('click', this._bound.handleLogout);
        document.getElementById('login-button')?.removeEventListener('click', this._bound.goToLogin);
        document.getElementById('signup-button')?.removeEventListener('click', this._bound.goToRegister);
        document.getElementById('delete-account-link')?.removeEventListener('click', this._bound.handleDeleteAccount);
        document.getElementById('register-biometric-link')?.removeEventListener('click', this._bound.handleRegisterBiometricClick);

        this._elements.subtractButton?.removeEventListener('click', this._bound.handlePassengerChangeSubtract);
        this._elements.addButton?.removeEventListener('click', this._bound.handlePassengerChangeAdd);
        this._elements.searchButton?.removeEventListener('click', this._bound.handleSearch);
        this._elements.fromInput?.removeEventListener('input', this._bound.handleFromInput);
        this._elements.fromInput?.removeEventListener('focus', this._bound.handleFromFocus);
        document.removeEventListener('click', this._bound.handleDocumentClick);
        this._elements.toInput?.removeEventListener('input', this._bound.handleToInput);
        this._elements.toInput?.removeEventListener('focus', this._bound.handleToFocus);
        this._elements.roundTripRadio?.removeEventListener('change', this._bound.handleTripTypeChange);
        this._elements.oneWayRadio?.removeEventListener('change', this._bound.handleTripTypeChange);
        this._elements.backToFlightsButton?.removeEventListener('click', this._bound.handleBackToFlights);
        this._elements.confirmBookingButton?.removeEventListener('click', this._bound.handleConfirmBooking);
        this._elements.passengerFormsContainer?.removeEventListener('click', this._bound.handleSelectSeatClick);

        if (this._elements.confirmSeatButton && this._boundConfirmSeat) {
            this._elements.confirmSeatButton.removeEventListener('click', this._boundConfirmSeat);
            this._boundConfirmSeat = null;
        }
    }

    _goToPage(path) {
        history.pushState(null, null, path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    async _initializePage() {
        if (!this._isActive || !this._ui) return;

        this._ui.showLoading(true);
        this._ui.updateInputDisabledState();
        this._ui.toggleSearchView(false);
        this._ui.togglePassengerView(false);

        if (this._elements.dateRangeInput && $.fn.daterangepicker) {
            $(this._elements.dateRangeInput).daterangepicker({
                opens: 'left',
                autoUpdateInput: false,
                locale: { cancelLabel: 'Clear' }
            });
            $(this._elements.dateRangeInput).on('apply.daterangepicker', (ev, picker) => {
                $(this._elements.dateRangeInput).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
            });
            $(this._elements.dateRangeInput).on('cancel.daterangepicker', (ev, picker) => {
                $(this._elements.dateRangeInput).val('');
            });
        }

        let statusResult;

        try {
            const [status, countries, ipCountryData] = await Promise.all([
                SearchService.checkActivationStatus(),
                SearchService.fetchOriginCountries(),
                AuthService.getCountryCode()
            ]);

            if (!this._isActive) return;

            statusResult = status;
            this._updateGlobalAuthUI(statusResult.isLoggedIn, statusResult.email);

            if (statusResult.isLoggedIn && statusResult.email) {
                this._state.email = statusResult.email;
                localStorage.setItem('userEmail', statusResult.email);
            }

            this._state.uniqueCountriesCache = countries || [];

            let defaultCountrySet = false;
            if (ipCountryData && ipCountryData.name && ipCountryData.name !== "Unknown" && this._state.uniqueCountriesCache.length > 0) {
                const userCountryName = ipCountryData.name;
                const matchedCountry = this._state.uniqueCountriesCache.find(
                    c => c.name.toLowerCase() === userCountryName.toLowerCase()
                );
                if (matchedCountry) {
                    this._state.selectedOrigin = matchedCountry;
                    if (this._elements.fromInput) this._elements.fromInput.value = matchedCountry.name;
                    await this._handleToFocus();
                    defaultCountrySet = true;
                }
            }
            if (!defaultCountrySet && this._state.uniqueCountriesCache.length > 0) {
                const israelCountry = this._state.uniqueCountriesCache.find(
                    c => c.name.toLowerCase() === "israel"
                );
                if (israelCountry) {
                    this._state.selectedOrigin = israelCountry;
                    if (this._elements.fromInput) this._elements.fromInput.value = israelCountry.name;
                    await this._handleToFocus();
                }
            }

        } catch (error) {
            console.error("Failed to initialize page data:", error);
            if (this._isActive && !statusResult) {
                this._updateGlobalAuthUI(false);
            }
        } finally {
            if (this._isActive && this._ui) {
                this._ui.updateInputDisabledState();
                this._ui.showLoading(false);
            }
        }
    }

    _updateGlobalAuthUI(isLoggedIn, email = null) {
        const loginButton = document.getElementById('login-button');
        const signupButton = document.getElementById('signup-button');
        const logoutButton = document.getElementById('logout-button');
        const personalAreaDropdown = document.getElementById('personal-area-dropdown');

        if (isLoggedIn) {
            if (loginButton) loginButton.style.display = 'none';
            if (signupButton) signupButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            if (personalAreaDropdown) personalAreaDropdown.style.display = 'block';
            this._state.email = email;
        } else {
            if (loginButton) loginButton.style.display = 'block';
            if (signupButton) signupButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (personalAreaDropdown) personalAreaDropdown.style.display = 'none';
            this._state.email = null;
        }
    }

    async _handleLogout() {
        this._updateGlobalAuthUI(false);
        uiUtils.showCustomAlert('Logged Out', 'You have been logged out.', 'success');
    }

    async _handleDeleteAccount(event) {
        event.preventDefault();
        const result = await Swal.fire({
            title: 'Delete Account',
            text: "Are you sure? This action is final.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete'
        });

        if (!result.isConfirmed) return;

        this._ui.showLoading(true);
        try {
            await fetch(C.API_DELETE_URL, { method: 'DELETE', credentials: 'include' });
            uiUtils.showCustomAlert('Deleted', 'Account deleted.', 'success');
            this._updateGlobalAuthUI(false);
            this._goToPage('/');
        } catch (error) {
            uiUtils.showCustomAlert('Error', error.message, 'error');
        } finally {
            if (this._isActive) this._ui.showLoading(false);
        }
    }

    _handlePassengerChange(e, action) {
        e.preventDefault();
        if (action === 'add') this._state.currentNumber++;
        else if (action === 'subtract' && this._state.currentNumber > 1) this._state.currentNumber--;
        this._ui.updatePassengerCount(this._state.currentNumber);
    }

    _handleTripTypeChange(e) {
        if (e.target.checked) {
            this._state.tripType = e.target.value;
        }
    }

    _handleFromInput(q) {
        this._ui.updateInputDisabledState();
        const f = this._state.uniqueCountriesCache.filter(c => c.name?.toLowerCase().includes(q.toLowerCase()));
        this._ui.renderAutocompleteList(this._elements.fromList, f.map(c => c.name), this._handleAutocompleteSelectFrom);
    }

    async _handleAutocompleteSelectFrom(n) {
        if (this._elements.fromInput) this._elements.fromInput.value = n;
        const s = this._state.uniqueCountriesCache.find(c => c.name === n);
        this._state.selectedOrigin = s || { id: null, name: n };
        this._state.selectedDestination = { id: null, name: '' };
        if (this._elements.toInput) this._elements.toInput.value = '';
        this._state.destinationsCache = [];
        this._ui.updateInputDisabledState();
        this._ui.clearAutocomplete(this._elements.fromList);
        await this._handleToFocus();
        this._elements.toInput?.focus();
    }

    _handleFromFocus() {
        this._ui.renderAutocompleteList(this._elements.fromList, this._state.uniqueCountriesCache.map(c => c.name), this._handleAutocompleteSelectFrom);
    }

    _handleToInput(q) {
        this._ui.updateInputDisabledState();
        if (!this._state.selectedOrigin.id) return;
        const f = this._state.destinationsCache.filter(d => d.name?.toLowerCase().includes(q.toLowerCase()));
        this._ui.renderAutocompleteList(this._elements.toList, f.map(c => c.name), this._handleAutocompleteSelectTo);
    }

    _handleAutocompleteSelectTo(n) {
        if (this._elements.toInput) this._elements.toInput.value = n;
        const s = this._state.destinationsCache.find(c => c.name === n);
        this._state.selectedDestination = s || { id: null, name: n };
        this._ui.updateInputDisabledState();
        this._ui.clearAutocomplete(this._elements.toList);
    }

    async _handleToFocus() {
        if (!this._isActive) return;

        const oId = this._state.selectedOrigin.id;
        if (!oId) {
            if (this._elements.toList) this._ui.clearAutocomplete(this._elements.toList);
            return;
        }
        if (this._state.destinationsCache.length === 0) {
            this._ui.showLoading(true);
            this._state.destinationsCache = await SearchService.fetchDestinations(oId);

            if (!this._isActive) return;
            this._ui.showLoading(false);
        }
        this._ui.renderAutocompleteList(this._elements.toList, this._state.destinationsCache.map(c => c.name), this._handleAutocompleteSelectTo);
    }

    async _handleSearch() {
        this._ui.toggleSearchView(false);
        this._ui.togglePassengerView(false);
        this._ui.showLoading(true);

        const originId = this._state.selectedOrigin.id;
        const destId = this._state.selectedDestination.id;
        const date = this._elements.dateRangeInput?.value || null;
        const tripType = this._state.tripType;

        if (!originId || !destId) {
            uiUtils.showCustomAlert("Input Error", "Please select origin and destination.", "warning");
            this._ui.showLoading(false);
            this._ui.toggleSearchView(true);
            return;
        }

        try {
            let outbound = [];
            let returns = [];
            const outFilters = { origin_id: originId, destination_id: destId, date: date };

            if (tripType === 'round-trip') {
                const retFilters = { origin_id: destId, destination_id: originId, date: date };
                [outbound, returns] = await Promise.all([
                    SearchService.searchFlights(outFilters),
                    SearchService.searchFlights(retFilters)
                ]);
            } else {
                outbound = await SearchService.searchFlights(outFilters);
            }

            if (!this._isActive) return;

            this._ui.renderFlightCards(this._elements.outboundContainer, outbound, this._handleFlightSelectOutbound);
            this._ui.renderFlightCards(this._elements.returnContainer, returns, this._handleFlightSelectReturn);

            this._state.selectedOutboundFlight = null;
            this._state.selectedReturnFlight = null;
            this._ui.selectedOutboundCard = null;
            this._ui.selectedReturnCard = null;

            if (this._elements.outboundSection) this._elements.outboundSection.style.display = 'block';

            const showReturn = tripType === 'round-trip';
            if (this._elements.returnSection) this._elements.returnSection.style.display = showReturn ? 'block' : 'none';

            if (tripType === 'one-way') {
                this._ui.showReturnFlightsSection();
            }

        } catch (error) {
            console.error("Flight search error:", error);
            if (this._isActive) uiUtils.showCustomAlert("Search Error", "Could not fetch flight data.", "error");
        } finally {
            if (this._isActive) this._ui.showLoading(false);
        }
    }

    _handleFlightSelect(flight, card, type = 'outbound') {
        this._ui.updateSelectedCardVisuals(card, type);
        if (type === 'outbound') {
            this._state.selectedOutboundFlight = flight;
            if (this._state.tripType === 'round-trip') {
                this._ui.showReturnFlightsSection();
            } else {
                this._showPassengerDetailsForm();
            }
        } else {
            this._state.selectedReturnFlight = flight;
            this._showPassengerDetailsForm();
        }
    }

    _showPassengerDetailsForm() {
        this._ui.togglePassengerView(true);
        this._ui.renderPassengerForms(this._state.currentNumber, this._state.tripType);
    }

    _handleBackToFlights() {
        this._ui.togglePassengerView(false);
    }

    _handleSelectSeatClick(e) {
        const target = e.target;
        if (target.classList.contains('select-seat-btn')) {
            const pIndex = target.dataset.passengerIndex;
            const fType = target.dataset.flightType || 'outbound';
            const flight = (fType === 'outbound') ? this._state.selectedOutboundFlight : this._state.selectedReturnFlight;
            if (!flight) {
                uiUtils.showCustomAlert("Error", "Flight not selected", "error");
                return;
            }
            this._openSeatMap(pIndex, fType, flight);
        }
    }

    async _openSeatMap(passengerIndex, flightType, flight) {
        this._ui.showLoading(true);
        if (this._elements.seatMapTitle) this._elements.seatMapTitle.textContent = `Select Seat (Passenger ${passengerIndex}, ${flightType === 'outbound' ? 'Outbound' : 'Return'})`;
        if (this._elements.seatMapGrid) this._elements.seatMapGrid.innerHTML = 'Loading seat map...';

        const planeId = flight.plane_id;
        const flightIdForTaken = flight.id;

        const seatLayout = PLANE_LAYOUTS[planeId];
        if (!seatLayout) {
            uiUtils.showCustomAlert("Error", `Seat layout not found for plane ID ${planeId}`, "error");
            if (this._elements.seatMapGrid) this._elements.seatMapGrid.innerHTML = 'Error loading map layout.';
            this._ui.showLoading(false);
            return;
        }

        let allAssignments = [];
        try {
            allAssignments = await SearchService.getTakenSeats(flightIdForTaken);
        } catch (error) {
            console.error("Error loading seat assignments:", error);
            if (this._elements.seatMapGrid) this._elements.seatMapGrid.innerHTML = 'Error loading seat assignments.';
            this._ui.showLoading(false);
            return;
        }

        if (!this._isActive) return;

        const takenSeatIds = new Set(allAssignments.filter(a => a.passenger_id !== null).map(a => a.char_id));
        if (this._elements.seatMapGrid) this._elements.seatMapGrid.innerHTML = '';

        seatLayout.forEach(seat => {
            const seatDiv = document.createElement('div');
            seatDiv.className = 'seat available';
            seatDiv.textContent = seat.name;
            seatDiv.dataset.seatId = seat.id;
            if (takenSeatIds.has(seat.id)) {
                seatDiv.classList.replace('available', 'taken');
            } else {
                seatDiv.addEventListener('click', () => {
                    this._elements.seatMapGrid.querySelector('.seat.selected')?.classList.remove('selected');
                    seatDiv.classList.add('selected');
                });
            }
            this._elements.seatMapGrid.appendChild(seatDiv);
        });

        this._ui.showLoading(false);

        if (this._elements.seatMapModal && !this._seatMapModalInstance) {
            this._seatMapModalInstance = new bootstrap.Modal(this._elements.seatMapModal);
        }

        if (this._elements.confirmSeatButton && this._boundConfirmSeat) {
            this._elements.confirmSeatButton.removeEventListener('click', this._boundConfirmSeat);
        }

        this._boundConfirmSeat = () => {
            const selected = this._elements.seatMapGrid.querySelector('.seat.selected');
            if (selected) {
                const seatId = selected.dataset.seatId;
                const seatName = selected.textContent;
                const seatDisplay = document.getElementById(`seat-selection-${flightType}-${passengerIndex}`);
                if (seatDisplay) seatDisplay.textContent = ` (${seatName})`;

                const form = document.querySelector(`.passenger-form[data-index="${passengerIndex}"]`);
                if (form) form.dataset[flightType === 'outbound' ? 'seatOutbound' : 'seatReturn'] = seatId;

                this._seatMapModalInstance.hide();
            } else {
                uiUtils.showCustomAlert("Wait", "Please select a seat.", "warning");
            }
        };

        this._elements.confirmSeatButton.addEventListener('click', this._boundConfirmSeat);
        this._seatMapModalInstance.show();
    }

    async _handleConfirmBooking() {
        this._ui.showLoading(true);
        const forms = this._elements.passengerFormsContainer.querySelectorAll('.passenger-form');
        let dataToSubmit = [];
        let isValid = true;

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
                uiUtils.showCustomAlert("Missing Info", `Please fill in all details for passenger ${idx}.`, "warning");
                isValid = false;
                break;
            }
            if (this._state.tripType === 'round-trip' && !data.seatReturn) {
                uiUtils.showCustomAlert("Missing Info", `Please select a return seat for passenger ${idx}.`, "warning");
                isValid = false;
                break;
            }
            dataToSubmit.push(data);
        }

        if (!isValid) {
            this._ui.showLoading(false);
            return;
        }

        try {
            for (const data of dataToSubmit) {
                const pRes = await fetch(C.API_PASSENGERS_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        passport_number: data.passport_number,
                        flight_id: this._state.selectedOutboundFlight.id,
                        date_of_birth: data.date_of_birth,
                    })
                });
                const newPassenger = await pRes.json();
                if (!pRes.ok) throw new Error(`Passenger creation failed: ${newPassenger.error || 'Unknown error'}`);
                const passengerId = newPassenger.id;

                const outboundSeatId = data.seatOutbound;
                await fetch(C.API_CHAIRS_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flight_id: this._state.selectedOutboundFlight.id,
                        char_id: outboundSeatId,
                        passenger_id: passengerId
                    })
                });

                let returnSeatId = null;
                if (data.seatReturn) {
                    returnSeatId = data.seatReturn;
                    await fetch(C.API_CHAIRS_URL, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            flight_id: this._state.selectedReturnFlight.id,
                            char_id: returnSeatId,
                            passenger_id: passengerId
                        })
                    });
                }

                await fetch(C.API_TICKETS_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flight_id: this._state.selectedOutboundFlight.id,
                        passenger_id: passengerId,
                        chair_id: outboundSeatId
                    })
                });

                if (this._state.tripType === 'round-trip' && returnSeatId) {
                    await fetch(C.API_TICKETS_URL, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            flight_id: this._state.selectedReturnFlight.id,
                            passenger_id: passengerId,
                            chair_id: returnSeatId
                        })
                    });
                }
            }

            await uiUtils.showCustomAlert("Success", "Booking was successful! Redirecting to My Tickets...", "success");
            this._goToPage(C.API_MY_TICKETS_URL);

        } catch (error) {
            console.error("Booking failed:", error);
            await uiUtils.showCustomAlert("Booking Error", error.message, "error");
        } finally {
            if (this._isActive) this._ui.showLoading(false);
        }
    }

    async _handleRegisterBiometricClick(e) {
        e.preventDefault();
        const email = this._state.email;
        if (!email || email === "null") {
            uiUtils.showCustomAlert('Login Required', 'You must be logged in to add biometric ID.', 'error');
            return;
        }
        const newCredentialID = await this._webAuthn.handleRegisterBiometric(email);
        if (newCredentialID) {
            localStorage.setItem('credentialID', newCredentialID);
        }
    }
}