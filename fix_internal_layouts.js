const fs = require('fs');

console.log("🔧 در حال بازگرداندن چیدمان گرید و فلکس در صفحات داخلی...");

let css = fs.readFileSync('style.css', 'utf8');

// استایل‌های ضروری که به اشتباه حذف شده بودند
const layoutCSS = `
/* ============ RESTORE INTERNAL LAYOUTS ============ */
.container {
    max-width: 900px !important;
    margin: 0 auto !important;
    padding: 15px !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

/* ساختار کارت‌ها */
.card {
    background: var(--bg-card) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    margin-bottom: 15px !important;
    border: 1px solid var(--border) !important;
    box-shadow: var(--shadow) !important;
}

/* گریدهای دو و سه ستونه (برای آمارها) */
.grid-2 {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
}
.grid-3 {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
}

/* گرید کلاس‌های مدرسه */
.school-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 12px !important;
}
.school-day {
    background: var(--bg) !important;
    border-radius: 12px !important;
    padding: 12px !important;
    border: 1px solid var(--border) !important;
}

/* خط زمان برنامه مطالعه */
.timeline {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin-top: 15px !important;
}
.ti {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 12px !important;
    background: var(--bg-card) !important;
    border-radius: 10px !important;
    border: 1px solid var(--border) !important;
    border-right-width: 4px !important;
    transition: all 0.2s !important;
}
.ti:hover { transform: translateX(-3px) !important; }
.tt {
    font-size: 0.85em !important;
    font-weight: 800 !important;
    color: var(--primary) !important;
    min-width: 85px !important;
    text-align: left !important;
    direction: ltr !important;
}
.tx {
    font-size: 0.95em !important;
    flex: 1 !important;
    font-weight: 500 !important;
}

/* آمارها (stat boxes) */
.stat {
    background: var(--bg-card) !important;
    border-radius: 14px !important;
    padding: 15px 10px !important;
    text-align: center !important;
    border: 1px solid var(--border) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important;
}
.stat-v {
    font-size: 1.6em !important;
    font-weight: 900 !important;
    color: var(--primary) !important;
    margin-bottom: 5px !important;
}
.stat-l {
    font-size: 0.8em !important;
    color: var(--text-light) !important;
    font-weight: 600 !important;
}

/* فرم‌ها */
.inp-row {
    display: flex !important;
    gap: 10px !important;
    margin-bottom: 10px !important;
}
.inp-row > * {
    flex: 1 !important;
}

/* اصلاح دکمه‌های گزارش هفتگی */
.weekly-actions {
    display: flex !important;
    gap: 10px !important;
    margin-bottom: 20px !important;
    flex-wrap: wrap !important;
}
.weekly-actions .btn {
    flex: 1 !important;
    min-width: 140px !important;
}

/* کارت‌های آزمون */
.exam-item {
    background: var(--bg-card) !important;
    border-radius: 12px !important;
    margin: 10px 0 !important;
    border: 1px solid var(--border) !important;
    border-right: 4px solid var(--primary) !important;
    overflow: hidden !important;
}
.exam-head {
    padding: 15px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
}
`;

fs.writeFileSync('style.css', css + "\n" + layoutCSS);
console.log("✅ استایل‌های گرید و فلکس با موفقیت بازگردانده شدند.");

// آپدیت کش
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را با Ctrl+F5 رفرش کن.");
