const fs = require('fs');

console.log("🌳 در حال ساخت صفحه اختصاصی باغ مطالعه و ارتقای آن...");

// ==========================================
// 1. اصلاح HTML (اضافه کردن دکمه و صفحه باغ)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) حذف باغ قبلی از داشبورد (اگر وجود دارد)
html = html.replace(/<div class="study-garden"[\s\S]*?<\/div>\s*<\/div>/, '');

// ب) اضافه کردن دکمه باغ به شبکه دکمه‌ها (بعد از برنامه هفتگی)
const gardenBtn = `
    <div class="nimkat-card" onclick="go('garden')"><div class="nimkat-icon">🌳</div><div class="nimkat-title">باغ مطالعه</div></div>
    <div class="nimkat-card" onclick="go('schedule')"><div class="nimkat-icon">📅</div><div class="nimkat-title">برنامه هفتگی</div></div>
`;
html = html.replace('<div class="nimkat-card" onclick="go(\'schedule\')"><div class="nimkat-icon">📅</div><div class="nimkat-title">برنامه هفتگی</div></div>', gardenBtn);

// ج) ساخت سکشن اختصاصی برای باغ مطالعه
const gardenSection = `
<section id="garden">
    <div class="container" style="padding-top:20px;">
        <h2>🌳 باغ مطالعه‌ی من</h2>
        <p style="color:var(--text-light); font-size:0.85em; margin-bottom:15px; line-height:1.8;">
            هر روزی که بیشتر تلاش کنی، باغت سرسبزتر میشه. 
            <br>🌱 (کمتر از ۱ ساعت) | 🌿 (۱ تا ۲ ساعت) | 🌻 (۲ تا ۳ ساعت) | 🌳 (بیشتر از ۳ ساعت)
        </p>
        
        <div class="card" style="padding:20px 15px;">
            <div class="garden-stats" id="gardenStats"></div>
            <div class="garden-grid-large" id="gardenGridLarge"></div>
        </div>
        
        <div class="card" style="background:linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05)); border-color:var(--success); text-align:center;">
            <div style="font-size:2em; margin-bottom:10px;">🍃</div>
            <div style="font-weight:800; color:var(--success); margin-bottom:5px;">پیام روز</div>
            <div id="gardenMessage" style="font-size:0.9em; line-height:1.8;">باغت منتظرته...</div>
        </div>
    </div>
</section>
`;

if (!html.includes('<section id="garden">')) {
    html = html.replace('<section id="settings">', gardenSection + '\n<section id="settings">');
}

// د) اصلاح ویجت داشبورد (برگرداندن به حالت مقایسه با دیروز)
html = html.replace('<span>🎯 هدف امروز</span>', '<span>📊 عملکرد امروز</span>');
html = html.replace('<span>خوندی: <b id="lw-hours">۰</b> ساعت</span>', '<span>امروز: <b id="lw-hours">۰</b> ساعت</span>');
html = html.replace('<span>هدف: <b id="lw-goal">۰</b> ساعت</span>', '<span>دیروز: <b id="lw-goal">۰</b> ساعت</span>');

fs.writeFileSync('index.html', html);
console.log("✅ HTML و دکمه باغ مطالعه اضافه شد.");

// ==========================================
// 2. اصلاح CSS (استایل صفحه باغ)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const gardenCSS = `
/* ============ STUDY GARDEN PAGE ============ */
.garden-stats {
    display: flex; justify-content: space-around; text-align: center;
    padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px dashed var(--border);
}
.gs-item { display: flex; flex-direction: column; gap: 5px; }
.gs-val { font-size: 1.4em; font-weight: 900; color: var(--primary); }
.gs-label { font-size: 0.75em; color: var(--text-light); font-weight: 700; }

