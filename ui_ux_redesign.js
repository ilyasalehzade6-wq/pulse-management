const fs = require('fs');

console.log("🎨 در حال اعمال طراحی SaaS مدرن روی تحلیلگر هوشمند...");

// ==========================================
// 1. تزریق CSS جدید
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const saasCSS = `
/* ============ SMART ANALYZER SAAS DESIGN ============ */
#smart-analyzer-page {
    background: #0f1115; /* پس‌زمینه تیره و مدرن */
    min-height: 100vh;
}

/* هدر تمیز */
.sa-header {
    border-bottom: 1px solid #2a2e37;
    background: rgba(15, 17, 21, 0.8);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50;
    padding: 0 20px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
}
.sa-header-title { display: flex; align-items: center; gap: 12px; }
.sa-header-title h1 { font-size: 1.2em; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
.sa-back-btn {
    display: flex; align-items: center; gap: 6px;
    background: #1a1d24; border: 1px solid #2a2e37; color: #9ca3af;
    padding: 8px 16px; border-radius: 8px; font-family: inherit; font-size: 0.85em; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
}
.sa-back-btn:hover { color: #fff; border-color: #4b5563; }

/* کانتینر اصلی */
.sa-main { max-width: 1200px; margin: 0 auto; padding: 32px 20px 100px; }

/* باکس هشدار (Alert) */
.sa-alert {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px; padding: 16px; margin-bottom: 32px;
    display: flex; align-items: flex-start; gap: 12px;
}
.sa-alert-icon { color: #ef4444; margin-top: 2px; }
.sa-alert-title { font-size: 0.9em; font-weight: 700; color: #ef4444; margin-bottom: 4px; }
.sa-alert-text { font-size: 0.9em; color: #9ca3af; line-height: 1.6; }
.sa-alert-text strong { color: #fff; }

/* گرید 3 ستونه */
.sa-grid {
    display: grid; grid-template-columns: 1fr; gap: 20px;
}
@media (min-width: 768px) { .sa-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .sa-grid { grid-template-columns: repeat(3, 1fr); } }

/* کارت‌های کوچک و تمیز */
.sa-card {
    background: #1a1d24; border: 1px solid #2a2e37; border-radius: 16px;
    padding: 20px; display: flex; flex-direction: column;
    transition: border-color 0.2s, transform 0.2s;
}
.sa-card:hover { border-color: #4b5563; transform: translateY(-2px); }

.sa-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.sa-card-title-wrap { display: flex; align-items: center; gap: 12px; }
.sa-icon-box {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
}
.sa-icon-box.critical { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.sa-icon-box.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.sa-icon-box.good { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.sa-card-title { font-size: 1.05em; font-weight: 700; color: #fff; }
.sa-badge {
    font-size: 0.75em; font-weight: 700; padding: 4px 10px; border-radius: 20px;
    border: 1px solid transparent;
}
.sa-badge.critical { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
.sa-badge.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }
.sa-badge.good { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }

.sa-card-desc { font-size: 0.85em; color: #9ca3af; line-height: 1.6; margin-bottom: 20px; flex: 1; }
.sa-card-desc b { color: #d1d5db; }

/* نوار پیشرفت (Progress) */
.sa-progress-wrap { margin-top: auto; }
.sa-progress-labels { display: flex; justify-content: space-between; font-size: 0.75em; font-weight: 600; margin-bottom: 8px; }
.sa-progress-labels span:first-child { color: #9ca3af; }
.sa-progress-bar { width: 100%; height: 6px; background: #2a2e37; border-radius: 10px; overflow: hidden; }
.sa-progress-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
.sa-progress-fill.critical { background: #ef4444; }
.sa-progress-fill.warning { background: #f59e0b; }
.sa-progress-fill.good { background: #10b981; }
`;

