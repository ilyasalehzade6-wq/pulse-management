const fs = require('fs');

console.log("🚀 در حال تزریق نهایی ویجت و آیکون‌ها با جاوااسکریپت...");

// ==========================================
// 1. تزریق CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const finalCSS = `
/* ============ FINAL INJECTION CSS ============ */
.launcher-widget {
    width: 100% !important;
    background: linear-gradient(145deg, #1c2028, #171423) !important;
    border: 1px solid #2a2e37 !important;
    border-radius: 16px !important;
    padding: 20px !important;
    margin-bottom: 20px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
}
.lw-circle-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.lw-circle-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
.lw-circle-bg { fill: none; stroke: #2a2e37; stroke-width: 8; }
.lw-circle-fill { 
    fill: none; stroke: #8b5cf6; stroke-width: 8; stroke-linecap: round; 
    transition: stroke-dashoffset 1s ease, stroke 0.3s ease; 
}
.lw-circle-text {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-size: 1.2em; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(139,92,246,0.5);
}
`;

if (!css.includes('/* ============ FINAL INJECTION CSS ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + finalCSS);
}

// ==========================================
// 2. تزریق منطق جاوااسکریپت (DOM Manipulation)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const domInjectionJS = `
// ============ ULTIMATE DOM INJECTION ============
setTimeout(() => {
    // --- 1. تزریق ویجت عملکرد امروز ---
    const dashboardContainer = document.querySelector('#dashboard .container');
    if (dashboardContainer && !document.getElementById('launcherWidget')) {
        const widgetHTML = \`
            <div class="launcher-widget" id="launcherWidget" onclick="StudyEditor.open()" style="cursor:pointer;">
                <div class="lw-content">
                    <div class="lw-header" style="color: #fff; font-weight: 800; font-size: 1.1em; margin-bottom: 8px;">عملکرد امروز</div>
                    <div class="lw-meta" style="color: #d1d5db; font-size: 0.95em;">
                        <span>امروز: <b id="lw-hours" style="color: #fff; font-size: 1.2em;">۰.۰</b> ساعت</span>
                        <span style="font-size: 0.85em; color: #9ca3af; margin-top: 4px; display:block;">دیروز: <span id="lw-goal">۰.۰</span> ساعت</span>
                    </div>
                </div>
                <div class="lw-circle-wrap">
                    <svg class="lw-circle-svg" viewBox="0 0 100 100">
                        <circle class="lw-circle-bg" cx="50" cy="50" r="42"></circle>
                        <circle class="lw-circle-fill" id="lw-fill" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="264"></circle>
                    </svg>
                    <div class="lw-circle-text" id="lw-percent">۰٪</div>
                </div>
            </div>
        \`;
        dashboardContainer.insertAdjacentHTML('afterbegin', widgetHTML);
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
    }

    // --- 2. اصلاح آیکون و نام کارت‌ها در بخش «ثبت و تحلیل» ---
    const grids = document.querySelectorAll('#dashboard .nimkat-grid');
    if (grids.length >= 2) {
        const grid2 = grids[1]; // گرید دوم (ثبت و تحلیل)
        const cards = grid2.querySelectorAll('.nimkat-card');
        
        cards.forEach(card => {
            const titleEl = card.querySelector('.nimkat-title');
            const iconEl = card.querySelector('.nimkat-icon');
            if (!titleEl || !iconEl) return;
            
            const titleText = titleEl.innerText.trim();

            // پیدا کردن کارت تحلیلگر هوشمند
            if (titleText.includes('تحلیلگر هوشمند')) {
                // جایگزینی با آیکون مغز SVG
                iconEl.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>\`;
            }

            // پیدا کردن کارت مشاور
            if (titleText === 'مشاور') {
                titleEl.innerText = 'مشاور هوشمند';
                // اطمینان از اینکه آیکون هم SVG است
                iconEl.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>\`;
            }
        });
    }
}, 800); // اجرا ۸۰۰ میلی‌ثانیه بعد از لود شدن صفحه
`;

if (!js.includes('// ============ ULTIMATE DOM INJECTION ============')) {
    js += "\n" + domInjectionJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 3. آپدیت کش
// ==========================================
const version = Date.now();
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
html = html.replace(/<link rel="stylesheet" href="style\.css.*?">/, '<link rel="stylesheet" href="style.css?v=' + version + '">');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تزریق نهایی انجام شد! حالا Ctrl+F5 بزن.");