.garden-grid-large {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;
}
.gd-cell {
    background: var(--bg); border-radius: 12px; padding: 10px 4px;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    border: 1px solid var(--border); position: relative; transition: transform 0.2s;
}
.gd-cell:hover { transform: scale(1.05); }
.gd-cell.today { border-color: var(--primary); background: rgba(0,150,136,0.05); box-shadow: 0 0 10px rgba(0,150,136,0.15); }
.gd-icon { font-size: 1.8em; }
.gd-day { font-size: 0.65em; color: var(--text-light); font-weight: bold; }
.gd-hours { font-size: 0.6em; color: var(--primary); font-weight: 800; }
`;
fs.writeFileSync('style.css', css + "\n" + gardenCSS);

// ==========================================
// 3. اصلاح JS (منطق باغ و ویجت)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// الف) اصلاح ویجت (اگر در نسخه قبلی خراب شده)
const widgetLogic = `
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
    
    const headerEl = widget.querySelector('.lw-header span:first-child');
    if(headerEl && headerEl.textContent.includes('هدف')) headerEl.textContent = '📊 عملکرد امروز';
    
    if (elPct) elPct.textContent = fa(pct) + '٪';
    if (elHours) elHours.textContent = fa(todayHours.toFixed(1));
    if (elGoal) elGoal.textContent = fa(yesterdayHours.toFixed(1));
    if (elFill) elFill.style.fill = pct + '%', elFill.style.width = pct + '%';
    
    if (todayHours > yesterdayHours && todayHours > 0) widget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    else if (todayHours === 0) widget.style.background = 'linear-gradient(135deg, #64748b, #475569)';
    else widget.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
}
setTimeout(updateLauncherWidget, 1000);
setInterval(updateLauncherWidget, 60000);
`;
js = js.replace(/function updateLauncherWidget\(\) \{[\s\S]*?setInterval\(updateLauncherWidget, 60000\);/, widgetLogic);

// ب) منطق جدید باغ مطالعه
const gardenJS = `
window.renderGardenPage = function() {
    const grid = document.getElementById('gardenGridLarge');
    const stats = document.getElementById('gardenStats');
    const msg = document.getElementById('gardenMessage');
    if (!grid || !stats) return;
    
    const log = getData('ilia-log', []);
    const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    
    let html = '';
    let totalTrees = 0, totalFlowers = 0, totalSprouts = 0, activeDays = 0;
    
    // 14 روز اخیر (2 ردیف 7 تایی)
    for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = localDate(d);
        const hours = log.filter(e => e.date === dateStr).reduce((s,e) => s + e.hours, 0);
        
        let icon = '🟫'; // خاک
        if (hours > 0 && hours < 1) { icon = '🌱'; totalSprouts++; activeDays++; }
        else if (hours >= 1 && hours < 2) { icon = '🌿'; activeDays++; }
        else if (hours >= 2 && hours < 3) { icon = '🌻'; totalFlowers++; activeDays++; }
        else if (hours >= 3) { icon = '🌳'; totalTrees++; activeDays++; }
        
        const isToday = i === 0;
        const dayName = dayNames[d.getDay()];
        
        html += \`
            <div class="gd-cell \${isToday ? 'today' : ''}">
                <div class="gd-icon">\${icon}</div>
                <div class="gd-day">\${dayName}</div>
                \${hours > 0 ? \`<div class="gd-hours">\${fa(hours.toFixed(1))}س</div>\` : ''}
            </div>
        \`;
    }
    
    grid.innerHTML = html;
    
    stats.innerHTML = \`
        <div class="gs-item"><div class="gs-val">\${fa(activeDays)}</div><div class="gs-label">روز فعال</div></div>
        <div class="gs-item"><div class="gs-val">\${fa(totalTrees)}</div><div class="gs-label">درخت</div></div>
        <div class="gs-item"><div class="gs-val">\${fa(totalFlowers)}</div><div class="gs-label">گل</div></div>
    \`;
    
    if (activeDays === 0) msg.textContent = 'باغت خشک شده! امروز با ۱۰ دقیقه مطالعه، اولین جوانه رو بکار.';
    else if (totalTrees > 0) msg.textContent = 'چه باغ سرسبزی! تو داری فوق‌العاده پیش میری. 🌳✨';
    else if (totalFlowers > 0) msg.textContent = 'گل‌ها دارن شکوفه میدن. با کمی تلاش بیشتر، درخت هم میکاری! 🌻';
    else msg.textContent = 'جوانه‌ها دارن سبز میشن. مراقبشون باش تا تبدیل به درخت بشن! 🌱';
};

// اتصال به تابع go
if (typeof go !== 'undefined') {
    const originalGo = go;
    window.go = function(id) {
        originalGo(id);
        if (id === 'garden') {
            setTimeout(renderGardenPage, 50);
        }
    };
}

// رندر اولیه در صورت لود مستقیم
setTimeout(() => {
    if (document.getElementById('garden') && document.getElementById('garden').classList.contains('active')) {
        renderGardenPage();
    }
}, 1000);
`;

if (!js.includes('window.renderGardenPage')) {
    js += "\n" + gardenJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 صفحه باغ مطالعه ساخته شد! حالا حتما Ctrl+F5 بزن.");
