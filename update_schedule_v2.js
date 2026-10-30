const fs = require('fs');

console.log("🔄 در حال جابجایی قطعی درس‌ها در تمام نقاط کد...");

let js = fs.readFileSync('app.js', 'utf8');

// 1. جابجایی در روز شنبه (شنبه = 6)
// آمادگی دفاعی را برمی‌داریم و جغرافیا می‌گذاریم
js = js.replace(
    "'آمادگی دفاعی', 'فارسی', 'نگارش', 'شیمی'", 
    "'جغرافیا', 'فارسی', 'نگارش', 'شیمی'"
);
js = js.replace(
    "'دفاعی', 'فارسی', 'نگارش', 'شیمی'", 
    "'جغرافیا', 'فارسی', 'نگارش', 'شیمی'"
);

// 2. جابجایی در روز یکشنبه (یکشنبه = 0)
// جغرافیا را برمی‌داریم و آمادگی دفاعی می‌گذاریم
js = js.replace(
    "'ریاضی', 'تفکر', 'فیزیک', 'جغرافیا'", 
    "'ریاضی', 'تفکر', 'فیزیک', 'آمادگی دفاعی'"
);

fs.writeFileSync('app.js', js);
console.log("✅ برنامه درسی با موفقیت جابجا شد.");

// 3. پاک کردن اجباری کش مرورگر (Service Worker)
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);
console.log("✅ نسخه کش مرورگر آپدیت شد.");

console.log("🎉 تمام شد! حالا حتماً Ctrl+F5 بزن و به برنامه هفتگی برو.");
