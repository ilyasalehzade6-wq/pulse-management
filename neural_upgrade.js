const fs = require('fs');

console.log("🧠 در حال ارتقای ۳ برابری هوش برنامه (Neural Engine)...");

// ==========================================
// 1. افزودن CSS برای بخش بینش‌ها و کارت‌های جدید
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const neuralCSS = `
/* ============ NEURAL ENGINE INSIGHTS ============ */
.sa-insights-box {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.05));
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px; padding: 20px; margin-bottom: 24px;
    position: relative; overflow: hidden;
}
.sa-insights-box::before {
    content: '🧠'; position: absolute; left: -10px; bottom: -20px; font-size: 6em; opacity: 0.05; pointer-events: none;
}
.sa-insights-title { font-size: 0.95em; font-weight: 800; color: #a78bfa; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.sa-insights-text { font-size: 0.9em; color: #d1d5db; line-height: 1.8; }
.sa-insights-text b { color: #fff; }

/* کارت‌های با اولویت */
.sa-card.priority-high { border-right: 4px solid #ef4444; }
.sa-card.priority-med { border-right: 4px solid #f59e0b; }
.sa-card.priority-low { border-right: 4px solid #10b981; }

.sa-trend-badge {
    font-size: 0.65em; font-weight: 800; padding: 2px 8px; border-radius: 6px; margin-right: 6px; display: inline-block;
}
.sa-trend-badge.down { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.sa-trend-badge.up { background: rgba(16, 185, 129, 0.15); color: #10b981; }
`;

