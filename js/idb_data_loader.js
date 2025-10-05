/**
 * IndexedDB Data Loader Module
 * Provides IDB-first data loading with ET timezone-aware freshness checks
 * Shared across all road closures analysis pages
 */

// IndexedDB Configuration
const IDB_DB_NAME = 'roadclosures-db';
const IDB_STORE = 'datasets';
const IDB_KEY = 'data_v4_final_roadclosures';
const IDB_META_KEY = 'data_v4_final_roadclosures_meta';
const DATA_URL = '../data/data_v4_final_roadclosures.json';

/**
 * Open the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Get a value from IndexedDB
 * @param {string} key 
 * @returns {Promise<any>}
 */
async function idbGet(key) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Put a value into IndexedDB
 * @param {string} key 
 * @param {any} value 
 * @returns {Promise<boolean>}
 */
async function idbPut(key, value) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Delete a value from IndexedDB
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
async function idbDelete(key) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Get current date string in America/New_York timezone (YYYY-MM-DD)
 * Falls back to UTC if Intl API is unavailable
 * @returns {string}
 */
function getETDateString() {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', { 
      timeZone: 'America/New_York', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).formatToParts(now);
    const y = parts.find(p => p.type === 'year').value;
    const m = parts.find(p => p.type === 'month').value;
    const d = parts.find(p => p.type === 'day').value;
    return `${y}-${m}-${d}`;
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Get year from a date string
 * @param {string} dateStr 
 * @returns {string}
 */
function getYear(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d) ? '' : d.getFullYear().toString();
}

/**
 * Load data with IDB-first strategy and ET-aware freshness checking
 * @param {Object} callbacks - Optional callbacks for status updates
 * @param {Function} callbacks.onStatusUpdate - Called with status info object
 * @param {Function} callbacks.onDataReady - Called when data is ready with the dataset
 * @returns {Promise<Array>} The loaded dataset
 */
async function loadData(callbacks = {}) {
  const { onStatusUpdate, onDataReady } = callbacks;
  const today = getETDateString();
  
  try {
    const t0 = performance.now();
    const cached = await idbGet(IDB_KEY);
    const meta = await idbGet(IDB_META_KEY);
    const idbMs = Math.round(performance.now() - t0);
    
    if (cached && Array.isArray(cached)) {
      // Check if cache is fresh (same ET date)
      const lastFetched = meta && meta.lastFetched ? meta.lastFetched : null;
      
      if (lastFetched === today) {
        // Cache is fresh - use it
        if (onStatusUpdate) {
          onStatusUpdate({ 
            source: 'indexeddb', 
            idbTime: idbMs, 
            records: cached.length,
            lastFetched: lastFetched,
            message: `Loaded from cache: ${cached.length} records (idb ${idbMs} ms) | Last updated: ${lastFetched}`
          });
        }
        console.info('Loaded from IDB (fresh):', cached.length, 'records');
        if (onDataReady) onDataReady(cached);
        return cached;
      }
      
      // Cache is stale - try to fetch current year updates and merge
      try {
        const currentYear = new Date().getFullYear().toString();
        const t1 = performance.now();
        const resp = await fetch(DATA_URL);
        const data = await resp.json();
        const fetchMs = Math.round(performance.now() - t1);
        
        // Filter only current year records and merge dedup
        const updates = data.filter(d => getYear(d.Reported_On) === currentYear);
        
        // Merge updates into cached by key
        const keyMap = {};
        cached.forEach(item => {
          const key = [item.latitude, item.longitude, item.Road_Name, item.Reported_On, item.Comments].join('|');
          keyMap[key] = item;
        });
        
        let added = 0;
        updates.forEach(u => {
          const key = [u.latitude, u.longitude, u.Road_Name, u.Reported_On, u.Comments].join('|');
          if (!keyMap[key]) { 
            keyMap[key] = u; 
            added++; 
          }
        });
        
        const merged = Object.values(keyMap);
        await idbPut(IDB_KEY, merged);
        await idbPut(IDB_META_KEY, { lastFetched: today });
        
        if (onStatusUpdate) {
          onStatusUpdate({ 
            source: 'indexeddb-updated', 
            idbTime: idbMs, 
            fetchTime: fetchMs, 
            records: merged.length,
            lastFetched: today,
            message: `Cache merged with updates: ${merged.length} records (idb ${idbMs} ms, fetch ${fetchMs} ms) | Last updated: ${today}`
          });
        }
        console.info('Merged updates from network. added=', added, 'total=', merged.length);
        if (onDataReady) onDataReady(merged);
        return merged;
        
      } catch (innerErr) {
        // Update fetch failed - use stale cache
        console.warn('Update fetch failed, using cached data', innerErr);
        if (onStatusUpdate) {
          onStatusUpdate({ 
            source: 'indexeddb-stale', 
            idbTime: idbMs, 
            records: cached.length,
            lastFetched: lastFetched,
            message: `Using cached (stale): ${cached.length} records (idb ${idbMs} ms) | Last updated: ${lastFetched || 'unknown'}`
          });
        }
        if (onDataReady) onDataReady(cached);
        return cached;
      }
    }
    
    // No cached data - fetch initial dataset
    const t2 = performance.now();
    const resp2 = await fetch(DATA_URL);
    const data2 = await resp2.json();
    const fetchMs2 = Math.round(performance.now() - t2);
    
    await idbPut(IDB_KEY, data2);
    await idbPut(IDB_META_KEY, { lastFetched: today });
    
    if (onStatusUpdate) {
      onStatusUpdate({ 
        source: 'network-initial', 
        fetchTime: fetchMs2, 
        records: data2.length,
        lastFetched: today,
        message: `Initial fetch and cached: ${data2.length} records (fetch ${fetchMs2} ms) | Last updated: ${today}`
      });
    }
    console.info('Fetched initial dataset and cached to IDB:', data2.length);
    if (onDataReady) onDataReady(data2);
    return data2;
    
  } catch (err) {
    console.error('Data loading failed', err);
    if (onStatusUpdate) {
      onStatusUpdate({ 
        source: 'error', 
        message: `Error: ${String(err)}`
      });
    }
    throw err;
  }
}

/**
 * Force refresh data from network and update cache
 * @param {Function} onStatusUpdate - Optional callback for status updates
 * @returns {Promise<Array>} The refreshed dataset
 */
async function refreshData(onStatusUpdate) {
  try {
    const t = performance.now();
    const resp = await fetch(DATA_URL);
    const data = await resp.json();
    const fetchMs = Math.round(performance.now() - t);
    
    await idbPut(IDB_KEY, data);
    const etToday = getETDateString();
    await idbPut(IDB_META_KEY, { lastFetched: etToday });
    
    console.info('Fetched and cached dataset to IDB:', data.length);
    if (onStatusUpdate) {
      onStatusUpdate({ 
        source: 'network', 
        fetchTime: fetchMs, 
        records: Array.isArray(data) ? data.length : 0,
        lastFetched: etToday,
        message: `Fetched ${data.length} records (network ${fetchMs} ms) | Last updated: ${etToday}`
      });
    }
    return data;
  } catch (err) {
    console.warn('Refresh failed', err);
    if (onStatusUpdate) {
      onStatusUpdate({ 
        source: 'error', 
        message: String(err)
      });
    }
    throw err;
  }
}

// Export for use in other modules or direct script inclusion
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openDb,
    idbGet,
    idbPut,
    idbDelete,
    getETDateString,
    getYear,
    loadData,
    refreshData,
    IDB_KEY,
    IDB_META_KEY,
    DATA_URL
  };
}
