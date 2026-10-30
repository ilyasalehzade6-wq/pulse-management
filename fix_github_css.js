const fs = require('fs');

console.log("🌐 در حال آماده‌سازی فایل‌ها برای آپلود نهایی به گیت‌هاب...");

let html = fs.readFileSync('index.html', 'utf8');

// 1. اضافه کردن نسخه (Version) به لینک CSS برای شکستن کش
const version = Date.now();
html = html.replace(/<link rel="stylesheet" href="style\.css.*?">/, '<link rel="stylesheet" href="style.css?v=' + version + '">');

// 2. شکستن کش فایل JS هم برای اطمینان
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');

fs.writeFileSync('index.html', html);
console.log("✅ لینک‌های CSS و JS با نسخه جدید آپدیت شدند (کش مرورگر باطل شد).");

// 3. آپدیت فایل Service Worker
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);
console.log("✅ کش Service Worker هم آپدیت شد.");

console.log("🎉 تمام شد! حالا باید فایل‌ها را به گیت‌هاب بفرستی.");
