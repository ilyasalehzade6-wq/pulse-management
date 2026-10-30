const fs = require('fs');

console.log("🎨 در حال ساده‌سازی و ارتقای رابط کاربری فرم آزمون...");

// ==========================================
// 1. بازسازی HTML فرم آزمون
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const newExamEditorHTML = `
<div class="modal-overlay" id="examEditorModal" onclick="if(event.target===this)ExamEditor.close()">
    <div class="modal-box" style="max-width: 600px; border-radius: 20px; display: flex; flex-direction: column; max-height: 90vh;">
        
        <div class="modal-header" style="flex-shrink: 0;">
            <div>
                <h3 style="margin:0; font-size:1.2em;" id="eeTitle">ثبت آزمون جدید</h3>
                <div style="font-size:0.75em; color:var(--text-light); margin-top:5px;">نتیجه آزمون‌های خود را با نمره منفی دقیق ثبت کنید.</div>
            </div>
            <button class="modal-close" onclick="ExamEditor.close()">✕</button>
        </div>
        
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding-bottom: 10px;">
            <!-- اطلاعات کلی -->
            <div class="ee-section-title">۱. اطلاعات کلی</div>
            <div class="inp-row" style="margin-bottom: 20px;">
                <div class="inp-group" style="flex:2;">
                    <label>عنوان آزمون <span style="color:var(--danger)">*</span></label>
                    <input type="text" id="eeTitleInput" class="inp" placeholder="مثلاً: آزمون جامع ماز مرحله ۱">
                </div>
                <div class="inp-group" style="flex:1;">
                    <label>تاریخ</label>
                    <input type="text" id="eeDate" class="inp" readonly onclick="JalaliPicker.open(this)" placeholder="تاریخ">
                </div>
            </div>

            <!-- دروس -->
            <div class="ee-section-title">۲. پاسخ‌نامه دروس</div>
            <div id="eeSubjectsContainer" style="display:flex; flex-direction:column; gap:15px; margin-bottom: 15px;">
                <!-- درس‌ها اینجا اضافه می‌شوند -->
            </div>

            <button class="btn btn-secondary btn-block" onclick="ExamEditor.addSubjectRow()" style="border: 2px dashed var(--primary); color:var(--primary); background:transparent; padding:12px; font-size:0.9em;">
                ➕ افزودن درس دیگر
            </button>

        </div>

        <!-- خلاصه و پیش‌نمایش (بخش ثابت پایین) -->
        <div class="ee-summary-box">
            <div class="ees-left">
                <div style="font-size:0.8em; color:var(--text-light); margin-bottom:5px;">مجموع سوالات آزمون</div>
                <div style="font-size:1.4em; font-weight:800; color:var(--text);" id="eeTotalQ">۰ سوال</div>
            </div>
            <div class="ees-right">
                <div style="font-size:0.8em; color:var(--text-light); margin-bottom:5px;">درصد کل (با نمره منفی)</div>
                <div style="font-size:2.2em; font-weight:900; color:var(--primary); line-height:1;" id="eePercent">۰٪</div>
            </div>
        </div>
        
        <div class="modal-footer" style="flex-shrink: 0;">
            <button id="seCancelBtn" onclick="ExamEditor.close()" style="flex:1;">انصراف</button>
            <button id="seSaveBtn" onclick="ExamEditor.save()" style="flex:2;">ثبت کارنامه</button>
        </div>
    </div>
</div>
`;

// جایگزینی مودال قبلی
const oldModalStart = html.indexOf('<div class="modal-overlay" id="examEditorModal"');
if (oldModalStart !== -1) {
    const oldModalEnd = html.indexOf('</div>', html.indexOf('</div>', html.indexOf('</div>', oldModalStart) + 6) + 6) + 6; // پیدا کردن بسته شدن مودال
    // از روش ساده‌تر استفاده می‌کنیم: پیدا کردن تا کلمه examViewerModal
    const nextModal = html.indexOf('<div class="modal-overlay" id="examViewerModal"');
    if (nextModal !== -1) {
        html = html.slice(0, oldModalStart) + newExamEditorHTML + '\n' + html.slice(nextModal);
    }
} else {
    html = html.replace('</body>', newExamEditorHTML + '\n</body>');
}

fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS برای زیبایی و خوانایی
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const uxCss = `
/* ============ EXAM EDITOR UX ============ */
.ee-section-title {
    font-size: 0.9em; font-weight: 800; color: var(--primary);
    margin-bottom: 10px; display: flex; align-items: center; gap: 5px;
}
.ee-section-title::after {
    content: ''; flex: 1; height: 1px; background: var(--border); margin-right: 10px;
}

.ee-subject-row {
    background: var(--bg-card); border-radius: 14px; padding: 15px; 
    border: 1px solid var(--border); position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    display: flex; flex-direction: column; gap: 12px;
}
.ee-del-row {
    position: absolute; top: -10px; left: -10px; 
    background: rgba(239, 68, 68, 0.1); color: var(--danger);
    border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; 
    width: 28px; height: 28px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1em;
    transition: all 0.2s;
}
.ee-del-row:hover { background: var(--danger); color: #fff; }

.ee-row-top { display: flex; align-items: center; gap: 10px; }
.ee-row-top select { flex: 1; margin-bottom: 0 !important; font-weight: 800; }

.ee-inputs-grid { 
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; 
}
.ee-input-box { display: flex; flex-direction: column; gap: 4px; }
.ee-input-box label { font-size: 0.7em; font-weight: 700; text-align: center; }
.ee-input-box input { 
    text-align: center; padding: 10px 5px !important; font-size: 1em !important; 
    font-weight: 800; margin-bottom: 0 !important; border-radius: 8px !important;
}

.ee-summary-box {
    display: flex; justify-content: space-between; align-items: center;
    background: linear-gradient(135deg, rgba(0,150,136,0.08), rgba(118,75,162,0.05));
    border-top: 2px dashed var(--primary);
    padding: 15px 20px;
}
.ee-summary-box.empty { opacity: 0.7; }
.ees-left { text-align: right; }
.ees-right { text-align: left; }
`;
fs.writeFileSync('style.css', css + "\n" + uxCss);

