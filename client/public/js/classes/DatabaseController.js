import * as C from '../utils/constants.js';

export class DatabaseController {
    constructor() {
        this.tableHead = null;
        this.tableBody = null;
        this.filterInput = null;
        this.loadingIndicator = null;
        this.allData = null; 
        this.boundHandleFilterInput = null;

        this.dbName = "DatabaseCache";
        this.dbVersion = 1; 

        this.TABLE_CONFIG = {
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
        
        this.MAX_TABLE_ID = Object.keys(this.TABLE_CONFIG).length - 1;
    }

    init() {
        this.tableHead = document.getElementById('trbody');
        this.tableBody = document.getElementById('dataTableBody');
        this.filterInput = document.getElementById('filter');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.boundHandleFilterInput = this.handleFilterInput.bind(this);
        this.filterInput?.addEventListener('input', this.boundHandleFilterInput);
        this.initApp();
    }

    destroy() {
        this.filterInput?.removeEventListener('input', this.boundHandleFilterInput);
        this.allData = null;
        this.tableHead = null;
        this.tableBody = null;
        this.filterInput = null;
        this.loadingIndicator = null;
        this.boundHandleFilterInput = null;
    }

    async initApp() {
        console.log('[App] Initializing...');
        
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
        
        try {
            const res = await fetch(C.API_ALL_TABLES_URL);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            this.allData = await res.json(); 
            console.log('[Fetch] Data loaded and cached locally:', this.allData);

            await this.saveAllDataToIndexedDB(this.allData);

            console.log('[App] Initialization successful.');
            if (this.filterInput) {
                this.filterInput.disabled = false; 
                this.filterInput.placeholder = `Enter ID 0-${this.MAX_TABLE_ID}`; 
            }

        } catch (e) {
            console.error('[Fetch Error]', e);
            if (this.filterInput) this.filterInput.placeholder = "Data load failed";

        } finally {
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none'; 
            }
        }
    }

    handleFilterInput() {
        if (!this.filterInput) return;
        const val = this.filterInput.value;
        const valNum = Number(val);

        try {
            if (val === '' || (valNum >= 0 && valNum <= this.MAX_TABLE_ID)) {
                if (val !== '') {
                    console.clear();
                    console.log(`[Input] Filter ID entered: ${valNum}`);
                    this.renderTable(valNum); 
                } else {
                    if (this.tableHead) this.tableHead.innerHTML = '';
                    if (this.tableBody) this.tableBody.innerHTML = '';
                    console.log('[Input] Filter cleared — table reset');
                }
            } else {
                console.warn(`[Input] Invalid value entered: "${val}"`);
                this.filterInput.value = '';
            }
        } catch (e) {
            console.error('[Input Error]', e);
        }
    }

    renderTable(filterid) {
        if (!this.allData) {
            console.warn('[Display] Data not loaded yet.');
            return;
        }

        const config = this.TABLE_CONFIG[filterid];
        if (!config) {
            console.error(`[Render Error] No config found for table ID ${filterid}`);
            return;
        }
        
        if (this.tableHead) this.tableHead.innerHTML = '';
        if (this.tableBody) this.tableBody.innerHTML = '';

        try {
            const headerRow = document.createElement('tr');
            config.headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            if (this.tableHead) this.tableHead.appendChild(headerRow);
        } catch (e) {
            console.error(`[Header Error] Failed to render headers for table ${filterid}`, e);
            return;
        }

        this.displayRecords(this.allData, filterid, config);
    }

    
    displayRecords(records, filterid, config) {
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
                this.appendRow(fullRowValues);
            } catch (e) {
                console.error(`[Row Error] Failed to render row ${index} in table ${filterid}:`, e, row);
            }
        });
    }

    createCell(text) {
        const td = document.createElement('td');
        td.textContent = text ?? 'N/A'; 
        return td;
    }

    appendRow(values) {
        const tr = document.createElement('tr');
        values.forEach(value => tr.appendChild(this.createCell(value)));
        if (this.tableBody) this.tableBody.appendChild(tr);
    }

    openAppDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

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
                
                Object.values(this.TABLE_CONFIG).forEach(config => {
                    const lowerCaseName = config.tableName.toLowerCase();
                    if (!db.objectStoreNames.contains(lowerCaseName)) {
                        db.createObjectStore(lowerCaseName, { keyPath: 'id' });
                        console.log(`[IndexedDB] Created object store: ${lowerCaseName}`);
                    }
                });
            };
        });
    }

    async saveAllDataToIndexedDB(data) {
        try {
            const db = await this.openAppDB();
            
            const storeNames = Object.values(this.TABLE_CONFIG).map(c => c.tableName.toLowerCase());
            
            const transaction = db.transaction(storeNames, 'readwrite');
            
            transaction.onerror = (e) => console.error('[IndexedDB Transaction Error]', e.target.error);
            transaction.oncomplete = () => console.log('[IndexedXDB] All data saved successfully.');

            Object.keys(this.TABLE_CONFIG).forEach(filterid => {
                const config = this.TABLE_CONFIG[filterid];
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
}