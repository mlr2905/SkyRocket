
export class SearchUIHandler {
    #elements;
    selectedOutboundCard = null; // Made public for controller access if needed, but managed internally
    selectedReturnCard = null; // Made public for controller access if needed, but managed internally

    constructor(elements) {
        this.#elements = elements;
    }

    /**
     * Toggles between the search form view and the flight results view.
     * @param {boolean} showResults - True to show results, false to show the form.
     */
    toggleSearchView(showResults) {
        // Ensure elements exist before trying to access style
        if (this.#elements.formRow) {
            this.#elements.formRow.style.display = showResults ? 'none' : 'flex'; // Use flex if that's the default display
        }
         if (this.#elements.flightContainer) {
             this.#elements.flightContainer.style.display = showResults ? 'block' : 'none';
        }
        // Also hide/show the parent search form group if needed
         if (this.#elements.searchFormGroup) {
             this.#elements.searchFormGroup.style.display = showResults ? 'none' : 'block';
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
        const disableSearch = disableDate; // Search enabled when Date is enabled

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
            listElement.style.display = 'none'; // Hide when empty
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
        if (items.length === 0) return; // Don't show if no items

        const uniqueItems = Array.from(new Set(items)); // Ensure unique items

        uniqueItems.forEach(itemName => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = itemName;
            // item.setAttribute('data-text', itemName); // Not strictly needed if using textContent
            item.addEventListener('click', () => {
                onSelectCallback(itemName);
                this.clearAutocomplete(listElement); // Hide list after selection
            });
            listElement.appendChild(item);
        });
        listElement.style.display = 'block'; // Show list
    }

    /**
     * Creates and returns a flight card DOM element.
     * @param {Object} flight - Flight data object.
     * @returns {HTMLElement} The flight card element.
     */
    #createFlightCardElement(flight) {
        // Date and Time Formatting (with safety checks)
        const formatOptionsTime = { hour: '2-digit', minute: '2-digit' };
        const departureTime = flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], formatOptionsTime) : 'N/A';
        const departureDate = flight.departure_time ? new Date(flight.departure_time).toLocaleDateString() : 'N/A';
        const landingTime = flight.landing_time ? new Date(flight.landing_time).toLocaleTimeString([], formatOptionsTime) : 'N/A';
        const landingDate = flight.landing_time ? new Date(flight.landing_time).toLocaleDateString() : 'N/A';

        // Duration Calculation (with safety checks)
        let duration = 'N/A';
        let price = 'N/A';
        if (flight.departure_time && flight.landing_time) {
            const durationMs = new Date(flight.landing_time).getTime() - new Date(flight.departure_time).getTime();
            if (!isNaN(durationMs) && durationMs >= 0) {
                 const durationHours = Math.floor(durationMs / 3600000);
                 const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
                 duration = `${durationHours}h ${(durationMinutes < 10 ? '0' : '') + durationMinutes}m`;
                 const totalMinutes = durationHours * 60 + durationMinutes;
                 price = Math.ceil(totalMinutes / 60) * 150; // Price calculation
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
        
        // Store flight ID on the card element itself for easy access
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
        container.innerHTML = ''; // Clear previous results
        if (!flights || flights.length === 0) {
            container.innerHTML = '<p>No flights found for this route.</p>'; // User feedback
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
                    onSelectCallback(flight, card); // Pass flight data and card element
                });
            }
            grid.appendChild(card);
        });

        container.appendChild(grid);

        // Adjust container height based on content
        container.style.maxHeight = (flights.length <= 2) ? 'none' : '400px';
    }

    /**
     * Updates the visual selection state of flight cards.
     * @param {HTMLElement} selectedCard - The newly selected card.
     * @param {'outbound' | 'return'} cardType - The type of flight selected.
     */
    updateSelectedCardVisuals(selectedCard, cardType) {
        // Deselect previous card of the same type
        const previouslySelected = (cardType === 'outbound')
            ? this.selectedOutboundCard
            : this.selectedReturnCard;

        if (previouslySelected && previouslySelected !== selectedCard) {
            previouslySelected.classList.remove('selected');
        }

        // Select the new card
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