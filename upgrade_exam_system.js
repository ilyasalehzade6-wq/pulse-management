const fs = require('fs');

console.log("🧪 در حال ساخت سیستم کامل تحلیل آزمون و تکمیل فرم ثبت مطالعه...");

// ==========================================
// 1. تغییرات HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن تب‌ها و بخش آزمون‌ها به صفحه برنامه مطالعاتی
const studyPlanHTML = `
<section id="study-plan">
    <div class="container" style="padding-top:20px; padding-bottom:100px;">
        <h2>📝 برنامه مطالعاتی</h2>
        
        <!-- تب‌ها -->
        <div class="sp-tabs">
            <button class="sp-tab active" id="tabStudy" onclick="StudyPlan.switchTab('study')">📖 مطالعه</button>
            <button class="sp-tab" id="tabExam" onclick="StudyPlan.switchTab('exam')">📝 آزمون‌ها</button>
        </div>

        <!-- بخش مطالعه -->
        <div id="spStudySection">
            <div class="sp-nav">
                <button class="sp-nav-btn" onclick="StudyPlan.prevDay()">❮ روز قبل</button>
                <div class="sp-date" id="spDate" onclick="StudyPlan.openDatePicker()">تاریخ</div>
                <button class="sp-nav-btn" onclick="StudyPlan.nextDay()">روز بعد ❯</button>
            </div>
            <div class="sp-total" id="spTotal">مجموع: ۰ دقیقه</div>
            <div class="sp-list" id="spList"></div>
            <button class="sp-add-btn" onclick="StudyEditor.open()">+ ثبت مطالعه</button>
        </div>

        <!-- بخش آزمون‌ها -->
        <div id="spExamSection" style="display:none;">
            <div class="sp-exam-header">
                <div class="sp-exam-title">📊 کارنامه آزمون‌ها</div>
                <button class="btn btn-primary" onclick="ExamEditor.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">+ ثبت آزمون</button>
            </div>
            <div class="sp-exam-list" id="spExamList"></div>
        </div>
    </div>
</section>
`;

// جایگزینی سکشن برنامه مطالعاتی
const spStart = html.indexOf('<section id="study-plan">');
const spEnd = html.indexOf('</section>', spStart) + 10;
if (spStart !== -1 && spEnd !== -1) {
    html = html.slice(0, spStart) + studyPlanHTML + html.slice(spEnd);
}

// ب) اضافه کردن کادر تعداد تست به مودال مطالعه
const testCountHTML = `
            <div class="inp-group" id="seTestCountGroup" style="margin-top:15px; display:none;">
                <div style="font-size:0.9em; font-weight:700; color:var(--text-light); margin-bottom:10px; text-align:center;">تعداد تست</div>
                <input type="number" id="editTestCount" class="inp" placeholder="تعداد تست..." style="text-align:center; font-weight:800; font-size:1.2em; border-radius:12px;">
                <div class="se-quick-times">
                    <button onclick="StudyEditor.setTestCount(10)">۱۰</button>
                    <button onclick="StudyEditor.setTestCount(20)">۲۰</button>
                    <button onclick="StudyEditor.setTestCount(30)">۳۰</button>
                    <button onclick="StudyEditor.setTestCount(40)">۴۰</button>
                    <button onclick="StudyEditor.setTestCount(50)">۵۰</button>
                </div>
            </div>
`;

// تزریق قبل از بخش توضیحات
html = html.replace('<div class="inp-group" style="margin-top:15px;">\n                <input type="text" id="editDesc"', testCountHTML + '\n            <div class="inp-group" style="margin-top:15px;">\n                <input type="text" id="editDesc"');

