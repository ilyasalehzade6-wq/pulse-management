const fs = require('fs');

console.log("✨ در حال اعمال جراحی دقیق روی صفحات 'برنامه' و 'گزارش'...");

let css = fs.readFileSync('style.css', 'utf8');

const uiFixCSS = `
/* ==========================================
   SCHEDULE PAGE FIX (برنامه هفتگی)
   ========================================== */
#schedule .week-tabs {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    gap: 6px !important;
    margin-bottom: 20px !important;
    padding: 0 5px !important;
}
#schedule .wd-tab {
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 12px !important;
    padding: 10px 2px !important;
    text-align: center !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    font-size: 0.75em !important;
    font-weight: 700 !important;
    color: var(--text-light) !important;
}
#schedule .wd-tab.active {
    background: var(--primary) !important;
    color: #fff !important;
    border-color: transparent !important;
    box-shadow: 0 4px 10px rgba(0,150,136,0.3) !important;
}
#schedule .wd-tab .wd-name {
    font-size: 1.3em !important;
    margin-bottom: 4px !important;
    display: block !important;
}

/* جدول کلاس‌های مدرسه */
#schedule .school-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
}
#schedule .school-day {
    background: var(--bg) !important;
    border: 1px solid var(--border) !important;
    border-radius: 14px !important;
    padding: 12px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
}
#schedule .school-day.today {
    border-color: var(--primary) !important;
    box-shadow: 0 4px 15px rgba(0,150,136,0.1) !important;
}
#schedule .school-day-name {
    font-size: 0.85em !important;
    font-weight: 800 !important;
    color: var(--primary) !important;
    display: flex !important;
    justify-content: space-between !important;
    border-bottom: 1px dashed var(--border) !important;
    padding-bottom: 8px !important;
}
#schedule .school-classes {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
}
#schedule .school-class {
    background: var(--bg-card) !important;
    padding: 8px 10px !important;
    border-radius: 8px !important;
    font-size: 0.8em !important;
    font-weight: 600 !important;
    border-right: 3px solid var(--info) !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
    cursor: pointer !important;
}
#schedule .school-class.off {
    border-right-color: transparent !important;
    background: transparent !important;
    color: var(--text-light) !important;
    text-align: center !important;
    font-style: italic !important;
    box-shadow: none !important;
}

/* جدول زمان‌بندی مطالعه (تایم‌لاین) */
#schedule .timeline {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin-top: 15px !important;
    padding-right: 10px !important;
    border-right: 2px dashed var(--border) !important;
}
#schedule .ti {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 10px 15px !important;
    background: var(--bg-card) !important;
    border-radius: 12px !important;
    border: 1px solid var(--border) !important;
    border-right: 4px solid var(--info) !important;
    position: relative !important;
}
#schedule .ti.current-item {
    background: rgba(0,150,136,0.05) !important;
    border-color: var(--primary) !important;
}
#schedule .tt {
    font-size: 0.8em !important;
    font-weight: 800 !important;
    color: var(--text-light) !important;
    min-width: 90px !important;
    direction: ltr !important;
    text-align: left !important;
}
#schedule .tx {
    font-size: 0.9em !important;
    font-weight: 600 !important;
    flex: 1 !important;
}

/* ==========================================
   WEEKLY REPORT PAGE FIX (گزارش هفتگی)
   ========================================== */
#weekly .weekly-actions {
    display: flex !important;
    flex-direction: row !important;
    gap: 10px !important;
    margin-bottom: 20px !important;
}
#weekly .weekly-actions .btn {
    flex: 1 !important;
    padding: 12px !important;
    font-size: 0.9em !important;
    border-radius: 12px !important;
}

/* هدر سبز رنگ گزارش */
#weekly .phase-hero {
    background: linear-gradient(135deg, #10b981, #059669) !important;
    border-radius: 20px !important;
    padding: 20px !important;
    color: #fff !important;
    margin-bottom: 20px !important;
    box-shadow: 0 8px 25px rgba(16,185,129,0.3) !important;
}
#weekly .phase-month {
    display: flex !important;
    justify-content: space-between !important;
    font-size: 0.85em !important;
    opacity: 0.9 !important;
    margin-bottom: 10px !important;
}
#weekly .phase-title {
    font-size: 1.3em !important;
    font-weight: 900 !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}

/* آمارهای 4 گانه */
#weekly .grid-2 {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
}
#weekly .stat {
    background: var(--bg-card) !important;
    border-radius: 16px !important;
    padding: 15px !important;
    text-align: center !important;
    border: 1px solid var(--border) !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.02) !important;
}
#weekly .stat-v {
    font-size: 1.8em !important;
    font-weight: 900 !important;
    color: var(--primary) !important;
    margin-bottom: 5px !important;
}
#weekly .stat-l {
    font-size: 0.85em !important;
    color: var(--text-light) !important;
    font-weight: 700 !important;
}

/* کارت اهداف هفتگی */
#weekly .wg-card {
    background: var(--bg-card) !important;
    border-radius: 20px !important;
    padding: 20px !important;
    border: 1px solid var(--border) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important;
    margin-bottom: 20px !important;
}
#weekly .wg-title {
    font-size: 1.1em !important;
    font-weight: 800 !important;
    color: var(--primary) !important;
    margin-bottom: 5px !important;
}
#weekly .wg-sub {
    font-size: 0.8em !important;
    color: var(--text-light) !important;
    margin-bottom: 20px !important;
}
#weekly .wg-rows {
    display: flex !important;
    flex-direction: column !important;
    gap: 15px !important;
    margin-bottom: 20px !important;
}
#weekly .wg-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
}
#weekly .wg-row-head {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    font-size: 0.9em !important;
    font-weight: 700 !important;
}
#weekly .wg-row-head .num {
    color: var(--text-light) !important;
}
#weekly .wg-row-head .num b {
    color: var(--primary) !important;
    font-size: 1.1em !important;
}
#weekly .wg-bar {
    background: var(--bg) !important;
    height: 10px !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    width: 100% !important;
}
#weekly .wg-bar-fill {
    background: linear-gradient(90deg, var(--primary), var(--secondary)) !important;
    height: 100% !important;
    border-radius: 10px !important;
    transition: width 0.5s ease !important;
}
#weekly .wg-actions {
    display: flex !important;
    gap: 10px !important;
}
#weekly .wg-actions .wg-btn {
    flex: 1 !important;
    background: var(--bg) !important;
    border: 1px solid var(--border) !important;
    padding: 10px !important;
    border-radius: 12px !important;
    font-family: inherit !important;
    font-weight: 700 !important;
    color: var(--text) !important;
    cursor: pointer !important;
}
`;

fs.writeFileSync('style.css', css + "\n" + uiFixCSS);
console.log("✅ استایل‌های دقیق برای برنامه هفتگی و گزارش اعمال شد.");

// آپدیت کش مرورگر
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را با Ctrl+F5 رفرش کن.");
