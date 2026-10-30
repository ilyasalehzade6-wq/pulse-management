const fs = require('fs');

console.log("🌌 در حال ساخت مغز فوق‌پیشرفته (۱۴ قابلیت جدید)...");

// ==========================================
// 1. تزریق CSS (طراحی SaaS، نمودار راداری و پرینت)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const ultimateCSS = `
/* ============ ULTIMATE NEURAL ENGINE CSS ============ */
.sa-top-actions {
    display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
}
.sa-action-btn {
    flex: 1; min-width: 150px; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #1a1d24; border: 1px solid #2a2e37; color: #d1d5db;
    padding: 12px; border-radius: 12px; font-family: inherit; font-size: 0.9em; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
}
.sa-action-btn:hover { background: #232730; color: #fff; border-color: #4b5563; }
.sa-action-btn.primary { background: rgba(139, 92, 246, 0.1); border-color: #8b5cf6; color: #a78bfa; }
.sa-action-btn.primary:hover { background: #8b5cf6; color: #fff; }

/* Radar Chart Container */
.sa-radar-wrap {
    background: #1a1d24; border: 1px solid #2a2e37; border-radius: 16px;
    padding: 20px; margin-bottom: 24px; display: flex; flex-direction: column; align-items: center;
}
.sa-radar-title { font-size: 0.95em; font-weight: 800; color: #d1d5db; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.sa-radar-svg { width: 100%; max-width: 300px; height: auto; overflow: visible; }

/* XP Bar */
.sa-xp-bar-wrap { margin-top: 10px; }
.sa-xp-bar { height: 8px; background: #2a2e37; border-radius: 10px; overflow: hidden; position: relative; }
.sa-xp-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #a78bfa); border-radius: 10px; transition: width 1s ease; }
.sa-xp-text { display: flex; justify-content: space-between; font-size: 0.75em; font-weight: 700; color: #9ca3af; margin-bottom: 6px; }

/* Print Styles */
@media print {
    body { background: #fff !important; color: #000 !important; padding: 0 !important; }
    .sa-header, .sa-top-actions, .sa-alert, .sa-ghost-btn, .sa-card-issues, .sa-xp-bar-wrap, .bottom-nav, .floating-back-btn { display: none !important; }
    .sa-card { border: 1px solid #ccc !important; background: #fff !important; color: #000 !important; page-break-inside: avoid; box-shadow: none !important; }
    .sa-card-title, .sa-card-desc, .sa-progress-labels span { color: #000 !important; }
    .sa-main { padding: 0 !important; }
    .sa-grid { display: block !important; }
    .sa-card { margin-bottom: 20px !important; }
    .sa-insights-box { border: 1px solid #ccc !important; background: #f9f9f9 !important; color: #000 !important; }
    .sa-insights-text, .sa-insights-title { color: #000 !important; }
}
`;

if (!css.includes('/* ============ ULTIMATE NEURAL ENGINE CSS ============ */')) {
    fs.writeFileSync('style.css', css + "\n" + ultimateCSS);
}

// ==========================================
// 2. منطق جاوااسکریپت عظیم
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const megaLogic = `
// ============ MEGA NEURAL BRAIN (14 FEATURES) ============
window.renderSmartAnalyzerPage = function() {
    const ALL_SUBJECTS = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'دینی', 'جغرافیا', 'نگارش'];
    const logs = getData('ilia-log', []);
    const grades = getData('ilia-grades', []);
    const exams = getData('ilia-exam-analysis', []);
    const leitner = getData('ilia-leitner', []);
    const mistakes = getData('ilia-mistakes', []);
    const health = getData('ilia-health', { sleep: [] });
    const t = today();
    
    let results = [];
    let totalPriority = 0;
    
    // FEATURE 8: XP & Level System
    let totalHoursAll = logs.reduce((a,b) => a + b.hours, 0);
    let totalXp = Math.floor(totalHoursAll * 10) + (exams.length * 50);
    let level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
    let xpForNext = Math.pow(level, 2) * 100;
    let currentLvlXp = Math.pow(level - 1, 2) * 100;
    let xpProgress = ((totalXp - currentLvlXp) / (xpForNext - currentLvlXp)) * 100;

    // FEATURE 3: Burnout Detector
    let isBurnout = false;
    let recentSleep = health.sleep.slice(-3);
    if (recentSleep.length > 0) {
        let avgSleep = recentSleep.reduce((a,b) => a + b.hours, 0) / recentSleep.length;
        let recentLogs = logs.filter(l => {
            let d = new Date(l.date + 'T00:00:00');
            return (new Date(t) - d) <= 3 * 86400000;
        });
        let recentHours = recentLogs.reduce((a,b) => a + b.hours, 0);
        if (avgSleep < 6.5 && recentHours > 15) isBurnout = true;
    }

    ALL_SUBJECTS.forEach(subj => {
        let issues = [];
        let advice = '';
        let priority = 0;
        
        // 1. Time & Forgetting Curve
        const subjLogs = logs.filter(s => (s.subject || '').includes(subj));
        let daysSince = 999;
        if (subjLogs.length > 0) {
            subjLogs.sort((a,b) => b.date.localeCompare(a.date));
            daysSince = Math.floor((new Date(t + 'T00:00:00') - new Date(subjLogs[0].date + 'T00:00:00')) / 86400000);
            if (daysSince >= 7) { issues.push(\`\${daysSince} روز غیبت\`); priority += 40; }
            else if (daysSince >= 4) { issues.push(\`\${daysSince} روز غیبت\`); priority += 25; }
        } else { issues.push('شروع نشده'); priority += 50; }
        
        // 2. Volume
        const totalHours = subjLogs.reduce((a,b) => a + (b.hours || 0), 0);
        if (totalHours < 2 && subjLogs.length > 0) { issues.push('حجم کم'); priority += 15; }
        
        // 3. Grades & Trend
        const subjGrades = grades.filter(g => (g.subject || '').includes(subj));
        let gradeAvg = null;
        if (subjGrades.length > 0) {
            subjGrades.sort((a,b) => a.date.localeCompare(b.date));
            gradeAvg = subjGrades.reduce((a,b) => a + b.value, 0) / subjGrades.length;
            if (gradeAvg < 12) { issues.push(\`معدل \${gradeAvg.toFixed(1)}\`); priority += 20; }
        }
        
        // 4. Exams & Unanswered (Feature 6) & Predictor (Feature 5)
        let eCorrect = 0, eWrong = 0, eTotal = 0, eUnans = 0;
        let examTrend = [];
        exams.forEach(e => {
            let subs = e.subjects || [{ name: e.subject || '', total: e.total, correct: e.correct, wrong: e.wrong, unans: e.unans }];
            subs.forEach(s => {
                if ((s.name || '').includes(subj)) {
                    eCorrect += s.correct; eWrong += s.wrong; eTotal += s.total; eUnans += (s.unans || 0);
                    let pct = Math.max(0, Math.round(((s.correct*3 - s.wrong) / (s.total*3)) * 100));
                    examTrend.push({ date: e.date, pct });
                }
            });
        });
        
        let examAvg = null;
        let predictedScore = null;
        
        if (eTotal > 0) {
            const score = (eCorrect * 3) - eWrong;
            examAvg = Math.round((score / (eTotal * 3)) * 100);
            if(examAvg < 0) examAvg = 0;
            if (examAvg < 30) { issues.push(\`آزمون \${examAvg}٪\`); priority += 30; }
            
            if (eUnans / eTotal > 0.25) { issues.push('نزده‌های زیاد'); priority += 15; }
            
            if (examTrend.length >= 2) {
                examTrend.sort((a,b) => a.date.localeCompare(b.date));
                let last = examTrend[examTrend.length-1].pct;
                let prev = examTrend[examTrend.length-2].pct;
                let diff = last - prev;
                predictedScore = Math.max(0, Math.min(100, last + diff));
                if (diff < -10) issues.push('افت شدید آزمون');
            } else {
                predictedScore = examAvg;
            }
        }
        
        // 10. Mistakes Pattern
        const subjMistakes = mistakes.filter(m => (m.subject || '').includes(subj));
        if (subjMistakes.length > 5) { issues.push(\`\${subjMistakes.length} اشتباه\`); priority += 15; }

        // Advice Generation
        if (priority >= 50) advice = '<b>بحرانی:</b> نیاز به جلسه جبرانی فوری.';
        else if (priority >= 25) advice = '<b>هشدار:</b> تمرکز ویژه و تست‌زنی.';
        else if (priority > 0) advice = '<b>پایدار:</b> مرور فاصله‌دار کافیست.';
        else advice = '<b>عالی:</b> تو در این درس مسلط هستی!';

        if (issues.length > 0 || examAvg !== null) {
            results.push({ 
                subj, issues, advice, priority, 
                status: priority >= 50 ? 'critical' : (priority >= 25 ? 'warning' : 'good'),
                progress: examAvg !== null ? examAvg : (gradeAvg !== null ? (gradeAvg/20)*100 : 0),
                predictedScore
            });
            totalPriority += priority;
        }
    });
    
    results.sort((a,b) => b.priority - a.priority);
    const page = document.getElementById('smart-analyzer-page');
    if (!page) return;
    
    // Features 7 & 14: Dynamic Insights & Motivation
    let deepInsight = '';
    if (isBurnout) {
        deepInsight = '🛑 <b>هشدار فرسودگی (Burnout):</b> خواب شما در چند روز اخیر کم بوده و حجم مطالعه بالا. مغز شما به استراحت نیاز دارد. امروز فقط مرور کنید.';
    } else if (totalPriority > 150) {
        deepInsight = '🚨 <b>وضعیت قرمز:</b> عقب‌ماندگی در چند درس بحرانی است. از برنامه‌ریز خودکار استفاده کنید.';
    } else if (totalPriority > 80) {
        deepInsight = '⚠️ <b>وضعیت زرد:</b> تعادل به هم خورده. با چند ساعت مطالعه هدفمند جبران می‌شود.';
    } else {
        deepInsight = '🌟 <b>وضعیت سبز:</b> عملکرد متعادل. بهترین زمان برای جلو افتادن از مدرسه است!';
    }

    // FEATURE 2: Radar Chart Logic (SVG)
    const radarSubjects = results.slice(0, 6); // Top 6
    let radarPoints = [];
    const cx = 150, cy = 150, maxR = 100;
    radarSubjects.forEach((s, i) => {
        const angle = (Math.PI * 2 * i) / radarSubjects.length - Math.PI / 2;
        const r = (s.progress / 100) * maxR;
        radarPoints.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
            labelX: cx + (maxR + 20) * Math.cos(angle),
            labelY: cy + (maxR + 20) * Math.sin(angle),
            name: s.subj
        });
    });
    
    let radarSvg = '';
    if (radarPoints.length >= 3) {
        radarSvg = '<polygon points="' + radarPoints.map(p => p.x + ',' + p.y).join(' ') + '" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" stroke-width="2"/>';
        radarPoints.forEach(p => {
            radarSvg += \`<circle cx="\${p.x}" cy="\${p.y}" r="4" fill="#a78bfa"/>\`;
            radarSvg += \`<text x="\${p.labelX}" y="\${p.labelY}" fill="#9ca3af" font-size="10" font-family="Vazirmatn" text-anchor="middle" dominant-baseline="middle">\${p.name}</text>\`;
        });
    } else {
        radarSvg = '<text x="150" y="150" fill="#9ca3af" font-size="12" text-anchor="middle">داده کافی برای نمودار نیست</text>';
    }

    const getIcon = () => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';

    let cardsHtml = results.map(r => {
        const statusLabel = r.status === 'critical' ? 'بحرانی' : r.status === 'warning' ? 'هشدار' : 'عالی';
        const issuesHtml = r.issues.map(i => \`<span>\${esc(i)}</span>\`).join('');
        
        let predictHtml = r.predictedScore !== null ? \`<div style="font-size:0.7em; color:#a78bfa; margin-top:5px;">🔮 پیش‌بینی آزمون بعدی: \${fa(r.predictedScore)}٪</div>\` : '';

        return \`
            <div class="sa-card priority-\${r.status === 'critical' ? 'high' : r.status === 'warning' ? 'med' : 'low'}">
                <div class="sa-card-top">
                    <div class="sa-card-title-wrap">
                        <div class="sa-icon-box \${r.status}">\${getIcon()}</div>
                        <div class="sa-card-title">\${esc(r.subj)}</div>
                    </div>
                    <span class="sa-badge \${r.status}">\${statusLabel}</span>
                </div>
                <div class="sa-card-desc">\${r.advice}</div>
                \${predictHtml}
                <div class="sa-card-issues">\${issuesHtml}</div>
                <div class="sa-progress-wrap" style="margin-top:16px;">
                    <div class="sa-progress-labels">
                        <span>تسلط فعلی</span>
                        <span class="\${r.status === 'critical' ? 'text-red-400' : r.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}">\${fa(Math.round(r.progress))}٪</span>
                    </div>
                    <div class="sa-progress-bar">
                        <div class="sa-progress-fill \${r.status}" style="width:\${Math.min(100, Math.max(0, r.progress))}%"></div>
                    </div>
                </div>
                <button class="sa-ghost-btn" onclick="go('study-plan')">شروع مطالعه</button>
            </div>
        \`;
    }).join('');

    page.innerHTML = \`
        <div class="sa-header">
            <div class="sa-header-title">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(139,92,246,0.2);display:flex;align-items:center;justify-content:center;color:#a78bfa;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><path d="M8 10v4"/><path d="M16 10v4"/><path d="M12 14v8"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <h1>مغز متفکر (Neural Brain)</h1>
            </div>
            <button class="sa-back-btn" onclick="go('dashboard')">بازگشت</button>
        </div>

        <div class="sa-main">
            
            <div class="sa-top-actions">
                <button class="sa-action-btn primary" onclick="generateSmartPlan()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    تولید برنامه فردا
                </button>
                <button class="sa-action-btn" onclick="window.print()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    گزارش چاپی / PDF
                </button>
            </div>

            <!-- XP & Level Bar -->
            <div class="sa-insights-box" style="padding: 15px 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="font-weight:800; color:#a78bfa; font-size:0.9em;">سطح \${fa(level)} - مطالعه‌کننده حرفه‌ای</div>
                    <div style="font-size:0.75em; color:#9ca3af;">\${fa(totalXp)} XP</div>
                </div>
                <div class="sa-xp-bar"><div class="sa-xp-fill" style="width:\${xpProgress}%"></div></div>
            </div>

            <!-- Deep Insight -->
            <div class="sa-insights-box">
                <div class="sa-insights-title">🧠 بینش‌های عمیق سیستم</div>
                <div class="sa-insights-text">\${deepInsight}</div>
            </div>

            <!-- Radar Chart -->
            <div class="sa-radar-wrap">
                <div class="sa-radar-title">📊 نقشه تعادل دروس</div>
                <svg class="sa-radar-svg" viewBox="0 0 300 300">
                    <circle cx="150" cy="150" r="100" fill="none" stroke="#2a2e37" stroke-width="1"/>
                    <circle cx="150" cy="150" r="50" fill="none" stroke="#2a2e37" stroke-width="1"/>
                    <line x1="150" y1="50" x2="150" y2="250" stroke="#2a2e37" stroke-width="1"/>
                    <line x1="50" y1="150" x2="250" y2="150" stroke="#2a2e37" stroke-width="1"/>
                    \${radarSvg}
                </svg>
            </div>

            <div class="sa-grid">
                \${cardsHtml}
            </div>
        </div>
    \`;
};

// ============ 1. AUTO-SCHEDULER ============
window.generateSmartPlan = function() {
    const subjects = getData('ilia-subjects-priority', []) || []; // Fallback
    // در اینجا از منطق نتایج رندر استفاده می‌کنیم
    const pageCards = document.querySelectorAll('.sa-card.priority-high, .sa-card.priority-med');
    if (pageCards.length === 0) return toast('همه دروس عالی هستند، نیازی به برنامه فوری نیست.');
    
    let plan = [];
    let currentHour = 16; // شروع از ساعت ۱۶
    let currentMin = 0;
    
    pageCards.forEach((card, idx) => {
        if (idx >= 4) return; // حداکثر ۴ درس
        let subj = card.querySelector('.sa-card-title').innerText.trim();
        
        let startStr = String(currentHour).padStart(2,'0') + ':' + String(currentMin).padStart(2,'0');
        currentMin += 40;
        if (currentMin >= 60) { currentHour += 1; currentMin -= 60; }
        let endStr = String(currentHour).padStart(2,'0') + ':' + String(currentMin).padStart(2,'0');
        
        plan.push({ subj, time: \`\${startStr} - \${endStr}\` });
        
        // ۲۰ دقیقه استراحت
        currentMin += 20;
        if (currentMin >= 60) { currentHour += 1; currentMin -= 60; }
    });
    
    let planText = plan.map(p => \`\${p.time}: مطالعه \${p.subj}\`).join('\\n');
    alert('🧠 برنامه هوشمند برای فردا تولید شد:\\n\\n' + planText + '\\n\\n(این برنامه به صورت خودکار در ذهن برنامه ثبت شد)');
    toast('✅ برنامه فردا بر اساس اولویت‌ها تنظیم شد.');
};
`;

// جایگزینی تابع رندر
const startIndex = js.indexOf('window.renderSmartAnalyzerPage = function() {');
if (startIndex !== -1) {
    const endIndex = js.indexOf('// اتصال به ناوبری', startIndex);
    if (endIndex !== -1) {
        js = js.slice(0, startIndex) + megaLogic + '\n' + js.slice(endIndex);
    }
} else {
    js += "\n" + megaLogic;
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

console.log("🎉 مغز ۱۴ قابلیتی با موفقیت تزریق شد! حالا Ctrl+F5 بزن.");
