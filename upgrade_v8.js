const fs = require('fs');

console.log("☁️ در حال ارتقای دیتابیس به IndexedDB و افزودن قابلیت ویرایش...");

// ==========================================
// 1. ساخت سیستم پشتیبان‌گیری خودکار IndexedDB
// ==========================================
const dbJS = `
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
`;
fs.writeFileSync('db.js', dbJS);
console.log("✅ فایل db.js (پشتیبان‌گیر IndexedDB) ساخته شد.");

// ==========================================
// 2. متصل کردن db.js به فایل HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('src="db.js"')) {
    html = html.replace('<script src="app.js"></script>', '<script src="db.js"></script>\n<script src="app.js"></script>');
}
fs.writeFileSync('index.html', html);

// ==========================================
// 3. آپدیت Service Worker برای کش کردن db.js
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
if (!sw.includes("'./db.js'")) {
    sw = sw.replace("const URLS = [", "const URLS = [\n  './db.js',");
}
fs.writeFileSync('service-worker.js', sw);

// ==========================================
// 4. اضافه کردن قابلیت ویرایش جلسات گذشته
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const editBtnJS = `
window.editSession = function(id) {
    const sessions = getData(SS_KEY, []);
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    const newMin = prompt('دقیقه مطالعه جدید برای ' + s.topic + ' را وارد کنید:', s.min);
    if (newMin === null) return;
    const val = parseInt(newMin);
    if (isNaN(val) || val <= 0) return toast('عدد معتبر وارد کنید');
    
    const diffMin = val - s.min;
    s.min = val;
    setData(SS_KEY, sessions);
    
    // آپدیت لاگ برای هماهنگی با ویجت‌ها
    const log = getData('ilia-log', []);
    const logEntry = log.find(l => l.date === s.date && l.subject === s.subj && Math.abs(l.hours - (s.min - diffMin)/60) < 0.01);
    if (logEntry) {
        logEntry.hours = val / 60;
        setData('ilia-log', log);
    } else {
        log.push({date: s.date, hours: val/60, subject: s.subj, ts: Date.now()});
        setData('ilia-log', log);
    }
    
    if (typeof refreshAppData === 'function') refreshAppData();
    renderSessions();
    toast('✅ جلسه ویرایش شد');
};
`;

if (!js.includes('window.editSession = function')) {
    js += "\n" + editBtnJS;
}

// تغییر رندر جلسات برای نمایش دکمه ویرایش
js = js.replace(
    '<span class="session-hrs">${fa(s.min)} دقیقه</span></div>',
    '<span class="session-hrs">${fa(s.min)} دقیقه <button class="btn btn-sm btn-secondary" style="margin-right:8px; padding:2px 8px; font-size:0.7em" onclick="editSession(${s.id})">✏️ ویرایش</button></span></div>'
);

fs.writeFileSync('app.js', js);
console.log("🎉 دیتابیس به IndexedDB ارتقا یافت و قابلیت ویرایش جلسات اضافه شد!");
