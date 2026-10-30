const fs = require('fs');

console.log("🏆 در حال ساخت سیستم جامع آزمون و کارنامه...");

// ==========================================
// 1. بازسازی HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// حذف مودال‌های قدیمی آزمون (اگر وجود دارند)
html = html.replace(/<div class="modal-overlay" id="examEditorModal"[\s\S]*?<\/body>/, '</body>');
html = html.replace(/<div class="modal-overlay" id="examViewerModal"[\s\S]*?<\/body>/, '</body>');

// ساخت مودال ثبت آزمون جدید (با قابلیت افزودن چند درس)
const examEditorHTML = `
<div class="modal-overlay" id="examEditorModal" onclick="if(event.target===this)ExamEditor.close()">
    <div class="modal-box" style="max-width: 600px; border-radius: 20px;">
        <div class="modal-header">
            <h3 style="margin:0;" id="eeTitle">ثبت آزمون جدید</h3>
            <button class="modal-close" onclick="ExamEditor.close()">✕</button>
        </div>
        
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div class="inp-row">
                <div class="inp-group" style="flex:2;">
                    <label>عنوان آزمون</label>
                    <input type="text" id="eeTitleInput" class="inp" placeholder="مثلاً: آزمون جامع ماز مرحله ۱">
                </div>
                <div class="inp-group" style="flex:1;">
                    <label>تاریخ</label>
                    <input type="text" id="eeDate" class="inp" readonly onclick="JalaliPicker.open(this)" placeholder="تاریخ">
                </div>
            </div>

            <div id="eeSubjectsContainer" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">
                <!-- درس‌ها اینجا اضافه می‌شوند -->
            </div>

            <button class="btn btn-secondary btn-block" onclick="ExamEditor.addSubjectRow()" style="margin-top:15px; border: 2px dashed var(--primary); color:var(--primary); background:transparent;">
                ➕ افزودن درس
            </button>

            <!-- خلاصه و پیش‌نمایش -->
            <div class="ee-summary">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:var(--text-light);">مجموع سوالات:</span>
                    <b id="eeTotalQ" style="color:var(--text);">۰</b>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--text-light);">درصد کل آزمون:</span>
                    <div style="font-size:1.8em; font-weight:900; color:var(--primary);" id="eePercent">۰٪</div>
                </div>
            </div>
        </div>
        
        <div class="modal-footer">
            <button id="seCancelBtn" onclick="ExamEditor.close()" style="flex:1;">انصراف</button>
            <button id="seSaveBtn" onclick="ExamEditor.save()" style="flex:2;">ثبت آزمون</button>
        </div>
    </div>
</div>
`;

// ساخت مودال نمایش کارنامه
const examViewerHTML = `
<div class="modal-overlay" id="examViewerModal" onclick="if(event.target===this)ExamViewer.close()">
    <div class="modal-box" style="max-width: 600px; border-radius: 20px; background:var(--bg);">
        <div class="modal-header" style="background:var(--bg-card); border-radius:20px 20px 0 0;">
            <div>
                <h3 style="margin:0;" id="evTitle">کارنامه آزمون</h3>
                <div style="font-size:0.8em; color:var(--text-light); margin-top:5px;" id="evDate">تاریخ</div>
            </div>
            <button class="modal-close" onclick="ExamViewer.close()">✕</button>
        </div>
        
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div class="ev-header-score">
                <div class="ev-total-pct" id="evTotalPct">۰٪</div>
                <div class="ev-subtitle">درصد کل آزمون (با نمره منفی)</div>
            </div>
            
            <div class="ev-table-wrap">
                <table class="ev-table">
                    <thead>
                        <tr>
                            <th>درس</th>
                            <th>کل</th>
                            <th style="color:var(--success)">درست</th>
                            <th style="color:var(--danger)">غلط</th>
                            <th style="color:var(--text-light)">نزده</th>
                            <th>درصد</th>
                        </tr>
                    </thead>
                    <tbody id="evTableBody">
                        <!-- سطرهای کارنامه -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="ExamViewer.close()" style="width:100%;">بستن کارنامه</button>
        </div>
    </div>
</div>
`;