// ج) ساخت مودال ثبت آزمون
const examModalHTML = `
<div class="modal-overlay" id="examEditorModal" onclick="if(event.target===this)ExamEditor.close()">
    <div class="modal-box" style="max-width: 450px; border-radius: 20px;">
        <div class="modal-header">
            <h3 style="margin:0;" id="eeTitle">ثبت آزمون جدید</h3>
            <button class="modal-close" onclick="ExamEditor.close()">✕</button>
        </div>
        
        <div class="modal-body">
            <div class="inp-group">
                <label>عنوان آزمون</label>
                <input type="text" id="eeTitleInput" class="inp" placeholder="مثلاً: آزمون ماز مرحله ۱">
            </div>
            
            <div class="inp-row">
                <div class="inp-group" style="flex:1;">
                    <label>درس</label>
                    <select id="eeSubject" class="inp">
                        <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                        <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                        <option value="عربی">عربی</option><option value="زبان">زبان</option>
                        <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                        <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                        <option value="آزمون جامع">آزمون جامع</option>
                    </select>
                </div>
                <div class="inp-group" style="flex:1;">
                    <label>تاریخ</label>
                    <input type="text" id="eeDate" class="inp" readonly onclick="JalaliPicker.open(this)" placeholder="انتخاب تاریخ">
                </div>
            </div>

            <div class="inp-group" style="margin-top:10px;">
                <label>تعداد کل سوالات</label>
                <input type="number" id="eeTotal" class="inp" placeholder="مثلاً ۱۰۰" oninput="ExamEditor.calculate()">
            </div>

            <div class="inp-row" style="margin-top:10px;">
                <div class="inp-group" style="flex:1;">
                    <label style="color:var(--success);">درست</label>
                    <input type="number" id="eeCorrect" class="inp" placeholder="۰" oninput="ExamEditor.calculate()">
                </div>
                <div class="inp-group" style="flex:1;">
                    <label style="color:var(--danger);">غلط</label>
                    <input type="number" id="eeWrong" class="inp" placeholder="۰" oninput="ExamEditor.calculate()">
                </div>
                <div class="inp-group" style="flex:1;">
                    <label style="color:var(--text-light);">نزده</label>
                    <input type="number" id="eeUnans" class="inp" placeholder="۰" oninput="ExamEditor.calculate()">
                </div>
            </div>

            <!-- پیش‌نمایش درصد -->
            <div class="ee-preview" id="eePreview">
                <div style="font-size:0.8em; color:var(--text-light);">درصد کنکوری (با نمره منفی):</div>
                <div style="font-size:1.8em; font-weight:900; color:var(--primary);" id="eePercent">۰٪</div>
            </div>
        </div>
        
        <div class="modal-footer">
            <button id="seCancelBtn" onclick="ExamEditor.close()" style="flex:1;">انصراف</button>
            <button id="seSaveBtn" onclick="ExamEditor.save()" style="flex:2;">ثبت آزمون</button>
        </div>
    </div>
</div>
`;

if (!html.includes('id="examEditorModal"')) {
    html = html.replace('</body>', examModalHTML + '\n</body>');
}

fs.writeFileSync('index.html', html);
console.log("✅ ساختار HTML آپدیت شد.");

// ==========================================
// 2. افزودن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const examCSS = `
/* ============ STUDY PLAN TABS ============ */
.sp-tabs {
    display: flex; gap: 10px; margin-bottom: 20px; background: var(--bg-card);
    padding: 5px; border-radius: 14px; border: 1px solid var(--border);
}
.sp-tab {
    flex: 1; padding: 12px; border: none; background: transparent; border-radius: 10px;
    font-family: inherit; font-size: 0.9em; font-weight: 800; color: var(--text-light); cursor: pointer; transition: all 0.3s;
}
.sp-tab.active { background: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(0,150,136,0.2); }

