const fs = require('fs');

console.log("📊 در حال ساخت صفحه اختصاصی تحلیل آزمون...");

// ==========================================
// 1. تغییرات HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن دکمه به صفحه اصلی
const newBtn = `<div class="nimkat-card" onclick="go('exam-analysis')"><div class="nimkat-icon">📉</div><div class="nimkat-title">تحلیل آزمون</div></div>`;
if (!html.includes('onclick="go(\'exam-analysis\')"')) {
    html = html.replace('<div class="nimkat-card" onclick="go(\'weakness\')">', newBtn + '\n<div class="nimkat-card" onclick="go(\'weakness\')">');
}

// ب) ساخت سکشن تحلیل آزمون
const analysisSection = `
<section id="exam-analysis">
    <div class="container" style="padding-top:20px; padding-bottom:100px;">
        <h2>📉 تحلیل و آنالیز آزمون‌ها</h2>
        
        <div id="eaEmptyState" style="display:none; text-align:center; padding:40px 20px; color:var(--text-light);">
            <div style="font-size:3em; margin-bottom:10px;">📊</div>
            <div style="font-weight:800; font-size:1.1em; margin-bottom:5px;">هنوز آزمونی ثبت نکرده‌اید!</div>
            <div style="font-size:0.85em;">از بخش «برنامه مطالعاتی» یک آزمون جدید ثبت کنید تا تحلیل‌ها اینجا نمایش داده شوند.</div>
        </div>

        <div id="eaContent" style="display:none;">
            <!-- آمار کلی -->
            <div class="ea-stats-grid">
                <div class="ea-stat-card">
                    <div class="ea-stat-icon">📝</div>
                    <div class="ea-stat-val" id="eaTotalExams">۰</div>
                    <div class="ea-stat-label">تعداد آزمون</div>
                </div>
                <div class="ea-stat-card">
                    <div class="ea-stat-icon">🎯</div>
                    <div class="ea-stat-val" id="eaAvgPct">۰٪</div>
                    <div class="ea-stat-label">میانگین درصد</div>
                </div>
                <div class="ea-stat-card">
                    <div class="ea-stat-icon">📈</div>
                    <div class="ea-stat-val" id="eaBestSubj">-</div>
                    <div class="ea-stat-label">بهترین درس</div>
                </div>
            </div>

            <!-- تحلیل درس به درس -->
            <div class="ea-card">
                <h3 class="ea-card-title">📚 عملکرد درس به درس</h3>
                <div id="eaSubjectsList" class="ea-subjects-list"></div>
            </div>

            <!-- تحلیل نوع پاسخ‌ها -->
            <div class="ea-card">
                <h3 class="ea-card-title">🔍 کیفیت پاسخ‌دهی (کل آزمون‌ها)</h3>
                <div id="eaQualityList"></div>
            </div>

        </div>
    </div>
</section>
`;

if (!html.includes('<section id="exam-analysis">')) {
    html = html.replace('<section id="settings">', analysisSection + '\n<section id="settings">');
}

fs.writeFileSync('index.html', html);
console.log("✅ ساختار HTML تحلیل آزمون اضافه شد.");

