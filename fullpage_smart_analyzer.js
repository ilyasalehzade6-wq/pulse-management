const fs = require('fs');

console.log("📺 در حال تبدیل تحلیلگر هوشمند به یک صفحه بزرگ و تمام‌عرض...");

// ==========================================
// 1. اصلاح HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) حذف مودال قدیمی
const modalStart = html.indexOf('<div class="modal-overlay" id="smartAnalyzerModal"');
if (modalStart !== -1) {
    const modalEnd = html.indexOf('</div>\n</div>\n</div>', modalStart) + 18;
    if (modalEnd > 18) {
        html = html.slice(0, modalStart) + html.slice(modalEnd);
    }
}

// ب) ساخت سکشن تمام‌صفحه جدید
const fullPageSection = `
<section id="smart-analyzer-page">
    <div class="sa-hero">
        <div class="sa-hero-icon">🧠</div>
        <h2>تحلیلگر هوشمند</h2>
        <p>ارزیابی جامع تمام دروس بر اساس زمان، نمرات، آزمون‌ها و لایتنر</p>
    </div>
    
    <div class="container" style="padding-bottom:100px;">
        <!-- آمار کلی -->
        <div id="saPageSummary" class="sa-page-summary"></div>
        
        <!-- لیست دروس -->
        <div id="saPageList" class="sa-page-list"></div>
    </div>
</section>
`;

if (!html.includes('<section id="smart-analyzer-page">')) {
    html = html.replace('<section id="garden">', fullPageSection + '\n<section id="garden">');
}

// ج) تغییر دکمه صفحه اصلی برای رفتن به این صفحه
html = html.replace(
    '<div class="nimkat-card" id="smartAnalyzerBtnCard" onclick="SmartAnalyzer.open()"><div class="nimkat-icon">🧠</div><div class="nimkat-title">تحلیلگر هوشمند</div></div>',
    '<div class="nimkat-card" id="smartAnalyzerBtnCard" onclick="go(\'smart-analyzer-page\')"><div class="nimkat-icon">🧠</div><div class="nimkat-title">تحلیلگر هوشمند</div></div>'
);

fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS (طراحی صفحه بزرگ)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const pageCSS = `
/* ============ SMART ANALYZER FULL PAGE ============ */
.sa-hero {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #fff; padding: 40px 20px; text-align: center;
    border-radius: 0 0 30px 30px; box-shadow: 0 10px 30px rgba(139,92,246,0.3);
    margin-bottom: 25px; position: relative; overflow: hidden;
}
.sa-hero::before {
    content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1), transparent 60%);
    animation: rot 20s linear infinite; pointer-events: none;
}
.sa-hero-icon { font-size: 3.5em; margin-bottom: 10px; position: relative; z-index: 1; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2)); }
.sa-hero h2 { font-size: 1.6em; margin: 0 0 10px; font-weight: 900; position: relative; z-index: 1; color: #fff; }
.sa-hero p { font-size: 0.9em; opacity: 0.9; margin: 0; position: relative; z-index: 1; }

.sa-page-summary {
    background: var(--bg-card); border-radius: 18px; padding: 20px;
    border: 1px solid var(--border); text-align: center;
    box-shadow: 0 8px 25px rgba(0,0,0,0.05); margin-bottom: 25px;
    border-top: 5px solid var(--primary);
}
.sa-page-summary.critical { border-top-color: var(--danger); }
.sa-page-summary.warning { border-top-color: var(--accent); }
.sa-page-summary.good { border-top-color: var(--success); }

.sa-ps-title { font-size: 1.3em; font-weight: 900; margin-bottom: 8px; }
.sa-ps-text { font-size: 0.95em; color: var(--text-light); line-height: 1.8; }

.sa-page-list { display: flex; flex-direction: column; gap: 20px; }
.sa-page-card {
    background: var(--bg-card); border-radius: 20px; padding: 25px;
    border: 1px solid var(--border); border-right: 6px solid var(--border);
    box-shadow: 0 6px 20px rgba(0,0,0,0.04); position: relative;
}
.sa-page-card.critical { border-right-color: var(--danger); }
.sa-page-card.warning { border-right-color: var(--accent); }
.sa-page-card.good { border-right-color: var(--success); }

.sa-pc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.sa-pc-title { font-size: 1.2em; font-weight: 900; display: flex; align-items: center; gap: 10px; color: var(--text); }
.sa-pc-status { font-size: 0.85em; font-weight: 800; padding: 6px 14px; border-radius: 12px; }
.sa-pc-status.critical { background: rgba(239,68,68,0.15); color: var(--danger); }
.sa-pc-status.warning { background: rgba(245,158,11,0.15); color: var(--accent); }
.sa-pc-status.good { background: rgba(16,185,129,0.15); color: var(--success); }

.sa-pc-issues { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.sa-pc-issues span { background: var(--bg); padding: 6px 12px; border-radius: 10px; font-size: 0.85em; font-weight: 700; border: 1px solid var(--border); color: var(--text); }

.sa-pc-advice {
    background: rgba(139, 92, 246, 0.05); border: 1.5px dashed #8b5cf6;
    border-radius: 14px; padding: 15px 20px; font-size: 0.95em; line-height: 1.8; color: var(--text);
}
.sa-pc-advice b { color: #8b5cf6; font-size: 1.05em; display: block; margin-bottom: 5px; }
`;
fs.writeFileSync('style.css', css + "\n" + pageCSS);

