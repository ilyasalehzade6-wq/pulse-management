const fs = require('fs');

console.log("🎨 در حال اعمال طراحی SaaS مدرن روی داشبورد اصلی...");

// ==========================================
// 1. تزریق CSS جدید
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const dashboardCSS = `
/* ============ DASHBOARD SAAS DESIGN ============ */
/* 1. حذف دکمه شناور فقط در صفحه داشبورد */
body:has(#dashboard.active) .wizard-fab {
    display: none !important;
}

/* 2. ویجت عملکرد امروز (تیره و مدرن) */
.launcher-widget {
    background: #1a1d24 !important;
    background-image: none !important;
    border: 1px solid #2a2e37 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    animation: none !important; /* حذف انیمیشن چرخش قبلی */
}
.launcher-widget::before { display: none !important; }
.lw-header { color: #fff !important; font-weight: 800; font-size: 1.1em; margin-bottom: 15px !important; }
.lw-progress-bg { background: #2a2e37 !important; height: 8px !important; border-radius: 8px !important; }
.lw-progress-fill { border-radius: 8px !important; transition: width 0.8s ease, background-color 0.3s ease !important; }
.lw-meta { color: #9ca3af !important; font-size: 0.85em !important; margin-top: 12px !important; }
.lw-meta b { color: #fff !important; }

/* 3. عنوان بخش‌ها (بدون ایموجی، با خط ظریف) */
.category-title {
    font-size: 0.95em !important;
    font-weight: 700 !important;
    color: #9ca3af !important;
    margin: 25px 0 15px 0 !important;
    padding-bottom: 8px !important;
    border-bottom: 1px solid #2a2e37 !important;
    display: flex !important;
    align-items: center !important;
}
.category-title::after { display: none !important; } /* حذف خط قبلی */

/* 4. گرید و کارت‌ها (جمع‌وجورتر، تیره‌تر با Hover) */
.nimkat-grid {
    gap: 10px !important; /* کاهش فاصله برای تراکم بیشتر */
}
.nimkat-card {
    background: #1a1d24 !important;
    border: 1px solid #2a2e37 !important;
    border-radius: 14px !important;
    padding: 16px 8px !important; /* کاهش پدینگ */
    box-shadow: none !important;
    transition: all 0.2s ease !important;
}
.nimkat-card:hover {
    border-color: #4b5563 !important;
    transform: translateY(-2px) !important;
    background: #232730 !important;
}
.nimkat-card:active {
    transform: scale(0.96) !important;
}

/* آیکون‌های SVG داخل کارت */
.nimkat-icon {
    font-size: 1.6em !important;
    margin-bottom: 12px !important;
    color: #a78bfa; /* رنگ آیکون‌ها */
    display: flex;
    align-items: center;
    justify-content: center;
}
.nimkat-icon svg {
    width: 26px !important;
    height: 26px !important;
    stroke-width: 1.8 !important;
}
.nimkat-title {
    font-size: 0.8em !important;
    font-weight: 700 !important;
    color: #d1d5db !important;
    text-align: center !important;
    line-height: 1.4 !important;
}

/* اصلاح حالت دارک برای کارت‌ها */
[data-theme="dark"] .nimkat-card { background: #1a1d24 !important; border-color: #2a2e37 !important; }
[data-theme="dark"] .nimkat-card:hover { background: #232730 !important; border-color: #4b5563 !important; }
`;

if (!css.includes('/* ============ DASHBOARD SAAS DESIGN ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + dashboardCSS);
}

// ==========================================
// 2. اصلاح HTML (جایگزینی ایموجی‌ها با SVG)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// آیکون‌های SVG (Lucide Style)
const icons = {
    schedule: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    garden: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2"/><path d="M12 15l2-2"/><path d="M17 14l-5-5-5 5"/><path d="M19 9l-7-7-7 7"/></svg>',
    league: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    studyplan: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    focus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    pomodoro: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    sessions: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    summary: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    sourceguide: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
};

// جایگزینی آیکون‌ها در HTML
html = html.replace(/<div class="nimkat-card" onclick="go\('schedule'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('schedule')"><div class="nimkat-icon">${icons.schedule}</div><div class="nimkat-title">برنامه هفتگی</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('garden'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('garden')"><div class="nimkat-icon">${icons.garden}</div><div class="nimkat-title">باغ مطالعه</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('league'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('league')"><div class="nimkat-icon">${icons.league}</div><div class="nimkat-title">لیگ مطالعه</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('study-plan'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('study-plan')"><div class="nimkat-icon">${icons.studyplan}</div><div class="nimkat-title">برنامه مطالعاتی</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="startFocusMode\(\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="startFocusMode()"><div class="nimkat-icon">${icons.focus}</div><div class="nimkat-title">حالت تمرکز</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('pomodoro'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('pomodoro')"><div class="nimkat-icon">${icons.pomodoro}</div><div class="nimkat-title">پومودورو</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('sessions'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('sessions')"><div class="nimkat-icon">${icons.sessions}</div><div class="nimkat-title">جلسات مطالعه</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('summary'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('summary')"><div class="nimkat-icon">${icons.summary}</div><div class="nimkat-title">خلاصه‌نویسی</div></div>`);
html = html.replace(/<div class="nimkat-card" onclick="go\('sourceguide'\)"><div class="nimkat-icon">.*?<\/div><div class="nimkat-title">.*?<\/div><\/div>/g, `<div class="nimkat-card" onclick="go('sourceguide')"><div class="nimkat-icon">${icons.sourceguide}</div><div class="nimkat-title">راهنمای منبع</div></div>`);

// حذف ایموجی از عنوان‌ها
html = html.replace('<div class="category-title" style="display:flex !important;">📚 برنامه و مطالعه</div>', '<div class="category-title" style="display:flex !important;">برنامه و مطالعه</div>');

// اصلاح ویجت بالای صفحه (حذف ایموجی و استایل قدیمی)
html = html.replace(/<span>📊 عملکرد امروز<\/span>/g, '<span>عملکرد امروز</span>');

fs.writeFileSync('index.html', html);

// ==========================================
// 3. اصلاح جاوااسکریپت (تغییر رنگ نوار پیشرفت)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// پیدا کردن تابع آپدیت ویجت و جایگزینی آن با نسخه رنگی
const widgetRegex = /function updateLauncherWidget\(\) \{[\s\S]*?setInterval\(updateLauncherWidget, 60000\);/;

const newWidgetJS = `
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
    if(headerEl && headerEl.textContent.includes('هدف')) headerEl.textContent = 'عملکرد امروز';
    
    if (elPct) elPct.textContent = fa(pct) + '٪';
    if (elHours) elHours.textContent = fa(todayHours.toFixed(1));
    if (elGoal) elGoal.textContent = fa(yesterdayHours.toFixed(1));
    
    if (elFill) {
        elFill.style.width = pct + '%';
        // تغییر رنگ داینامیک نوار پیشرفت
        if (pct === 0) elFill.style.background = '#4b5563'; // خاکستری
        else if (pct < 50) elFill.style.background = '#ef4444'; // قرمز
        else if (pct < 75) elFill.style.background = '#f59e0b'; // نارنجی
        else elFill.style.background = '#10b981'; // سبز
    }
}
setTimeout(updateLauncherWidget, 1000);
setInterval(updateLauncherWidget, 60000);
`;

if (js.match(widgetRegex)) {
    js = js.replace(widgetRegex, newWidgetJS);
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

console.log("🎉 طراحی داشبورد به استاندارد SaaS ارتقا یافت! حالا Ctrl+F5 بزن.");
