const fs = require('fs');

console.log("🚀 در حال بازسازی کامل و نهایی تمام فایل‌ها...");

// ==========================================
// 1. index.html
// ==========================================
const htmlCode = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#009688">
<title>مرکز مطالعه ایلیا</title>
<link rel="manifest" href="./manifest.json">
<link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png">
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<button class="floating-back-btn" id="globalBackBtn" onclick="go('dashboard')"><span>⬅</span> بازگشت</button>
<button class="ai-fab" onclick="toggleAIChat()" title="مشاور هوشمند">🤖</button>
<button class="wizard-fab" id="fabBtn" onclick="WIZARD.open()" title="ثبت سریع"><span style="font-size:1.5em;font-weight:bold;">+</span></button>

<section id="dashboard" class="active">
    <div class="launcher-widget" id="launcherWidget" onclick="StudyEditor.open()" style="cursor:pointer;">
        <div class="lw-header"><span>📊 عملکرد امروز</span><span id="lw-percent">۰٪</span></div>
        <div class="lw-progress-bg"><div class="lw-progress-fill" id="lw-fill" style="width: 0%"></div></div>
        <div class="lw-meta"><span>امروز: <b id="lw-hours">۰</b> ساعت</span><span>دیروز: <b id="lw-goal">۰</b> ساعت</span></div>
    </div>
    <div class="category-title">📚 برنامه و مطالعه</div>
    <div class="nimkat-grid">
        <div class="nimkat-card" onclick="go('garden')"><div class="nimkat-icon">🌳</div><div class="nimkat-title">باغ مطالعه</div></div>
        <div class="nimkat-card" onclick="go('league')"><div class="nimkat-icon">🏆</div><div class="nimkat-title">لیگ مطالعه</div></div>
        <div class="nimkat-card" onclick="go('schedule')"><div class="nimkat-icon">📅</div><div class="nimkat-title">برنامه هفتگی</div></div>
        <div class="nimkat-card" onclick="go('pomodoro')"><div class="nimkat-icon">⏱</div><div class="nimkat-title">پومودورو</div></div>
        <div class="nimkat-card" onclick="startFocusMode()"><div class="nimkat-icon">🎯</div><div class="nimkat-title">حالت تمرکز</div></div>
        <div class="nimkat-card" onclick="go('sessions')"><div class="nimkat-icon">✍️</div><div class="nimkat-title">جلسات مطالعه</div></div>
        <div class="nimkat-card" onclick="go('mistakes')"><div class="nimkat-icon">📕</div><div class="nimkat-title">دفتر اشتباهات</div></div>
        <div class="nimkat-card" onclick="go('exams')"><div class="nimkat-icon">📊</div><div class="nimkat-title">تحلیل آزمون</div></div>
        <div class="nimkat-card" onclick="go('leitner')"><div class="nimkat-icon">🗂</div><div class="nimkat-title">جعبه لایتنر</div></div>
        <div class="nimkat-card" onclick="go('stats')"><div class="nimkat-icon">📈</div><div class="nimkat-title">آمار کلی</div></div>
        <div class="nimkat-card" onclick="go('settings')"><div class="nimkat-icon">⚙️</div><div class="nimkat-title">تنظیمات</div></div>
        <div class="nimkat-card" onclick="go('backup')"><div class="nimkat-icon">💾</div><div class="nimkat-title">پشتیبان</div></div>
    </div>
</section>

<section id="garden">
    <div class="container" style="padding-top:20px;">
        <h2>🌳 باغ مطالعه‌ی من</h2>
        <div class="week-navigator">
            <button class="wn-btn" onclick="GardenPro.changeWeek(1)">هفته قبل ❯</button>
            <div class="wn-title" id="weekTitle">این هفته</div>
            <button class="wn-btn" onclick="GardenPro.changeWeek(-1)" id="btnNextWeek">❮ هفته بعد</button>
        </div>
        <div class="garden-stats-grid">
            <div class="gs-box"><div class="gs-icon">📅</div><div class="gs-val" id="statDaily">۰</div><div class="gs-label">میانگین روزانه</div></div>
            <div class="gs-box"><div class="gs-icon">📆</div><div class="gs-val" id="statWeekly">۰</div><div class="gs-label">کل هفته</div></div>
            <div class="gs-box"><div class="gs-icon">🗓️</div><div class="gs-val" id="statMonthly">۰</div><div class="gs-label">کل ماه</div></div>
        </div>
        <div class="garden-scene-realistic" id="gardenScene">
            <div class="sky-realistic" id="gardenSky"></div>
            <div class="garden-grid-realistic" id="gardenGridLarge"></div>
            <div class="soil-bed"></div>
        </div>
        <div class="garden-tips"><div class="gt-icon">💡</div><div class="gt-text" id="gardenMessage">...</div></div>
        <div id="gardenTooltip" class="garden-tooltip"></div>
    </div>
</section>

<section id="league">
    <div class="container" style="padding-top:20px;">
        <h2>🏆 لیگ‌های مطالعه</h2>
        <p style="color:var(--text-light); font-size:0.85em; margin-bottom:15px; line-height:1.8;">با افزایش میانگین مطالعه، در لیگ‌های بالاتر قرار می‌گیری!</p>
        <div class="league-tabs">
            <button class="lt-btn active" onclick="GardenPro.switchLeagueTab('weekly', this)">هفتگی</button>
            <button class="lt-btn" onclick="GardenPro.switchLeagueTab('monthly', this)">ماهانه</button>
            <button class="lt-btn" onclick="GardenPro.switchLeagueTab('alltime', this)">کلی</button>
        </div>
        <div class="league-current-card" id="leagueCurrentCard"></div>
        <h3 style="margin-top:20px; font-size:1em; color:var(--text-light);">مسیر پیشرفت لیگ‌ها</h3>
        <div class="league-list" id="leagueList"></div>
    </div>
