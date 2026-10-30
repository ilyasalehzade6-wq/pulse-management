const fs = require('fs');

console.log("💎 در حال اعمال استایل‌های لوکس و پولیش نهایی...");

let css = fs.readFileSync('style.css', 'utf8');

const masterpieceCSS = `
/* ==========================================
   ULTIMATE POLISH & MASTERPIECE UI
   ========================================== */

/* ---------- 1. برنامه هفتگی (Schedule) ---------- */
/* تب‌های روزهای هفته: باریک، مدرن و شیشه‌ای */
#schedule .week-tabs {
    display: flex !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 5px !important;
    margin-bottom: 20px !important;
    scrollbar-width: none !important;
}
#schedule .week-tabs::-webkit-scrollbar { display: none; }
#schedule .wd-tab {
    flex: 1 0 60px !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 12px !important;
    padding: 8px 4px !important;
    text-align: center !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    font-size: 0.8em !important;
    font-weight: 700 !important;
    color: var(--text-light) !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02) !important;
}
#schedule .wd-tab .wd-name {
    font-size: 1.4em !important;
    display: block !important;
    margin-bottom: 2px !important;
    color: var(--text) !important;
}
#schedule .wd-tab.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
    color: #fff !important;
    border-color: transparent !important;
    box-shadow: 0 6px 15px rgba(0,150,136,0.35) !important;
    transform: translateY(-3px) !important;
}
#schedule .wd-tab.active .wd-name { color: #fff !important; }

/* جدول کلاس‌های مدرسه */
#schedule .school-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
    gap: 12px !important;
}
#schedule .school-day {
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 16px !important;
    padding: 15px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02) !important;
    transition: transform 0.2s !important;
}
#schedule .school-day:hover { transform: translateY(-2px) !important; }
#schedule .school-day-name {
    font-size: 0.85em !important;
    font-weight: 800 !important;
    color: var(--primary) !important;
    display: flex !important;
    justify-content: space-between !important;
    border-bottom: 1px dashed var(--border) !important;
    padding-bottom: 8px !important;
}
#schedule .school-class {
    background: var(--bg) !important;
    padding: 10px 12px !important;
    border-radius: 10px !important;
    font-size: 0.85em !important;
    font-weight: 700 !important;
    color: var(--text) !important;
    border-right: 4px solid var(--info) !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}
#schedule .school-class.off {
    border-right-color: transparent !important;
    background: transparent !important;
    color: var(--text-light) !important;
    justify-content: center !important;
    font-weight: 500 !important;
    font-style: italic !important;
}

/* برنامه مطالعه (تایم‌لاین) */
#schedule .timeline {
    position: relative !important;
    padding-right: 20px !important;
    margin-top: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
}
#schedule .timeline::before {
    content: '' !important;
    position: absolute !important;
    top: 10px !important;
    bottom: 10px !important;
    right: 6px !important;
    width: 2px !important;
    background: var(--border) !important;
    z-index: 0 !important;
}
#schedule .ti {
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    gap: 15px !important;
    background: var(--bg-card) !important;
    padding: 12px 15px !important;
    border-radius: 14px !important;
    border: 1px solid var(--border) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02) !important;
    z-index: 1 !important;
    transition: all 0.2s !important;
}
#schedule .ti:hover {
    transform: translateX(-5px) !important;
    border-color: var(--primary) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.05) !important;
}
#schedule .ti .td {
    position: absolute !important;
    right: -20px !important;
    width: 12px !important;
    height: 12px !important;
    border-radius: 50% !important;
    background: var(--bg) !important;
    border: 3px solid var(--border) !important;
    z-index: 2 !important;
}
#schedule .ti.current-item {
    background: linear-gradient(135deg, rgba(0,150,136,0.08), transparent) !important;
    border-color: var(--primary) !important;
}
#schedule .ti.current-item .td {
    border-color: var(--primary) !important;
    background: var(--primary) !important;
    box-shadow: 0 0 10px rgba(0,150,136,0.5) !important;
}
#schedule .ti .tt {
    font-size: 0.85em !important;
    font-weight: 800 !important;
    color: var(--text-light) !important;
    background: var(--bg) !important;
    padding: 4px 10px !important;
    border-radius: 8px !important;
    direction: ltr !important;
    white-space: nowrap !important;
}
#schedule .ti .tx {
    font-size: 0.95em !important;
    font-weight: 600 !important;
    color: var(--text) !important;
    flex: 1 !important;
}

/* ---------- 2. گزارش هفتگی (Weekly Report) ---------- */
#weekly .weekly-actions {
    display: flex !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
}
#weekly .weekly-actions .btn {
    flex: 1 !important;
    padding: 14px !important;
    border-radius: 14px !important;
    font-size: 0.95em !important;
    font-weight: 800 !important;
}

#weekly .phase-hero {
    background: linear-gradient(135deg, #10b981, #047857) !important;
    border-radius: 24px !important;
    padding: 25px !important;
    color: #fff !important;
    margin-bottom: 20px !important;
    box-shadow: 0 10px 30px rgba(16,185,129,0.3) !important;
    position: relative !important;
    overflow: hidden !important;
}
#weekly .phase-hero::after {
    content: '' !important;
    position: absolute !important;
    top: -50% !important; right: -50% !important; width: 200% !important; height: 200% !important;
    background: radial-gradient(circle, rgba(255,255,255,0.2), transparent 60%) !important;
    animation: rot 20s linear infinite !important;
}
#weekly .phase-title {
    font-size: 1.5em !important;
    font-weight: 900 !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    position: relative !important;
    z-index: 1 !important;
}

#weekly .grid-2 {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 15px !important;
    margin-bottom: 20px !important;
}
#weekly .stat {
    background: var(--bg-card) !important;
    border-radius: 20px !important;
    padding: 20px 15px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    border: 1px solid var(--border) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.03) !important;
    position: relative !important;
}
#weekly .stat-v {
    font-size: 2em !important;
    font-weight: 900 !important;
    background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    margin-bottom: 8px !important;
}
#weekly .stat-l {
    font-size: 0.85em !important;
    color: var(--text-light) !important;
    font-weight: 700 !important;
}

#weekly .wg-card {
    background: var(--bg-card) !important;
    border-radius: 20px !important;
    padding: 20px !important;
    border: 1px solid var(--border) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.03) !important;
}
#weekly .wg-title {
    font-size: 1.1em !important;
    font-weight: 900 !important;
    color: var(--text) !important;
    margin-bottom: 5px !important;
}
#weekly .wg-rows { display: flex !important; flex-direction: column !important; gap: 20px !important; margin-top: 20px !important; }
#weekly .wg-row { display: flex !important; flex-direction: column !important; gap: 8px !important; }
#weekly .wg-row-head { display: flex !important; justify-content: space-between !important; font-size: 0.9em !important; font-weight: 800 !important; }
#weekly .wg-row-head .num b { color: var(--primary) !important; font-size: 1.1em !important; }
#weekly .wg-bar { background: var(--bg) !important; height: 12px !important; border-radius: 10px !important; overflow: hidden !important; }
#weekly .wg-bar-fill {
    background: linear-gradient(90deg, var(--primary), var(--secondary)) !important;
    height: 100% !important;
    border-radius: 10px !important;
    position: relative !important;
}
#weekly .wg-bar-fill::after {
    content: '' !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.3)) !important;
}
#weekly .wg-actions { display: flex !important; gap: 10px !important; margin-top: 20px !important; }
#weekly .wg-btn {
    flex: 1 !important; background: var(--bg) !important; border: 1px solid var(--border) !important;
    padding: 12px !important; border-radius: 12px !important; font-family: inherit !important;
    font-weight: 800 !important; color: var(--text) !important; cursor: pointer !important;
    display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;
}
`;

fs.writeFileSync('style.css', css + "\n" + masterpieceCSS);
console.log("✅ استایل‌های لوکس با موفقیت اعمال شدند.");

// آپدیت کش
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را با Ctrl+F5 رفرش کن.");
