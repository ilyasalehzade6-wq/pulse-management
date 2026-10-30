const fs = require('fs');

console.log("🩺 در حال معاینه کامل برنامه (Health Check)...\n");

let score = 0;
let issues = [];

// ==========================================
// 1. بررسی فایل CSS
// ==========================================
console.log("🎨 بررسی فایل style.css:");
try {
    const css = fs.readFileSync('style.css', 'utf8');
    
    // مخفی کردن دکمه پرش به محتوا
    const skipLinkFix = `
.skip-link {
    position: fixed !important;
    top: -100px !important;
    right: 20px !important;
    background: var(--primary) !important;
    color: #fff !important;
    padding: 10px 20px !important;
    border-radius: 0 0 10px 10px !important;
    z-index: 999999 !important;
    transition: top 0.2s !important;
}
.skip-link:focus { top: 0 !important; }
`;
    if (!css.includes('.skip-link:focus')) {
        fs.writeFileSync('style.css', css + "\n" + skipLinkFix);
        console.log("  ✅ دکمه 'پرش به محتوا' با موفقیت مخفی شد.");
    } else {
        console.log("  ✅ استایل 'پرش به محتوا' از قبل درست بود.");
    }

    if (css.includes('.nimkat-grid')) { console.log("  ✅ شبکه کارت‌ها (nimkat-grid) پیدا شد."); score++; }
    else issues.push("استایل شبکه کارت‌ها (nimkat-grid) پیدا نشد.");
    
    if (css.includes('.launcher-widget')) { console.log("  ✅ استایل ویجت عملکرد پیدا شد."); score++; }
    else issues.push("استایل ویجت عملکرد پیدا نشد.");

    if (css.includes('.modal-overlay.active')) { console.log("  ✅ استایل مودال‌ها سالم است."); score++; }
    else issues.push("استایل مودال‌ها مشکل دارد.");

} catch(e) { issues.push("فایل style.css وجود ندارد یا خوانده نمی‌شود."); }

console.log("");

// ==========================================
// 2. بررسی فایل HTML
// ==========================================
console.log("📄 بررسی فایل index.html:");
try {
    const html = fs.readFileSync('index.html', 'utf8');
    
    if (html.includes('<section id="dashboard"')) { console.log("  ✅ صفحه اصلی (Dashboard) وجود دارد."); score++; }
    else issues.push("صفحه اصلی پیدا نشد.");

    if (html.includes('id="studyEditorModal"')) { console.log("  ✅ مودال ثبت مطالعه (StudyEditor) وجود دارد."); score++; }
    else issues.push("مودال ثبت مطالعه پیدا نشد.");

    if (html.includes('id="launcherWidget"')) { console.log("  ✅ ویجت عملکرد امروز وجود دارد."); score++; }
    else issues.push("ویجت عملکرد امروز پیدا نشد.");

    if (html.includes('src="app.js')) { console.log("  ✅ فایل app.js به درستی متصل است."); score++; }
    else issues.push("فایل app.js متصل نیست.");

    if (html.includes('href="style.css')) { console.log("  ✅ فایل style.css به درستی متصل است."); score++; }
    else issues.push("فایل style.css متصل نیست.");

} catch(e) { issues.push("فایل index.html وجود ندارد یا خوانده نمی‌شود."); }

console.log("");

// ==========================================
// 3. بررسی فایل JS
// ==========================================
console.log("🧠 بررسی فایل app.js:");
try {
    const js = fs.readFileSync('app.js', 'utf8');
    
    // بررسی توابع کلیدی
    const funcs = [
        { name: 'go', label: 'ناوبری (go)' },
        { name: 'StudyEditor', label: 'ثبت مطالعه (StudyEditor)' },
        { name: 'GardenPro', label: 'باغ مطالعه (GardenPro)' },
        { name: 'updateLauncherWidget', label: 'آپدیت ویجت' },
        { name: 'JalaliPicker', label: 'تقویم شمسی' }
    ];

    funcs.forEach(f => {
        if (js.includes('window.' + f.name) || js.includes('function ' + f.name)) {
            console.log(`  ✅ تابع ${f.label} تعریف شده است.`);
            score++;
        } else {
            issues.push(`تابع ${f.label} تعریف نشده است.`);
        }
    });

    // بررسی تداخل (آیا تابع go بیشتر از ۲ بار تعریف شده؟)
    const goCount = (js.match(/function go\(/g) || []).length + (js.match(/window\.go = function/g) || []).length;
    if (goCount > 2) {
        issues.push(`تداخل در تابع go! (${goCount} بار تعریف شده است)`);
    } else {
        console.log(`  ✅ تابع go بدون تداخل است.`);
        score++;
    }

} catch(e) { issues.push("فایل app.js وجود ندارد یا خوانده نمی‌شود."); }

console.log("\n==========================================");
console.log("📊 نتیجه نهایی:");
if (issues.length === 0) {
    console.log("🎉 عالی! برنامه کاملاً سالم است و هیچ مشکلی پیدا نشد.");
} else {
    console.log("⚠️ موارد زیر نیاز به بررسی دارند:");
    issues.forEach((iss, i) => console.log(`  ${i+1}. ❌ ${iss}`));
}
console.log("==========================================\n");

// آپدیت کش مرورگر (برای اعمال مخفی شدن دکمه پرش به محتوا)
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("👉 حالا مرورگر را رفرش کن (Ctrl+F5) تا دکمه 'پرش به محتوا' مخفی شود.");
