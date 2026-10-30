const fs = require('fs');

console.log("🎨 در حال بازسازی کامل شبکه داشبورد (Grid) به صورت متقارن...");

let css = fs.readFileSync('style.css', 'utf8');

// استایل‌های نهایی که با قدرت تمام قوانین قبلی را باطل می‌کند
const finalGridCSS = `
/* ============ PERFECT LAUNCHER GRID ============ */
#dashboard {
    max-width: 1000px !important;
    margin: 0 auto !important;
    padding: 15px 10px !important;
    display: block !important;
}

/* شبکه اصلی */
.nimkat-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important; /* 3 ستون در موبایل */
    gap: 15px !important;
    margin-bottom: 25px !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

/* در تبلت 4 ستون شود */
@media (min-width: 600px) {
    .nimkat-grid {
        grid-template-columns: repeat(4, 1fr) !important;
    }
}

/* در دسکتاپ 6 ستون شود */
@media (min-width: 900px) {
    .nimkat-grid {
        grid-template-columns: repeat(6, 1fr) !important;
    }
}

/* کارت‌ها */
.nimkat-card {
    background: var(--bg-card) !important;
    border-radius: 16px !important;
    padding: 15px 5px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.04) !important;
    border: 1px solid var(--border) !important;
    cursor: pointer !important;
    transition: transform 0.2s, box-shadow 0.2s !important;
    
    /* حذف محدودیت‌های قبلی و مربعی کردن کارت‌ها */
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    max-height: none !important;
    aspect-ratio: 1 / 1 !important; 
    margin: 0 !important;
    box-sizing: border-box !important;
}

.nimkat-card:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
    border-color: var(--primary) !important;
}

.nimkat-card:active {
    transform: scale(0.95) !important;
}

.nimkat-icon {
    font-size: 2.2em !important;
    line-height: 1 !important;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) !important;
}

.nimkat-title {
    font-size: 0.8em !important;
    font-weight: 800 !important;
    color: var(--text) !important;
    text-align: center !important;
    line-height: 1.4 !important;
}

/* ظاهر تم تاریک برای کارت‌ها */
[data-theme="dark"] .nimkat-card {
    background: #1e293b !important;
    border-color: #334155 !important;
}
[data-theme="dark"] .nimkat-card:hover {
    border-color: var(--primary) !important;
}

/* تنظیم فاصله عنوان دسته‌بندی‌ها */
.category-title {
    margin: 20px 5px 12px !important;
    padding: 0 !important;
    font-size: 1.1em !important;
    font-weight: 800 !important;
    color: var(--text-light) !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}
.category-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
}
`;

fs.writeFileSync('style.css', css + "\n" + finalGridCSS);
console.log("✅ استایل‌های شبکه بی‌نقص اعمال شد.");

// آپدیت کش
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را رفرش کن (Ctrl+F5).");
