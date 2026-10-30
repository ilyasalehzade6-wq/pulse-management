const fs = require('fs');

console.log("🔧 در حال تزریق قطعی دکمه تحلیلگر هوشمند به صفحه اصلی...");

let js = fs.readFileSync('app.js', 'utf8');

const injectJS = `
// ============ FORCE INJECT SMART BUTTON ============
setTimeout(() => {
    const grids = document.querySelectorAll('.nimkat-grid');
    // ما می‌خواهیم دکمه را در دومین گرید (ثبت و تحلیل) قرار دهیم
    if (grids.length >= 2) {
        const targetGrid = grids[1]; 
        // چک می‌کنیم که دکمه از قبل وجود نداشته باشد
        if (targetGrid && !document.getElementById('smartAnalyzerBtnCard')) {
            const btnHTML = \`<div class="nimkat-card" id="smartAnalyzerBtnCard" onclick="SmartAnalyzer.open()"><div class="nimkat-icon">🧠</div><div class="nimkat-title">تحلیلگر هوشمند</div></div>\`;
            targetGrid.insertAdjacentHTML('afterbegin', btnHTML);
            console.log('✅ دکمه تحلیلگر هوشمند با موفقیت به صفحه اصلی تزریق شد.');
        }
    }
}, 1000);
`;

if (!js.includes('FORCE INJECT SMART BUTTON')) {
    js += "\n" + injectJS;
}

fs.writeFileSync('app.js', js);

// آپدیت کش
const version = Date.now();
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا Ctrl+F5 بزن.");
