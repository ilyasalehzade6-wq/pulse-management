const fs = require('fs');

console.log("✨ در حال پالایش نهایی و اعمال تغییرات UI/UX...");

// ==========================================
// 1. اصلاحات CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const polishCSS = `
/* ============ FINAL POLISH ============ */
/* مخفی کردن دکمه شناور و دکمه بازگشت بیرونی در صفحه تحلیلگر */
body:has(#smart-analyzer-page.active) .wizard-fab,
body:has(#smart-analyzer-page.active) .floating-back-btn {
    display: none !important;
}

/* دکمه Ghost (بدون پس‌زمینه) */
.sa-ghost-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; margin-top: 16px; padding: 10px 12px;
    background: transparent; border: 1px solid #2a2e37;
    color: #d1d5db; border-radius: 10px; font-family: inherit;
    font-size: 0.85em; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease;
}
.sa-ghost-btn:hover {
    background: #232730; border-color: #4b5563; color: #fff;
}

/* اصلاح متن‌های داخل کارت */
.sa-card-desc {
    font-size: 0.9em; color: #d1d5db; line-height: 1.6; margin-bottom: 12px; flex: 1;
}
.sa-card-issues {
    font-size: 0.75em; color: #6b7280; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;
}
.sa-card-issues span {
    background: #232730; padding: 4px 8px; border-radius: 6px; border: 1px solid #2a2e37;
}
`;

if (!css.includes('/* ============ FINAL POLISH ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + polishCSS);
}

// ==========================================
// 2. اصلاح منطق رندر جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const polishedRenderLogic = `
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
        let progressPct = 0; 
        
        // 1. زمان
        const subjLogs = logs.filter(s => (s.subject || '').includes(subj));
        let daysSince = 999;
        if (subjLogs.length > 0) {
            subjLogs.sort((a,b) => b.date.localeCompare(a.date));
            daysSince = Math.floor((new Date(t + 'T00:00:00') - new Date(subjLogs[0].date + 'T00:00:00')) / 86400000);
            if (daysSince >= 5) { issues.push(\`\${daysSince} روز نخوندی\`); isCritical = true; }
            else if (daysSince >= 3) { issues.push(\`\${daysSince} روز نخوندی\`); isWarning = true; }
        } else {
            issues.push('هنوز شروع نکردی!'); isCritical = true;
        }
        
        // 2. حجم مطالعه
        const totalHours = subjLogs.reduce((a,b) => a + (b.hours || 0), 0);
        if (totalHours < 1 && subjLogs.length > 0) { issues.push('زمان مطالعه کم'); isWarning = true; }
        
        // 3. نمرات
        const subjGrades = grades.filter(g => (g.subject || '').includes(subj));
        let gradeAvg = null;
        if (subjGrades.length > 0) {
            gradeAvg = subjGrades.reduce((a,b) => a + b.value, 0) / subjGrades.length;
            progressPct = (gradeAvg / 20) * 100;
            if (gradeAvg < 12) { issues.push(\`معدل \${gradeAvg.toFixed(1)}\`); isCritical = true; }
            else if (gradeAvg < 15) { issues.push(\`معدل \${gradeAvg.toFixed(1)}\`); isWarning = true; }
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
            progressPct = examAvg;
            if (examAvg < 30) { issues.push(\`آزمون \${examAvg}٪\`); isCritical = true; }
            else if (examAvg < 50) { issues.push(\`آزمون \${examAvg}٪\`); isWarning = true; }
        }
        
        // 5. بازدهی
        if (totalHours > 5 && examAvg !== null && examAvg < 40) {
            issues.push('مطالعه بی‌بازده');
        }
        
        // 6. لایتنر
        const subjLeitner = leitner.filter(l => (l.subject || '').includes(subj) && (l.box || 1) === 1);
        if (subjLeitner.length > 5) {
            issues.push(\`\${subjLeitner.length} کارت لایتنر\`);
            isWarning = true;
        }
        
        if (issues.length > 0 || examAvg !== null || gradeAvg !== null) {
            results.push({ subj, issues, status: isCritical ? 'critical' : (isWarning ? 'warning' : 'good'), progress: progressPct });
        }
    });
    
    results.sort((a,b) => {
        const s = { critical: 1, warning: 2, good: 3 };
        return s[a.status] - s[b.status];
    });
    
    const page = document.getElementById('smart-analyzer-page');
    if (!page) return;
    
    const criticalCount = results.filter(r => r.status === 'critical').length;
    
    const getIcon = () => {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
    };

    let cardsHtml = results.map(r => {
        const statusLabel = r.status === 'critical' ? 'بحرانی' : r.status === 'warning' ? 'هشدار' : 'عالی';
        
        // متن کوتاه و واقعی
        let shortText = 'وضعیت مطلوب، تمرکز بر مرور فاصله‌دار.';
        if (r.status === 'critical') shortText = 'نیاز به مطالعه فوری مباحث پایه و رفع اشکال.';
        else if (r.status === 'warning') shortText = 'نیاز به تست‌زنی بیشتر و مرور مباحث.';

        const issuesHtml = r.issues.map(i => \`<span>\${esc(i)}</span>\`).join('');
        
        return \`
            <div class="sa-card">
                <div class="sa-card-top">
                    <div class="sa-card-title-wrap">
                        <div class="sa-icon-box \${r.status}">\${getIcon()}</div>
                        <div class="sa-card-title">\${esc(r.subj)}</div>
                    </div>
                    <span class="sa-badge \${r.status}">\${statusLabel}</span>
                </div>
                <div class="sa-card-desc">\${shortText}</div>
                <div class="sa-card-issues">\${issuesHtml}</div>
                
                <div class="sa-progress-wrap" style="margin-top:16px;">
                    <div class="sa-progress-labels">
                        <span>درصد تسلط / آزمون</span>
                        <span class="\${r.status === 'critical' ? 'text-red-400' : r.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}">\${fa(Math.round(r.progress))}٪</span>
                    </div>
                    <div class="sa-progress-bar">
                        <div class="sa-progress-fill \${r.status}" style="width:\${Math.min(100, Math.max(0, r.progress))}%"></div>
                    </div>
                </div>

                <!-- دکمه Ghost -->
                <button class="sa-ghost-btn" onclick="go('study-plan')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    شروع مطالعه
                </button>
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

// جایگزینی تابع رندر
const startIndex = js.indexOf('window.renderSmartAnalyzerPage = function() {');
if (startIndex !== -1) {
    const endIndex = js.indexOf('// اتصال به ناوبری', startIndex);
    if (endIndex !== -1) {
        js = js.slice(0, startIndex) + polishedRenderLogic + '\n' + js.slice(endIndex);
    }
} else {
    js += "\n" + polishedRenderLogic;
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

console.log("🎉 پالایش نهایی انجام شد! حالا Ctrl+F5 بزن.");
