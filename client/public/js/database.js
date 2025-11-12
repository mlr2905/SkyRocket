const tableHead = document.getElementById('trbody');
const tableBody = document.getElementById('dataTableBody');
const filterInput = document.getElementById('filter');

const headersMap = {
  0: ['TABLE', 'ID', 'USERNAME', 'EMAIL', 'ROLE_NAME (JOIN)'],
  1: ['TABLE', 'ID', 'NAME', 'COUNTRY_ID', 'CONTINENT_NAME (JOIN)'], 
  2: ['TABLE', 'ID', 'NAME', 'COUNTRY_ID', 'USER_ID', 'COUNTRY_NAME', 'USER_NAME'], 
  3: ['TABLE', 'ID', 'FIRST_NAME', 'LAST_NAME', 'ADDRESS', 'PHONE_NO', 'CREDIT_CARD_NO', 'USER_ID', 'USER_NAME'],
  4: ['TABLE', 'ID', 'AIRLINE_ID', 'ORIGIN_COUNTRY_ID', 'DESTINATION_COUNTRY_ID', 'DEPARTURE_TIME', 'LANDING_TIME', 'REMAINING_TICKETS', 'AIRLINE_NAME', 'ORIGIN_COUNTRY_NAME', 'DESTINATION_COUNTRY_NAME'],
  5: ['TABLE', 'ID', 'FLIGHT_ID', 'PASSENGER_ID', 'CUSTOMER_ID', 'AIRLINE_NAME', 'FLIGHT_DESTINATION', 'PASSENGER_FIRST_NAME', 'PASSENGER_LAST_NAME', 'SEAT', 'USERNAME'], // תוקן: USER_NAME -> USERNAME
  6: ['TABLE', 'ID', 'FIRST_NAME', 'LAST_NAME', 'DATE_OF_BIRTH', 'PASSPORT_NUMBER']
};

const name = {
    0: 'USERS', 1: 'COUNTRIES', 2: 'AIRLINES',
    3: 'CUSTOMERS', 4: 'FLIGHTS', 5: 'TICKETS', 6: 'PASSENGERS'
};

// --- App Initialization ---

async function initApp() {
    console.log('[App] Initializing...');
    try {
        const res = await fetch('/all_tables');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        allData = await res.json(); 
        console.log('[Fetch] Data loaded and cached locally:', allData);

        await saveAllDataToIndexedDB(allData);

    } catch (e) {
        console.error('[Fetch Error]', e);
        alert("Error fetching initial data. Check the console for more info.");
    }
}

document.addEventListener('DOMContentLoaded', initApp);

filterInput.addEventListener('input', function () {
    const val = this.value;
    const valNum = Number(val);

    try {
        if (val === '' || (valNum >= 0 && valNum <= 6)) {
            if (val !== '') {
                console.clear();
                console.log(`[Input] Filter ID entered: ${valNum}`);
                renderTable(valNum); 
            } else {
                tableHead.innerHTML = '';
                tableBody.innerHTML = '';
                console.log('[Input] Filter cleared — table reset');
            }
        } else {
            alert("There is no such table, enter a number between 0-6");
            console.warn(`[Input] Invalid value entered: "${val}"`);
            this.value = '';
        }
    } catch (e) {
        console.error('[Input Error]', e);
    }
});


// --- Rendering Functions ---

function renderTable(filterid) {
    if (!allData) {
        console.warn('[Display] Data not loaded yet.');
        alert("Data is still loading, please wait.");
        return;
    }

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    try {
        const headerRow = document.createElement('tr');
        headersMap[filterid].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);
    } catch (e) {
        console.error(`[Header Error] Failed to render headers for table ${filterid}`, e);
        return;
    }

    displayRecords(allData, filterid);
}


