const fs = require('fs');

console.log("🚀 در حال اعمال طراحی نهایی، رفع ایموجی‌ها و افزودن توضیحات...");

// ==========================================
// 1. تزریق CSS برای توضیحات کارت‌ها
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const descCSS = `
/* ============ CARD DESCRIPTIONS ============ */
.nimkat-desc {
    font-size: 0.65em;
    color: #9ca3af;
    text-align: center;
    margin-top: 6px;
    line-height: 1.4;
    font-weight: 500;
    padding: 0 4px;
}
[data-theme="dark"] .nimkat-desc { color: #94a3b8; }
`;
if (!css.includes('/* ============ CARD DESCRIPTIONS ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + descCSS);
}

// ==========================================
// 2. بازسازی HTML کارت‌ها و ویجت
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// آیکون‌های SVG
const svg = {
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    tree: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-7l-2-2"/><path d="M12 15l2-2"/><path d="M17 14l-5-5-5 5"/><path d="M19 9l-7-7-7 7"/></svg>',
    trophy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    crosshair: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    pen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    message: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    bookx: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
    barchart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
    brain: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
    trenddown: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    layers: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    target: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    checksquare: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    calendardays: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
    activity: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    flame: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    heartpulse: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>',
    zapoff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="12.41 6.75 13 2 10.57 4.92"/><polyline points="18.57 12.91 21 10 15.66 10"/><polyline points="8 8 3 14 12 14 11 22 16 16"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    stickynote: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>',
    database: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
    lightbulb: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.1 1.5-3.5A6 6 0 0 0 6 8c0 1.5.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    listchecks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>',
    graduationcap: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
};

const makeCard = (onclick, svg, title, desc) => `<div class="nimkat-card" onclick="${onclick}"><div class="nimkat-icon">${svg}</div><div class="nimkat-title">${title}</div><div class="nimkat-desc">${desc}</div></div>`;

const grid1 = [
    makeCard("go('schedule')", svg.calendar, "برنامه هفتگی", "مدیریت زمان و کلاس‌ها"),
    makeCard("go('garden')", svg.tree, "باغ مطالعه", "رشد درختان با تلاش"),
    makeCard("go('league')", svg.trophy, "لیگ مطالعه", "رقابت و ارتقای سطح"),
    makeCard("go('study-plan')", svg.file, "برنامه مطالعاتی", "ثبت و ویرایش جلسات"),
    makeCard("startFocusMode()", svg.crosshair, "حالت تمرکز", "مطالعه بدون حواس‌پرتی"),
    makeCard("go('pomodoro')", svg.clock, "پومودورو", "تایمر ۲۵ دقیقه‌ای"),
    makeCard("go('sessions')", svg.pen, "جلسات مطالعه", "تاریخچه زمان‌های مطالعه"),
    makeCard("go('summary')", svg.message, "خلاصه‌نویسی", "آموزش روش‌های خلاصه"),
    makeCard("go('sourceguide')", svg.book, "راهنمای منبع", "انتخاب بهترین منابع")
];

const grid2 = [
    makeCard("go('mistakes')", svg.bookx, "دفتر اشتباهات", "تحلیل خطاهای درسی"),
    makeCard("go('exam-analysis')", svg.barchart, "تحلیل آزمون", "کارنامه و نمودار درصد"),
    makeCard("go('smart-analyzer-page')", svg.brain, "تحلیلگر هوشمند", "مشاور و آنالیز AI"),
    makeCard("go('weakness')", svg.trenddown, "تحلیل ضعف", "شناسایی نقاط ضعف"),
    makeCard("go('chapters')", svg.book, "پیشرفت کتاب", "درصد خوانده‌شده"),
    makeCard("go('leitner')", svg.layers, "جعبه لایتنر", "مرور فاصله‌دار فلش‌کارت"),
    makeCard("go('goals')", svg.target, "اهداف", "تعیین هدف و پیگیری"),
    makeCard("go('todo')", svg.checksquare, "کارها", "لیست وظایف روزانه"),
    makeCard("go('weekly')", svg.calendar, "گزارش هفتگی", "خلاصه عملکرد هفته"),
    makeCard("go('heatmap')", svg.calendardays, "تقویم مطالعه", "نقشه حرارتی تلاش"),
    makeCard("go('stats')", svg.activity, "آمار کلی", "نمودارهای بلندمدت"),
    makeCard("go('habits')", svg.flame, "عادت‌ها", "ساختن عادات مثبت")
];

const grid3 = [
    makeCard("go('notes-hub')", svg.folder, "جزوه‌ها و فایل‌ها", "آرشیو PDF و عکس"),
    makeCard("go('rules')", svg.star, "قوانین", "قوانین شخصی طلایی"),
    makeCard("go('health')", svg.heartpulse, "خواب و سلامت", "ثبت ساعت خواب"),
    makeCard("go('distraction')", svg.zapoff, "حواس‌پرتی", "شناسایی عوامل حواس‌پرتی"),
    makeCard("go('profile')", svg.user, "پرونده", "اطلاعات و سطح‌سنجی"),
    makeCard("go('notes')", svg.stickynote, "یادداشت‌ها", "دفترچه یادداشت سریع"),
    makeCard("go('backup')", svg.database, "پشتیبان", "بکاپ‌گیری از داده‌ها"),
    makeCard("go('techniques')", svg.lightbulb, "تکنیک‌ها", "روش‌های مطالعه"),
    makeCard("go('checklist')", svg.listchecks, "چک‌لیست", "کارهای روزانه"),
    makeCard("openAssistantManual()", svg.graduationcap, "مشاور", "گفتگو با دستیار"),
    makeCard("go('settings')", svg.settings, "تنظیمات", "شخصی‌سازی برنامه")
];

// تابع قدرتمند برای جایگزینی گریدها بدون به هم ریختن بقیه HTML
function replaceGrid(htmlStr, index, newContent) {
    let searchStr = '<div class="nimkat-grid">';
    let currentIndex = -1;
    for (let i = 0; i <= index; i++) {
        currentIndex = htmlStr.indexOf(searchStr, currentIndex + 1);
    }
    if (currentIndex === -1) return htmlStr;

    let openTags = 1;
    let currentPos = currentIndex + searchStr.length;
    while (openTags > 0 && currentPos < htmlStr.length) {
        let nextOpen = htmlStr.indexOf('<div', currentPos);
        let nextClose = htmlStr.indexOf('</div>', currentPos);
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
            openTags++;
            currentPos = nextOpen + 4;
        } else {
            openTags--;
            currentPos = nextClose + 6;
        }
    }
    return htmlStr.slice(0, currentIndex + searchStr.length) + '\n' + newContent + '\n' + htmlStr.slice(currentPos - 6);
}