// ==========================================
// 2. افزودن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const analysisCSS = `
/* ============ EXAM ANALYSIS ============ */
.ea-stats-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;
}
.ea-stat-card {
    background: var(--bg-card); border-radius: 16px; padding: 15px 10px;
    text-align: center; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.ea-stat-icon { font-size: 1.5em; margin-bottom: 5px; }
.ea-stat-val { font-size: 1.3em; font-weight: 900; color: var(--primary); line-height: 1.2; }
.ea-stat-label { font-size: 0.7em; color: var(--text-light); font-weight: 700; margin-top: 4px; }

.ea-card {
    background: var(--bg-card); border-radius: 16px; padding: 18px;
    border: 1px solid var(--border); box-shadow: var(--shadow); margin-bottom: 15px;
}
.ea-card-title {
    font-size: 1em; font-weight: 800; margin-bottom: 15px; 
    display: flex; align-items: center; gap: 8px; color: var(--text);
}

.ea-subjects-list { display: flex; flex-direction: column; gap: 12px; }
.ea-subj-item { display: flex; flex-direction: column; gap: 5px; }
.ea-subj-head { display: flex; justify-content: space-between; align-items: center; font-size: 0.85em; font-weight: 700; }
.ea-subj-bar-bg { height: 8px; background: var(--bg); border-radius: 10px; overflow: hidden; }
.ea-subj-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

/* کیفیت پاسخ‌دهی (نمودار دونات ساده) */
.ea-quality-wrap { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
.ea-donut {
    width: 100px; height: 100px; border-radius: 50%; position: relative;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.ea-donut-inner {
    width: 70px; height: 70px; background: var(--bg-card); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1em; font-weight: 900; color: var(--text);
}
.ea-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.ea-legend-item { display: flex; align-items: center; justify-content: space-between; font-size: 0.85em; font-weight: 700; }
.ea-legend-color { width: 12px; height: 12px; border-radius: 4px; margin-left: 8px; }
.ea-legend-val { color: var(--text-light); font-size: 0.9em; }
`;
fs.writeFileSync('style.css', css + "\n" + analysisCSS);

// ==========================================
// 3. منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const analysisJS = `
// ============ EXAM ANALYSIS LOGIC ============
window.renderExamAnalysis = function() {
    const exams = getData('ilia-exam-analysis', []);
    const emptyState = document.getElementById('eaEmptyState');
    const content = document.getElementById('eaContent');
    
    if (!exams || exams.length === 0) {
        if(emptyState) emptyState.style.display = 'block';
        if(content) content.style.display = 'none';
        return;
    }
    
    if(emptyState) emptyState.style.display = 'none';
    if(content) content.style.display = 'block';
    
    let totalExams = exams.length;
    let globalCorrect = 0, globalWrong = 0, globalUnans = 0, globalTotalQ = 0;
    let subjectStats = {};
    
    // پردازش داده‌ها
    exams.forEach(e => {
        let subs = e.subjects;
        if (!subs) {
            // پشتیبانی از فرمت قدیمی
            subs = [{ name: e.subject || 'نامشخص', total: e.total, correct: e.correct, wrong: e.wrong, unans: e.unans }];
        }
        
        subs.forEach(s => {
            globalCorrect += s.correct;
            globalWrong += s.wrong;
            globalUnans += s.unans;
            globalTotalQ += s.total;
            
            if (!subjectStats[s.name]) {
                subjectStats[s.name] = { totalQ: 0, correct: 0, wrong: 0, unans: 0, count: 0 };
            }
            subjectStats[s.name].totalQ += s.total;
            subjectStats[s.name].correct += s.correct;
            subjectStats[s.name].wrong += s.wrong;
            subjectStats[s.name].unans += s.unans;
            subjectStats[s.name].count++;
        });
    });
    
    // 1. آمار کلی
    const globalScore = (globalCorrect * 3) - globalWrong;
    let globalPct = 0;
    if (globalTotalQ > 0) {
        globalPct = Math.round((globalScore / (globalTotalQ * 3)) * 100);
        if(globalPct < 0) globalPct = 0;
    }
    
    document.getElementById('eaTotalExams').textContent = fa(totalExams);
    document.getElementById('eaAvgPct').textContent = fa(globalPct) + '٪';
    
    // پیدا کردن بهترین درس
    let bestSubj = '-';
    let bestPct = -1;
    Object.keys(subjectStats).forEach(name => {
        const st = subjectStats[name];
        const score = (st.correct * 3) - st.wrong;
        const pct = st.totalQ > 0 ? Math.round((score / (st.totalQ * 3)) * 100) : 0;
        if (pct > bestPct) { bestPct = pct; bestSubj = name; }
    });
    document.getElementById('eaBestSubj').textContent = bestSubj;
    
    // 2. تحلیل درس به درس
    const subjList = document.getElementById('eaSubjectsList');
    let subjHtml = '';
    
    // مرتب سازی بر اساس درصد
    const sortedSubjs = Object.keys(subjectStats).map(name => {
        const st = subjectStats[name];
        const score = (st.correct * 3) - st.wrong;
        const pct = st.totalQ > 0 ? Math.round((score / (st.totalQ * 3)) * 100) : 0;
        return { name, pct, st };
    }).sort((a,b) => b.pct - a.pct);
    
    sortedSubjs.forEach(item => {
        let color = 'var(--success)';
        if (item.pct < 50) color = 'var(--danger)';
        else if (item.pct < 75) color = 'var(--accent)';
        
        const icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[item.name]) ? SUBJECT_ICONS[item.name] : '📚';
        
        subjHtml += \`
            <div class="ea-subj-item">
                <div class="ea-subj-head">
                    <span>\${icon} \${esc(item.name)}</span>
                    <span style="color:\${color}">\${fa(item.pct)}٪</span>
                </div>
                <div class="ea-subj-bar-bg">
                    <div class="ea-subj-bar-fill" style="width:\${item.pct}%; background:\${color};"></div>
                </div>
            </div>
        \`;
    });
    subjList.innerHTML = subjHtml;
    
    // 3. کیفیت پاسخ‌دهی
    const qualityWrap = document.getElementById('eaQualityList');
    const totalAll = globalCorrect + globalWrong + globalUnans;
    
    if (totalAll > 0) {
        const cShare = Math.round((globalCorrect / totalAll) * 100);
        const wShare = Math.round((globalWrong / totalAll) * 100);
        const uShare = Math.round((globalUnans / totalAll) * 100);
        
        qualityWrap.innerHTML = \`
            <div class="ea-quality-wrap">
                <div class="ea-donut" style="background: conic-gradient(var(--success) 0% \${cShare}%, var(--danger) \${cShare}% \${cShare + wShare}%, var(--border) \${cShare + wShare}% 100%);">
                    <div class="ea-donut-inner">\${fa(cShare)}٪</div>
                </div>
                <div class="ea-legend">
                    <div class="ea-legend-item">
                        <div style="display:flex; align-items:center;"><div class="ea-legend-color" style="background:var(--success)"></div> درست</div>
                        <div class="ea-legend-val">\${fa(globalCorrect)}</div>
                    </div>
                    <div class="ea-legend-item">
                        <div style="display:flex; align-items:center;"><div class="ea-legend-color" style="background:var(--danger)"></div> غلط</div>
                        <div class="ea-legend-val">\${fa(globalWrong)}</div>
                    </div>
                    <div class="ea-legend-item">
                        <div style="display:flex; align-items:center;"><div class="ea-legend-color" style="background:var(--border)"></div> نزده</div>
                        <div class="ea-legend-val">\${fa(globalUnans)}</div>
                    </div>
                </div>
            </div>
        \`;
    }
};

// اتصال به go
if (typeof go !== 'undefined') {
    const originalGoExam = go;
    window.go = function(id) {
        originalGoExam(id);
        if (id === 'exam-analysis') {
            setTimeout(() => { if (typeof renderExamAnalysis === 'function') renderExamAnalysis(); }, 50);
        }
    };
}

// اجرای اولیه
setTimeout(() => {
    if (document.getElementById('exam-analysis') && document.getElementById('exam-analysis').classList.contains('active')) {
        if (typeof renderExamAnalysis === 'function') renderExamAnalysis();
    }
}, 1500);
`;

js += "\n" + analysisJS;
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

console.log("🎉 صفحه تحلیل آزمون ساخته شد! حالا Ctrl+F5 بزن.");
