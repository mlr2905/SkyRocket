
// --- DOM Elements ---
const tableHead = document.getElementById('trbody');
const tableBody = document.getElementById('dataTableBody');
const filterInput = document.getElementById('filter');
const loadingIndicator = document.getElementById('loading-indicator');
const dbName = "DatabaseCache";
const dbVersion = 1; 

let allData = null; 


const TABLE_CONFIG = {
  0: {
    tableName: 'USERS',
    headers: ['TABLE', 'ID', 'USERNAME', 'EMAIL', 'ROLE_NAME (JOIN)'],
    dataMap: ['id', 'username', 'email', 'role_name'] 
  },
  1: {
    tableName: 'COUNTRIES',
    headers: ['TABLE', 'ID', 'COUNTRY_NAME', 'CONTINENT_ID', 'CONTINENT_NAME (JOIN)'],
    dataMap: ['id', 'country_name', 'continent_id', 'continent_name']
  },
  2: {
    tableName: 'AIRLINES',
    headers: ['TABLE', 'ID', 'NAME', 'COUNTRY_ID', 'USER_ID', 'COUNTRY_NAME (JOIN)', 'USER_NAME (JOIN)'],
    dataMap: ['id', 'name', 'country_id', 'user_id', 'country_name', 'user_name']
  },
  3: {
    tableName: 'CUSTOMERS',
    headers: ['TABLE', 'ID', 'FIRST_NAME', 'LAST_NAME', 'ADDRESS', 'PHONE_NO', 'CREDIT_CARD_NO', 'USER_ID', 'USER_NAME (JOIN)'],
    dataMap: ['id', 'first_name', 'last_name', 'address', 'phone', 'credit_card', 'user_id', 'user_name']
  },
  4: {
    tableName: 'FLIGHTS',
    headers: ['TABLE', 'ID', 'AIRLINE_ID', 'ORIGIN_COUNTRY_ID', 'DESTINATION_COUNTRY_ID', 'DEPARTURE_TIME', 'LANDING_TIME', 'REMAINING_TICKETS', 'AIRLINE_NAME (JOIN)', 'ORIGIN_COUNTRY_NAME (JOIN)', 'DESTINATION_COUNTRY_NAME (JOIN)'],
    dataMap: ['id', 'airline_id', 'origin_country_id', 'destination_country_id', 'departure_time', 'landing_time', 'remaining_tickets', 'airline_name', 'origin_country_name', 'destination_country_name']
  },
  5: {
    tableName: 'TICKETS',
    headers: ['TABLE', 'ID', 'FLIGHT_ID', 'PASSENGER_ID', 'CUSTOMER_ID', 'AIRLINE_NAME (JOIN)', 'FLIGHT_DESTINATION (JOIN)', 'PASSENGER_FIRST_NAME (JOIN)', 'PASSENGER_LAST_NAME (JOIN)', 'SEAT', 'USERNAME (JOIN)'],
    dataMap: ['id', 'flight_id', 'passenger_id', 'customer_id', 'airline_name', 'flight_destination', 'passenger_first_name', 'passenger_last_name', 'seat', 'username']
  },
  6: {
    tableName: 'PASSENGERS',
    headers: ['TABLE', 'ID', 'FIRST_NAME', 'LAST_NAME', 'DATE_OF_BIRTH', 'PASSPORT_NUMBER'],
    dataMap: ['id', 'first_name', 'last_name', 'date_of_birth', 'passport_number']
  }
};

const MAX_TABLE_ID = Object.keys(TABLE_CONFIG).length - 1;

/**
 * Fetches initial data from the server and caches it locally and in IndexedDB.
 * Manages the loading indicator and input state.
 */
async function initApp() {
    console.log('[App] Initializing...');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    try {
        const res = await fetch('/all_tables');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        allData = await res.json(); 
        console.log('[Fetch] Data loaded and cached locally:', allData);

        await saveAllDataToIndexedDB(allData);

        console.log('[App] Initialization successful.');
        filterInput.disabled = false; 
        filterInput.placeholder = `Enter ID 0-${MAX_TABLE_ID}`; 

    } catch (e) {
        console.error('[Fetch Error]', e);
        alert("Error fetching initial data. Check the console for more info.");
        filterInput.placeholder = "Data load failed";

    } finally {
      
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none'; 
        }
    }
}

/**
 * Handles user input in the filter box.
 */
