const fs = require('fs');

console.log("🧠 در حال اضافه کردن دکمه تحلیلگر هوشمند به صفحه اصلی...");

let html = fs.readFileSync('index.html', 'utf8');

// اضافه کردن دکمه به شبکه اصلی (کنار دکمه تحلیل ضعف)
const smartBtn = `<div class="nimkat-card" onclick="SmartAnalyzer.open()"><div class="nimkat-icon">🧠</div><div class="nimkat-title">تحلیلگر هوشمند</div></div>`;

if (!html.includes('onclick="SmartAnalyzer.open()"')) {
    // قرار دادن دکمه دقیقاً قبل از دکمه "تحلیل ضعف"
    html = html.replace('<div class="nimkat-card" onclick="go(\'weakness\')">', smartBtn + '\n<div class="nimkat-card" onclick="go(\'weakness\')">');
    console.log("✅ دکمه به صفحه اصلی اضافه شد.");
}

fs.writeFileSync('index.html', html);

// آپدیت کش برای اعمال فوری
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 حالا در صفحه اصلی دکمه مغز رو می‌بینی! Ctrl+F5 بزن.");