// ==========================================
// 3. بازنویسی منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// حذف متدهای قدیمی افزودن درس و محاسبه
js = js.replace(/ExamEditor\.addSubjectRow = function\(\) \{[\s\S]*?\},/g, '');
js = js.replace(/ExamEditor\.updateSummary = function\(\) \{[\s\S]*?\},/g, '');

const newExamLogic = `
// ============ EXAM EDITOR (UX OPTIMIZED) ============
ExamEditor.addSubjectRow = function() {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const rowHtml = \`
        <div class="ee-subject-row" id="row-\${id}">
            <button class="ee-del-row" onclick="ExamEditor.removeSubjectRow('\${id}')" title="حذف این درس">🗑</button>
            
            <div class="ee-row-top">
                <select class="inp" id="subj-\${id}" onchange="ExamEditor.updateSummary()">
                    <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                    <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                    <option value="عربی">عربی</option><option value="زبان">زبان</option>
                    <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                    <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                </select>
            </div>
            
            <div class="ee-inputs-grid">
                <div class="ee-input-box">
                    <label style="color:var(--text);">کل سوالات</label>
                    <input type="number" id="tot-\${id}" class="inp" placeholder="۱۰۰" oninput="ExamEditor.updateSummary()">
                </div>
                <div class="ee-input-box">
                    <label style="color:var(--success);">درست</label>
                    <input type="number" id="cor-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()">
                </div>
                <div class="ee-input-box">
                    <label style="color:var(--danger);">غلط</label>
                    <input type="number" id="wr-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()">
                </div>
                <div class="ee-input-box">
                    <label style="color:var(--text-light);">نزده</label>
                    <input type="number" id="un-\${id}" class="inp" placeholder="۰" oninput="ExamEditor.updateSummary()">
                </div>
            </div>
        </div>
    \`;
    document.getElementById('eeSubjectsContainer').insertAdjacentHTML('beforeend', rowHtml);
    this.updateSummary();
};

ExamEditor.updateSummary = function() {
    let totalQ = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let hasData = false;
    
    document.querySelectorAll('.ee-subject-row').forEach(row => {
        const id = row.id.replace('row-', '');
        const t = parseInt(document.getElementById('tot-' + id).value) || 0;
        const c = parseInt(document.getElementById('cor-' + id).value) || 0;
        const w = parseInt(document.getElementById('wr-' + id).value) || 0;
        
        if (t > 0 || c > 0 || w > 0) hasData = true;
        
        totalQ += t;
        totalCorrect += c;
        totalWrong += w;
    });
    
    const summaryBox = document.querySelector('.ee-summary-box');
    if (!hasData) {
        document.getElementById('eeTotalQ').textContent = '۰ سوال';
        document.getElementById('eePercent').textContent = '۰٪';
        document.getElementById('eePercent').style.color = 'var(--text-light)';
        if (summaryBox) summaryBox.classList.add('empty');
        return;
    }
    
    if (summaryBox) summaryBox.classList.remove('empty');
    
    // محاسبه درصد کنکوری (هر ۳ غلط = ۱ درست)
    let pct = 0;
    if (totalQ > 0) {
        const score = (totalCorrect * 3) - totalWrong;
        pct = Math.round((score / (totalQ * 3)) * 100);
        if(pct < 0) pct = 0;
    }
    
    document.getElementById('eeTotalQ').textContent = fa(totalQ) + ' سوال';
    
    const pctEl = document.getElementById('eePercent');
    pctEl.textContent = fa(pct) + '٪';
    
    if (pct >= 75) pctEl.style.color = 'var(--success)';
    else if (pct >= 50) pctEl.style.color = 'var(--accent)';
    else pctEl.style.color = 'var(--danger)';
};
`;

js += "\n" + newExamLogic;

// اصلاح تابع open برای پاک کردن ردیف‌های قبلی
js = js.replace(
    "document.getElementById('eeTitleInput').value = '';\n        this.addSubjectRow(); // اضافه کردن یک ردیف پیش‌فرض\n        this.updateSummary();",
    "document.getElementById('eeTitleInput').value = '';\n        document.getElementById('eeSubjectsContainer').innerHTML = '';\n        this.addSubjectRow();\n        this.updateSummary();"
);

// اصلاح تابع save برای پیام‌های واضح‌تر
js = js.replace(
    "if (c + w + u > t) {\n                    toast('در درس ' + subjName + ' جمع درست+غلط+نزده بیشتر از کل است');\n                    hasValid = false;\n                    return;\n                }",
    "if (c + w + u > t) {\n                    toast('⚠️ خطا: در درس ' + subjName + '، جمع درست+غلط+نزده (' + (c+w+u) + ') بیشتر از کل سوالات (' + t + ') است.');\n                    hasValid = false;\n                    return;\n                }"
);

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

console.log("🎉 فرم آزمون کاملاً ساده و کاربرپسند شد! حالا Ctrl+F5 بزن.");