/* ============ EXAMS LIST ============ */
.sp-exam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.sp-exam-title { font-size: 1.1em; font-weight: 800; color: var(--text); }
.sp-exam-list { display: flex; flex-direction: column; gap: 10px; }
.exam-card {
    background: var(--bg-card); border-radius: 14px; padding: 15px;
    border: 1px solid var(--border); border-right: 4px solid var(--primary);
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03); cursor: pointer;
}
.exam-card-info { display: flex; flex-direction: column; gap: 5px; }
.exam-card-title { font-weight: 800; font-size: 0.95em; color: var(--text); }
.exam-card-sub { font-size: 0.75em; color: var(--text-light); }
.exam-card-score { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.exam-card-pct { font-size: 1.4em; font-weight: 900; color: var(--success); }
.exam-card-detail { font-size: 0.65em; color: var(--text-light); font-weight: 700; }

/* ============ EXAM MODAL PREVIEW ============ */
.ee-preview {
    background: var(--bg); border-radius: 12px; padding: 15px; text-align: center;
    margin-top: 15px; border: 1px dashed var(--primary);
}
`;
fs.writeFileSync('style.css', css + "\n" + examCSS);

// ==========================================
// 3. تغییرات JavaScript
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// الف) تکمیل StudyEditor برای تعداد تست
js = js.replace(
    "document.getElementById('editMinutes').value = '';\n        document.getElementById('editDesc').value = '';",
    "document.getElementById('editMinutes').value = '';\n        document.getElementById('editDesc').value = '';\n        document.getElementById('editTestCount').value = '';\n        document.getElementById('seTestCountGroup').style.display = 'none';"
);

js = js.replace(
    "document.getElementById('editDesc').value = target.desc || '';",
    "document.getElementById('editDesc').value = target.desc || '';\n        document.getElementById('editTestCount').value = target.testCount || '';\n        if(target.activity === 'تست') document.getElementById('seTestCountGroup').style.display = 'block';\n        else document.getElementById('seTestCountGroup').style.display = 'none';"
);

// تغییر منطق انتخاب فعالیت برای نمایش تعداد تست
const originalSetActivity = `
window.StudyEditor.setActivity = function(act, btn) {
    this.activity = act;
    document.querySelectorAll('.se-act-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    document.getElementById('seTestCountGroup').style.display = (act === 'تست') ? 'block' : 'none';
};
window.StudyEditor.setTestCount = function(c) {
    document.getElementById('editTestCount').value = c;
};
`;

// اضافه کردن متد ذخیره تعداد تست در StudyEditor.save
js = js.replace(
    "const desc = document.getElementById('editDesc').value.trim();",
    "const desc = document.getElementById('editDesc').value.trim();\n        const testCount = parseInt(document.getElementById('editTestCount').value) || 0;"
);
js = js.replace(
    "log[logIdx].desc = desc;",
    "log[logIdx].desc = desc;\n                log[logIdx].testCount = testCount;"
);
js = js.replace(
    "sessions[sesIdx].desc = desc;",
    "sessions[sesIdx].desc = desc;\n                sessions[sesIdx].tests = testCount;"
);
js = js.replace(
    "log.push({ date: this.currentDate, hours: min / 60, subject: subj, activity: this.activity, desc: desc, ts: newTs });",
    "log.push({ date: this.currentDate, hours: min / 60, subject: subj, activity: this.activity, desc: desc, testCount: testCount, ts: newTs });"
);
js = js.replace(
    "sessions.push({ id: newTs, date: this.currentDate, subj: subj, min: min, topic: this.activity, desc: desc, pages: 0, tests: 0, ts: newTs });",
    "sessions.push({ id: newTs, date: this.currentDate, subj: subj, min: min, topic: this.activity, desc: desc, pages: 0, tests: testCount, ts: newTs });"
);

// ب) اضافه کردن منطق تب‌ها و آزمون‌ها به StudyPlan
const examLogic = `
// ============ EXAM MANAGER & TABS ============
StudyPlan.currentTab = 'study';
StudyPlan.switchTab = function(tab) {
    this.currentTab = tab;
    if (tab === 'study') {
        document.getElementById('spStudySection').style.display = 'block';
        document.getElementById('spExamSection').style.display = 'none';
        document.getElementById('tabStudy').classList.add('active');
        document.getElementById('tabExam').classList.remove('active');
        this.render();
    } else {
        document.getElementById('spStudySection').style.display = 'none';
        document.getElementById('spExamSection').style.display = 'block';
        document.getElementById('tabStudy').classList.remove('active');
        document.getElementById('tabExam').classList.add('active');
        ExamEditor.renderExams();
    }
};

window.ExamEditor = {
    open: function() {
        document.getElementById('examEditorModal').classList.add('active');
        const dateInput = document.getElementById('eeDate');
        const sh = getShamsi();
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        dateInput.dataset.gregorian = today();
        
        document.getElementById('eeTitleInput').value = '';
        document.getElementById('eeTotal').value = '';
        document.getElementById('eeCorrect').value = '';
        document.getElementById('eeWrong').value = '';
        document.getElementById('eeUnans').value = '';
        this.calculate();
    },
    close: function() { document.getElementById('examEditorModal').classList.remove('active'); },
    calculate: function() {
        const total = parseInt(document.getElementById('eeTotal').value) || 0;
        const correct = parseInt(document.getElementById('eeCorrect').value) || 0;
        const wrong = parseInt(document.getElementById('eeWrong').value) || 0;
        
        let pct = 0;
        if (total > 0) {
            // فرمول کنکور: هر ۳ غلط یک درست را خنثی می‌کند
            const score = (correct * 3) - wrong;
            pct = Math.round((score / (total * 3)) * 100);
            if(pct < 0) pct = 0;
        }
        document.getElementById('eePercent').textContent = fa(pct) + '٪';
    },
    save: function() {
        const title = document.getElementById('eeTitleInput').value.trim();
        const subj = document.getElementById('eeSubject').value;
        const date = document.getElementById('eeDate').dataset.gregorian || today();
        const total = parseInt(document.getElementById('eeTotal').value) || 0;
        const correct = parseInt(document.getElementById('eeCorrect').value) || 0;
        const wrong = parseInt(document.getElementById('eeWrong').value) || 0;
        const unans = parseInt(document.getElementById('eeUnans').value) || 0;
        
        if (!title) return toast('عنوان آزمون را وارد کنید');
        if (total <= 0) return toast('تعداد کل سوالات را وارد کنید');
        if (correct + wrong + unans > total) return toast('جمع درست+غلط+نزده بیشتر از کل است');
        
        const exams = getData('ilia-exam-analysis', []);
        exams.push({ id: Date.now(), title, date, total, correct, wrong, unans, subject: subj, ts: Date.now() });
        setData('ilia-exam-analysis', exams);
        
        this.close();
        toast('✅ آزمون ثبت شد');
        this.renderExams();
        if (typeof refreshAppData === 'function') refreshAppData();
    },
    renderExams: function() {
        const list = document.getElementById('spExamList');
        if (!list) return;
        
        const exams = getData('ilia-exam-analysis', []);
        if (exams.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:var(--text-light); padding:30px 10px; font-weight:700;">هنوز آزمونی ثبت نکرده‌اید.</div>';
            return;
        }
        
        // مرتب سازی از جدید به قدیم
        exams.sort((a,b) => b.ts - a.ts);
        
        list.innerHTML = exams.map(e => {
            const score = (e.correct * 3) - e.wrong;
            let pct = Math.round((score / (e.total * 3)) * 100);
            if(pct < 0) pct = 0;
            
            let color = 'var(--success)';
            if (pct < 50) color = 'var(--danger)';
            else if (pct < 75) color = 'var(--accent)';
            
            return \`
                <div class="exam-card" style="border-right-color:\${color}" onclick="ExamEditor.deleteExam(\${e.id})">
                    <div class="exam-card-info">
                        <div class="exam-card-title">\${esc(e.title)}</div>
                        <div class="exam-card-sub">\${esc(e.subject)} — \${fa(e.total)} سوال</div>
                        <div class="exam-card-sub" style="font-size:0.65em; margin-top:3px;">\${esc(e.date)}</div>
                    </div>
                    <div class="exam-card-score">
                        <div class="exam-card-pct" style="color:\${color}">\${fa(pct)}٪</div>
                        <div class="exam-card-detail">\${fa(e.correct)}✓ \${fa(e.wrong)}✗</div>
                    </div>
                </div>
            \`;
        }).join('');
    },
    deleteExam: function(id) {
        if (!confirm('آیا از حذف این آزمون مطمئن هستید؟')) return;
        let exams = getData('ilia-exam-analysis', []);
        exams = exams.filter(e => e.id !== id);
        setData('ilia-exam-analysis', exams);
        toast('🗑 آزمون حذف شد');
        this.renderExams();
        if (typeof refreshAppData === 'function') refreshAppData();
    }
};
`;

if (!js.includes('StudyPlan.switchTab')) {
    js += "\n" + originalSetActivity + "\n" + examLogic;
}

// ج) اصلاح رندر StudyPlan برای نمایش تعداد تست در کارت‌ها
js = js.replace(
    "\${l.desc ? \`<div class=\"sp-card-desc\">\${esc(l.desc)}</div>\` : ''}",
    "\${l.testCount ? \`<div class=\"sp-card-desc\">📝 \${fa(l.testCount)} تست</div>\` : ''}\n                        \${l.desc ? \`<div class=\"sp-card-desc\">\${esc(l.desc)}</div>\` : ''}"
);

// د) آپدیت تابع go برای پشتیبانی از تب‌ها
js = js.replace(
    "if (id === 'study-plan') {\n            setTimeout(() => StudyPlan.init(), 50);",
    "if (id === 'study-plan') {\n            setTimeout(() => { StudyPlan.init(); StudyPlan.switchTab('study'); }, 50);"
);

fs.writeFileSync('app.js', js);
console.log("✅ منطق جاوااسکریپت آپدیت شد.");

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
html = html.replace(/<link rel="stylesheet" href="style\.css.*?">/, '<link rel="stylesheet" href="style.css?v=' + version + '">');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 سیستم آزمون و تحلیل با موفقیت اضافه شد! حالا Ctrl+F5 بزن.");