</section>

<section id="schedule"><div class="container" style="padding-top:20px;"><h2>📅 برنامه هفتگی</h2><div class="card"><h3>🏫 کلاس‌های مدرسه</h3><div class="school-grid" id="schoolGrid"></div></div><div class="week-tabs" id="weekTabs"></div><div id="fullSchedule"></div></div></section>
<section id="pomodoro"><div class="container" style="padding-top:20px;"><h2>⏱ پومودورو</h2><div class="pomodoro"><div class="pomo-modes"><button class="pomo-mode active" data-m="25" onclick="setPom(25,this)">۲۵</button><button class="pomo-mode" data-m="45" onclick="setPom(45,this)">۴۵</button><button class="pomo-mode" data-m="5" onclick="setPom(5,this)">۵ استراحت</button></div><div class="pomodoro-timer" id="pomD">۲۵:۰۰</div><div class="btn-group-3"><button class="btn btn-primary" onclick="startPom()" id="startBtn">▶ شروع</button><button class="btn btn-secondary" onclick="resetPom()">🔄</button><button class="btn btn-info" onclick="startFocusMode()">🎯 تمرکز</button></div><button class="btn btn-success" onclick="start2MinRule()" style="width:100%;margin-top:10px;font-size:0.8em;padding:8px;">🌱 فقط ۵ دقیقه شروع می‌کنم</button><input class="inp" id="pomSubj" placeholder="درس (اختیاری)" style="margin-top:14px;text-align:center"></div></div></section>
<section id="sessions"><div class="container" style="padding-top:20px;"><h2>📝 جلسات مطالعه</h2><div class="card"><input class="inp" id="ssDate" type="text" placeholder="انتخاب تاریخ (پیش‌فرض: امروز)" readonly onclick="JalaliPicker.open(this)"><div class="inp-row"><select class="inp" id="ssSubj"><option>ریاضی</option><option>هندسه</option><option>فیزیک</option><option>شیمی</option><option>عربی</option><option>زبان</option><option>فارسی</option><option>دینی</option><option>جغرافیا</option><option>نگارش</option></select><input class="inp" id="ssMin" type="number" placeholder="دقیقه" min="1" max="300" step="5"></div><input class="inp" id="ssTopic" placeholder="مبحث"><button class="btn btn-success btn-block" onclick="addSession()">➕ ثبت</button></div></div></section>
<section id="mistakes"><div class="container" style="padding-top:20px;"><h2>📕 دفتر اشتباهات</h2><div class="card"><input class="inp" id="mS" placeholder="درس"><input class="inp" id="mQ" placeholder="سوال"><input class="inp" id="mR" placeholder="چرا غلط زدم؟"><button class="btn btn-success btn-block" onclick="addMistake()">➕ ثبت</button></div><div id="mistakesList"></div></div></section>
<section id="exams"><div class="container" style="padding-top:20px;"><h2>📝 تحلیل آزمون‌ها</h2><div class="card"><div class="inp-row"><input class="inp" id="exTitle" placeholder="عنوان"><input class="inp" id="exDate" type="text" placeholder="انتخاب تاریخ (شمسی)" readonly onclick="JalaliPicker.open(this)"></div><div class="inp-row"><input class="inp" id="exTotal" type="number" placeholder="کل" min="1"><input class="inp" id="exCorrect" type="number" placeholder="درست" min="0"></div><div class="inp-row"><input class="inp" id="exWrong" type="number" placeholder="غلط" min="0"><input class="inp" id="exUnanswered" type="number" placeholder="نزده" min="0"></div><input class="inp" id="exSubject" placeholder="درس"><button class="btn btn-success btn-block" onclick="addExam()">➕ ثبت</button></div><div class="grid-2"><div class="stat"><div class="stat-v" id="exAvg">۰</div><div class="stat-l">میانگین %</div></div><div class="stat"><div class="stat-v" id="exCount">۰</div><div class="stat-l">تعداد</div></div></div><div id="examsList"></div></div></section>
<section id="leitner"><div class="container" style="padding-top:20px;"><h2>🗂 جعبه لایتنر</h2><div class="card"><div class="inp-row"><input class="inp" id="lf" placeholder="سوال / لغت"><input class="inp" id="lb" placeholder="پاسخ / معنی"></div><div class="inp-row"><select class="inp" id="leitnerSubject"><option>ریاضی</option><option>فیزیک</option><option>هندسه</option><option>شیمی</option><option>عربی</option><option>زبان</option><option>فارسی</option><option>دینی</option><option>جغرافیا</option><option>نگارش</option></select><button class="btn btn-success" onclick="addLeitner()">➕ اضافه</button></div></div><div class="card"><div style="text-align:center;margin-bottom:10px;"><select class="inp" id="filterLeitnerSubject" onchange="renderLeitner()" style="max-width:200px;margin:0 auto;"><option value="all">همه درس‌ها</option><option>ریاضی</option><option>فیزیک</option><option>هندسه</option><option>شیمی</option><option>عربی</option><option>زبان</option><option>فارسی</option><option>دینی</option><option>جغرافیا</option><option>نگارش</option></select></div><div class="flashcard" id="leitnerCard" onclick="flipLeitner()"><div class="fc-inner"><div class="fc-front" id="lv1">کارتی نیست</div><div class="fc-back" id="lv2">اضافه کن!</div></div></div><div id="leitnerActions" style="margin-top:15px;"><div class="btn-group" id="leitnerMainBtns"><button class="btn btn-danger" onclick="leitnerAnswer(false)">❌ نمی‌دونستم</button><button class="btn btn-success" onclick="leitnerAnswer(true)">✅ می‌دونستم</button></div><div class="btn-group" id="leitnerResultBtns" style="display:none;"><button class="btn btn-info" onclick="editLeitnerCard()">✏️ ویرایش</button><button class="btn btn-primary" onclick="nextLeitnerCard()">بعدی ➡</button></div></div><p style="text-align:center;color:var(--text-light);margin-top:10px;font-size:.82em" id="leitnerCounter"></p></div></div></section>
<section id="stats"><div class="container" style="padding-top:20px;"><h2>📈 آمار</h2><div class="grid-2"><div class="stat"><div class="stat-v" id="tT">۰</div><div class="stat-l">امروز</div></div><div class="stat"><div class="stat-v" id="wT">۰</div><div class="stat-l">هفته</div></div><div class="stat"><div class="stat-v" id="aT">۰</div><div class="stat-l">کل</div></div><div class="stat"><div class="stat-v" id="stT">۰</div><div class="stat-l">پیوسته</div></div></div><div class="card"><h3>📊 نمودار ۷ روز</h3><div class="chart" id="chart"></div></div><div class="card"><h3>📋 گزارش</h3><div id="logList" style="max-height:280px;overflow-y:auto"></div></div></div></section>
<section id="settings"><div class="container" style="padding-top:20px;"><h2>⚙️ تنظیمات</h2><div class="card"><button class="btn btn-primary btn-block" onclick="toggleTheme()">تغییر تم تاریک/روشن</button></div></div></section>
<section id="backup"><div class="container" style="padding-top:20px;"><h2>💾 پشتیبان</h2><button class="btn btn-primary btn-block" onclick="exportData()">⬇️ خروجی</button><input type="file" id="importF" accept=".json" onchange="importData(event)" class="inp" style="margin-top:10px"></div></section>

