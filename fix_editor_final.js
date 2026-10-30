const fs = require('fs');

console.log("🔧 در حال بازنویسی کامل StudyEditor و رفع خطای تداخل...");

let js = fs.readFileSync('app.js', 'utf8');

// پیدا کردن اولین تعریف StudyEditor و بریدن بقیه کدها از آنجا به بعد
// این کار باعث میشه تمام کدهای خراب و تکراری قبلی پاک بشن
const startIdx = js.indexOf('window.StudyEditor = {');
if (startIdx !== -1) {
    js = js.slice(0, startIdx);
}

const finalEditorCode = `
// ============ FINAL CLEAN STUDY EDITOR ============
window.StudyEditor = {
    open: function() {
        document.getElementById('studyEditorModal').classList.add('active');
        const dateInput = document.getElementById('editDate');
        
        if (!dateInput.dataset.gregorian) {
            const t = today();
            dateInput.dataset.gregorian = t;
            const sh = getShamsi(new Date());
            dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        }
        
        document.getElementById('editMinutes').value = '';
        document.getElementById('editMinutes').focus();
        
        this.updateNextButton(dateInput.dataset.gregorian);
        this.renderExistingLogs();
    },
    
    close: function() { 
        document.getElementById('studyEditorModal').classList.remove('active'); 
    },
    
    save: function() {
        const dateInput = document.getElementById('editDate');
        const date = dateInput.dataset.gregorian || today();
        const subj = document.getElementById('editSubject').value;
        const min = parseInt(document.getElementById('editMinutes').value);
        
        if (!min || min <= 0) return toast('لطفاً دقیقه معتبر وارد کنید');
        
        const log = getData('ilia-log', []);
        log.push({ date, hours: min / 60, subject: subj, ts: Date.now() });
        setData('ilia-log', log);
        
        const sessions = getData('ilia-sessions', []);
        sessions.push({ id: Date.now(), date, subj, min, topic: 'ثبت سریع', pages: 0, tests: 0, ts: Date.now() });
        setData('ilia-sessions', sessions);
        
        this.close();
        toast('✅ مطالعه برای تاریخ ' + dateInput.value + ' ثبت شد');
        
        if (typeof refreshAppData === 'function') refreshAppData();
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
        if (typeof renderStats === 'function') renderStats();
        if (typeof renderSessions === 'function') renderSessions();
    },
    
    changeDate: function(delta) {
        const dateInput = document.getElementById('editDate');
        let currentGreg = dateInput.dataset.gregorian || today();
        let d = new Date(currentGreg + 'T00:00:00');
        d.setDate(d.getDate() + delta);
        
        const todayStr = today();
        const newGregStr = localDate(d);
        
        if (newGregStr > todayStr) return;
        
        dateInput.dataset.gregorian = newGregStr;
        const sh = getShamsi(d);
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        
        this.updateNextButton(newGregStr);
        this.renderExistingLogs();
    },
    
    updateNextButton: function(gregStr) {
        const btn = document.getElementById('btnNextDay');
        if (btn) {
            if (gregStr === today()) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }
    },
    
    renderExistingLogs: function() {
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
    },
    
    deleteLog: function(ts) {
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
    },
    
    editLog: function(ts) {
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
    }
};

// ============ JALALI PICKER SYNC ============
if (typeof JalaliPicker !== 'undefined') {
    const origSelect = JalaliPicker.select;
    JalaliPicker.select = function(d) {
        origSelect.call(this, d);
        if (this.targetInput && this.targetInput.id === 'editDate') {
            setTimeout(() => {
                StudyEditor.updateNextButton(this.targetInput.dataset.gregorian);
                StudyEditor.renderExistingLogs();
            }, 50);
        }
    };
}

// ============ BIND CLICK TO WIDGET ============
setTimeout(() => {
    const widget = document.getElementById('launcherWidget');
    if (widget) {
        widget.style.cursor = 'pointer';
        widget.onclick = function(e) {
            e.preventDefault();
            if (typeof StudyEditor !== 'undefined') StudyEditor.open();
        };
    }
}, 1000);
`;

js += "\n" + finalEditorCode;
fs.writeFileSync('app.js', js);
console.log("✅ StudyEditor با موفقیت بازنویسی شد.");

// آپدیت کش مرورگر
const version = Date.now();
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا Ctrl+F5 بزن.");
