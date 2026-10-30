const fs = require('fs');

console.log("🔧 در حال اضافه کردن قطعی لیست رکوردها به مودال...");

let html = fs.readFileSync('index.html', 'utf8');

// پیدا کردن دکمه ثبت و اضافه کردن لیست دقیقاً بالای آن
const saveBtn = `<button class="btn btn-primary btn-block" onclick="StudyEditor.save()" style="margin-top:15px;">💾 ثبت اطلاعات</button>`;

const newSection = `
            <div style="margin-top: 20px; border-top: 1px dashed var(--border); padding-top: 15px;">
                <h4 style="font-size: 0.9em; margin-bottom: 10px; color: var(--primary);">📋 رکوردهای این روز (برای ویرایش یا حذف):</h4>
                <div id="existingLogsList" style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    <div style="text-align:center; color:var(--text-light); font-size:0.8em; padding:10px;">در حال بارگذاری...</div>
                </div>
            </div>
            ` + saveBtn;

if (!html.includes('id="existingLogsList"')) {
    html = html.replace(saveBtn, newSection);
    console.log("✅ بخش رکوردها به HTML اضافه شد.");
} else {
    console.log("✅ بخش رکوردها از قبل وجود داشت.");
}

fs.writeFileSync('index.html', html);

// اطمینان از اینکه کدهای جاوااسکریپت به درستی متصل هستند
let js = fs.readFileSync('app.js', 'utf8');

if (!js.includes('StudyEditor.renderExistingLogs = function')) {
    console.log("⚠️ کدهای JS پیدا نشد، در حال اضافه کردن مجدد...");
    const editLogicJS = `
StudyEditor.renderExistingLogs = function() {
    const dateInput = document.getElementById('editDate');
    const targetDate = dateInput.dataset.gregorian || today();
    const log = getData('ilia-log', []);
    const dayLogs = log.filter(e => e.date === targetDate);
    const listEl = document.getElementById('existingLogsList');
    
    if (!listEl) return;

    if (dayLogs.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:var(--text-light); font-size:0.8em; padding:10px;">هیچ مطالعه‌ای برای این روز ثبت نشده است.</div>';
        return;
    }

    listEl.innerHTML = dayLogs.map(l => \`
        <div class="log-record-item">
            <div class="log-record-info">
                \${(typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[l.subject]) ? SUBJECT_ICONS[l.subject] : '📚'} 
                \${esc(l.subject)} — \${fa(Math.round(l.hours * 60))} دقیقه
            </div>
            <div class="log-record-actions">
                <button class="log-action-btn" onclick="StudyEditor.editLog(\${l.ts})" title="ویرایش">✏️</button>
                <button class="log-action-btn del" onclick="StudyEditor.deleteLog(\${l.ts})" title="حذف">🗑</button>
            </div>
        </div>
    \`).join('');
};

StudyEditor.deleteLog = function(ts) {
    if (!confirm('آیا از حذف این رکورد مطمئن هستید؟')) return;
    let log = getData('ilia-log', []);
    log = log.filter(x => x.ts !== ts);
    setData('ilia-log', log);
    let sessions = getData('ilia-sessions', []);
    sessions = sessions.filter(x => x.ts !== ts);
    setData('ilia-sessions', sessions);
    toast('🗑 رکورد حذف شد');
    this.renderExistingLogs();
    if (typeof refreshAppData === 'function') refreshAppData();
    if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
    if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
    if (typeof renderStats === 'function') renderStats();
};

StudyEditor.editLog = function(ts) {
    let log = getData('ilia-log', []);
    let targetLog = log.find(x => x.ts === ts);
    if (!targetLog) return;
    const currentMin = Math.round(targetLog.hours * 60);
    const newMin = prompt('مدت زمان جدید (به دقیقه):', currentMin);
    if (newMin === null) return;
    const parsed = parseInt(newMin);
    if (isNaN(parsed) || parsed <= 0) return toast('عدد معتبر وارد کنید');
    targetLog.hours = parsed / 60;
    setData('ilia-log', log);
    let sessions = getData('ilia-sessions', []);
    let targetSession = sessions.find(x => x.ts === ts);
    if (targetSession) {
        targetSession.min = parsed;
        setData('ilia-sessions', sessions);
    }
    toast('✅ رکورد ویرایش شد');
    this.renderExistingLogs();
    if (typeof refreshAppData === 'function') refreshAppData();
    if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
    if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
    if (typeof renderStats === 'function') renderStats();
};

const originalOpenForLogs = StudyEditor.open;
StudyEditor.open = function() {
    originalOpenForLogs();
    this.renderExistingLogs();
};

const originalChangeDateForLogs = StudyEditor.changeDate;
StudyEditor.changeDate = function(delta) {
    originalChangeDateForLogs(delta);
    this.renderExistingLogs();
};

const originalPickerSelectForLogs = window.JalaliPicker.select;
window.JalaliPicker.select = function(d) {
    originalPickerSelectForLogs.call(this, d);
    if (this.targetInput && this.targetInput.id === 'editDate') {
        setTimeout(() => StudyEditor.renderExistingLogs(), 100);
    }
};
`;
    js += "\n" + editLogicJS;
}

fs.writeFileSync('app.js', js);

// آپدیت کش
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا Ctrl+F5 بزن و مودال رو باز کن.");