function handleFilterInput() {
    const val = filterInput.value;
    const valNum = Number(val);

    try {
        if (val === '' || (valNum >= 0 && valNum <= MAX_TABLE_ID)) {
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
            alert(`There is no such table, enter a number between 0-${MAX_TABLE_ID}`);
            console.warn(`[Input] Invalid value entered: "${val}"`);
            filterInput.value = '';
        }
    } catch (e) {
        console.error('[Input Error]', e);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
filterInput.addEventListener('input', handleFilterInput);

/**
 * Renders the entire table (headers and body) for a given table ID.
 * @param {number} filterid - The ID of the table to render (e.g., 0, 1, 2...).
 */
function renderTable(filterid) {
    if (!allData) {
        console.warn('[Display] Data not loaded yet.');
        alert("Data is still loading, please wait.");
        return;
    }

    const config = TABLE_CONFIG[filterid];
    if (!config) {
        console.error(`[Render Error] No config found for table ID ${filterid}`);
        return;
    }

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    try {
        const headerRow = document.createElement('tr');
        config.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);
    } catch (e) {
        console.error(`[Header Error] Failed to render headers for table ${filterid}`, e);
        return;
    }

    displayRecords(allData, filterid, config);
}

/**
 * Renders all rows for a specific table into the <tbody>.
 * This function is now dynamic and uses the TABLE_CONFIG.
 * @param {object} records - The main `allData` object.
 * @param {number} filterid - The ID of the table (e.g., 0).
 * @param {object} config - The `TABLE_CONFIG` entry for this table.
 */
const displayRecords = (records, filterid, config) => {
    const tableKey = config.tableName.toLowerCase(); 
    
    let rowsToDisplay = records[tableKey] || records[filterid];

    if (!Array.isArray(rowsToDisplay)) {
        console.error(`[Display Error] Expected array for table ${filterid} (${tableKey}), got:`, rowsToDisplay);
        return;
    }

    console.log(`[Display] Rendering ${rowsToDisplay.length} rows for table ${filterid} (${tableKey})`);
    
    rowsToDisplay.forEach((row, index) => {
        try {
            const tableIdentifier = `${filterid}-${config.tableName}`;
            
            const dataValues = config.dataMap.map(key => row[key]);

            const fullRowValues = [tableIdentifier, ...dataValues];
            
            appendRow(fullRowValues);

        } catch (e) {
            console.error(`[Row Error] Failed to render row ${index} in table ${filterid}:`, e, row);
        }
    });
};


/**
 * Creates a single <td> cell.
 * @param {string | number} text
 * @returns {HTMLTableCellElement}
 */
const createCell = (text) => {
    const td = document.createElement('td');
    td.textContent = text ?? 'N/A'; 
    return td;
};

/**
 * Creates a <tr> row from an array of values and appends it to the table body.
 * @param {Array<string | number>} values - An array of values for the cells.
 */
const appendRow = (values) => {
    const tr = document.createElement('tr');
    values.forEach(value => tr.appendChild(createCell(value)));
    tableBody.appendChild(tr);
};



/**
 * Opens (and upgrades if necessary) the IndexedDB.
 * @returns {Promise<IDBDatabase>}
 */
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
            
            Object.values(TABLE_CONFIG).forEach(config => {
                const lowerCaseName = config.tableName.toLowerCase();
                if (!db.objectStoreNames.contains(lowerCaseName)) {
                    db.createObjectStore(lowerCaseName, { keyPath: 'id' });
                    console.log(`[IndexedDB] Created object store: ${lowerCaseName}`);
                }
            });
        };
    });
}

/**
 * Saves the fetched data into their respective object stores in IndexedDB.
 * @param {object} data - The `allData` object from the fetch.
 */
async function saveAllDataToIndexedDB(data) {
    try {
        const db = await openAppDB();
        
        const storeNames = Object.values(TABLE_CONFIG).map(c => c.tableName.toLowerCase());
        
        const transaction = db.transaction(storeNames, 'readwrite');
        
        transaction.onerror = (e) => console.error('[IndexedDB Transaction Error]', e.target.error);
        transaction.oncomplete = () => console.log('[IndexedDB] All data saved successfully.');

        Object.keys(TABLE_CONFIG).forEach(filterid => {
            const config = TABLE_CONFIG[filterid];
            const tableKey = config.tableName.toLowerCase(); 
            
            let dataToSave = data[tableKey] || data[filterid];
            
            if (!Array.isArray(dataToSave)) {
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