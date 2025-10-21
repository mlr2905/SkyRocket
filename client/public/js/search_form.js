  function toggleSearchIcon() {

        const formRow = document.querySelector('.form-group');
        const flight = document.querySelector('.main-container');

        formRow.style.display = formRow.style.display === 'block' ? 'none' : 'block'
        flight.style.display = formRow.style.display === 'none' ? 'block' : 'none'
        createOutboundFlightCards();
        createReturnFlightCards();

    }
    document.getElementById('logout-button').addEventListener('click', function () {
        alert("You have been logged out!");
    });
    function checkActivationStatus() {
        fetch('https://skyrocket.onrender.com/activation')
            .then(response => {
                if (response.status === 404 || response.status === 500) {
                    // אם חזר סטטוס 404 או 500, הצג את כפתור ההתחברות והסתר את כפתור החשבון
                    document.getElementById('login-button').style.display = 'block';
                } else if (response.status === 200) {
                    // אם חזר סטטוס 200, הצג את כפתור החשבון והסתר את כפתור ההתחברות
                    document.getElementById('logout-button').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('בעיה בביצוע בקשת HTTP:', error);
                // טיפול בשגיאות כאן, לדוגמה יכול להיות הצגת הודעת שגיאה או פעולה נוספת
            });
    }

    // קריאה לפונקציה ברגע שהדף נטען
    checkActivationStatus();

    function handleInputChange() {
        var fromInput = document.getElementById('from');
        var toInput = document.getElementById('to');
        var dateRangeInput = document.getElementById('daterange');

        // Enable or disable 'To' input and date range input based on 'From' input value
        if (fromInput.value.trim() !== '') {
            toInput.disabled = false;
            if (toInput.value.trim() !== '') {
                dateRangeInput.disabled = false
            }
            else {
                dateRangeInput.disabled = true

            }
        } else {
            toInput.disabled = true;
            dateRangeInput.disabled = true;
        }
    }


    $(function () {
        $('input[name="daterange"]').daterangepicker({
            opens: 'left'
        }, function (start, end, label) {

        });
    });

    let currentNumber = 1;
    const numberElement = document.getElementById('number');
    const subtractButton = document.getElementById('button-subtract');

    function update(action) {
        event.preventDefault(); // מונע את ההתנהגות הרגילה של הטופס

        if (action === 'add') currentNumber++;
        else if (action === 'subtract') currentNumber--;

        numberElement.textContent = currentNumber;
        subtractButton.disabled = currentNumber <= 1;
    }

    function changeNumber(action) {

        update(action);
    }

    let addedItems = {}
    document.addEventListener("DOMContentLoaded", function () {
        let timeout = null;

        async function fetchDataAndStore() {
            try {
                let response = await fetch('https://skyrocket.onrender.com/role_users/flights');
                let data = await response.json();

                // Open IndexedDB
                let dbRequest = indexedDB.open('FlightDB', 1);

                dbRequest.onupgradeneeded = function (event) {
                    let db = event.target.result;
                    if (!db.objectStoreNames.contains('flights')) {
                        db.createObjectStore('flights', { keyPath: 'id', autoIncrement: true });
                    }
                };

                dbRequest.onsuccess = function (event) {
                    let db = event.target.result;
                    let transaction = db.transaction('flights', 'readwrite');
                    let store = transaction.objectStore('flights');

                    // Clear previous data
                    store.clear();

                    // Add new data
                    data.forEach(flight => {
                        store.add(flight);
                    });

                    transaction.oncomplete = function () {
                        console.log('Data stored successfully in IndexedDB');

                        // Extract unique countries
                        let countrySet = new Set();
                        data.forEach(flight => {
                            countrySet.add(flight.origin_country_name);
                        });

                        let uniqueCountries = Array.from(countrySet);
                        localStorage.setItem('uniqueCountries', JSON.stringify(uniqueCountries));
                    };

                    transaction.onerror = function (event) {
                        console.error('Transaction error:', event.target.error);
                    };
                };

                dbRequest.onerror = function (event) {
                    console.error('IndexedDB error:', event.target.error);
                };
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        function getFlightsFromDB(callback) {
            let dbRequest = indexedDB.open('FlightDB', 1);

            dbRequest.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction('flights', 'readonly');
                let store = transaction.objectStore('flights');
                let request = store.getAll();

                request.onsuccess = function (event) {
                    callback(event.target.result);
                };

                request.onerror = function (event) {
                    console.error('Request error:', event.target.error);
                };
            };

            dbRequest.onerror = function (event) {
                console.error('IndexedDB error:', event.target.error);
            };
        }

        function displayFlights(data) {
            let fromList = document.getElementById('from-list');
            fromList.innerHTML = ''; // Clear previous items
            const icon = document.getElementById('loading-icon');
            icon.style.display = 'block';
            for (let i = 0; i < data.length; i++) {
                let itemName = data[i];
                // Check if item already exists
                if (!fromList.querySelector(`.autocomplete-item[data-text="${itemName}"]`)) {
                    let item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = itemName;
                    item.setAttribute('data-text', itemName); // Set attribute to identify this item
                    item.addEventListener('click', function () {
                        document.getElementById('from').value = this.textContent;
                        handleInputChange();
                        fromList.innerHTML = ''; // Clear the list after selection
                        updateDestinationOptions(this.textContent);
                    });
                    fromList.appendChild(item);
                }
            }

            icon.style.display = 'none';
        }

        function displayAllFlights() {
            let uniqueCountries = JSON.parse(localStorage.getItem('uniqueCountries'));
            if (uniqueCountries) {
                displayFlights(uniqueCountries);
            }
        }

        function filterAndDisplayFlights(query) {
            getFlightsFromDB(function (flightData) {
                if (flightData) {
                    let regex = new RegExp(query, 'i');
                    let filteredFlights = flightData.filter(flight => regex.test(flight.origin_country_name));
                    displayFlights(filteredFlights.map(flight => flight.origin_country_name));
                }
            });
        }

        function updateDestinationOptions(originCountry) {

            handleInputChange();
            let toList = document.getElementById('to-list');
            toList.innerHTML = '';

            getFlightsFromDB(function (flightData) {

                if (flightData) {
                    let toInput = document.getElementById('to');

                    // Function to create autocomplete items
                    function createAutocompleteItem(flight) {
                        let item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = flight.destination_country_name;
                        item.setAttribute('data-text', flight.destination_country_name); // Set attribute to identify this item
                        item.addEventListener('click', function () {
                            toInput.value = this.textContent;
                            toList.innerHTML = '';
                            document.getElementById("search").disabled = false;

                            handleInputChange();
                        });
                        return item;
                    }

                    // Add input event listener to 'to' input element
                    toInput.addEventListener('input', function () {

                        let inputValue = this.value.toLowerCase(); // Get current input value and convert to lowercase

                        // Filter flights based on originCountry and current input value
                        let filteredDestinations = flightData.filter(flight =>
                            flight.origin_country_name === originCountry &&
                            flight.destination_country_name.toLowerCase().includes(inputValue) &&
                            !toList.querySelector(`.autocomplete-item[data-text="${flight.destination_country_name}"]`)
                        );

                        // Clear existing items in toList
                        toList.innerHTML = '';

                        // Iterate through filtered destinations and create autocomplete items
                        filteredDestinations.forEach(flight => {
                            let item = createAutocompleteItem(flight);
                            let text = item.dataset.text;

                            // בדיקה האם הטקסט של הפריט כבר קיים במערך הפריטים שנוספו
                            if (!addedItems[text]) {
                                toList.appendChild(item);
                                addedItems[text] = true; // סימון שהפריט נוסף למערך
                            }
                        });

                        // מחיקת כל המידע ב-addedItems לאחר סיום הלולאה
                        addedItems = {};

                    });

                    // Initial filtering based on originCountry and empty input
                    let filteredDestinations = flightData.filter(flight =>
                        flight.origin_country_name === originCountry &&
                        !toList.querySelector(`.autocomplete-item[data-text="${flight.destination_country_name}"]`)
                    );

                    // Create autocomplete items for initial load
                    filteredDestinations.forEach(flight => {
                        let item = createAutocompleteItem(flight);
                        toList.appendChild(item);
                    });
                }

            });
        }


        fetchDataAndStore();

        document.getElementById('from').addEventListener('input', function () {
            clearTimeout(timeout);
            let query = this.value.trim();
            timeout = setTimeout(() => {
                if (query.length > 0) {
                    filterAndDisplayFlights(query);
                    updateDestinationOptions(query);
                } else {
                    displayAllFlights();
                }
            }, 300);
        });




        document.getElementById('from').addEventListener('focus', function () {
            displayAllFlights();
        });

        document.getElementById('to').addEventListener('focus', function () {
            let originCountry = document.getElementById('from').value.trim();
            updateDestinationOptions(originCountry);
        });
    });

    function createOutboundFlightCards() {
        const icon = document.getElementById('loading-icon');
        icon.style.display = 'block';

        // Open IndexedDB
        const request = indexedDB.open('FlightDB');

        request.onsuccess = function (event) {
            const db = event.target.result;

            // Assuming 'flights' is the object store name
            const transaction = db.transaction(['flights'], 'readonly');
            const objectStore = transaction.objectStore('flights');

            const from = document.getElementById('from').value.toLowerCase();
            const to = document.getElementById('to').value.toLowerCase();

            const container = document.getElementById('flights-container');
            container.innerHTML = ''; // Clear previous results

            const outboundContainer = document.createElement('div');
            outboundContainer.className = 'flight-grid';



            container.appendChild(outboundContainer);

            let resultCount = 0;

            objectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const flight = cursor.value;
                    if (flight.origin_country_name.toLowerCase() === from && flight.destination_country_name.toLowerCase() === to) {
                        const departureDate = new Date(flight.departure_time).toLocaleDateString();
                        const departureTime = new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const landingDate = new Date(flight.landing_time).toLocaleDateString();
                        const landingTime = new Date(flight.landing_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        // Calculate duration in milliseconds
                        const departureTimestamp = new Date(flight.departure_time).getTime();
                        const landingTimestamp = new Date(flight.landing_time).getTime();
                        const durationMs = landingTimestamp - departureTimestamp;

                        // Convert milliseconds to hours and minutes
                        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                        // Format duration as HH:mm
                        const duration = `${durationHours}:${(durationMinutes < 10 ? '0' : '') + durationMinutes}`;

                        // Calculate total minutes
                        const totalMinutes = durationHours * 60 + durationMinutes;

                        // Calculate price based on rate per hour (assuming 150 units per hour)
                        const price = Math.ceil(totalMinutes / 60) * 150;

                        // Create flight card with corrected price calculation
                        const card = createFlightCard(flight.id, price, departureDate, departureTime, duration, landingDate, landingTime, flight.origin_country_name, flight.destination_country_name, flight.airline_id);
                        outboundContainer.appendChild(card);
                        resultCount++;
                    }
                    cursor.continue();
                } else {
                    icon.style.display = 'none';
                    // Set container height based on the number of results
                    if (resultCount <= 2) {
                        container.style.maxHeight = 'none'; // Disable max-height for fewer results
                    } else {
                        container.style.maxHeight = '400px'; // Re-enable max-height for more results
                    }
                }
            };
        };

        request.onerror = function (event) {
            console.error("Error opening indexedDB: ", event.target.error);
        };
    }


    function createReturnFlightCards() {
        const icon = document.getElementById('loading-icon');
        icon.style.display = 'block';

        // Open IndexedDB
        const request = indexedDB.open('FlightDB');

        request.onsuccess = function (event) {
            const db = event.target.result;

            // Check if 'flights' object store exists
            if (db.objectStoreNames.contains('flights')) {
                const transaction = db.transaction(['flights'], 'readonly');
                const objectStore = transaction.objectStore('flights');

                const from = document.getElementById('from').value.toLowerCase();
                const to = document.getElementById('to').value.toLowerCase();

                const container = document.getElementById('flights-container2');
                container.innerHTML = ''; // Clear previous results

                const returnContainer = document.createElement('div');
                returnContainer.className = 'flight-grid';


                container.appendChild(returnContainer);

                let resultCount = 0;

                objectStore.openCursor().onsuccess = function (event) {
                    const cursor = event.target.result;
                    if (cursor) {
                        const flight = cursor.value;
                        if (flight.origin_country_name.toLowerCase() === to && flight.destination_country_name.toLowerCase() === from) {
                            const departureDate = new Date(flight.departure_time).toLocaleDateString();
                            const departureTime = new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const landingDate = new Date(flight.landing_time).toLocaleDateString();
                            const landingTime = new Date(flight.landing_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            // Calculate duration in milliseconds
                            const departureTimestamp = new Date(flight.departure_time).getTime();
                            const landingTimestamp = new Date(flight.landing_time).getTime();
                            const durationMs = landingTimestamp - departureTimestamp;

                            // Convert milliseconds to hours and minutes
                            const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                            const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                            // Format duration as HH:mm
                            const duration = `${durationHours}:${(durationMinutes < 10 ? '0' : '') + durationMinutes}`;

                            // Calculate total minutes
                            const totalMinutes = durationHours * 60 + durationMinutes;

                            // Calculate price based on rate per hour (assuming 150 units per hour)
                            const price = Math.ceil(totalMinutes / 60) * 150;

                            // Create flight card with corrected price calculation
                            const card = createFlightCard(flight.id, price, departureDate, departureTime, duration, landingDate, landingTime, flight.origin_country_name, flight.destination_country_name, flight.airline_id);
                            returnContainer.appendChild(card);
                            resultCount++;
                        }
                        cursor.continue();
                    } else {
                        icon.style.display = 'none';
                        // Set container height based on the number of results
                        if (resultCount <= 2) {
                            container.style.maxHeight = 'none'; // Disable max-height for fewer results
                        } else {
                            container.style.maxHeight = '300px'; // Re-enable max-height for more results
                        }
                    }
                };
            } else {
                console.error("Object store 'flights' not found in 'FlightDB'.");
            }
        };

        request.onerror = function (event) {
            console.error("Error opening FlightDB: ", event.target.error);
        };
    }

    function createFlightCard(id, price, departureDate, departureTime, duration, landingDate, landingTime, origin, destination, airlineId) {
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.innerHTML = `
         <div class="flight-card-header">
                    <div class="price">$${price}</div>
                    <button class="select-button">בחירה</button>
                </div>
                <div class="flight-info">
                    <div class="flight-leg">
                        <span class="time">${departureTime}</span>
                        <span class="date">${departureDate}</span>
                        <span class="airport">${origin}</span>
                    </div>
                    <div class="flight-leg">
                        <span class="time">${landingTime}</span>
                        <span class="date">${landingDate}</span>
                        <span class="airport">${destination}</span>
                    </div>
                </div>
                <div class="flight-details">
                    <div class="flight-duration">${duration}</div>
                    <div class="airline-logo">
                        <img src="./logo_airlines/${airlineId}.png" alt="Airline Logo">
                    </div>
                </div>
            `;

        const selectButton = card.querySelector('.select-button');
        selectButton.addEventListener('click', function () {
            const currentlySelected = document.querySelector('.flight-card.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            card.classList.add('selected');
            addToSelection(id);
        });

        return card;
    }

    function addToSelection(id) {
        document.querySelector('.main-container')
        const div1 = document.querySelector('#return');
        const div2 = document.querySelector('#outbound')
        div2.style.display = 'none'

        if (div2.style.display = 'none') {
            div1.style.display = 'block'
        }



        // הוסף את ה id למערך או בצורה אחרת לפי הצורך
        console.log(`Flight ID ${id} has been added to selection.`);
        flight
    }