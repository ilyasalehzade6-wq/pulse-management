const fs = require('fs');
const path = require('path');

console.log("⏳ شروع فرآیند پاک‌سازی...");

// 1. ساخت پوشه پشتیبان (اگر اپ خراب شد، نسخه اصلی را داری)
if (!fs.existsSync('backup')) {
    fs.mkdirSync('backup');
}
fs.copyFileSync('index.html', 'backup/index.html.bak');
console.log("✅ فایل پشتیبان در پوشه backup/ ساخته شد.");

let html = fs.readFileSync('index.html', 'utf8');

// 2. استخراج CSS
const styleRegex = /<style>([\s\S]*?)<\/style>/;
const styleMatch = html.match(styleRegex);
if (styleMatch) {
    fs.writeFileSync('style.css', styleMatch[1].trim());
    html = html.replace(styleRegex, '<link rel="stylesheet" href="style.css">');
    console.log("✅ فایل style.css ساخته شد.");
} else {
    console.log("⚠️ تگ style پیدا نشد.");
}

// 3. استخراج JS (پیدا کردن بزرگترین بلوک اسکریپت که کدهای اصلی توست)
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let biggestMatch = null;
let biggestLength = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1].length > biggestLength) {
        biggestLength = match[1].length;
        biggestMatch = match;
    }
}

if (biggestMatch) {
    fs.writeFileSync('app.js', biggestMatch[1].trim());
    html = html.replace(biggestMatch[0], '<script src="app.js"></script>');
    console.log("✅ فایل app.js ساخته شد.");
} else {
    console.log("⚠️ تگ script پیدا نشد.");
}

// 4. ذخیره فایل HTML جدید
fs.writeFileSync('index.html', html);
console.log("🎉 تمام شد! حالا index.html، style.css و app.js را داری.");
