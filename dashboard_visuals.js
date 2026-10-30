const fs = require('fs');

console.log("✨ در حال اعمال جلوه‌های بصری و پویایی به داشبورد...");

// ==========================================
// 1. تغییرات HTML (بازسازی ویجت عملکرد امروز)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const newWidgetHTML = `
    <div class="launcher-widget" id="launcherWidget" onclick="StudyEditor.open()" style="cursor:pointer;">
        <div class="lw-content">
            <div class="lw-header"><span>عملکرد امروز</span></div>
            <div class="lw-meta">
                <span>امروز: <b id="lw-hours">۰.۰</b> ساعت</span>
                <span style="font-size: 0.85em; color: #9ca3af; margin-top: 4px; display:block;">دیروز: <span id="lw-goal">۰.۰</span> ساعت</span>
            </div>
        </div>
        <div class="lw-circle-wrap">
            <svg class="lw-circle-svg" viewBox="0 0 100 100">
                <circle class="lw-circle-bg" cx="50" cy="50" r="42"></circle>
                <!-- 264 is the circumference for r=42 -->
                <circle class="lw-circle-fill" id="lw-fill" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="264"></circle>
            </svg>
            <div class="lw-circle-text" id="lw-percent">۰٪</div>
        </div>
    </div>
`;

// پیدا کردن ویجت قدیمی و جایگزینی با ویجت دایره‌ای جدید
const oldWidgetStart = html.indexOf('<div class="launcher-widget"');
if (oldWidgetStart !== -1) {
    const oldWidgetEnd = html.indexOf('</div>', html.indexOf('lw-meta', oldWidgetStart)) + 6; 
    // پیدا کردن دقیق بسته شدن تگ اصلی
    const endPattern = '</div>';
    let openTags = 1;
    let currentPos = html.indexOf('>', oldWidgetStart) + 1;
    while (openTags > 0 && currentPos < html.length) {
        const nextOpen = html.indexOf('<div', currentPos);
        const nextClose = html.indexOf('</div>', currentPos);
        if (nextOpen !== -1 && nextOpen < nextClose) {
            openTags++;
            currentPos = nextOpen + 4;
        } else {
            openTags--;
            currentPos = nextClose + 6;
        }
    }
    html = html.slice(0, oldWidgetStart) + newWidgetHTML + html.slice(currentPos);
}

fs.writeFileSync('index.html', html);

// ==========================================
// 2. تزریق CSS جدید
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const visualCSS = `
/* ============ DASHBOARD DYNAMIC VISUALS ============ */

/* 1. هاله نور پس‌زمینه */
#dashboard {
    position: relative;
}
#dashboard::before {
    content: ''; position: absolute;
    top: -100px; left: 50%; transform: translateX(-50%);
    width: 80%; height: 400px;
    background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0) 70%);
    pointer-events: none; z-index: 0;
}

/* 2. گرادیانت تیره برای کارت‌ها */
.nimkat-card, .launcher-widget {
    background: linear-gradient(145deg, #1c2028, #13161b) !important;
    border: 1px solid #2a2e37 !important;
    position: relative; z-index: 1;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
}

/* 3. افکت Hover کارت‌ها */
.nimkat-card {
    transition: all 0.25s ease !important;
}
.nimkat-card:hover {
    border-color: #8b5cf6 !important;
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15) !important;
    transform: translateY(-2px) !important;
}

/* 4. آیکون‌های دایره‌ای */
.nimkat-icon {
    width: 50px !important; height: 50px !important;
    border-radius: 50% !important;
    background: rgba(139, 92, 246, 0.08) !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    margin: 0 auto 12px auto !important;
    transition: all 0.3s ease !important;
    color: #a78bfa !important;
}
.nimkat-card:hover .nimkat-icon {
    background: rgba(139, 92, 246, 0.2) !important;
    transform: scale(1.1) !important;
    color: #c4b5fd !important;
}

