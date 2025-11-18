// js/classes/SearchUIHandler.js
export class SearchUIHandler {
    _elements;
    selectedOutboundCard = null;
    selectedReturnCard = null;
    
    // אחסון מקומי של פונקציות ה-callback
    _callbacks = {
        onSelectFrom: null,
        onSelectTo: null,
        onSelectOutbound: null,
        onSelectReturn: null
    };

    constructor(elements) {
        this._elements = elements;
    }

    /**
     * NEW: Receives callbacks from the controller
     */
    setAutocompleteCallbacks(onSelectFrom, onSelectTo) {
        this._callbacks.onSelectFrom = onSelectFrom;
        this._callbacks.onSelectTo = onSelectTo;
    }

    /**
     * NEW: Receives callbacks from the controller
     */
    setFlightSelectCallbacks(onSelectOutbound, onSelectReturn) {
        this._callbacks.onSelectOutbound = onSelectOutbound;
        this._callbacks.onSelectReturn = onSelectReturn;
    }

    /**
     * Toggles between the search form view and the flight results view.
     */
    toggleSearchView(showResults) {
        if (this._elements.flightContainer) { 
            this._elements.flightContainer.style.display = showResults ? 'block' : 'none';
        }
        if (this._elements.searchFormGroup) {
            this._elements.searchFormGroup.style.display = showResults ? 'none' : 'block';
        }
    }

    /**
     * Toggle between flight results and passenger details
     */
    togglePassengerView(showPassengers) {
        if (this._elements.mainFlightContainer) { 
            this._elements.mainFlightContainer.style.display = showPassengers ? 'none' : 'block';
        }
        if (this._elements.passengerDetailsSection) { 
            this._elements.passengerDetailsSection.style.display = showPassengers ? 'block' : 'none';
        }

        if (showPassengers) {
            this._elements.passengerDetailsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Render passenger forms
     */
    renderPassengerForms(passengerCount, tripType) {
        const container = this._elements.passengerFormsContainer;
        if (!container) return;

        container.innerHTML = ''; 

        for (let i = 1; i <= passengerCount; i++) {
            const formDiv = document.createElement('div');
            formDiv.className = 'passenger-form mb-3 p-3 border rounded';
            formDiv.dataset.index = i; 

            const returnButtonDisplay = (tripType === 'round-trip') ? 'inline-block' : 'none';

            formDiv.innerHTML = `
                <h5>Passenger ${i}</h5>
                <div class="row g-2">
                    <div class="col-md-4">
                        <label class="form-label">First Name</label>
                        <input type="text" class="form-control" name="first_name" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Last Name</label>
                        <input type="text" class="form-control" name="last_name" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Passport Number</label>
                        <input type="text" class="form-control" name="passport_number" required>
                    </div>
                  <div class="col-md"> <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" name="date_of_birth" required>
                  </div>
                </div>
                <div class="mt-3 d-flex align-items-center gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-secondary btn-sm select-seat-btn" data-passenger-index="${i}" data-flight-type="outbound">
                        Select Seat (Outbound)
                    </button>
                    <span class="seat-selection-display" id="seat-selection-outbound-${i}"></span>
                    
                    <button type="button" class="btn btn-outline-secondary btn-sm select-seat-btn" data-passenger-index="${i}" data-flight-type="return" style="display: ${returnButtonDisplay};">
                        Select Seat (Return)
                    </button>
                    <span class="seat-selection-display" id="seat-selection-return-${i}"></span>
                </div>
            `;
            container.appendChild(formDiv);
        }
    }

    updateInputDisabledState() {
        const fromValue = this._elements.fromInput?.value.trim() ?? '';
        const toValue = this._elements.toInput?.value.trim() ?? '';

        const disableTo = (fromValue === '');
        const disableDate = (fromValue === '' || toValue === '');
        const disableSearch = disableDate;

        if (this._elements.toInput) this._elements.toInput.disabled = disableTo;
        if (this._elements.dateRangeInput) this._elements.dateRangeInput.disabled = disableDate;
        if (this._elements.searchButton) this._elements.searchButton.disabled = disableSearch;
    }

    updatePassengerCount(count) {
        if (this._elements.numberElement) {
            this._elements.numberElement.textContent = count;
        }
        if (this._elements.subtractButton) {
            this._elements.subtractButton.disabled = count <= 1;
        }
    }

    showLoading(show) {
        if (this._elements.loadingIcon) {
            this._elements.loadingIcon.style.display = show ? 'block' : 'none';
        }
    }

    clearAutocomplete(listElement) {
        if (listElement) {
            listElement.innerHTML = '';
            listElement.style.display = 'none';
        }
    }

    renderAutocompleteList(listElement, items, onSelectCallback) {
        if (!listElement) return;
        this.clearAutocomplete(listElement);
        if (items.length === 0) return;

        const uniqueItems = Array.from(new Set(items));

        uniqueItems.forEach(itemName => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = itemName;
            item.addEventListener('click', () => {
                // Use the passed callback OR the stored one
                if (onSelectCallback) onSelectCallback(itemName);
                this.clearAutocomplete(listElement);
            });
            listElement.appendChild(item);
        });
        listElement.style.display = 'block';
    }

    _createFlightCardElement(flight) {
        const formatOptionsTime = { hour: '2-digit', minute: '2-digit' };
        const departureTime = flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], formatOptionsTime) : 'N/A';
        const departureDate = flight.departure_time ? new Date(flight.departure_time).toLocaleDateString() : 'N/A';
        const landingTime = flight.landing_time ? new Date(flight.landing_time).toLocaleTimeString([], formatOptionsTime) : 'N/A';
        const landingDate = flight.landing_time ? new Date(flight.landing_time).toLocaleDateString() : 'N/A';