// ==========================================
// 3. منطق جاوااسکریپت (تغییر از مودال به صفحه)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// حذف کدهای قدیمی SmartAnalyzer
const oldSaStart = js.indexOf('window.SmartAnalyzer = {');
if (oldSaStart !== -1) {
    const oldSaEnd = js.indexOf('// ============ FORCE INJECT SMART BUTTON ============', oldSaStart);
    if (oldSaEnd !== -1) {
        js = js.slice(0, oldSaStart) + js.slice(oldSaEnd);
    } else {
        js = js.slice(0, oldSaStart);
    }
}

const fullPageLogic = `
// ============ SMART ANALYZER FULL PAGE ============
window.renderSmartAnalyzerPage = function() {
    const ALL_SUBJECTS = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'دینی', 'جغرافیا', 'نگارش'];
    const logs = getData('ilia-log', []);
    const grades = getData('ilia-grades', []);
    const exams = getData('ilia-exam-analysis', []);
    const leitner = getData('ilia-leitner', []);
    const t = today();
    
    let results = [];
    
    ALL_SUBJECTS.forEach(subj => {
        let issues = [];
        let isCritical = false;
        let isWarning = false;
        let advice = '';
        
        // 1. زمان
        const subjLogs = logs.filter(s => (s.subject || '').includes(subj));
        let daysSince = 999;
        if (subjLogs.length > 0) {
            subjLogs.sort((a,b) => b.date.localeCompare(a.date));
            daysSince = Math.floor((new Date(t + 'T00:00:00') - new Date(subjLogs[0].date + 'T00:00:00')) / 86400000);
            if (daysSince >= 5) { issues.push(\`🚨 \${daysSince} روز نخوندی\`); isCritical = true; }
            else if (daysSince >= 3) { issues.push(\`⚠️ \${daysSince} روز نخوندی\`); isWarning = true; }
        } else {
            issues.push('🚨 هنوز شروع نکردی!'); isCritical = true;
        }
        
        // 2. حجم مطالعه
        const totalHours = subjLogs.reduce((a,b) => a + (b.hours || 0), 0);
        if (totalHours < 1 && subjLogs.length > 0) { issues.push('📉 زمان مطالعه خیلی کم'); isWarning = true; }
        
        // 3. نمرات
        const subjGrades = grades.filter(g => (g.subject || '').includes(subj));
        let gradeAvg = null;
        if (subjGrades.length > 0) {
            gradeAvg = subjGrades.reduce((a,b) => a + b.value, 0) / subjGrades.length;
            if (gradeAvg < 12) { issues.push(\`📉 معدل ضعیف (\${gradeAvg.toFixed(1)})\`); isCritical = true; }
            else if (gradeAvg < 15) { issues.push(\`📊 معدل مرزی (\${gradeAvg.toFixed(1)})\`); isWarning = true; }
        }
        
        // 4. آزمون‌ها
        let eCorrect = 0, eWrong = 0, eTotal = 0;
        exams.forEach(e => {
            let subs = e.subjects || [{ name: e.subject || '', total: e.total, correct: e.correct, wrong: e.wrong }];
            subs.forEach(s => {
                if ((s.name || '').includes(subj)) {
                    eCorrect += s.correct; eWrong += s.wrong; eTotal += s.total;
                }
            });
        });
        
        let examAvg = null;
        if (eTotal > 0) {
            const score = (eCorrect * 3) - eWrong;
            examAvg = Math.round((score / (eTotal * 3)) * 100);
            if(examAvg < 0) examAvg = 0;
            if (examAvg < 30) { issues.push(\`📉 آزمون بحرانی (\${examAvg}٪)\`); isCritical = true; }
            else if (examAvg < 50) { issues.push(\`📊 آزمون ضعیف (\${examAvg}٪)\`); isWarning = true; }
        }
        
        // 5. بازدهی
        if (totalHours > 5 && examAvg !== null && examAvg < 40) {
            issues.push('🔍 مطالعه بی‌بازده');
            advice = '<b>هشدار بازدهی:</b> زمان زیادی برای این درس گذاشتی اما نتیجه‌ی آزمون خوب نبوده. روش مطالعه‌ت رو عوض کن! به جای فقط خوندن، برو سراغ حل تست و تحلیل اشتباهات.';
        }
        
        // 6. لایتنر
        const subjLeitner = leitner.filter(l => (l.subject || '').includes(subj) && (l.box || 1) === 1);
        if (subjLeitner.length > 5) {
            issues.push(\`🗂 \${subjLeitner.length} کارت لایتنر\`);
            isWarning = true;
            if (!advice) advice = '<b>مشکل حافظه:</b> کارت‌های زیادی در جعبه ۱ لایتنر داری. یعنی لغات یا فرمول‌ها رو فراموش کردی. برو بخش لایتنر و این کارت‌ها رو مرور کن.';
        }
        
        if (!advice) {
            if (isCritical) advice = '<b>وضعیت بحرانی:</b> این درس رو باید همین امروز شروع کنی. حداقل ۳۰ دقیقه زمان بده و از مباحث ساده شروع کن.';
            else if (isWarning) advice = '<b>نیاز به توجه:</b> عقب‌نموندی رو جبران کن. یک بلوک ۴۰ دقیقه‌ای برای این درس در برنامه‌ت بذار.';
        }
        
        if (issues.length > 0) {
            results.push({ subj, issues, advice, status: isCritical ? 'critical' : (isWarning ? 'warning' : 'good') });
        }
    });
    
    results.sort((a,b) => {
        const s = { critical: 1, warning: 2, good: 3 };
        return s[a.status] - s[b.status];
    });
    
    const list = document.getElementById('saPageList');
    const summary = document.getElementById('saPageSummary');
    
    if (!list || !summary) return;
    
    if (results.length === 0) {
        summary.className = 'sa-page-summary good';
        summary.innerHTML = '<div class="sa-ps-title" style="color:var(--success)">✅ عالی!</div><div class="sa-ps-text">طبق تحلیل هوشمند، در هیچ درسی مشکل جدی نداری. داری عالی پیش می‌ری!</div>';
        list.innerHTML = '';
        return;
    }
    
    const criticalCount = results.filter(r => r.status === 'critical').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    summary.className = 'sa-page-summary ' + (criticalCount > 0 ? 'critical' : 'warning');
    summary.innerHTML = \`
        <div class="sa-ps-title" style="color:\${criticalCount > 0 ? 'var(--danger)' : 'var(--accent)'}">
            \${criticalCount > 0 ? '🚨 ' + fa(criticalCount) + ' درس بحرانی' : '⚠️ نیاز به توجه'}
        </div>
        <div class="sa-ps-text">تحلیلگر هوشمند داده‌های تو را بررسی کرد. <b>\${fa(warningCount)}</b> درس دیگر هم نیاز به توجه دارند.</div>
    \`;
    
    list.innerHTML = results.map(r => {
        const icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[r.subj]) ? SUBJECT_ICONS[r.subj] : '📚';
        const statusLabel = r.status === 'critical' ? '🚨 بحرانی' : r.status === 'warning' ? '⚠️ هشدار' : '✅ خوب';
        const issuesHtml = r.issues.map(i => \`<span>\${i}</span>\`).join('');
        
        return \`
            <div class="sa-page-card \${r.status}">
                <div class="sa-pc-header">
                    <div class="sa-pc-title">\${icon} \${esc(r.subj)}</div>
                    <div class="sa-pc-status \${r.status}">\${statusLabel}</div>
                </div>
                <div class="sa-pc-issues">\${issuesHtml}</div>
                <div class="sa-pc-advice">💡 \${r.advice}</div>
            </div>
        \`;
    }).join('');
};

// اتصال به ناوبری
if (typeof go !== 'undefined') {
    const originalGoSA = go;
    window.go = function(id) {
        originalGoSA(id);
        if (id === 'smart-analyzer-page') {
            setTimeout(() => { if (typeof renderSmartAnalyzerPage === 'function') renderSmartAnalyzerPage(); }, 50);
        }
    };
}

// اطمینان از اینکه دکمه در داشبورد به go وصل است (اگر قبلاً تزریق شده)
setTimeout(() => {
    const btn = document.getElementById('smartAnalyzerBtnCard');
    if (btn) btn.setAttribute('onclick', "go('smart-analyzer-page')");
}, 1000);
`;

if (!js.includes('window.renderSmartAnalyzerPage')) {
    js += "\n" + fullPageLogic;
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

console.log("🎉 تحلیلگر هوشمند به یک صفحه کامل تبدیل شد! حالا Ctrl+F5 بزن.");