const displayRecords = (records, filterid) => {
    const tableKey = name[filterid]?.toLowerCase();
    let rowsToDisplay;

    if (Array.isArray(records[tableKey])) {
        rowsToDisplay = records[tableKey];
    } else if (Array.isArray(records[filterid])) {
        rowsToDisplay = records[filterid];
    } else {
        console.error(`[Display Error] Expected array for table ${filterid} (${tableKey}), got:`,
            records[filterid], records[tableKey]);
        return;
    }

    const funcs = [appendRow0, appendRow1, appendRow2, appendRow3, appendRow4, appendRow5, appendRow6];

    console.log(`[Display] Rendering ${rowsToDisplay.length} rows for table ${filterid} (${tableKey})`);
    rowsToDisplay.forEach((row, index) => {
        try {
            funcs[filterid](row);
        } catch (e) {
            console.error(`[Row Error] Failed to render row ${index} in table ${filterid}:`, e, row);
        }
    });
};


// --- Helper Functions ---

const createCell = (text) => {
    const td = document.createElement('td');
    td.textContent = text ?? 'N/A'; 
    return td;
};

const appendRow = (values) => {
    const tr = document.createElement('tr');
    values.forEach(value => tr.appendChild(createCell(value)));
    tableBody.appendChild(tr);
};

const appendRow0 = r => appendRow([`0-${name[0]}`, r.id, r.username, r.email, r.role_name]);
const appendRow1 = r => appendRow([`1-${name[1]}`, r.id, r.country_name, r.continent_id, r.continent_name]);
const appendRow2 = r => appendRow([`2-${name[2]}`, r.id, r.name, r.country_id, r.user_id, r.country_name, r.user_name]);
const appendRow3 = r => appendRow([`3-${name[3]}`, r.id, r.first_name, r.last_name, r.address, r.phone, r.credit_card, r.user_id, r.user_name]);
const appendRow4 = r => appendRow([`4-${name[4]}`, r.id, r.airline_id, r.origin_country_id, r.destination_country_id, r.departure_time, r.landing_time, r.remaining_tickets, r.airline_name, r.origin_country_name, r.destination_country_name]);
const appendRow5 = r => appendRow([`5-${name[5]}`, r.id, r.flight_id, r.passenger_id, r.customer_id, r.airline_name, r.flight_destination, r.passenger_first_name, r.passenger_last_name, r.seat, r.username]);
const appendRow6 = r => appendRow([`6-${name[6]}`, r.id, r.first_name, r.last_name, r.date_of_birth, r.passport_number]);


const dbName = "DatabaseCache";
const dbVersion = 1; 


function openAppDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (e) => {
            console.error('[IndexedDB] Error opening DB', e);
            reject(e.target.error);
        };

        request.onsuccess = (e) => {
            resolve(e.target.result);
        };

        request.onupgradeneeded = (e) => {
            console.log('[IndexedDB] Upgrade needed or DB created');
            const db = e.target.result;
            
            Object.values(name).forEach(storeName => {
                const lowerCaseName = storeName.toLowerCase();
                if (!db.objectStoreNames.contains(lowerCaseName)) {
                    db.createObjectStore(lowerCaseName, { keyPath: 'id' });
                    console.log(`[IndexedDB] Created object store: ${lowerCaseName}`);
                }
            });
        };
    });
}

async function saveAllDataToIndexedDB(data) {
    try {
        const db = await openAppDB();
        
        const storeNames = Object.values(name).map(n => n.toLowerCase());
        
        const transaction = db.transaction(storeNames, 'readwrite');
        
        transaction.onerror = (e) => console.error('[IndexedDB Transaction Error]', e.target.error);
        transaction.oncomplete = () => console.log('[IndexedDB] All data saved successfully.');

        Object.keys(name).forEach(filterid => {
            const tableKey = name[filterid]?.toLowerCase(); 
            
            let dataToSave;
            if (Array.isArray(data[tableKey])) {
                dataToSave = data[tableKey];
            } else if (Array.isArray(data[filterid])) {
                dataToSave = data[filterid];
            } else {
                console.warn(`[IndexedDB] No data found for ${tableKey}, skipping store.`);
                return; 
            }
            
            const store = transaction.objectStore(tableKey);
            dataToSave.forEach(row => {
                store.put(row);
            });
            console.log(`[IndexedDB] Queued ${dataToSave.length} rows for store: ${tableKey}`);
        });

    } catch (e) {
        console.error('[IndexedDB Save Error]', e);
    }
}