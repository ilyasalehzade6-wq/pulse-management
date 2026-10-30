const fs = require('fs');

console.log("🔧 در حال اصلاح دکمه‌های مودال مطالعه...");

// 1. آپدیت HTML (حذف کلاس‌های مزاحم از دکمه‌ها)
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<button class="btn" id="seSaveBtn"/g, '<button id="seSaveBtn"');
html = html.replace(/<button class="btn" id="seCancelBtn"/g, '<button id="seCancelBtn"');
html = html.replace(/<button class="btn" id="seDeleteBtn"/g, '<button id="seDeleteBtn"');
fs.writeFileSync('index.html', html);

// 2. تزریق CSS دقیق و قفل‌شده
let css = fs.readFileSync('style.css', 'utf8');
const buttonFixCSS = `
/* ============ FIX MODAL BUTTONS ============ */
#studyEditorModal .modal-footer {
    display: flex !important;
    gap: 10px !important;
    align-items: center;
}

#seSaveBtn {
    background: var(--primary) !important;
    color: #ffffff !important;
    border: none !important;
    padding: 14px !important;
    flex: 2 !important; /* دکمه ثبت کمی پهن‌تر باشد */
    font-family: inherit !important;
    font-size: 1rem !important;
    font-weight: 800 !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 15px rgba(0, 150, 136, 0.3) !important;
    cursor: pointer;
    transition: transform 0.2s;
}
#seSaveBtn:active {
    transform: scale(0.96) !important;
}

#seCancelBtn {
    background: transparent !important;
    color: var(--text-light) !important;
    border: 1.5px solid var(--border) !important;
    padding: 14px !important;
    flex: 1 !important;
    font-family: inherit !important;
    font-size: 1rem !important;
    font-weight: 700 !important;
    border-radius: 12px !important;
    cursor: pointer;
    transition: background 0.2s;
}
#seCancelBtn:active {
    background: var(--bg) !important;
}

#seDeleteBtn {
    background: rgba(239, 68, 68, 0.1) !important;
    color: var(--danger) !important;
    border: 1.5px solid rgba(239, 68, 68, 0.3) !important;
    padding: 14px !important;
    flex: 1 !important;
    font-family: inherit !important;
    font-size: 1rem !important;
    font-weight: 800 !important;
    border-radius: 12px !important;
    cursor: pointer;
    transition: all 0.2s;
}
#seDeleteBtn:active {
    background: var(--danger) !important;
    color: #fff !important;
}
`;
fs.writeFileSync('style.css', css + "\n" + buttonFixCSS);

// 3. آپدیت کش
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 دکمه‌ها اصلاح شدند! حالا Ctrl+F5 بزن.");
