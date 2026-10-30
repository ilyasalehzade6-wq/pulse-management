const fs = require('fs');

console.log("✏️ در حال افزودن قابلیت ویرایش و حذف رکوردهای گذشته...");

// ==========================================
// 1. آپدیت HTML (اضافه کردن لیست رکوردها به مودال)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const recordsListHTML = `
            <div style="margin-top: 20px; border-top: 1px dashed var(--border); padding-top: 15px;">
                <h4 style="font-size: 0.9em; margin-bottom: 10px; color: var(--primary);">📋 رکوردهای این روز:</h4>
                <div id="existingLogsList" style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    <!-- لیست اینجا لود می‌شود -->
                </div>
            </div>
`;

// اضافه کردن لیست قبل از بسته شدن modal-body
if (!html.includes('id="existingLogsList"')) {
    html = html.replace('</div>\n    </div>\n</div>', recordsListHTML + '</div>\n    </div>\n</div>');
    // فالبک در صورت تفاوت در ساختار HTML
    if (!html.includes('id="existingLogsList"')) {
        html = html.replace('</div>\n    </div>\n</div>\n</body>', recordsListHTML + '</div>\n    </div>\n</div>\n</body>');
    }
    console.log("✅ بخش HTML لیست رکوردها اضافه شد.");
}
fs.writeFileSync('index.html', html);

// ==========================================
// 2. آپدیت CSS (استایل رکوردها)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const logCSS = `
/* ============ EXISTING LOGS LIST ============ */
.log-record-item {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--bg); padding: 8px 12px; border-radius: 10px;
    border: 1px solid var(--border); font-size: 0.85em;
}
.log-record-info { flex: 1; font-weight: 700; }
.log-record-actions { display: flex; gap: 5px; }
.log-action-btn {
    background: var(--bg-card); border: 1px solid var(--border);
    padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 1em; transition: 0.2s;
}
.log-action-btn:hover { background: var(--border); }
.log-action-btn.del { color: var(--danger); border-color: rgba(231,76,60,0.3); }
.log-action-btn.del:hover { background: rgba(231,76,60,0.1); }
`;
fs.writeFileSync('style.css', css + "\n" + logCSS);

// ==========================================
// 3. آپدیت JS (منطق ویرایش و حذف)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const editLogicJS = `
// ============ EDIT & DELETE EXISTING LOGS ============
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
    
    // حذف از لاگ
    let log = getData('ilia-log', []);
    log = log.filter(x => x.ts !== ts);
    setData('ilia-log', log);
    
    // حذف از جلسات
    let sessions = getData('ilia-sessions', []);
    sessions = sessions.filter(x => x.ts !== ts);
    setData('ilia-sessions', sessions);
    
    toast('🗑 رکورد حذف شد');
    this.renderExistingLogs();
    
    // آپدیت کل برنامه
    if (typeof refreshAppData === 'function') refreshAppData();
    if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
    if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
    if (typeof renderStats === 'function') renderStats();
    if (typeof renderSessions === 'function') renderSessions();
};

StudyEditor.editLog = function(ts) {
    let log = getData('ilia-log', []);
    let targetLog = log.find(x => x.ts === ts);
    if (!targetLog) return;

    const currentMin = Math.round(targetLog.hours * 60);
    const newMin = prompt('مدت زمان جدید (به دقیقه):', currentMin);
    
    if (newMin === null) return; // کاربر انصراف داد
    const parsed = parseInt(newMin);
    if (isNaN(parsed) || parsed <= 0) return toast('عدد معتبر وارد کنید');

    // آپدیت لاگ
    targetLog.hours = parsed / 60;
    setData('ilia-log', log);

    // آپدیت جلسات
    let sessions = getData('ilia-sessions', []);
    let targetSession = sessions.find(x => x.ts === ts);
    if (targetSession) {
        targetSession.min = parsed;
        setData('ilia-sessions', sessions);
    }

    toast('✅ رکورد ویرایش شد');
    this.renderExistingLogs();

    // آپدیت کل برنامه
    if (typeof refreshAppData === 'function') refreshAppData();
    if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
    if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
    if (typeof renderStats === 'function') renderStats();
    if (typeof renderSessions === 'function') renderSessions();
};

// اتصال به تغییر تاریخ‌ها
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

fs.writeFileSync('app.js', js);
console.log("✅ منطق ویرایش و حذف رکوردها اضافه شد.");

// ==========================================
// 4. آپدیت کش
// ==========================================
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا Ctrl+F5 بزن و مودال رو باز کن.");