<div class="guide-overlay" id="guideOverlay" onclick="if(event.target===this)closeGuide()"><div class="guide-modal"><div class="guide-header"><div class="guide-icon" id="guideIcon">📚</div><div style="flex:1"><div class="guide-title" id="guideTitle"></div><div class="guide-sub" id="guideSubtitle"></div></div><button class="guide-close" onclick="closeGuide()">✕</button></div><div class="guide-body" id="guideBody"></div><div class="guide-footer" id="guideFooter"></div></div></div>
<div class="jalali-modal" id="jalaliModal" onclick="if(event.target===this)JalaliPicker.close()"><div class="jalali-box"><div class="jp-header"><button class="jp-nav" onclick="JalaliPicker.prevMonth()">❯</button><span id="jpTitle"></span><button class="jp-nav" onclick="JalaliPicker.nextMonth()">❮</button></div><div class="jp-grid" id="jpGrid"></div></div></div>
<div class="modal-overlay" id="studyEditorModal" onclick="if(event.target===this)StudyEditor.close()"><div class="modal-box"><div class="modal-header"><h3>📝 ثبت / ویرایش مطالعه</h3><button class="modal-close" onclick="StudyEditor.close()">✕</button></div><div class="modal-body"><label>تاریخ ثبت</label><div style="display:flex;gap:8px;align-items:center;margin-bottom:15px;"><button type="button" class="btn btn-secondary" onclick="StudyEditor.changeDate(-1)" style="padding:10px;font-size:1.2em;flex:0 0 auto;border-radius:12px;">❮</button><input type="text" id="editDate" class="inp" readonly onclick="JalaliPicker.open(this)" placeholder="انتخاب تاریخ" style="margin-bottom:0;text-align:center;font-weight:bold;font-size:1.1em;"><button type="button" class="btn btn-secondary" id="btnNextDay" onclick="StudyEditor.changeDate(1)" style="padding:10px;font-size:1.2em;flex:0 0 auto;border-radius:12px;">❯</button></div><label>درس</label><select id="editSubject" class="inp"><option>ریاضی</option><option>فیزیک</option><option>هندسه</option><option>شیمی</option><option>عربی</option><option>زبان</option><option>فارسی</option><option>دینی</option><option>جغرافیا</option><option>نگارش</option><option>مطالعه آزاد</option></select><label>مدت زمان (دقیقه)</label><input type="number" id="editMinutes" class="inp" placeholder="مثلاً ۴۵" min="1"><button class="btn btn-primary btn-block" onclick="StudyEditor.save()" style="margin-top:15px;">💾 ثبت اطلاعات</button></div></div></div>
<div class="focus-mode" id="focusMode"><button class="focus-exit" onclick="exitFocus()">✕ خروج</button><h2 id="focusSubject">حالت تمرکز</h2><div class="focus-timer" id="focusTimer">۲۵:۰۰</div><div class="sound-controls"><button class="sound-btn" onclick="SoundEngine.toggle('rain', this)">🌧️</button><button class="sound-btn" onclick="SoundEngine.toggle('cafe', this)">☕</button><button class="sound-btn" onclick="SoundEngine.toggle('noise', this)">📻</button></div><button class="btn btn-primary" onclick="toggleFocusTimer()" id="focusStartBtn" style="padding:14px 36px;font-size:1em">▶ شروع</button></div>
<div class="toast" id="toast"></div>

