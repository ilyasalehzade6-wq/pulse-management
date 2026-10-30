const fs = require('fs');

console.log("🧠 در حال ساخت تحلیلگر هوشمند (ارتقای ۳ برابری مغز برنامه)...");

// ==========================================
// 1. تغییرات HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن دکمه تحلیلگر به تب لایتنر
html = html.replace(
    '<button class="btn btn-info" onclick="LeitnerManager.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">📋 مدیریت</button>',
    '<button class="btn btn-accent" onclick="SmartAnalyzer.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px; background:linear-gradient(135deg,#8b5cf6,#6d28d9); border:none; color:#fff;">🧠 تحلیلگر هوشمند</button><button class="btn btn-info" onclick="LeitnerManager.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">📋 مدیریت</button>'
);

// ب) ساخت مودال تحلیلگر
const analyzerModalHTML = `
<div class="modal-overlay" id="smartAnalyzerModal" onclick="if(event.target===this)SmartAnalyzer.close()">
    <div class="modal-box" style="max-width: 550px; border-radius: 20px; display:flex; flex-direction:column; max-height:90vh;">
        <div class="modal-header" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: #fff; border-bottom: none;">
            <div>
                <h3 style="margin:0; font-size:1.2em;">🧠 تحلیلگر هوشمند</h3>
                <div style="font-size:0.75em; opacity:0.8; margin-top:5px;">ارزیابی جامع تمام دروس بر اساس زمان، نمرات، آزمون‌ها و لایتنر</div>
            </div>
            <button class="modal-close" style="background:rgba(255,255,255,0.2); color:#fff;" onclick="SmartAnalyzer.close()">✕</button>
        </div>
        
        <div class="modal-body" style="flex:1; overflow-y:auto; padding:15px; background:var(--bg);">
            <div id="saSummary" style="margin-bottom:15px;"></div>
            <div id="saList" style="display:flex; flex-direction:column; gap:12px;"></div>
        </div>
        
        <div class="modal-footer" style="padding:15px; border-top:1px solid var(--border); background:var(--bg-card);">
            <button class="btn btn-secondary btn-block" onclick="SmartAnalyzer.close()">بستن تحلیل</button>
        </div>
    </div>
</div>
`;

if (!html.includes('id="smartAnalyzerModal"')) {
    html = html.replace('</body>', analyzerModalHTML + '\n</body>');
}

fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const saCSS = `
/* ============ SMART ANALYZER ============ */
.sa-summary-box {
    background: var(--bg-card); border-radius: 14px; padding: 15px;
    border: 1px solid var(--border); text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.sa-summary-title { font-size: 1.1em; font-weight: 800; margin-bottom: 5px; }
.sa-summary-text { font-size: 0.85em; color: var(--text-light); line-height: 1.7; }

.sa-card {
    background: var(--bg-card); border-radius: 14px; padding: 15px;
    border: 1px solid var(--border); border-right: 5px solid var(--border);
    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.sa-card.critical { border-right-color: var(--danger); }
.sa-card.warning { border-right-color: var(--accent); }
.sa-card.good { border-right-color: var(--success); }

.sa-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sa-card-title { font-size: 1em; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.sa-card-status { font-size: 0.75em; font-weight: 700; padding: 4px 10px; border-radius: 8px; }
.sa-card-status.critical { background: rgba(239,68,68,0.1); color: var(--danger); }
.sa-card-status.warning { background: rgba(245,158,11,0.1); color: var(--accent); }
.sa-card-status.good { background: rgba(16,185,129,0.1); color: var(--success); }

.sa-card-reasons { font-size: 0.85em; color: var(--text); line-height: 1.8; margin-bottom: 12px; }
.sa-card-reasons span { display: inline-block; background: var(--bg); padding: 3px 8px; border-radius: 6px; margin: 2px; border: 1px solid var(--border); }

.sa-card-advice {
    font-size: 0.85em; background: rgba(139, 92, 246, 0.05); border: 1px dashed #8b5cf6;
    border-radius: 10px; padding: 10px 12px; color: var(--text); line-height: 1.7;
}
.sa-card-advice b { color: #8b5cf6; }
`;
fs.writeFileSync('style.css', css + "\n" + saCSS);