        let duration = 'N/A';
        let price = 'N/A';
        if (flight.departure_time && flight.landing_time) {
            const durationMs = new Date(flight.landing_time).getTime() - new Date(flight.departure_time).getTime();
            if (!isNaN(durationMs) && durationMs >= 0) {
                const durationHours = Math.floor(durationMs / 3600000);
                const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
                duration = `${durationHours}h ${(durationMinutes < 10 ? '0' : '') + durationMinutes}m`;
                const totalMinutes = durationHours * 60 + durationMinutes;
                price = Math.ceil(totalMinutes / 60) * 150;
            }
        }

        const card = document.createElement('div');
        card.className = 'flight-card';
        card.innerHTML = `
         <div class="flight-card-header">
            <div class="price">$${price}</div>
            <button class="select-button">Select</button> </div>
         <div class="flight-info">
            <div class="flight-leg">
                <span class="time">${departureTime}</span>
                <span class="date">${departureDate}</span>
                <span class="airport">${flight.origin_country_name || 'N/A'}</span>
            </div>
            <div class="flight-leg">
                <span class="time">${landingTime}</span>
                <span class="date">${landingDate}</span>
                <span class="airport">${flight.destination_country_name || 'N/A'}</span>
            </div>
         </div>
         <div class="flight-details">
            <div class="flight-duration">${duration}</div>
            <div class="airline-logo">
                <img src="./logo_airlines/${flight.airline_id || 'default'}.png" alt="Airline Logo" onerror="this.style.display='none'"> </div>
         </div>`;

        card.dataset.flightId = flight.id;
        return card;
    }

    renderFlightCards(container, flights, onSelectCallback) {
        if (!container) return;
        container.innerHTML = '';
        if (!flights || flights.length === 0) {
            container.innerHTML = '<p>No flights found for this route.</p>';
            container.style.maxHeight = 'none';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'flight-grid';

        flights.forEach(flight => {
            const card = this._createFlightCardElement(flight);
            const selectButton = card.querySelector('.select-button');
            if (selectButton) {
                selectButton.addEventListener('click', () => {
                    if(onSelectCallback) onSelectCallback(flight, card);
                });
            }
            grid.appendChild(card);
        });

        container.appendChild(grid);
        container.style.maxHeight = (flights.length <= 2) ? 'none' : '400px';
    }

    updateSelectedCardVisuals(selectedCard, cardType) {
        const previouslySelected = (cardType === 'outbound')
            ? this.selectedOutboundCard
            : this.selectedReturnCard;

        if (previouslySelected && previouslySelected !== selectedCard) {
            previouslySelected.classList.remove('selected');
        }

        if (selectedCard) {
            selectedCard.classList.add('selected');
            if (cardType === 'outbound') {
                this.selectedOutboundCard = selectedCard;
            } else {
                this.selectedReturnCard = selectedCard;
            }
        }
    }

    showReturnFlightsSection() {
        if (this._elements.outboundSection) this._elements.outboundSection.style.display = 'none';
        if (this._elements.returnSection) this._elements.returnSection.style.display = 'block';
    }
}