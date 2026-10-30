const fs = require('fs');

console.log("🔧 در حال بازسازی کامل مودال ثبت مطالعه...");

let html = fs.readFileSync('index.html', 'utf8');

// 1. پیدا کردن و حذف کامل مودال خراب قبلی
const startTag = '<div class="modal-overlay" id="studyEditorModal"';
const startIdx = html.indexOf(startTag);

if (startIdx !== -1) {
    // پیدا کردن بسته شدن body
    const endIdx = html.indexOf('</body>');
    if (endIdx !== -1) {
        // تمام کدهای بین مودال خراب و بسته شدن body حذف می‌شوند
        html = html.slice(0, startIdx) + html.slice(endIdx);
        console.log("✅ مودال خراب قبلی حذف شد.");
    }
}

// 2. تزریق مودال جدید و سالم (دقیقاً مطابق طرح نیمکت)
const safeModalHTML = `
<div class="modal-overlay" id="studyEditorModal" onclick="if(event.target===this)StudyEditor.close()">
    <div class="modal-box" style="max-width: 450px; border-radius: 20px;">
        <div class="modal-header" style="background: #f8f9fa; border-bottom: none; border-radius: 20px 20px 0 0;">
            <h3 style="color: #333; font-weight: 800; margin:0;" id="seTitle">ثبت مطالعه</h3>
            <button class="modal-close" onclick="StudyEditor.close()" style="background:#e2e8f0; border-radius:50%; width:30px; height:30px; display:flex; justify-content:center; align-items:center;">✕</button>
        </div>
        
        <div class="modal-body" style="padding: 20px;">
            <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:0.9em; font-weight:700; color:#555; margin-bottom:10px;">تاریخ مطالعه</div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="se-date-btn" id="seBtnToday" onclick="StudyEditor.setDate('today')">امروز (<span id="seTodayDate"></span>)</button>
                    <button class="se-date-btn" id="seBtnYesterday" onclick="StudyEditor.setDate('yesterday')">دیروز (<span id="seYestDate"></span>)</button>
                </div>
            </div>

            <div class="inp-group">
                <select class="inp" id="editSubject" style="border-radius:12px; font-weight:700;">
                    <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                    <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                    <option value="عربی">عربی</option><option value="زبان">زبان</option>
                    <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                    <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                    <option value="مطالعه آزاد">مطالعه آزاد</option>
                </select>
            </div>

            <div style="text-align:center; margin: 20px 0 10px;">
                <div style="font-size:0.9em; font-weight:700; color:#555; margin-bottom:10px;">نوع فعالیت</div>
                <div class="se-activity-group" id="seActivities">
                    <button class="se-act-btn active" onclick="StudyEditor.setActivity('مطالعه', this)">مطالعه</button>
                    <button class="se-act-btn" onclick="StudyEditor.setActivity('انجام تکلیف', this)">انجام تکلیف</button>
                    <button class="se-act-btn" onclick="StudyEditor.setActivity('مرور', this)">مرور</button>
                    <button class="se-act-btn" onclick="StudyEditor.setActivity('پیش مطالعه', this)">پیش مطالعه</button>
                    <button class="se-act-btn" onclick="StudyEditor.setActivity('تست', this)">تست</button>
                </div>
            </div>

            <div class="inp-group" style="margin-top:20px;">
                <div style="font-size:0.9em; font-weight:700; color:#555; margin-bottom:10px; text-align:center;">مدت زمان (دقیقه)</div>
                <input type="number" id="editMinutes" class="inp" placeholder="مدت زمان..." style="text-align:center; font-weight:800; font-size:1.2em; border-radius:12px;">
                <div class="se-quick-times">
                    <button onclick="StudyEditor.setMin(15)">۱۵'</button>
                    <button onclick="StudyEditor.setMin(30)">۳۰'</button>
                    <button onclick="StudyEditor.setMin(45)">۴۵'</button>
                    <button onclick="StudyEditor.setMin(60)">۶۰'</button>
                </div>
            </div>

            <div class="inp-group" style="margin-top:15px;">
                <input type="text" id="editDesc" class="inp" placeholder="توضیحات (اختیاری)" style="border-radius:12px;">
            </div>
        </div>
        
        <div class="modal-footer" style="padding: 15px 20px; border-top: none; display: flex; gap: 10px; border-radius: 0 0 20px 20px; background:#f8f9fa;">
            <button class="btn" id="seCancelBtn" onclick="StudyEditor.close()" style="background:transparent; color:#666; flex:1; font-weight:700;">انصراف</button>
            <button class="btn" id="seDeleteBtn" onclick="StudyEditor.deleteCurrent()" style="background:#fee2e2; color:#ef4444; flex:1; font-weight:800; display:none;">حذف</button>
            <button class="btn" id="seSaveBtn" onclick="StudyEditor.save()" style="background:#0ea5e9; color:#fff; flex:1; font-weight:800; border-radius:10px;">ثبت</button>
        </div>
    </div>
</div>
`;

// تزریق مودال قبل از بسته شدن body
html = html.replace('</body>', safeModalHTML + '\n</body>');
fs.writeFileSync('index.html', html);
console.log("✅ مودال جدید و سالم تزریق شد.");

// 3. آپدیت کش برای اعمال فوری
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا Ctrl+F5 بزن و روی دکمه ثبت مطالعه کلیک کن.");
