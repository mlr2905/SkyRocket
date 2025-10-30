// File: SearchUIHandler.js
export class SearchUIHandler {
    #elements;
    selectedOutboundCard = null;
    selectedReturnCard = null;

    constructor(elements) {
        this.#elements = elements;
    }

    /**
     * Toggles between the search form view and the flight results view.
     * @param {boolean} showResults - True to show results, false to show the form.
     */
    toggleSearchView(showResults) {
        if (this.#elements.flightContainer) { // זהו ה-main-container
            this.#elements.flightContainer.style.display = showResults ? 'block' : 'none';
        }
        if (this.#elements.searchFormGroup) {
            this.#elements.searchFormGroup.style.display = showResults ? 'none' : 'block';
        }
    }

    /**
     * מחליף בין תצוגת הטיסות לתצוגת פרטי הנוסעים
     * @param {boolean} showPassengers - True to show passenger form, false to show flight results.
     */
    togglePassengerView(showPassengers) {
        if (this.#elements.mainFlightContainer) { // ה-div שמכיל את תוצאות הטיסה
            this.#elements.mainFlightContainer.style.display = showPassengers ? 'none' : 'block';
        }
        if (this.#elements.passengerDetailsSection) { // ה-div החדש של פרטי הנוסעים
            this.#elements.passengerDetailsSection.style.display = showPassengers ? 'block' : 'none';
        }

        // גלול לראש הטופס החדש
        if (showPassengers) {
            this.#elements.passengerDetailsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }


    /**
     * מייצר את הטפסים עבור כל נוסע
     * @param {number} passengerCount - כמות הנוסעים
     * @param {'one-way' | 'round-trip'} tripType - סוג הטיסה
     */
    renderPassengerForms(passengerCount, tripType) {
        const container = this.#elements.passengerFormsContainer;
        if (!container) return;

        container.innerHTML = ''; // נקה טפסים קודמים

        for (let i = 1; i <= passengerCount; i++) {
            const formDiv = document.createElement('div');
            formDiv.className = 'passenger-form mb-3 p-3 border rounded';
            formDiv.dataset.index = i; // שמירת אינדקס הנוסע

            const returnButtonDisplay = (tripType === 'round-trip') ? 'inline-block' : 'none';

            // --- שונה ---
            // הוספנו שדה תאריך לידה ושינינו את פריסת הרשת
            formDiv.innerHTML = `
                <h5>נוסע ${i}</h5>
                <div class="row g-2">
                    <div class="col-md-4">
                        <label class="form-label">שם פרטי</label>
                        <input type="text" class="form-control" name="first_name" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">שם משפחה</label>
                        <input type="text" class="form-control" name="last_name" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">מספר דרכון</label>
                        <input type="text" class="form-control" name="passport_number" required>
                    </div>
                  <div class="col-md"> <label class="form-label">תאריך לידה</label>
    <input type="date" class="form-control" name="date_of_birth" required>
</div>
                </div>
                <div class="mt-3 d-flex align-items-center gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-secondary btn-sm select-seat-btn" data-passenger-index="${i}" data-flight-type="outbound">
                        בחר כיסא (הלוך)
                    </button>
                    <span class="seat-selection-display" id="seat-selection-outbound-${i}"></span>
                    
                    <button type="button" class="btn btn-outline-secondary btn-sm select-seat-btn" data-passenger-index="${i}" data-flight-type="return" style="display: ${returnButtonDisplay};">
                        בחר כיסא (חזור)
                    </button>
                    <span class="seat-selection-display" id="seat-selection-return-${i}"></span>
                </div>
            `;
            // --- סוף שינוי ---
            container.appendChild(formDiv);
        }
    }

    /**
     * Updates the disabled state of input fields based on selections.
     */
    updateInputDisabledState() {
        const fromValue = this.#elements.fromInput?.value.trim() ?? '';
        const toValue = this.#elements.toInput?.value.trim() ?? '';

        const disableTo = (fromValue === '');
        const disableDate = (fromValue === '' || toValue === '');
        const disableSearch = disableDate;

        if (this.#elements.toInput) this.#elements.toInput.disabled = disableTo;
        if (this.#elements.dateRangeInput) this.#elements.dateRangeInput.disabled = disableDate;
        if (this.#elements.searchButton) this.#elements.searchButton.disabled = disableSearch;
    }

    /**
     * Updates the displayed passenger count.
     * @param {number} count - The new count.
     */
    updatePassengerCount(count) {
        if (this.#elements.numberElement) {
            this.#elements.numberElement.textContent = count;
        }
        if (this.#elements.subtractButton) {
            this.#elements.subtractButton.disabled = count <= 1;
        }
    }

    /**
     * Shows or hides the loading icon.
     * @param {boolean} show
     */
    showLoading(show) {
        if (this.#elements.loadingIcon) {
            this.#elements.loadingIcon.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Clears an autocomplete list container.
     * @param {HTMLElement} listElement
     */
    clearAutocomplete(listElement) {
        if (listElement) {
            listElement.innerHTML = '';
            listElement.style.display = 'none';
        }
    }

    /**
     * Renders items into an autocomplete list container.
     * @param {HTMLElement} listElement - The container (e.g., div).
     * @param {Array<string>} items - The list of strings to display.
     * @param {Function} onSelectCallback - Callback function when an item is clicked.
     */
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
                onSelectCallback(itemName);
                this.clearAutocomplete(listElement);
            });
            listElement.appendChild(item);
        });
        listElement.style.display = 'block';
    }

    /**
     * Creates and returns a flight card DOM element.
     * @param {Object} flight - Flight data object.
     * @returns {HTMLElement} The flight card element.
     */
    #createFlightCardElement(flight) {
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

    /**
     * Renders flight cards into a specified container.
     * @param {HTMLElement} container - The container element (outbound or return).
     * @param {Array<Object>} flights - Array of flight objects.
     * @param {Function} onSelectCallback - Callback function for when a card's select button is clicked.
     */
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
            const card = this.#createFlightCardElement(flight);
            const selectButton = card.querySelector('.select-button');
            if (selectButton) {
                selectButton.addEventListener('click', () => {
                    onSelectCallback(flight, card);
                });
            }
            grid.appendChild(card);
        });

        container.appendChild(grid);
        container.style.maxHeight = (flights.length <= 2) ? 'none' : '400px';
    }

    /**
     * Updates the visual selection state of flight cards.
     * @param {HTMLElement} selectedCard - The newly selected card.
     * @param {'outbound' | 'return'} cardType - The type of flight selected.
     */
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


    /**
    * Shows the return flights section after an outbound flight is selected.
    */
    showReturnFlightsSection() {
        if (this.#elements.outboundSection) this.#elements.outboundSection.style.display = 'none';
        if (this.#elements.returnSection) this.#elements.returnSection.style.display = 'block';
    }


    /**
     * Updates the display of login/logout buttons.
     * @param {boolean} isLoggedIn
     */
    updateLoginStatus(isLoggedIn) {
        if (this.#elements.loginButton) {
            this.#elements.loginButton.style.display = isLoggedIn ? 'none' : 'block';
        }
        if (this.#elements.logoutButton) {
            this.#elements.logoutButton.style.display = isLoggedIn ? 'block' : 'none';
        }
    }
}