<script src="db.js"></script>
<script src="app.js"></script>
</body>
</html>`;
fs.writeFileSync('index.html', htmlCode);
console.log('✅ index.html ساخته شد.');

// ==========================================
// 2. style.css
// ==========================================
const cssCode = `
:root{--primary:#009688;--primary-dark:#00796b;--secondary:#00897b;--accent:#f39c12;--success:#27ae60;--danger:#e74c3c;--info:#3498db;--bg:#f4f6f8;--bg-card:#fff;--text:#2d3748;--text-light:#718096;--border:#e2e8f0;--shadow:0 2px 12px rgba(0,0,0,0.06);--shadow-lg:0 10px 40px rgba(0,0,0,0.12)}
[data-theme="dark"]{--primary:#14b8a6;--primary-dark:#0f766e;--secondary:#0d9488;--accent:#f5b041;--success:#2ecc71;--danger:#ec7063;--info:#5dade2;--bg:#0f172a;--bg-card:#1e293b;--text:#e2e8f0;--text-light:#94a3b8;--border:#334155}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Vazirmatn',sans-serif;background:var(--bg);color:var(--text);line-height:1.7;min-height:100vh;padding:20px}
section{display:none!important;animation:fi .25s}
section.active{display:block!important}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.container{max-width:900px;margin:0 auto;padding:0 15px}
h2{font-size:1.15em;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--primary);color:var(--primary)}
.card{background:var(--bg-card);border-radius:14px;padding:14px;margin-bottom:12px;border:1px solid var(--border);box-shadow:var(--shadow)}
.floating-back-btn{position:fixed;top:20px;left:20px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;border:none;border-radius:50px;padding:12px 20px;font-family:inherit;font-size:.9em;font-weight:800;cursor:pointer;z-index:10000;box-shadow:0 4px 15px rgba(0,150,136,0.4);display:none;align-items:center;gap:8px}
.wizard-fab{display:flex!important;position:fixed;bottom:25px;right:25px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;border:none;box-shadow:0 4px 15px rgba(0,150,136,0.4);z-index:9999;align-items:center;justify-content:center;cursor:pointer;animation:fabPulse 2s infinite}
@keyframes fabPulse{0%{box-shadow:0 0 0 0 rgba(0,150,136,0.5)}70%{box-shadow:0 0 0 12px rgba(0,150,136,0)}100%{box-shadow:0 0 0 0 rgba(0,150,136,0)}}
.ai-fab{position:fixed;bottom:25px;left:25px;width:55px;height:55px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;border:none;font-size:1.5em;box-shadow:0 4px 15px rgba(139,92,246,0.4);z-index:9998;cursor:pointer;display:flex;align-items:center;justify-content:center}
.launcher-widget{background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;margin:15px;padding:18px 20px;border-radius:18px;box-shadow:0 8px 25px rgba(0,150,136,0.35);display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden}
.launcher-widget::before{content:'';position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,0.15),transparent 60%);animation:rot 20s linear infinite}
@keyframes rot{to{transform:rotate(360deg)}}
.lw-header{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;font-weight:800;font-size:1.05em}
.lw-progress-bg{background:rgba(255,255,255,0.25);height:10px;border-radius:10px;overflow:hidden;position:relative;z-index:1}
.lw-progress-fill{height:100%;background:#fff;border-radius:10px;transition:width .8s ease}
.lw-meta{display:flex;justify-content:space-between;font-size:.82em;opacity:.95;position:relative;z-index:1}
.category-title{font-size:1em;font-weight:800;color:var(--text-light);margin:25px 20px 10px;display:flex;align-items:center;gap:8px}
.category-title::after{content:'';flex:1;height:1px;background:var(--border);margin-right:10px}
.nimkat-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:12px!important;padding:20px 15px!important;width:100%!important;box-sizing:border-box!important;max-width:800px!important;margin:0 auto!important}
.nimkat-card{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;background:#fff!important;padding:15px 5px!important;border-radius:14px!important;box-shadow:0 2px 10px rgba(0,0,0,0.05)!important;cursor:pointer!important;aspect-ratio:1/1!important;min-width:0!important;border:1px solid rgba(0,0,0,0.03)!important;transition:transform .1s!important}
.nimkat-card:active{transform:scale(.95)!important}
.nimkat-icon{font-size:2.2em!important;margin-bottom:10px!important;line-height:1!important}
.nimkat-title{font-size:.75em!important;font-weight:800!important;text-align:center!important;color:#334155!important}
[data-theme="dark"] .nimkat-card{background:#1e293b!important;border:1px solid #334155!important}
[data-theme="dark"] .nimkat-title{color:#e2e8f0!important}
.inp{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-card);color:var(--text);font-family:inherit;font-size:.9em;margin-bottom:8px;transition:border-color .15s}
.inp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(0,150,136,0.15)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 18px;border-radius:12px;font-family:inherit;font-size:.86em;font-weight:700;line-height:1;cursor:pointer;border:none;color:#fff;white-space:nowrap;transition:transform .12s;box-shadow:0 2px 6px rgba(0,0,0,0.10)}
.btn:hover{transform:translateY(-1px)}
.btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark))}
.btn-block{width:100%;padding:14px;font-size:.88em}
.btn-secondary{background:var(--bg);color:var(--text);border:1.5px solid var(--border)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.stat{background:var(--bg-card);border-radius:12px;padding:12px 8px;text-align:center;border:1px solid var(--border);box-shadow:var(--shadow)}
.stat-v{font-size:1.4em;font-weight:800;background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-l{font-size:.72em;color:var(--text-light);margin-top:2px}
.pomodoro{text-align:center;padding:22px 14px;background:var(--bg-card);border-radius:16px;box-shadow:var(--shadow);margin-bottom:12px}
.pomodoro-timer{font-size:3.6em;font-weight:900;background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:10px 0;font-variant-numeric:tabular-nums;letter-spacing:2px}
.pomo-modes{display:flex;justify-content:center;gap:6px;margin-bottom:12px}
.pomo-mode{padding:8px 16px;border-radius:20px;background:var(--bg);border:1.5px solid var(--border);cursor:pointer;font-family:inherit;font-size:.82em;font-weight:600;color:var(--text)}
.pomo-mode.active{background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;border-color:transparent}
.flashcard{width:100%;height:200px;margin:12px 0;perspective:1000px;cursor:pointer}
.fc-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}
.flashcard.flipped .fc-inner{transform:rotateY(180deg)}
.fc-front,.fc-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:16px;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;font-weight:700;box-shadow:var(--shadow-lg)}
.fc-front{background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;font-size:1.2em}
.fc-back{transform:rotateY(180deg);background:linear-gradient(135deg,var(--success),#1e8449);color:#fff;font-size:1.05em}
.focus-mode{position:fixed;inset:0;background:#0a0a0a;color:#fff;z-index:9999;display:none;align-items:center;justify-content:center;flex-direction:column;gap:20px;padding:20px}
.focus-mode.active{display:flex}
.focus-timer{font-size:5em;font-weight:900;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:3px}
.focus-exit{position:absolute;top:20px;right:20px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;padding:11px 22px;border-radius:30px;cursor:pointer;font-family:inherit;font-size:.9em;font-weight:700}
.sound-controls{display:flex;justify-content:center;gap:10px;margin:15px 0}
.sound-btn{width:45px;height:45px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);font-size:1.2em;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff}
.sound-btn.active{border-color:var(--primary);background:rgba(0,150,136,0.3);transform:scale(1.1)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px}
.modal-overlay.active{display:flex}
.modal-box{background:var(--bg-card);width:100%;max-width:400px;border-radius:20px;box-shadow:0 15px 40px rgba(0,0,0,0.3);animation:slideUp .3s ease}
@keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-header{padding:15px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.modal-close{background:none;border:none;font-size:1.2em;cursor:pointer;color:var(--text-light)}
.modal-body{padding:20px}
.modal-body label{display:block;font-size:.85em;font-weight:700;margin:10px 0 5px;color:var(--text-light)}
.jalali-modal{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);z-index:99999;display:none;align-items:center;justify-content:center}
.jalali-modal.active{display:flex}
.jalali-box{background:var(--bg-card);width:90%;max-width:340px;border-radius:20px;padding:20px;box-shadow:0 15px 50px rgba(0,0,0,0.3)}
.jp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;font-weight:800;color:var(--primary);font-size:1.1em}
.jp-nav{background:transparent;border:none;font-size:1.2em;cursor:pointer;color:var(--text);width:32px;height:32px;border-radius:50%}
.jp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;text-align:center}
.jp-day-name{font-size:.75em;color:var(--text-light);font-weight:700;margin-bottom:5px}
.jp-day{padding:8px 0;border-radius:8px;cursor:pointer;font-size:.9em;transition:all .2s}
.jp-day:hover{background:var(--bg)}
.jp-day.today{border:1.5px solid var(--primary);color:var(--primary);font-weight:bold}
.jp-day.selected{background:var(--primary);color:#fff;font-weight:bold}
.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(120px);background:var(--text);color:var(--bg);padding:14px 22px;border-radius:24px;font-size:.88em;font-weight:700;z-index:99999;transition:transform .3s;box-shadow:var(--shadow-lg);max-width:90%;text-align:center}
.toast.show{transform:translateX(-50%) translateY(0)}
.garden-scene-realistic{background:linear-gradient(to bottom,#bae6fd 0%,#f0fdf4 70%,#f0fdf4 100%);border-radius:20px;padding:20px 10px 60px 10px;position:relative;box-shadow:inset 0 0 20px rgba(0,0,0,0.05);border:2px solid #bbf7d0;margin-bottom:15px;overflow:hidden;transition:background 1s}
.garden-scene-realistic.night{background:linear-gradient(to bottom,#1e1b4b 0%,#064e3b 70%,#064e3b 100%);border-color:#166534}
.sky-realistic{position:absolute;top:15px;right:20px;font-size:2.5em;z-index:1;filter:drop-shadow(0 0 15px rgba(255,255,255,0.6))}
.soil-bed{position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(to bottom,#065f46,#064e3b);border-top:8px solid #10b981;border-radius:50% 50% 0 0/20px 20px 0 0;z-index:1;box-shadow:inset 0 5px 15px rgba(0,0,0,0.5)}
.garden-grid-realistic{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;position:relative;z-index:2;height:140px;align-items:flex-end}
.svg-plant{width:100%;max-width:60px;height:auto;transition:transform .3s;filter:drop-shadow(0 5px 5px rgba(0,0,0,0.3));transform-origin:bottom center;animation:growPlant 1s ease-out forwards}
@keyframes growPlant{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}
.svg-empty{width:20px;height:10px;background:#064e3b;border-radius:50%;opacity:.6;margin-bottom:5px}
.gd-day-real{position:absolute;bottom:-25px;font-size:.75em;color:#fff;font-weight:bold;text-shadow:0 1px 3px rgba(0,0,0,0.8)}
.gd-hours-real{position:absolute;top:-20px;font-size:.65em;color:#fff;font-weight:800;background:rgba(16,185,129,0.9);padding:2px 6px;border-radius:8px;z-index:3}
.league-tabs{display:flex;gap:8px;margin-bottom:15px;background:var(--bg-card);padding:5px;border-radius:14px;border:1px solid var(--border)}
.lt-btn{flex:1;padding:10px 5px;border:none;background:transparent;border-radius:10px;font-family:inherit;font-size:.85em;font-weight:700;color:var(--text-light);cursor:pointer}
.lt-btn.active{background:var(--primary);color:#fff;box-shadow:0 4px 10px rgba(0,150,136,0.3)}
.league-current-card{background:linear-gradient(135deg,#1e293b,#0f172a);color:#fff;border-radius:20px;padding:25px 20px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3)}
`;
fs.writeFileSync('style.css', cssCode);
console.log('✅ style.css ساخته شد.');

// ==========================================
// 3. app.js
// ==========================================
const appCode = `
const pad2 = n => String(n).padStart(2, '0');
const fa = n => String(n ?? '0').replace(/\\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const getData = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch(e) { return d; } };
const setData = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { return false; } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()); };
const localDate = d => { const dt = d instanceof Date ? d : new Date(d); return dt.getFullYear() + '-' + pad2(dt.getMonth()+1) + '-' + pad2(dt.getDate()); };
function toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('show'), 2500); }

function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334]; let jy = (gy <= 1600) ? 0 : 979; gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy; let days = (365*gy) + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) - 80 + gd + g_d_m[gm-1];
  jy += 33 * Math.floor(days/12053); days %= 12053; jy += 4 * Math.floor(days/1461); days %= 1461;
  if (days > 365) { jy += Math.floor((days-1)/365); days = (days-1)%365; }
  const jm = (days < 186) ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
  const jd = 1 + ((days < 186) ? (days%31) : ((days-186)%30)); return [jy, jm, jd];
}
function jalaliToGregorian(jy, jm, jd) {
  jy += 1595; let days = -355668 + (365*jy) + (Math.floor(jy/33)*8) + Math.floor(((jy%33)+3)/4) + jd + ((jm<7) ? (jm-1)*31 : ((jm-7)*30)+186);
  let gy = 400 * Math.floor(days/146097); days %= 146097; if (days > 36524) { gy += 100 * Math.floor(--days/36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days/1461); days %= 1461; if (days > 365) { gy += Math.floor((days-1)/365); days = (days-1)%365; }
  let gd = days + 1; const sal_a = [0,31,(gy%4===0 && gy%100!==0)||(gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31]; let gm;
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm]; return [gy, gm, gd];
}
function jalaliDaysInMonth(jy, jm) { if (jm <= 6) return 31; if (jm <= 11) return 30; const r = jy % 33; return [1,5,9,13,17,22,26,30].includes(r) ? 30 : 29; }
const JM = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function getShamsi(d) { const dt = d || new Date(); const [jy, jm, jd] = gregorianToJalali(dt.getFullYear(), dt.getMonth()+1, dt.getDate()); return { y: jy, m: jm, d: jd, mn: JM[jm-1] }; }

window.JalaliPicker = {
    cy: 0, cm: 0, ti: null,
    open: function(i) { this.ti = i; const t = getShamsi(); this.cy = t.y; this.cm = t.m; document.getElementById('jalaliModal').classList.add('active'); this.render(); },
    close: function() { document.getElementById('jalaliModal').classList.remove('active'); },
    prevMonth: function() { this.cm--; if (this.cm < 1) { this.cm = 12; this.cy--; } this.render(); },
    nextMonth: function() { this.cm++; if (this.cm > 12) { this.cm = 1; this.cy++; } this.render(); },
    render: function() {
        document.getElementById('jpTitle').textContent = JM[this.cm-1] + ' ' + fa(this.cy);
        const dim = jalaliDaysInMonth(this.cy, this.cm); const fg = jalaliToGregorian(this.cy, this.cm, 1);
        const fd = new Date(fg[0], fg[1]-1, fg[2]); const sdw = (fd.getDay() + 1) % 7;
        let h = ''; ['ش','ی','د','س','چ','پ','ج'].forEach(d => h += '<div class="jp-day-name">' + d + '</div>');
        for (let i = 0; i < sdw; i++) h += '<div class="jp-day empty"></div>';
        const t = getShamsi(); let ss = this.ti ? this.ti.value : '';
        if (this.ti && this.ti.dataset.gregorian) { const gp = this.ti.dataset.gregorian.split('-'); const sh = getShamsi(new Date(gp[0], gp[1]-1, gp[2])); ss = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d); }
        for (let d = 1; d <= dim; d++) {
            let c = 'jp-day'; if (this.cy === t.y && this.cm === t.m && d === t.d) c += ' today';
            const ds = this.cy + '/' + pad2(this.cm) + '/' + pad2(d); if (ss === ds) c += ' selected';
            h += '<div class="' + c + '" onclick="JalaliPicker.select(' + d + ')">' + fa(d) + '</div>';
        }
        document.getElementById('jpGrid').innerHTML = h;
    },
    select: function(d) {
        const js = this.cy + '/' + pad2(this.cm) + '/' + pad2(d);
        if (this.ti) { this.ti.value = js; const g = jalaliToGregorian(this.cy, this.cm, d); const gs = g[0] + '-' + pad2(g[1]) + '-' + pad2(g[2]); this.ti.dataset.gregorian = gs; }
        this.close(); if (this.ti.id === 'editDate') StudyEditor.updateNextButton(this.ti.dataset.gregorian);
    }
};

window.StudyEditor = {
    open: function() { document.getElementById('studyEditorModal').classList.add('active'); const di = document.getElementById('editDate'); const t = today(); di.dataset.gregorian = t; const sh = getShamsi(new Date(t)); di.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d); document.getElementById('editMinutes').value = ''; this.updateNextButton(t); },
    close: function() { document.getElementById('studyEditorModal').classList.remove('active'); },
    changeDate: function(delta) { const di = document.getElementById('editDate'); let cg = di.dataset.gregorian || today(); let d = new Date(cg + 'T00:00:00'); d.setDate(d.getDate() + delta); const ts = today(); const ng = localDate(d); if (ng > ts) return; di.dataset.gregorian = ng; const sh = getShamsi(d); di.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d); this.updateNextButton(ng); },
    updateNextButton: function(gs) { const b = document.getElementById('btnNextDay'); if (b) { if (gs === today()) { b.disabled = true; b.style.opacity = '0.3'; } else { b.disabled = false; b.style.opacity = '1'; } } },
    save: function() { const di = document.getElementById('editDate'); const date = di.dataset.gregorian || today(); const subj = document.getElementById('editSubject').value; const min = parseInt(document.getElementById('editMinutes').value); if (!min || min <= 0) return toast('دقیقه معتبر وارد کنید'); const log = getData('ilia-log', []); log.push({ date, hours: min / 60, subject: subj, ts: Date.now() }); setData('ilia-log', log); this.close(); toast('✅ ثبت شد'); updateLauncherWidget(); if (document.getElementById('garden').classList.contains('active')) GardenPro.renderGarden(); }
};

window.go = function(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById(id); if (!sec) return; sec.classList.add('active');
    const b = document.getElementById('globalBackBtn'); if (b) { b.style.display = id === 'dashboard' ? 'none' : 'flex'; }
    if (id === 'dashboard') updateLauncherWidget(); if (id === 'garden') GardenPro.renderGarden(); if (id === 'league') GardenPro.renderLeaguePage();
};

window.updateLauncherWidget = function() {
    const w = document.getElementById('launcherWidget'); if (!w) return;
    const log = getData('ilia-log', []); const t = today(); const d = new Date(); d.setDate(d.getDate() - 1); const y = localDate(d);
    const th = log.filter(e => e.date === t).reduce((s,e) => s + e.hours, 0); const yh = log.filter(e => e.date === y).reduce((s,e) => s + e.hours, 0);
    let p = 0; if (yh > 0) p = Math.min(100, Math.round((th/yh)*100)); else p = th > 0 ? 100 : 0;
    document.getElementById('lw-percent').textContent = fa(p) + '٪'; document.getElementById('lw-hours').textContent = fa(th.toFixed(1)); document.getElementById('lw-goal').textContent = fa(yh.toFixed(1)); document.getElementById('lw-fill').style.width = p + '%';
};

window.GardenPro = {
    wo: 0, ct: 'weekly',
    lg: [{ n: 'برنز', i: '🥉', m: 0, c: '#cd7f32' }, { n: 'نقره', i: '🥈', m: 1, c: '#c0c0c0' }, { n: 'طلا', i: '🥇', m: 2, c: '#ffd700' }, { n: 'الماس', i: '💎', m: 3, c: '#b9f2ff' }, { n: 'استاد', i: '👑', m: 4, c: '#f59e0b' }, { n: 'افسانه', i: '🌌', m: 5, c: '#8b5cf6' }],
    switchLeagueTab: function(t, b) { this.ct = t; document.querySelectorAll('.lt-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); this.renderLeaguePage(); },
    getLD: function() {
        const l = getData('ilia-log', []); if (l.length === 0) return { a: 0 };
        l.sort((a,b) => a.date.localeCompare(b.date)); const fd = new Date(l[0].date); const td = new Date(today());
        let th = 0, dc = 1;
        if (this.ct === 'weekly') { const s = new Date(); s.setDate(s.getDate()-6); const ss = localDate(s); l.forEach(e => { if (e.date >= ss) th += e.hours; }); dc = 7; }
        else if (this.ct === 'monthly') { const sh = getShamsi(); const mg = jalaliToGregorian(sh.y, sh.m, 1); const ms = localDate(new Date(mg[0], mg[1]-1, mg[2])); l.forEach(e => { if (e.date >= ms) th += e.hours; }); dc = sh.d; }
        else { l.forEach(e => th += e.hours); dc = Math.ceil(Math.abs(td - fd) / (1000*60*60*24)) + 1; if (dc < 1) dc = 1; }
        return { a: th / dc };
    },
    changeWeek: function(d) { this.wo += d; if (this.wo < 0) this.wo = 0; this.renderGarden(); },
    getSvgPlant: function(h) {
        if (h <= 0) return '<div class="svg-empty"></div>';
        if (h > 0 && h < 1) return '<svg class="svg-plant" viewBox="0 0 50 50"><path d="M25,50 Q25,30 25,20" stroke="#4ade80" stroke-width="3" fill="none"/><path d="M25,30 Q15,25 10,35 Q20,35 25,30" fill="#22c55e"/><path d="M25,25 Q35,20 40,30 Q30,30 25,25" fill="#16a34a"/></svg>';
        if (h >= 1 && h < 2) return '<svg class="svg-plant" viewBox="0 0 50 50"><rect x="23" y="25" width="4" height="25" fill="#78350f"/><circle cx="25" cy="20" r="12" fill="#22c55e"/><circle cx="15" cy="25" r="8" fill="#16a34a"/><circle cx="35" cy="25" r="8" fill="#15803d"/></svg>';
        return '<svg class="svg-plant" viewBox="0 0 50 50"><path d="M20,50 L30,50 L28,15 L22,15 Z" fill="#451a03"/><circle cx="25" cy="12" r="18" fill="#22c55e"/><circle cx="10" cy="25" r="14" fill="#16a34a"/><circle cx="40" cy="25" r="14" fill="#15803d"/><circle cx="25" cy="30" r="12" fill="#166534"/><circle cx="15" cy="15" r="3" fill="#ef4444"/><circle cx="35" cy="18" r="3" fill="#ef4444"/><circle cx="20" cy="28" r="3" fill="#ef4444"/><circle cx="30" cy="32" r="3" fill="#ef4444"/></svg>';
    },
    renderGarden: function() {
        const g = document.getElementById('gardenGridLarge'); if (!g) return;
        const l = getData('ilia-log', []); const dn = ['ی','د','س','چ','پ','ج','ش'];
        const now = new Date(); const d = now.getDay(); const diff = (d + 1) % 7;
        const ws = new Date(now); ws.setDate(ws.getDate() - diff - (this.wo * 7)); ws.setHours(0,0,0,0);
        document.getElementById('weekTitle').textContent = this.wo === 0 ? 'این هفته' : (this.wo === 1 ? 'هفته قبل' : this.wo + ' هفته پیش');
        document.getElementById('btnNextWeek').disabled = (this.wo === 0);
        let h = ''; let wth = 0;
        for (let i = 0; i < 7; i++) {
            const dt = new Date(ws); dt.setDate(dt.getDate() + i); const ds = localDate(dt);
            const dl = l.filter(e => e.date === ds); const hrs = dl.reduce((s,e) => s + e.hours, 0); wth += hrs;
            const svg = this.getSvgPlant(hrs);
            h += '<div class="gd-cell-real">' + (hrs > 0 ? '<div class="gd-hours-real">' + fa(hrs.toFixed(1)) + '</div>' : '') + svg + '<div class="gd-day-real">' + dn[dt.getDay()] + '</div></div>';
        }
        g.innerHTML = h;
        if (this.wo === 0) {
            let l7 = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); l7 += l.filter(e => e.date === localDate(d)).reduce((s,e) => s + e.hours, 0); }
            document.getElementById('statDaily').textContent = fa((l7/7).toFixed(1)); document.getElementById('statWeekly').textContent = fa(wth.toFixed(1)); document.getElementById('statMonthly').textContent = fa(l.reduce((s,e) => s + e.hours, 0).toFixed(1));
        } else { document.getElementById('statDaily').textContent = '-'; document.getElementById('statWeekly').textContent = fa(wth.toFixed(1)); document.getElementById('statMonthly').textContent = '-'; }
    },
    renderLeaguePage: function() {
        const { a } = this.getLD(); let ci = 0; for (let i = 0; i < this.lg.length; i++) { if (a >= this.lg[i].m) ci = i; }
        const c = this.lg[ci]; const n = this.lg[ci+1];
        document.getElementById('leagueCurrentCard').innerHTML = '<div style="font-size:3em">' + c.i + '</div><div style="font-size:1.5em;font-weight:bold;color:' + c.c + '">لیگ ' + c.n + '</div><div>میانگین: ' + fa(a.toFixed(2)) + ' ساعت</div>';
        document.getElementById('leagueList').innerHTML = this.lg.map((x,i) => '<div style="padding:10px;border:1px solid #ccc;margin-bottom:5px;border-radius:10px;opacity:' + (i <= ci ? 1 : 0.5) + '">' + x.i + ' لیگ ' + x.n + '</div>').join('');
    }
};

window.startFocusMode = function() { document.getElementById('focusMode').classList.add('active'); };
window.exitFocus = function() { document.getElementById('focusMode').classList.remove('active'); };
window.toggleFocusTimer = function() {};
window.toggleAIChat = function() {};
window.WIZARD = { open: function() {} };
window.setPom = function(m, btn) {}; window.startPom = function() {}; window.resetPom = function() {}; window.start2MinRule = function() {};
window.addSession = function() { toast('این بخش در آپدیت بعدی تکمیل می‌شود'); };
window.addMistake = function() { toast('این بخش در آپدیت بعدی تکمیل می‌شود'); };
window.addExam = function() { toast('این بخش در آپدیت بعدی تکمیل می‌شود'); };
window.addLeitner = function() { toast('این بخش در آپدیت بعدی تکمیل می‌شود'); };
window.flipLeitner = function() {}; window.leitnerAnswer = function() {}; window.nextLeitnerCard = function() {}; window.editLeitnerCard = function() {};
window.renderLeitner = function() {};
window.toggleTheme = function() { document.body.setAttribute('data-theme', document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
window.exportData = function() {}; window.importData = function() {};

setTimeout(updateLauncherWidget, 1000);
`;
fs.writeFileSync('app.js', appCode);
console.log('✅ app.js ساخته شد.');

// ==========================================
// 4. db.js
// ==========================================
const dbCode = `
(function() {
    const DB_NAME = 'IliaStudyDB'; const STORE_NAME = 'backupStore'; let db;
    const openReq = indexedDB.open(DB_NAME, 1);
    openReq.onupgradeneeded = e => { const d = e.target.result; if (!d.objectStoreNames.contains(STORE_NAME)) d.createObjectStore(STORE_NAME); };
    openReq.onsuccess = e => { db = e.target.result; syncFromDB(); };
    function syncFromDB() {
        if (!db) return; const tx = db.transaction(STORE_NAME, 'readonly'); const store = tx.objectStore(STORE_NAME);
        const reqKeys = store.getAllKeys(); const reqVals = store.getAll();
        reqKeys.onsuccess = () => { const keys = reqKeys.result; reqVals.onsuccess = () => { const vals = reqVals.result; let restored = false;
            for (let i = 0; i < keys.length; i++) { if (localStorage.getItem(keys[i]) === null) { localStorage.setItem(keys[i], vals[i]); restored = true; } }
            if (restored) { console.log('✅ بازیابی شد'); location.reload(); } else { backupAll(); } }; };
    }
    function backupAll() { if (!db) return; const tx = db.transaction(STORE_NAME, 'readwrite'); const store = tx.objectStore(STORE_NAME); for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key.startsWith('ilia-')) store.put(localStorage.getItem(key), key); } }
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) { originalSetItem.apply(this, arguments); if (db && key.startsWith('ilia-')) { try { const tx = db.transaction(STORE_NAME, 'readwrite'); tx.objectStore(STORE_NAME).put(value, key); } catch(e) {} } };
})();
`;
fs.writeFileSync('db.js', dbCode);

// ==========================================
// 5. service-worker.js
// ==========================================
const swCode = `
const CACHE_NAME = 'ilia-study-v' + Date.now();
const URLS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './style.css', './app.js', './db.js'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET') return; event.respondWith((async () => { const cache = await caches.open(CACHE_NAME); const cached = await cache.match(event.request); const networkPromise = fetch(event.request).then(response => { if (response && response.status === 200) cache.put(event.request, response.clone()).catch(() => {}); return response; }).catch(() => null); return cached || (await networkPromise) || new Response('Offline', { status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'} }); })()); });
`;
fs.writeFileSync('service-worker.js', swCode);

// ==========================================
// 6. manifest.json
// ==========================================
const manifest = {
    "id": "./", "name": "مرکز مطالعه ایلیا", "short_name": "مطالعه", "description": "برنامه‌ریزی درسی و مشاور تحصیلی — ایلیا صالح‌زاده", "start_url": "./index.html", "scope": "./", "display": "standalone", "orientation": "portrait", "background_color": "#0f172a", "theme_color": "#009688", "lang": "fa", "dir": "rtl",
    "icons": [{ "src": "./icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" }, { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }, { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }]
};
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

console.log("🎉 بازسازی نهایی کامل شد! تمام فایل‌ها با موفقیت ساخته شدند.");