// ==========================================
// 3. منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const analyzerLogic = `
// ============ SMART ANALYZER (3X BRAIN) ============
window.SmartAnalyzer = {
    open: function() {
        document.getElementById('smartAnalyzerModal').classList.add('active');
        this.analyze();
    },
    
    close: function() {
        document.getElementById('smartAnalyzerModal').classList.remove('active');
    },
    
    analyze: function() {
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
            
            // 1. بررسی زمان آخرین مطالعه
            const subjLogs = logs.filter(s => (s.subject || '').includes(subj));
            let daysSince = 999;
            if (subjLogs.length > 0) {
                subjLogs.sort((a,b) => b.date.localeCompare(a.date));
                const lastDate = subjLogs[0].date;
                daysSince = Math.floor((new Date(t + 'T00:00:00') - new Date(lastDate + 'T00:00:00')) / 86400000);
                if (daysSince >= 5) { issues.push(\`🚨 \${daysSince} روز نخوندی\`); isCritical = true; }
                else if (daysSince >= 3) { issues.push(\`⚠️ \${daysSince} روز نخوندی\`); isWarning = true; }
            } else {
                issues.push('🚨 هنوز شروع نکردی!'); 
                isCritical = true;
            }
            
            // 2. بررسی حجم مطالعه (ساعت)
            const totalHours = subjLogs.reduce((a,b) => a + (b.hours || 0), 0);
            if (totalHours < 1 && subjLogs.length > 0) { issues.push('📉 زمان مطالعه خیلی کم'); isWarning = true; }
            
            // 3. بررسی نمرات مدرسه
            const subjGrades = grades.filter(g => (g.subject || '').includes(subj));
            let gradeAvg = null;
            if (subjGrades.length > 0) {
                gradeAvg = subjGrades.reduce((a,b) => a + b.value, 0) / subjGrades.length;
                if (gradeAvg < 12) { issues.push(\`📉 معدل ضعیف (\${gradeAvg.toFixed(1)})\`); isCritical = true; }
                else if (gradeAvg < 15) { issues.push(\`📊 معدل مرزی (\${gradeAvg.toFixed(1)})\`); isWarning = true; }
            }
            
            // 4. بررسی آزمون‌ها
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
            
            // 5. بررسی بازدهی (زمان زیاد + آزمون کم)
            if (totalHours > 5 && examAvg !== null && examAvg < 40) {
                issues.push('🔍 مطالعه بی‌بازده (زمان زیاد، نتیجه کم)');
                advice = '<b>هشدار بازدهی:</b> زمان زیادی برای این درس گذاشتی اما نتیجه‌ی آزمون خوب نبوده. روش مطالعه‌ت رو عوض کن! به جای فقط خوندن، برو سراغ <b>حل تست</b> و تحلیل اشتباهات.';
            }
            
            // 6. بررسی لایتنر
            const subjLeitner = leitner.filter(l => (l.subject || '').includes(subj) && (l.box || 1) === 1);
            if (subjLeitner.length > 5) {
                issues.push(\`🗂 \${subjLeitner.length} کارت لایتنر فراموش‌شده\`);
                isWarning = true;
                if (!advice) advice = '<b>مشکل حافظه:</b> کارت‌های زیادی در جعبه ۱ لایتنر داری. یعنی لغات یا فرمول‌ها رو فراموش کردی. برو بخش لایتنر و این کارت‌ها رو مرور کن.';
            }
            
            // تعیین راهکار پیش‌فرض اگر advice خالی بود
            if (!advice) {
                if (isCritical) advice = '<b>وضعیت بحرانی:</b> این درس رو باید همین امروز شروع کنی. حداقل ۳۰ دقیقه زمان بده و از مباحث ساده شروع کن.';
                else if (isWarning) advice = '<b>نیاز به توجه:</b> عقب‌نموندی رو جبران کن. یک بلوک ۴۰ دقیقه‌ای برای این درس در برنامه‌ت بذار.';
            }
            
            if (issues.length > 0) {
                results.push({
                    subj: subj,
                    issues: issues,
                    advice: advice,
                    status: isCritical ? 'critical' : (isWarning ? 'warning' : 'good')
                });
            }
        });
        
        // مرتب‌سازی: بحرانی‌ها اول
        results.sort((a,b) => {
            const s = { critical: 1, warning: 2, good: 3 };
            return s[a.status] - s[b.status];
        });
        
        // رندر
        const list = document.getElementById('saList');
        const summary = document.getElementById('saSummary');
        
        if (results.length === 0) {
            summary.innerHTML = '<div class="sa-summary-box"><div class="sa-summary-title" style="color:var(--success)">✅ عالی!</div><div class="sa-summary-text">طبق تحلیل هوشمند، در هیچ درسی مشکل جدی نداری. داری عالی پیش می‌ری!</div></div>';
            list.innerHTML = '';
            return;
        }
        
        const criticalCount = results.filter(r => r.status === 'critical').length;
        summary.innerHTML = \`
            <div class="sa-summary-box">
                <div class="sa-summary-title" style="color:\${criticalCount > 0 ? 'var(--danger)' : 'var(--accent)'}">
                    \${criticalCount > 0 ? '🚨 ' + fa(criticalCount) + ' درس بحرانی' : '⚠️ نیاز به توجه'}
                </div>
                <div class="sa-summary-text">تحلیلگر هوشمند داده‌های تو را بررسی کرد و این پیشنهادها را دارد:</div>
            </div>
        \`;
        
        list.innerHTML = results.map(r => {
            const icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[r.subj]) ? SUBJECT_ICONS[r.subj] : '📚';
            const statusLabel = r.status === 'critical' ? '🚨 بحرانی' : r.status === 'warning' ? '⚠️ هشدار' : '✅ خوب';
            const issuesHtml = r.issues.map(i => \`<span>\${i}</span>\`).join('');
            
            return \`
                <div class="sa-card \${r.status}">
                    <div class="sa-card-header">
                        <div class="sa-card-title">\${icon} \${esc(r.subj)}</div>
                        <div class="sa-card-status \${r.status}">\${statusLabel}</div>
                    </div>
                    <div class="sa-card-reasons">\${issuesHtml}</div>
                    <div class="sa-card-advice">💡 \${r.advice}</div>
                </div>
            \`;
        }).join('');
    }
};
`;

if (!js.includes('window.SmartAnalyzer')) {
    js += "\n" + analyzerLogic;
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

console.log("🎉 تحلیلگر هوشمند ۳ برابری ساخته شد! حالا Ctrl+F5 بزن.");
