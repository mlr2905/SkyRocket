import * as C from './utils/constants.js'; 
let tableHead, tableBody, filterInput, loadingIndicator;
let allData = null; 

let boundHandleFilterInput;

const dbName = "DatabaseCache";
const dbVersion = 1; 

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
 * NEW: Called by the router to initialize the page
 */
export function init() {
    // 1. Select DOM elements
    tableHead = document.getElementById('trbody');
    tableBody = document.getElementById('dataTableBody');
    filterInput = document.getElementById('filter');
    loadingIndicator = document.getElementById('loading-indicator');
    
    // 2. Bind handler
    boundHandleFilterInput = handleFilterInput.bind(this);
    
    // 3. Attach listener
    filterInput?.addEventListener('input', boundHandleFilterInput);
    
    // 4. Run app logic
    initApp();
}

/**
 * NEW: Called by the router to clean up the page
 */
export function destroy() {
    filterInput?.removeEventListener('input', boundHandleFilterInput);
    allData = null;
    tableHead = null;
    tableBody = null;
    filterInput = null;
    loadingIndicator = null;
    boundHandleFilterInput = null;
}

// --- All your original functions remain ---

async function initApp() {
    console.log('[App] Initializing...');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    try {
        const res = await fetch(c.API_ALL_TABLES_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        allData = await res.json(); 
        console.log('[Fetch] Data loaded and cached locally:', allData);

        await saveAllDataToIndexedDB(allData);

        console.log('[App] Initialization successful.');
        if (filterInput) {
            filterInput.disabled = false; 
            filterInput.placeholder = `Enter ID 0-${MAX_TABLE_ID}`; 
        }

    } catch (e) {
        console.error('[Fetch Error]', e);
        if (filterInput) filterInput.placeholder = "Data load failed";

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
    if (!filterInput) return;
    const val = filterInput.value;
    const valNum = Number(val);

    try {
        if (val === '' || (valNum >= 0 && valNum <= MAX_TABLE_ID)) {
            if (val !== '') {
                console.clear();
                console.log(`[Input] Filter ID entered: ${valNum}`);
                renderTable(valNum); 
            } else {
                if (tableHead) tableHead.innerHTML = '';
                if (tableBody) tableBody.innerHTML = '';
                console.log('[Input] Filter cleared — table reset');
            }
        } else {
            console.warn(`[Input] Invalid value entered: "${val}"`);
            filterInput.value = '';
        }
    } catch (e) {
        console.error('[Input Error]', e);
    }
}

/**
 * Renders the entire table (headers and body) for a given table ID.
 * @param {number} filterid - The ID of the table to render (e.g., 0, 1, 2...).
 */
function renderTable(filterid) {
    if (!allData) {
        console.warn('[Display] Data not loaded yet.');
        return;
    }

    const config = TABLE_CONFIG[filterid];
    if (!config) {
        console.error(`[Render Error] No config found for table ID ${filterid}`);
        return;
    }
    
    if (tableHead) tableHead.innerHTML = '';
    if (tableBody) tableBody.innerHTML = '';

    try {
        const headerRow = document.createElement('tr');
        config.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        if (tableHead) tableHead.appendChild(headerRow);
    } catch (e) {
        console.error(`[Header Error] Failed to render headers for table ${filterid}`, e);
        return;
    }

    displayRecords(allData, filterid, config);
}

/**
 * Renders all rows for a specific table into the <tbody>.
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
 */
const createCell = (text) => {
    const td = document.createElement('td');
    td.textContent = text ?? 'N/A'; 
    return td;
};

/**
 * Creates a <tr> row from an array of values and appends it to the table body.
 */
const appendRow = (values) => {
    const tr = document.createElement('tr');
    values.forEach(value => tr.appendChild(createCell(value)));
    if (tableBody) tableBody.appendChild(tr);
};



/**
 * Opens (and upgrades if necessary) the IndexedDB.
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
 */
async function saveAllDataToIndexedDB(data) {
    try {
        const db = await openAppDB();
        
        const storeNames = Object.values(TABLE_CONFIG).map(c => c.tableName.toLowerCase());
        
        const transaction = db.transaction(storeNames, 'readwrite');
        
        transaction.onerror = (e) => console.error('[IndexedDB Transaction Error]', e.target.error);
        transaction.oncomplete = () => console.log('[IndexedXDB] All data saved successfully.');

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