html = html.replace('</body>', examEditorHTML + '\n' + examViewerHTML + '\n</body>');
fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const examCSS = `
/* ============ EXAM EDITOR ============ */
.ee-subject-row {
    background: var(--bg); border-radius: 12px; padding: 12px; border: 1px solid var(--border);
    position: relative; animation: slideUp 0.2s ease;
}
.ee-del-row {
    position: absolute; top: -8px; left: -8px; background: var(--danger); color: #fff;
    border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 0.8em;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.ee-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
.ee-grid-4 input { text-align: center; padding: 8px !important; font-size: 0.9em !important; margin-bottom: 0 !important; }
.ee-summary {
    margin-top: 20px; padding: 15px; background: var(--bg-card);
    border-radius: 14px; border: 1px dashed var(--primary);
}

/* ============ EXAM VIEWER (REPORT CARD) ============ */
.ev-header-score {
    text-align: center; background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05));
    border: 1px solid var(--success); border-radius: 16px; padding: 20px; margin-bottom: 20px;
}
.ev-total-pct { font-size: 3em; font-weight: 900; color: var(--success); line-height: 1; }
.ev-subtitle { font-size: 0.85em; color: var(--text-light); margin-top: 5px; font-weight: 700; }

.ev-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
.ev-table { width: 100%; border-collapse: collapse; font-size: 0.85em; text-align: center; }
.ev-table th, .ev-table td { padding: 12px 8px; border-bottom: 1px solid var(--border); }
.ev-table th { background: var(--bg-card); font-weight: 800; color: var(--text-light); white-space: nowrap; }
.ev-table tr:last-child td { border-bottom: none; }
.ev-table td { font-weight: 700; color: var(--text); }
`;
fs.writeFileSync('style.css', css + "\n" + examCSS);

// ==========================================
// 3. منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// حذف کدهای قدیمی ExamEditor و ExamViewer
const oldExamStart = js.indexOf('window.ExamEditor = {');
if (oldExamStart !== -1) {
    const nextFunc = js.indexOf('// اتصال به go', oldExamStart);
    if (nextFunc !== -1) {
        js = js.slice(0, oldExamStart) + js.slice(nextFunc);
    } else {
        js = js.slice(0, oldExamStart);
    }
}