// 1. جایگزینی گریدها
html = replaceGrid(html, 0, grid1.join('\n'));
html = replaceGrid(html, 1, grid2.join('\n'));
html = replaceGrid(html, 2, grid3.join('\n'));

// 2. حذف ویجت قدیمی (اگر وجود داشت)
let widgetStart = html.indexOf('<div class="launcher-widget"');
if (widgetStart !== -1) {
    let openTags = 1;
    let currentPos = html.indexOf('>', widgetStart) + 1;
    while (openTags > 0) {
        let nextOpen = html.indexOf('<div', currentPos);
        let nextClose = html.indexOf('</div>', currentPos);
        if (nextOpen !== -1 && nextOpen < nextClose) { openTags++; currentPos = nextOpen + 4; }
        else { openTags--; currentPos = nextClose + 6; }
    }
    html = html.slice(0, widgetStart) + html.slice(currentPos);
}

// 3. تزریق ویجت جدید در بالاترین نقطه داشبورد
const progressWidget = `
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
            <circle class="lw-circle-fill" id="lw-fill" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="264"></circle>
        </svg>
        <div class="lw-circle-text" id="lw-percent">۰٪</div>
    </div>
</div>
`;

html = html.replace(/(<section id="dashboard"[^>]*>)/, '$1\n' + progressWidget);

fs.writeFileSync('index.html', html);

// ==========================================
// 3. آپدیت کش
// ==========================================
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
html = html.replace(/<link rel="stylesheet" href="style\.css.*?">/, '<link rel="stylesheet" href="style.css?v=' + version + '">');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام ایموجی‌ها حذف شدند، توضیحات اضافه شد و ویجت بالا بازگشت! حالا Ctrl+F5 بزن.");
