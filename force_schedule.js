const fs = require('fs');

console.log("🔨 در حال اعمال تغییر قطعی برنامه و شکستن کش مرورگر...");

// 1. جایگزینی قطعی برنامه درسی در app.js
let js = fs.readFileSync('app.js', 'utf8');

const newSchedule = `const SCHOOL_SCHEDULE = { 
  6: ['جغرافیا', 'فارسی', 'نگارش', 'شیمی'], // شنبه
  0: ['ریاضی', 'تفکر', 'فیزیک', 'آمادگی دفاعی'], // یکشنبه
  1: ['دینی', 'شیمی', 'زبان', 'آزمایشگاه'],
  2: ['فیزیک', 'هندسه', 'عربی', 'ریاضی'],
  3: [], // چهارشنبه
  4: [], // پنجشنبه
  5: []  // جمعه
};`;

// پیدا کردن و جایگزینی کل آبجکت SCHOOL_SCHEDULE
js = js.replace(/const SCHOOL_SCHEDULE = \{[\s\S]*?\};/, newSchedule);

fs.writeFileSync('app.js', js);
console.log("✅ برنامه درسی جایگزین شد.");

// 2. اضافه کردن نسخه (Version) به فایل app.js در index.html
let html = fs.readFileSync('index.html', 'utf8');
const version = Date.now();
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);
console.log("✅ نسخه جدید (v=" + version + ") به فایل HTML اضافه شد.");

// 3. پاک کردن کش Service Worker
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);
console.log("✅ کش Service Worker باطل شد.");

console.log("🎉 تمام شد! حالا تغییرات رو به گیت‌هاب بفرست.");
