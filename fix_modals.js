const fs = require('fs');

console.log("🔧 در حال اصلاح ساختار شناور (Modals) و رفع به‌هم‌ریختگی صفحه...");

let css = fs.readFileSync('style.css', 'utf8');

// کدهای CSS قدرتمند برای اجبار مودال‌ها به حالت شناور و تمام‌صفحه
const fixCSS = `
/* ============ FORCE MODALS TO FIXED OVERLAY ============ */
.focus-mode,
.mood-modal,
.assistant-overlay,
.guide-overlay,
.modal-overlay,
.wizard-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    background: rgba(15, 23, 42, 0.9) !important; /* پس‌زمینه تیره */
    backdrop-filter: blur(10px) !important;
    margin: 0 !important;
    padding: 20px !important;
    display: none; /* به صورت پیش‌فرض مخفی */
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}

/* وقتی کلاس active اضافه شد، نمایش داده شود */
.focus-mode.active,
.mood-modal.active,
.assistant-overlay.active,
.guide-overlay.active,
.modal-overlay.active,
.wizard-overlay.active,
.mood-modal[style*="display: flex"] {
    display: flex !important;
}

/* استایل‌دهی به محتوای داخلی حالت تمرکز */
.focus-mode {
    background: #0f172a !important; /* پس‌زمینه سالید برای تمرکز */
}
.focus-mode h2, .focus-mode .focus-timer {
    color: #fff !important;
    text-align: center !important;
}
.focus-mode .focus-exit {
    position: absolute !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 100000 !important;
}

/* اصلاح مودال‌ها (جعبه‌های وسط صفحه) */
.modal-box, .assistant-modal, .guide-modal, .wizard-modal, .mood-modal > div {
    position: relative !important;
    background: var(--bg-card) !important;
    border-radius: 20px !important;
    margin: auto !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
}

/* اصلاح چیدمان داخلی حالت ذهنی */
.mood-modal > div {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
}

/* جلوگیری از اسکرول شدن پس‌زمینه وقتی مودال باز است */
body.modal-open {
    overflow: hidden !important;
}
`;

fs.writeFileSync('style.css', css + "\n" + fixCSS);
console.log("✅ استایل‌های مودال‌ها با موفقیت اصلاح شدند.");

// آپدیت کش مرورگر
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا برنامه را در مرورگر (localhost:3000) با Ctrl+F5 رفرش کن.");
