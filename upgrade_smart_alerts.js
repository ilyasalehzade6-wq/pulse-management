const fs = require('fs');

console.log("🧠 در حال ساخت سیستم پیشنهاددهنده هوشمند (بر اساس زمان، آزمون و نمرات)...");

let js = fs.readFileSync('app.js', 'utf8');

const smartEngineJS = `
// ============ SMART DECISION SUPPORT ENGINE ============
window.SmartEngine = {
    getLastStudyDate: function(subj) {
        const logs = getData('ilia-log', []).filter(s => (s.subject || '').includes(subj));
        if (!logs || logs.length === 0) return null;
        // مرتب سازی بر اساس تاریخ نزولی
        logs.sort((a,b) => b.date.localeCompare(a.date));
        return logs[0].date;
    },

    generateSuggestions: function() {
        let suggestions = [];
        const t = today();
        const ALL_SUBJECTS = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'دینی', 'جغرافیا', 'نگارش'];
        
        const allGrades = getData('ilia-grades', []);
        const allExams = getData('ilia-exam-analysis', []);

        ALL_SUBJECTS.forEach(subj => {
            let reasons = [];
            let priority = 99; // هرچه کمتر، مهم‌تر

            // 1. بررسی زمان عدم مطالعه (فراموشی)
            const lastDate = this.getLastStudyDate(subj);
            let daysSince = 999;
            
            if (lastDate) {
                const d1 = new Date(t + 'T00:00:00');
                const d2 = new Date(lastDate + 'T00:00:00');
                daysSince = Math.floor((d1 - d2) / 86400000);
                
                if (daysSince >= 5) { reasons.push(\`🚨 \${daysSince} روزه نخوندی\`); priority = Math.min(priority, 1); }
                else if (daysSince >= 3) { reasons.push(\`⚠️ \${daysSince} روزه نخوندی\`); priority = Math.min(priority, 2); }
            } else {
                reasons.push('🚨 هنوز شروع نکردی!'); 
                priority = Math.min(priority, 1);
            }

            // 2. بررسی نمرات مدرسه
            const grades = allGrades.filter(g => (g.subject || '').includes(subj));
            if (grades.length > 0) {
                const avg = grades.reduce((a,b) => a + b.value, 0) / grades.length;
                if (avg < 12) { reasons.push(\`📉 معدل پایین (\${avg.toFixed(1)})\`); priority = Math.min(priority, 1); }
                else if (avg < 15) { reasons.push(\`📊 معدل نیاز به توجه (\${avg.toFixed(1)})\`); priority = Math.min(priority, 2); }
            }

            // 3. بررسی درصد آزمون‌ها
            let examCorrect = 0, examWrong = 0, examTotal = 0;
            allExams.forEach(e => {
                let subs = e.subjects || [{ name: e.subject || '', total: e.total, correct: e.correct, wrong: e.wrong }];
                subs.forEach(s => {
                    if ((s.name || '').includes(subj)) {
                        examCorrect += s.correct;
                        examWrong += s.wrong;
                        examTotal += s.total;
                    }
                });
            });

            if (examTotal > 0) {
                const score = (examCorrect * 3) - examWrong;
                let pct = Math.round((score / (examTotal * 3)) * 100);
                if(pct < 0) pct = 0;
                
                if (pct < 30) { reasons.push(\`📉 آزمون ضعیف (\${pct}٪)\`); priority = Math.min(priority, 1); }
                else if (pct < 50) { reasons.push(\`📊 آزمون نیاز به توجه (\${pct}٪)\`); priority = Math.min(priority, 2); }
            }

            // اگر دلیلی برای هشدار وجود داشت
            if (reasons.length > 0) {
                suggestions.push({
                    subj: subj,
                    priority: priority,
                    reasons: reasons
                });
            }
        });

        // مرتب‌سازی بر اساس اولویت (۱ مهم‌تر از ۲ و ۳)
        suggestions.sort((a,b) => a.priority - b.priority);
        
        // تبدیل به فرمت مورد نیاز ویجت داشبورد
        return suggestions.slice(0, 4).map((s, index) => ({
            priority: s.priority,
            icon: (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[s.subj]) ? SUBJECT_ICONS[s.subj] : '📚',
            title: 'تمرکز روی ' + s.subj,
            reason: s.reasons.join(' • '),
            action: 'بریم',
            handler: 'goWeak',
            subj: s.subj
        }));
    }
};

// ============ OVERRIDE DASHBOARD RENDER ============
// بازنویسی تابع رندر داشبورد برای استفاده از موتور هوشمند جدید
const originalRenderAutoPlan = renderAutoPlan;
window.renderAutoPlan = function() {
    const el = document.getElementById('autoPlanContainer');
    if (!el) return;
    if (!isSchoolStarted()) { el.innerHTML = ''; return; }

    const suggestions = SmartEngine.generateSuggestions();

    if (suggestions.length === 0) {
        el.innerHTML = '<div class="plan-daily">' +
            '<div class="plan-daily-title">🎯 تمرکز امروز</div>' +
            '<div class="plan-empty-msg">🎉 همه چیز روبراهه!<br>' +
            '<span style="font-size:.82em;opacity:.75;display:block;margin-top:6px">طبق تحلیل هوشمند، هیچ درسی عقب نیست و همه چیز در مسیر درست است.</span></div>' +
            '</div>';
        return;
    }

    const pLabels = { 1: '🔥', 2: '🎯', 3: '📌' };

    let html = '<div class="plan-daily">' +
        '<div class="plan-daily-title">🧠 پیشنهادهای هوشمند امروز</div>' +
        '<div class="plan-daily-sub">بر اساس تحلیل زمان، نمرات و آزمون‌ها</div>' +
        '<div class="plan-suggestions">';

    suggestions.forEach((s, i) => {
        const pClass = s.priority === 1 ? 'p1' : s.priority === 2 ? 'p2' : 'p3';
        const label = pLabels[s.priority] || '📌';
        
        html += '<div class="plan-sug">' +
            '<div class="plan-sug-num ' + pClass + '">' + label + '</div>' +
            '<div class="plan-sug-info">' +
                '<div class="plan-sug-title">' + s.icon + ' ' + esc(s.title) + '</div>' +
                '<div class="plan-sug-reason" style="line-height:1.6; margin-top:4px;">' + s.reason + '</div>' +
            '</div>' +
            '<button class="plan-sug-btn" onclick="runAutoPlanAction(' + i + ')">' + s.action + '</button>' +
        '</div>';
    });

    html += '</div></div>';
    el.innerHTML = html;

    window._lastAutoPlan = suggestions;
};

// اجرای فوری پس از لود
setTimeout(() => {
    if (document.getElementById('dashboard') && document.getElementById('dashboard').classList.contains('active')) {
        if (typeof renderAutoPlan === 'function') renderAutoPlan();
    }
}, 1000);
`;

if (!js.includes('window.SmartEngine')) {
    js += "\n" + smartEngineJS;
}

fs.writeFileSync('app.js', js);

// آپدیت کش
const version = Date.now();
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 موتور پیشنهاددهنده هوشمند فعال شد! حالا Ctrl+F5 بزن.");
