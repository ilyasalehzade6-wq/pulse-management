const fs = require('fs');

console.log("🔧 در حال رفع تداخل CSS و درست کردن ناوبری صفحات...");

let css = fs.readFileSync('style.css', 'utf8');

// قانون نهایی و قدرتمند برای مخفی کردن هر چیزی که فعال نیست
const fixNavCSS = `
/* ============ ULTIMATE NAVIGATION FIX ============ */
/* 1. مخفی کردن قطعی تمام صفحات به صورت پیش‌فرض */
section {
    display: none !important;
}

/* 2. فقط صفحه‌ای که کلاس active دارد نمایش داده شود */
section.active {
    display: block !important;
}

/* 3. خنثی کردن زورگویی قبلی روی داشبورد */
#dashboard {
    display: none !important;
}
#dashboard.active {
    display: block !important;
}
`;

fs.writeFileSync('style.css', css + "\n" + fixNavCSS);
console.log("✅ قوانین ناوبری در CSS با موفقیت اصلاح شد.");

// آپدیت کش
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را با Ctrl+F5 رفرش کن و تست کن.");