/* 5. ویجت عملکرد امروز (دایره‌ای) */
.launcher-widget {
    background: linear-gradient(145deg, #1c2028, #171423) !important; /* گرادیانت با کمی بنفش */
    display: flex !important; align-items: center !important; justify-content: space-between !important;
    padding: 24px 30px !important;
    border-radius: 20px !important;
}
.lw-content { flex: 1; }
.lw-header { color: #fff !important; font-weight: 800; font-size: 1.15em; margin-bottom: 8px !important; }
.lw-meta { color: #d1d5db !important; font-size: 0.95em !important; display: flex; flex-direction: column; gap: 4px; }
.lw-meta b { color: #fff !important; font-size: 1.2em; }

.lw-circle-wrap { position: relative; width: 90px; height: 90px; }
.lw-circle-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
.lw-circle-bg { fill: none; stroke: #2a2e37; stroke-width: 8; }
.lw-circle-fill { 
    fill: none; stroke: #8b5cf6; stroke-width: 8; stroke-linecap: round; 
    transition: stroke-dashoffset 1s ease, stroke 0.3s ease; 
}
.lw-circle-text {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-size: 1.3em; font-weight: 900; color: #fff;
    text-shadow: 0 0 10px rgba(139,92,246,0.5);
}
`;

if (!css.includes('/* ============ DASHBOARD DYNAMIC VISUALS ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + visualCSS);
}

// ==========================================
// 3. اصلاح جاوااسکریپت (محاسبه زاویه دایره)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const circleWidgetJS = `
function updateLauncherWidget() {
    const widget = document.getElementById('launcherWidget');
    if (!widget) return;
    const log = getData('ilia-log', []);
    const t = today();
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yesterday = localDate(d);
    const todayHours = log.filter(e => e.date === t).reduce((s,e) => s + e.hours, 0);
    const yesterdayHours = log.filter(e => e.date === yesterday).reduce((s,e) => s + e.hours, 0);
    
    let pct = 0;
    if (yesterdayHours > 0) pct = Math.min(100, Math.round((todayHours / yesterdayHours) * 100));
    else pct = todayHours > 0 ? 100 : 0;
    
    const elPct = document.getElementById('lw-percent');
    const elHours = document.getElementById('lw-hours');
    const elGoal = document.getElementById('lw-goal');
    const elFill = document.getElementById('lw-fill');
    
    if (elPct) elPct.textContent = fa(pct) + '٪';
    if (elHours) elHours.textContent = fa(todayHours.toFixed(1));
    if (elGoal) elGoal.textContent = fa(yesterdayHours.toFixed(1));
    
    if (elFill) {
        // شعاع 42 است، محیط = 2 * 3.14 * 42 = 263.89 (حدود 264)
        const circumference = 264;
        const offset = circumference - (pct / 100) * circumference;
        elFill.style.strokeDashoffset = offset;
        
        // تغییر رنگ دایره
        if (pct === 0) elFill.style.stroke = '#4b5563'; // خاکستری
        else if (pct < 50) elFill.style.stroke = '#ef4444'; // قرمز
        else if (pct < 75) elFill.style.stroke = '#f59e0b'; // نارنجی
        else elFill.style.stroke = '#10b981'; // سبز
    }
}
setTimeout(updateLauncherWidget, 1000);
setInterval(updateLauncherWidget, 60000);
`;

const oldWidgetRegex = /function updateLauncherWidget\(\) \{[\s\S]*?setInterval\(updateLauncherWidget, 60000\);/;
if (js.match(oldWidgetRegex)) {
    js = js.replace(oldWidgetRegex, circleWidgetJS);
} else {
    js += "\n" + circleWidgetJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش
// ==========================================
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
html = html.replace(/<link rel="stylesheet" href="style\.css.*?">/, '<link rel="stylesheet" href="style.css?v=' + version + '">');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 جلوه‌های بصری داشبورد اعمال شد! حالا Ctrl+F5 بزن.");