if (!css.includes('/* ============ SMART ANALYZER SAAS DESIGN ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + saasCSS);
}

// ==========================================
// 2. بازنویسی تابع رندر جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const newRenderLogic = `
// ============ SMART ANALYZER SAAS UI ============
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
        let progressPct = 0; 
        
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
            progressPct = (gradeAvg / 20) * 100;
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
            progressPct = examAvg; // اولویت با درصد آزمون
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
            if (isCritical) advice = 'این درس رو باید همین امروز شروع کنی. حداقل ۳۰ دقیقه زمان بده و از مباحث ساده شروع کن.';
            else if (isWarning) advice = 'عقب‌نموندی رو جبران کن. یک بلوک ۴۰ دقیقه‌ای برای این درس در برنامه‌ت بذار.';
            else advice = 'وضعیت پایدار است. به مرور فاصله‌دار ادامه بده.';
        }
        
        if (issues.length > 0 || examAvg !== null || gradeAvg !== null) {
            results.push({ subj, issues, advice, status: isCritical ? 'critical' : (isWarning ? 'warning' : 'good'), progress: progressPct });
        }
    });
    
    results.sort((a,b) => {
        const s = { critical: 1, warning: 2, good: 3 };
        return s[a.status] - s[b.status];
    });
    
    const page = document.getElementById('smart-analyzer-page');
    if (!page) return;
    
    const criticalCount = results.filter(r => r.status === 'critical').length;
    
    // آیکون‌های SVG تمیز (Lucide)
    const getIcon = (subj) => {
        // برای سادگی از یک کتاب استفاده می‌کنیم، در پروژه واقعی می‌توانید برای هر درس آیکون خاص بگذارید
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
    };

    let cardsHtml = results.map(r => {
        const statusLabel = r.status === 'critical' ? 'بحرانی' : r.status === 'warning' ? 'هشدار' : 'عالی';
        const issuesText = r.issues.length > 0 ? r.issues.join(' • ') : 'وضعیت مطلوب';
        
        return \`
            <div class="sa-card">
                <div class="sa-card-top">
                    <div class="sa-card-title-wrap">
                        <div class="sa-icon-box \${r.status}">\${getIcon(r.subj)}</div>
                        <div class="sa-card-title">\${esc(r.subj)}</div>
                    </div>
                    <span class="sa-badge \${r.status}">\${statusLabel}</span>
                </div>
                <div class="sa-card-desc">
                    \${esc(r.advice)}
                    <div style="margin-top:8px; font-size:0.9em; opacity:0.8;">\${esc(issuesText)}</div>
                </div>
                <div class="sa-progress-wrap">
                    <div class="sa-progress-labels">
                        <span>درصد تسلط / آزمون</span>
                        <span class="\${r.status === 'critical' ? 'text-red-400' : r.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}">\${fa(Math.round(r.progress))}٪</span>
                    </div>
                    <div class="sa-progress-bar">
                        <div class="sa-progress-fill \${r.status}" style="width:\${Math.min(100, Math.max(0, r.progress))}%"></div>
                    </div>
                </div>
            </div>
        \`;
    }).join('');

    page.innerHTML = \`
        <div class="sa-header">
            <div class="sa-header-title">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(139,92,246,0.2);display:flex;align-items:center;justify-content:center;color:#a78bfa;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><path d="M8 10v4"/><path d="M16 10v4"/><path d="M12 14v8"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <h1>تحلیلگر هوشمند</h1>
            </div>
            <button class="sa-back-btn" onclick="go('dashboard')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                بازگشت
            </button>
        </div>

        <div class="sa-main">
            \${criticalCount > 0 ? \`
            <div class="sa-alert">
                <div class="sa-alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                    <div class="sa-alert-title">وضعیت نیازمند توجه</div>
                    <div class="sa-alert-text">بر اساس تحلیل داده‌ها، <strong>\${fa(criticalCount)} درس</strong> در وضعیت بحرانی قرار دارند و نیاز به مطالعه فوری دارند.</div>
                </div>
            </div>
            \` : ''}

            <div class="sa-grid">
                \${cardsHtml}
            </div>
        </div>
    \`;
};
`;

// جایگزینی تابع قدیمی با تابع جدید
const startIndex = js.indexOf('window.renderSmartAnalyzerPage = function() {');
if (startIndex !== -1) {
    const endIndex = js.indexOf('// اتصال به ناوبری', startIndex);
    if (endIndex !== -1) {
        js = js.slice(0, startIndex) + newRenderLogic + '\n' + js.slice(endIndex);
    }
} else {
    js += "\n" + newRenderLogic;
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

console.log("🎉 طراحی فوق‌حرفه‌ای SaaS اعمال شد! حالا Ctrl+F5 بزن.");