if (!css.includes('/* ============ NEURAL ENGINE INSIGHTS ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + neuralCSS);
}

// ==========================================
// 2. بازنویسی تابع رندر با منطق پیشرفته
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const neuralLogic = `
// ============ NEURAL ENGINE (3X INTELLIGENCE) ============
window.renderSmartAnalyzerPage = function() {
    const ALL_SUBJECTS = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'دینی', 'جغرافیا', 'نگارش'];
    const logs = getData('ilia-log', []);
    const grades = getData('ilia-grades', []);
    const exams = getData('ilia-exam-analysis', []);
    const leitner = getData('ilia-leitner', []);
    const t = today();
    
    let results = [];
    let totalPriorityScore = 0;
    
    ALL_SUBJECTS.forEach(subj => {
        let issues = [];
        let advice = '';
        let trendHtml = '';
        let progressPct = 0; 
        let priority = 0;
        
        // --- 1. تحلیل زمان و منحنی فراموشی ---
        const subjLogs = logs.filter(s => (s.subject || '').includes(subj));
        let daysSince = 999;
        if (subjLogs.length > 0) {
            subjLogs.sort((a,b) => b.date.localeCompare(a.date));
            daysSince = Math.floor((new Date(t + 'T00:00:00') - new Date(subjLogs[0].date + 'T00:00:00')) / 86400000);
            
            // منحنی فراموشی (Ebbinghaus)
            if (daysSince >= 7) { issues.push(\`بیش از \${daysSince} روز غیبت\`); priority += 40; }
            else if (daysSince >= 4) { issues.push(\`\${daysSince} روز از آخرین مطالعه\`); priority += 25; }
        } else {
            issues.push('هنوز شروع نشده'); priority += 50;
        }
        
        // --- 2. تحلیل حجم مطالعه (Volume) ---
        const totalHours = subjLogs.reduce((a,b) => a + (b.hours || 0), 0);
        if (totalHours < 2 && subjLogs.length > 0) { issues.push('حجم مطالعه بسیار کم'); priority += 15; }
        
        // --- 3. تحلیل روند نمرات (Trend Analysis) ---
        const subjGrades = grades.filter(g => (g.subject || '').includes(subj));
        let gradeAvg = null;
        if (subjGrades.length > 0) {
            subjGrades.sort((a,b) => a.date.localeCompare(b.date));
            gradeAvg = subjGrades.reduce((a,b) => a + b.value, 0) / subjGrades.length;
            progressPct = (gradeAvg / 20) * 100;
            
            if (gradeAvg < 12) { issues.push(\`معدل ضعیف (\${gradeAvg.toFixed(1)})\`); priority += 20; }
            
            // روند نزولی/صعودی نمرات
            if (subjGrades.length >= 2) {
                const last = subjGrades[subjGrades.length - 1].value;
                const prev = subjGrades[subjGrades.length - 2].value;
                if (last < prev - 1) trendHtml = '<span class="sa-trend-badge down">📉 روند نزولی</span>';
                else if (last > prev + 1) trendHtml = '<span class="sa-trend-badge up">📈 روند صعودی</span>';
            }
        }
        
        // --- 4. تحلیل آزمون‌ها و بازدهی (Efficiency) ---
        let eCorrect = 0, eWrong = 0, eTotal = 0;
        let subjExams = [];
        exams.forEach(e => {
            let subs = e.subjects || [{ name: e.subject || '', total: e.total, correct: e.correct, wrong: e.wrong }];
            let found = false;
            subs.forEach(s => {
                if ((s.name || '').includes(subj)) {
                    eCorrect += s.correct; eWrong += s.wrong; eTotal += s.total;
                    found = true;
                }
            });
            if (found) subjExams.push({ date: e.date, pct: Math.max(0, Math.round(((eCorrect*3 - eWrong) / (eTotal*3)) * 100)) });
        });
        
        let examAvg = null;
        if (eTotal > 0) {
            const score = (eCorrect * 3) - eWrong;
            examAvg = Math.round((score / (eTotal * 3)) * 100);
            if(examAvg < 0) examAvg = 0;
            progressPct = examAvg; // اولویت با درصد آزمون
            if (examAvg < 30) { issues.push(\`آزمون بحرانی (\${examAvg}٪)\`); priority += 30; }
            else if (examAvg < 50) { issues.push(\`آزمون ضعیف (\${examAvg}٪)\`); priority += 15; }
            
            // تحلیل بازدهی (زمان زیاد، نتیجه کم)
            if (totalHours > 5 && examAvg < 40) {
                issues.push('بازدهی پایین');
                priority += 20;
                advice = '<b>هشدار بازدهی (ROI):</b> زمان زیادی صرف کرده‌ای اما نتیجه‌ای نگرفته‌ای. روشت را عوض کن! به جای خواندن صرف، تست بزن.';
            }
        }
        
        // --- 5. وضعیت حافظه (لایتنر) ---
        const subjLeitner = leitner.filter(l => (l.subject || '').includes(subj) && (l.box || 1) === 1);
        if (subjLeitner.length > 5) {
            issues.push(\`\${subjLeitner.length} لغت فراموش‌شده\`);
            priority += 10;
            if (!advice) advice = '<b>مشکل حافظه:</b> لغات زیادی در جعبه ۱ مانده‌اند. همین امروز ۱۰ دقیقه لایتنر مرور کن.';
        }
        
        if (!advice) {
            if (priority >= 40) advice = 'وضعیت بحرانی است. امروز حتماً یک بلوک ۳۰ دقیقه‌ای برای این درس خالی کن.';
            else if (priority > 0) advice = 'نیاز به توجه دارد. برای جلوگیری از افت، ۲۰ دقیقه تست هدفمند بزن.';
            else advice = 'وضعیت پایدار. به مرور فاصله‌دار ادامه بده.';
        }
        
        if (issues.length > 0 || examAvg !== null || gradeAvg !== null) {
            results.push({ 
                subj, issues, advice, trendHtml, 
                status: priority >= 40 ? 'critical' : (priority > 0 ? 'warning' : 'good'), 
                progress: progressPct,
                priorityScore: priority
            });
            totalPriorityScore += priority;
        }
    });
    
    // مرتب‌سازی بر اساس امتیاز اولویت (بیشترین نیاز به مطالعه اول)
    results.sort((a,b) => b.priorityScore - a.priorityScore);
    
    const page = document.getElementById('smart-analyzer-page');
    if (!page) return;
    
    const criticalCount = results.filter(r => r.status === 'critical').length;
    
    // تولید بینش کلی (Deep Insight) بر اساس مجموع امتیازات
    let deepInsight = '';
    if (totalPriorityScore > 150) {
        deepInsight = '🚨 <b>هشدار قرمز:</b> برنامه‌ی درسی شما در چند درس به شدت عقب افتاده است. تمرکز اصلی امروز باید روی جبران عقب‌ماندگی باشد.';
    } else if (totalPriorityScore > 80) {
        deepInsight = '⚠️ <b>وضعیت زرد:</b> در برخی دروس تعادل به هم خورده است. با یک برنامه‌ریزی دقیق برای دروس هشدار، می‌توانید تا آخر هفته جبران کنید.';
    } else {
        deepInsight = '✅ <b>وضعیت سبز:</b> عملکرد شما متعادل است. این یک فرصت عالی برای جلو افتادن و تست‌زنی پیشرفته است.';
    }

    const getIcon = () => {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
    };

    let cardsHtml = results.map(r => {
        const statusLabel = r.status === 'critical' ? 'بحرانی' : r.status === 'warning' ? 'هشدار' : 'عالی';
        
        let shortText = 'وضعیت مطلوب، تمرکز بر مرور فاصله‌دار.';
        if (r.status === 'critical') shortText = 'نیاز به مطالعه فوری مباحث پایه و رفع اشکال.';
        else if (r.status === 'warning') shortText = 'نیاز به تست‌زنی بیشتر و مرور مباحث.';

        const issuesHtml = r.issues.map(i => \`<span>\${esc(i)}</span>\`).join('');
        
        return \`
            <div class="sa-card priority-\${r.status === 'critical' ? 'high' : r.status === 'warning' ? 'med' : 'low'}">
                <div class="sa-card-top">
                    <div class="sa-card-title-wrap">
                        <div class="sa-icon-box \${r.status}">\${getIcon()}</div>
                        <div class="sa-card-title">\${esc(r.subj)} \${r.trendHtml}</div>
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
            <!-- باکس بینش‌های عمیق (Neural Insights) -->
            <div class="sa-insights-box">
                <div class="sa-insights-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><path d="M8 10v4"/><path d="M16 10v4"/><path d="M12 14v8"/><circle cx="12" cy="12" r="10"/></svg>
                    بینش‌های عمیق (Deep Insights)
                </div>
                <div class="sa-insights-text">
                    \${deepInsight}
                    <br>
                    <span style="font-size:0.85em; opacity:0.8; display:block; margin-top:8px;">
                        شبکه عصبی برنامه، داده‌های شما را تحلیل کرده و متوجه شده است که بیشترین تمرکز شما باید روی <b>\${results.length > 0 ? esc(results[0].subj) : '...'}</b> باشد.
                    </span>
                </div>
            </div>

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
        js = js.slice(0, startIndex) + neuralLogic + '\n' + js.slice(endIndex);
    }
} else {
    js += "\n" + neuralLogic;
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

console.log("🎉 هوش برنامه ۳ برابر شد! حالا Ctrl+F5 بزن.");