const newExamLogic = `
// ============ COMPREHENSIVE EXAM SYSTEM ============
window.ExamEditor = {
    tempSubjects: [],

    open: function() {
        this.tempSubjects = [];
        document.getElementById('examEditorModal').classList.add('active');
        
        const dateInput = document.getElementById('eeDate');
        const sh = getShamsi();
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        dateInput.dataset.gregorian = today();
        
        document.getElementById('eeTitleInput').value = '';
        this.addSubjectRow(); // اضافه کردن یک ردیف پیش‌فرض
        this.updateSummary();
    },
    
    close: function() {
        document.getElementById('examEditorModal').classList.remove('active');
    },
    
    addSubjectRow: function() {
        const id = Date.now() + Math.random();
        const rowHtml = \`
            <div class="ee-subject-row" id="row-\${id}">
                <button class="ee-del-row" onclick="ExamEditor.removeSubjectRow('\${id}')">✕</button>
                <select class="inp" id="subj-\${id}" style="margin-bottom:0; font-weight:700;">
                    <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                    <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                    <option value="عربی">عربی</option><option value="زبان">زبان</option>
                    <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                    <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                </select>
                <div class="ee-grid-4">
                    <div><label style="font-size:0.7em; color:var(--text-light);">کل</label><input type="number" id="tot-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()"></div>
                    <div><label style="font-size:0.7em; color:var(--success);">درست</label><input type="number" id="cor-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()"></div>
                    <div><label style="font-size:0.7em; color:var(--danger);">غلط</label><input type="number" id="wr-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()"></div>
                    <div><label style="font-size:0.7em; color:var(--text-light);">نزده</label><input type="number" id="un-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()"></div>
                </div>
            </div>
        \`;
        document.getElementById('eeSubjectsContainer').insertAdjacentHTML('beforeend', rowHtml);
    },
    
    removeSubjectRow: function(id) {
        const el = document.getElementById('row-' + id);
        if (el) el.remove();
        this.updateSummary();
    },
    
    updateSummary: function() {
        let totalQ = 0;
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalScore = 0;
        
        const rows = document.querySelectorAll('.ee-subject-row');
        rows.forEach(row => {
            const id = row.id.replace('row-', '');
            const t = parseInt(document.getElementById('tot-' + id).value) || 0;
            const c = parseInt(document.getElementById('cor-' + id).value) || 0;
            const w = parseInt(document.getElementById('wr-' + id).value) || 0;
            
            totalQ += t;
            totalCorrect += c;
            totalWrong += w;
        });
        
        // محاسبه درصد کل
        let pct = 0;
        if (totalQ > 0) {
            const score = (totalCorrect * 3) - totalWrong;
            pct = Math.round((score / (totalQ * 3)) * 100);
            if(pct < 0) pct = 0;
        }
        
        document.getElementById('eeTotalQ').textContent = fa(totalQ);
        document.getElementById('eePercent').textContent = fa(pct) + '٪';
    },
    
    save: function() {
        const title = document.getElementById('eeTitleInput').value.trim();
        const date = document.getElementById('eeDate').dataset.gregorian || today();
        
        if (!title) return toast('عنوان آزمون را وارد کنید');
        
        const subjects = [];
        let hasValid = false;
        
        document.querySelectorAll('.ee-subject-row').forEach(row => {
            const id = row.id.replace('row-', '');
            const subjName = document.getElementById('subj-' + id).value;
            const t = parseInt(document.getElementById('tot-' + id).value) || 0;
            const c = parseInt(document.getElementById('cor-' + id).value) || 0;
            const w = parseInt(document.getElementById('wr-' + id).value) || 0;
            const u = parseInt(document.getElementById('un-' + id).value) || 0;
            
            if (t > 0) {
                if (c + w + u > t) {
                    toast('در درس ' + subjName + ' جمع درست+غلط+نزده بیشتر از کل است');
                    hasValid = false;
                    return;
                }
                hasValid = true;
                subjects.push({ name: subjName, total: t, correct: c, wrong: w, unans: u });
            }
        });
        
        if (!hasValid) return toast('حداقل یک درس با تعداد سوال معتبر وارد کنید');
        
        const exams = getData('ilia-exam-analysis', []);
        exams.push({ id: Date.now(), title, date, subjects, ts: Date.now() });
        setData('ilia-exam-analysis', exams);
        
        this.close();
        toast('✅ آزمون جامع ثبت شد');
        ExamEditor.renderExams();
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
        
        exams.sort((a,b) => b.ts - a.ts);
        
        list.innerHTML = exams.map(e => {
            // پشتیبانی از داده‌های قدیمی (تک درسی) و جدید (چند درسی)
            let subjectsArray = e.subjects;
            if (!subjectsArray) {
                subjectsArray = [{ name: e.subject || 'نامشخص', total: e.total, correct: e.correct, wrong: e.wrong, unans: e.unans }];
            }
            
            let totalQ = 0; let totalCorrect = 0; let totalWrong = 0;
            subjectsArray.forEach(s => {
                totalQ += s.total; totalCorrect += s.correct; totalWrong += s.wrong;
            });
            
            const score = (totalCorrect * 3) - totalWrong;
            let pct = Math.round((score / (totalQ * 3)) * 100);
            if(pct < 0) pct = 0;
            
            let color = 'var(--success)';
            if (pct < 50) color = 'var(--danger)';
            else if (pct < 75) color = 'var(--accent)';
            
            let subjectsText = subjectsArray.map(s => s.name).join('، ');
            if (subjectsText.length > 20) subjectsText = subjectsText.substring(0, 20) + '...';
            
            return \`
                <div class="exam-card" style="border-right-color:\${color}" onclick="ExamViewer.open(\${e.id})">
                    <div class="exam-card-info">
                        <div class="exam-card-title">\${esc(e.title)}</div>
                        <div class="exam-card-sub">\${subjectsText} — \${fa(totalQ)} سوال</div>
                        <div class="exam-card-sub" style="font-size:0.65em; margin-top:3px;">\${esc(e.date)}</div>
                    </div>
                    <div class="exam-card-score">
                        <div class="exam-card-pct" style="color:\${color}">\${fa(pct)}٪</div>
                        <div class="exam-card-detail">\${fa(totalCorrect)}✓ \${fa(totalWrong)}✗</div>
                    </div>
                </div>
            \`;
        }).join('');
    }
};

window.ExamViewer = {
    open: function(examId) {
        const exams = getData('ilia-exam-analysis', []);
        const e = exams.find(x => x.id === examId);
        if (!e) return;
        
        document.getElementById('examViewerModal').classList.add('active');
        document.getElementById('evTitle').textContent = e.title;
        document.getElementById('evDate').textContent = 'تاریخ ثبت: ' + e.date;
        
        let subjectsArray = e.subjects;
        if (!subjectsArray) {
            subjectsArray = [{ name: e.subject || 'نامشخص', total: e.total, correct: e.correct, wrong: e.wrong, unans: e.unans }];
        }
        
        let totalQ = 0; let totalCorrect = 0; let totalWrong = 0;
        let rowsHtml = '';
        
        subjectsArray.forEach(s => {
            totalQ += s.total; totalCorrect += s.correct; totalWrong += s.wrong;
            
            const score = (s.correct * 3) - s.wrong;
            let pct = Math.round((score / (s.total * 3)) * 100);
            if(pct < 0) pct = 0;
            
            let color = 'var(--success)';
            if (pct < 50) color = 'var(--danger)';
            else if (pct < 75) color = 'var(--accent)';
            
            rowsHtml += \`
                <tr>
                    <td style="text-align:right;">\${(typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[s.name]) ? SUBJECT_ICONS[s.name] : ''} \${esc(s.name)}</td>
                    <td>\${fa(s.total)}</td>
                    <td style="color:var(--success)">\${fa(s.correct)}</td>
                    <td style="color:var(--danger)">\${fa(s.wrong)}</td>
                    <td style="color:var(--text-light)">\${fa(s.unans)}</td>
                    <td style="color:\${color}">\${fa(pct)}٪</td>
                </tr>
            \`;
        });
        
        document.getElementById('evTableBody').innerHTML = rowsHtml;
        
        const totalScore = (totalCorrect * 3) - totalWrong;
        let totalPct = Math.round((totalScore / (totalQ * 3)) * 100);
        if(totalPct < 0) totalPct = 0;
        
        document.getElementById('evTotalPct').textContent = fa(totalPct) + '٪';
        
        // اضافه کردن دکمه حذف به مودال کارنامه
        const footer = document.querySelector('#examViewerModal .modal-footer');
        footer.innerHTML = \`
            <button class="btn" onclick="ExamEditor.deleteExam(\${e.id})" style="background:rgba(239,68,68,0.1); color:var(--danger); flex:1; margin-right:10px; font-weight:800;">🗑 حذف آزمون</button>
            <button class="btn btn-primary" onclick="ExamViewer.close()" style="flex:2;">بستن</button>
        \`;
    },
    
    close: function() {
        document.getElementById('examViewerModal').classList.remove('active');
    }
};

// اضافه کردن تابع حذف
ExamEditor.deleteExam = function(id) {
    if (!confirm('آیا از حذف این آزمون مطمئن هستید؟')) return;
    let exams = getData('ilia-exam-analysis', []);
    exams = exams.filter(e => e.id !== id);
    setData('ilia-exam-analysis', exams);
    toast('🗑 آزمون حذف شد');
    ExamViewer.close();
    this.renderExams();
    if (typeof refreshAppData === 'function') refreshAppData();
};
`;

js += "\n" + newExamLogic;
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

console.log("🎉 سیستم آزمون جامع و کارنامه ساخته شد! حالا Ctrl+F5 بزن.");
