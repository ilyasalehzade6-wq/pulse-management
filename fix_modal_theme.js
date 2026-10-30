const fs = require('fs');

console.log("🎨 در حال اصلاح تم و رنگ‌بندی مودال مطالعه...");

// ==========================================
// 1. حذف استایل‌های اینلاین تند از HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// پاک کردن رنگ‌های هاردکد شده در هدر و فوتر مودال
html = html.replace(/style="background: #f8f9fa; border-bottom: none; border-radius: 20px 20px 0 0;"/g, 'class="modal-header"');
html = html.replace(/style="color: #333; font-weight: 800; margin:0;"/g, 'style="margin:0;"');
html = html.replace(/style="background:#e2e8f0; border-radius:50%; width:30px; height:30px; display:flex; justify-content:center; align-items:center;"/g, 'class="modal-close"');
html = html.replace(/style="padding: 15px 20px; border-top: none; display: flex; gap: 10px; border-radius: 0 0 20px 20px; background:#f8f9fa;"/g, 'class="modal-footer"');
html = html.replace(/style="background:transparent; color:#666; flex:1; font-weight:700;"/g, 'style="background:transparent; color:var(--text-light); flex:1; font-weight:700;"');
html = html.replace(/style="background:#0ea5e9; color:#fff; flex:1; font-weight:800; border-radius:10px;"/g, 'class="btn btn-primary" style="flex:1; font-weight:800; border-radius:10px;"');

fs.writeFileSync('index.html', html);
console.log("✅ استایل‌های تند از HTML پاک شدند.");

// ==========================================
// 2. افزودن CSS جدید و ملایم
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const newThemeCSS = `
/* ============ SOFT MODAL THEME ============ */
#studyEditorModal .modal-box {
    background: var(--bg-card);
    color: var(--text);
}
#studyEditorModal .modal-header {
    background: var(--bg-card) !important;
    border-bottom: 1px solid var(--border) !important;
    border-radius: 20px 20px 0 0;
    padding: 15px 20px;
}
#studyEditorModal .modal-header h3 {
    color: var(--text) !important;
}
#studyEditorModal .modal-close {
    background: var(--bg) !important;
    color: var(--text) !important;
    border: 1px solid var(--border);
}
#studyEditorModal .modal-footer {
    background: var(--bg-card) !important;
    border-top: 1px solid var(--border) !important;
    border-radius: 0 0 20px 20px;
}

/* دکمه‌های تاریخ */
.se-date-btn {
    flex: 1; padding: 12px; 
    border: 1px solid var(--border); 
    background: var(--bg); /* ملایم */
    border-radius: 10px; font-family: inherit; font-weight: 700; 
    color: var(--text-light); cursor: pointer; transition: 0.2s;
}
.se-date-btn.active { 
    background: var(--primary); 
    color: #fff; 
    border-color: var(--primary); 
    box-shadow: 0 4px 10px rgba(0, 150, 136, 0.2);
}

/* دکمه‌های فعالیت */
.se-act-btn {
    padding: 8px 14px; border-radius: 20px; 
    border: 1px solid var(--border);
    background: var(--bg); /* ملایم */
    font-family: inherit; font-size: 0.85em; font-weight: 700; 
    color: var(--text-light); cursor: pointer; transition: 0.2s;
}
.se-act-btn.active { 
    background: var(--primary); 
    color: #fff; 
    border-color: var(--primary); 
    box-shadow: 0 4px 10px rgba(0, 150, 136, 0.2);
}

/* دکمه‌های میانبر زمان */
.se-quick-times button {
    padding: 6px 12px; border-radius: 8px; 
    border: 1px solid var(--border);
    background: var(--bg); 
    font-family: inherit; font-size: 0.85em; font-weight: 700; 
    color: var(--text); cursor: pointer; transition: 0.2s;
}
.se-quick-times button:hover {
    border-color: var(--primary);
    color: var(--primary);
}

/* فیلدهای ورودی داخل مودال */
#studyEditorModal .inp {
    background: var(--bg) !important;
    border-color: var(--border) !important;
    color: var(--text) !important;
}
#studyEditorModal .inp:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.15) !important;
}

/* رنگ دکمه حذف */
#seDeleteBtn {
    background: rgba(239, 68, 68, 0.1) !important;
    color: var(--danger) !important;
    border: 1px solid rgba(239, 68, 68, 0.3) !important;
}
#seDeleteBtn:hover {
    background: var(--danger) !important;
    color: #fff !important;
}
`;
fs.writeFileSync('style.css', css + "\n" + newThemeCSS);
console.log("✅ استایل‌های ملایم به CSS اضافه شدند.");

// ==========================================
// 3. آپدیت کش مرورگر
// ==========================================
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تم مودال کاملاً ملایم و هماهنگ شد! حالا Ctrl+F5 بزن.");
