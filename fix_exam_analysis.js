const fs = require('fs');

console.log("🧹 در حال حذف دکمه‌های تکراری و ارتقای صفحه تحلیل آزمون...");

// ==========================================
// 1. اصلاح صفحه اصلی (حذف دکمه‌های تکراری)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// پیدا کردن و حذف تمام دکمه‌های تحلیل آزمون (با هر آیکون و اسمی)
const regex = /<div class="nimkat-card" onclick="go\('exam-analysis'\)[\s\S]*?<\/div><\/div>/g;
const regex2 = /<div class="nimkat-card" onclick="go\('exams'\)[\s\S]*?<\/div><\/div>/g;

html = html.replace(regex, '');
html = html.replace(regex2, '');

// اضافه کردن فقط یک دکمه استاندارد و شیک
const finalBtn = `<div class="nimkat-card" onclick="go('exam-analysis')"><div class="nimkat-icon">📊</div><div class="nimkat-title">تحلیل آزمون</div></div>`;
// قرار دادن دکمه دقیقاً قبل از دکمه دفتر اشتباهات
html = html.replace('<div class="nimkat-card" onclick="go(\'mistakes\')">', finalBtn + '\n<div class="nimkat-card" onclick="go(\'mistakes\')">');

// ==========================================
// 2. بازسازی کامل سکشن تحلیل آزمون
// ==========================================
const analysisSection = `
<section id="exam-analysis">
    <div class="container" style="padding-top:20px; padding-bottom:100px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">📊 تحلیل آزمون‌ها</h2>
            <button class="btn btn-primary" onclick="ExamEditor.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">+ ثبت آزمون</button>
        </div>
        
        <div id="eaEmptyState" style="display:none; text-align:center; padding:40px 20px; color:var(--text-light);">
            <div style="font-size:4em; margin-bottom:10px;">📉</div>
            <div style="font-weight:800; font-size:1.2em; margin-bottom:10px;">هنوز آزمونی ثبت نکرده‌اید!</div>
            <div style="font-size:0.9em; line-height:1.8; margin-bottom:20px;">با ثبت اولین آزمون، می‌توانید نقاط قوت و ضعف خود را دقیق بشناسید.</div>
            <button class="btn btn-primary" onclick="ExamEditor.open()" style="padding:12px 25px; border-radius:12px;">ثبت اولین آزمون</button>
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
                <h3 class="ea-card-title">🔍 استراتژی پاسخ‌دهی (کل آزمون‌ها)</h3>
                <div id="eaQualityList"></div>
            </div>

            <!-- لیست آزمون‌های اخیر -->
            <div class="ea-card">
                <h3 class="ea-card-title" style="justify-content:space-between;">
                    <span>🗓 آزمون‌های اخیر</span>
                    <span style="font-size:0.7em; color:var(--text-light); font-weight:normal;">برای دیدن کارنامه کلیک کنید</span>
                </h3>
                <div id="eaRecentList" class="sp-exam-list"></div>
            </div>
        </div>
    </div>
</section>
`;

// جایگزینی سکشن قبلی
const oldSectionStart = html.indexOf('<section id="exam-analysis">');
const oldSectionEnd = html.indexOf('</section>', oldSectionStart) + 10;
if (oldSectionStart !== -1 && oldSectionEnd !== -1) {
    html = html.slice(0, oldSectionStart) + analysisSection + html.slice(oldSectionEnd);
}

fs.writeFileSync('index.html', html);
console.log("✅ دکمه‌ها یکپارچه شدند و ساختار HTML تحلیل آزمون ارتقا یافت.");

// ==========================================
// 3. ارتقای منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// حذف تابع قدیمی رندر تحلیل
const oldRenderStart = js.indexOf('window.renderExamAnalysis = function() {');
if (oldRenderStart !== -1) {
    const oldRenderEnd = js.indexOf('// اتصال به go', oldRenderStart);
    if (oldRenderEnd !== -1) {
        js = js.slice(0, oldRenderStart) + js.slice(oldRenderEnd);
    }
}

const newAnalysisLogic = `
// ============ EXAM ANALYSIS (FINAL UPGRADE) ============
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
    
    // مرتب سازی از جدید به قدیم
    exams.sort((a,b) => b.ts - a.ts);
    
    exams.forEach(e => {
        let subs = e.subjects;
        if (!subs) {
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
    
    // بهترین درس
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
                    <span>\${icon} \${esc(item.name)} <span style="font-size:0.8em; color:var(--text-light); font-weight:normal;">(\${fa(item.st.count)} آزمون)</span></span>
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
    
    // 4. آزمون‌های اخیر
    const recentList = document.getElementById('eaRecentList');
    let recentHtml = '';
    
    exams.slice(0, 5).forEach(e => {
        let subs = e.subjects || [{ name: e.subject || 'نامشخص', total: e.total, correct: e.correct, wrong: e.wrong, unans: e.unans }];
        let totalQ = 0, tCorrect = 0, tWrong = 0;
        subs.forEach(s => { totalQ += s.total; tCorrect += s.correct; tWrong += s.wrong; });
        
        const score = (tCorrect * 3) - tWrong;
        let pct = totalQ > 0 ? Math.round((score / (totalQ * 3)) * 100) : 0;
        if(pct < 0) pct = 0;
        
        let color = pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
        
        recentHtml += \`
            <div class="exam-card" style="border-right-color:\${color}" onclick="ExamViewer.open(\${e.id})">
                <div class="exam-card-info">
                    <div class="exam-card-title">\${esc(e.title)}</div>
                    <div class="exam-card-sub">\${fa(totalQ)} سوال — \${esc(e.date)}</div>
                </div>
                <div class="exam-card-score">
                    <div class="exam-card-pct" style="color:\${color}">\${fa(pct)}٪</div>
                </div>
            </div>
        \`;
    });
    recentList.innerHTML = recentHtml;
};

// اتصال به go
if (typeof go !== 'undefined') {
    const originalGoExam2 = go;
    window.go = function(id) {
        originalGoExam2(id);
        if (id === 'exam-analysis') {
            setTimeout(() => { if (typeof renderExamAnalysis === 'function') renderExamAnalysis(); }, 50);
        }
    };
}
`;

js += "\n" + newAnalysisLogic;
fs.writeFileSync('app.js', js);
console.log("✅ منطق جاوااسکریپت ارتقا یافت.");

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

console.log("🎉 تحلیل آزمون یکپارچه و فوق‌العاده کاربردی شد! حالا Ctrl+F5 بزن.");
