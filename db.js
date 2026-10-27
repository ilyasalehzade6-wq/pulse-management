
// ============ IndexedDB Auto-Backup System ============
(function() {
    const DB_NAME = 'IliaStudyDB';
    const STORE_NAME = 'backupStore';
    let db;

    const openReq = indexedDB.open(DB_NAME, 1);
    openReq.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME)) d.createObjectStore(STORE_NAME);
    };
    
    openReq.onsuccess = e => {
        db = e.target.result;
        syncFromDB();
    };

    function syncFromDB() {
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const reqKeys = store.getAllKeys();
        const reqVals = store.getAll();
        
        reqKeys.onsuccess = () => {
            const keys = reqKeys.result;
            reqVals.onsuccess = () => {
                const vals = reqVals.result;
                let restored = false;
                
                // بازگردانی داده‌های از دست رفته از IndexedDB به localStorage
                for (let i = 0; i < keys.length; i++) {
                    if (localStorage.getItem(keys[i]) === null) {
                        localStorage.setItem(keys[i], vals[i]);
                        restored = true;
                    }
                }
                
                if (restored) {
                    console.log('✅ داده‌های از دست رفته از IndexedDB بازیابی شدند. رفرش...');
                    location.reload();
                } else {
                    backupAll(); // پشتیبان‌گیری اولیه
                }
            };
        };
    }

    function backupAll() {
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('ilia-') || key === 'theme') {
                store.put(localStorage.getItem(key), key);
            }
        }
    }

    // Override localStorage.setItem to instantly backup to IndexedDB
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (db && (key.startsWith('ilia-') || key === 'theme')) {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, key);
            } catch(e) {}
        }
    };
    
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
        originalRemoveItem.apply(this, arguments);
        if (db) {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).delete(key);
            } catch(e) {}
        }
    };
})();
