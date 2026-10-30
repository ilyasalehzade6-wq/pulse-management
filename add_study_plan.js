const fs = require('fs');

console.log("📝 در حال ساخت صفحه برنامه مطالعاتی و مودال‌های جدید...");

// ==========================================
// 1. تغییرات HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن دکمه به داشبورد
const newBtn = `<div class="nimkat-card" onclick="go('study-plan')"><div class="nimkat-icon">📝</div><div class="nimkat-title">برنامه مطالعاتی</div></div>`;
if (!html.includes('onclick="go(\'study-plan\')"')) {
    html = html.replace('<div class="nimkat-card" onclick="go(\'sourceguide\')">', newBtn + '\n<div class="nimkat-card" onclick="go(\'sourceguide\')">');
}

// ب) ساخت سکشن برنامه مطالعاتی
const studyPlanSection = `
<section id="study-plan">
    <div class="container" style="padding-top:20px; padding-bottom:100px;">
        <h2>📝 برنامه مطالعاتی</h2>
        
        <!-- ناوبری تاریخ -->
        <div class="sp-nav">
            <button class="sp-nav-btn" onclick="StudyPlan.prevDay()">❮ روز قبل</button>
            <div class="sp-date" id="spDate" onclick="StudyPlan.openDatePicker()">تاریخ</div>
            <button class="sp-nav-btn" onclick="StudyPlan.nextDay()">روز بعد ❯</button>
        </div>

        <!-- مجموع زمان -->
        <div class="sp-total" id="spTotal">مجموع: ۰ دقیقه</div>

        <!-- لیست مطالعات -->
        <div class="sp-list" id="spList"></div>
        
        <!-- دکمه شناور ثبت -->
        <button class="sp-add-btn" onclick="StudyEditor.open()">+ ثبت مطالعه</button>
    </div>
</section>
`;
if (!html.includes('<section id="study-plan">')) {
    html = html.replace('<section id="study-plan">', '').replace('<section id="settings">', studyPlanSection + '\n<section id="settings">');
}

// ج) ساخت مودال ثبت/ویرایش (با طراحی دقیقاً مثل عکس)
const modalHTML = `
<div class="modal-overlay" id="studyEditorModal" onclick="if(event.target===this)StudyEditor.close()">
    <div class="modal-box" style="max-width: 450px; border-radius: 20px;">
        <div class="modal-header" style="background: #f8f9fa; border-bottom: none; border-radius: 20px 20px 0 0;">
            <h3 style="color: #333; font-weight: 800;" id="seTitle">ثبت مطالعه</h3>
            <button class="modal-close" onclick="StudyEditor.close()" style="background:#e2e8f0; border-radius:50%; width:30px; height:30px; display:flex; justify-content:center; align-items:center;">✕</button>
        </div>
        
        <div class="modal-body" style="padding: 20px;">
            
            <!-- تاریخ -->
            <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:0.9em; font-weight:700; color:#555; margin-bottom:10px;">تاریخ مطالعه</div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="se-date-btn" id="seBtnToday" onclick="StudyEditor.setDate('today')">امروز (<span id="seTodayDate"></span>)</button>
                    <button class="se-date-btn" id="seBtnYesterday" onclick="StudyEditor.setDate('yesterday')">دیروز (<span id="seYestDate"></span>)</button>
                </div>
            </div>

            <!-- درس -->
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

            <!-- نوع فعالیت -->
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

            <!-- مدت زمان -->
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

            <!-- توضیحات -->
            <div class="inp-group" style="margin-top:15px;">
                <input type="text" id="editDesc" class="inp" placeholder="توضیحات (اختیاری)" style="border-radius:12px;">
            </div>

            <!-- ثبت برای تاریخ گذشته (فقط در حالت جدید) -->
            <div id="seLogsList" style="margin-top:20px; max-height:120px; overflow-y:auto;"></div>

        </div>
        
        <div class="modal-footer" style="padding: 15px 20px; border-top: none; display: flex; gap: 10px; border-radius: 0 0 20px 20px; background:#f8f9fa;">
            <button class="btn" id="seCancelBtn" onclick="StudyEditor.close()" style="background:transparent; color:#666; flex:1; font-weight:700;">انصراف</button>
            <button class="btn" id="seDeleteBtn" onclick="StudyEditor.deleteCurrent()" style="background:#fee2e2; color:#ef4444; flex:1; font-weight:800; display:none;">حذف</button>
            <button class="btn" id="seSaveBtn" onclick="StudyEditor.save()" style="background:#0ea5e9; color:#fff; flex:1; font-weight:800; border-radius:10px;">ثبت</button>
        </div>
    </div>
</div>
`;

// جایگزینی مودال قدیمی با مودال جدید
const oldModalStart = html.indexOf('<div class="modal-overlay" id="studyEditorModal"');
if (oldModalStart !== -1) {
    const oldModalEnd = html.indexOf('</div>\n</div>\n</div>', oldModalStart) + 18;
    if (oldModalEnd > 18) {
        html = html.slice(0, oldModalStart) + modalHTML + html.slice(oldModalEnd);
    }
} else {
    html = html.replace('</body>', modalHTML + '\n</body>');
}

fs.writeFileSync('index.html', html);
console.log("✅ HTML با موفقیت آپدیت شد.");

// ==========================================
// 2. تغییرات CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const newCSS = `
/* ============ STUDY PLAN PAGE ============ */
#study-plan {
    background: #e0f2fe; /* پس زمینه آبی روشن شبیه عکس */
}
[data-theme="dark"] #study-plan { background: var(--bg); }

.sp-nav {
    display: flex; justify-content: space-between; align-items: center;
    background: #fff; padding: 10px 15px; border-radius: 12px;
    margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
[data-theme="dark"] .sp-nav { background: var(--bg-card); }
.sp-nav-btn {
    background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 8px;
    font-family: inherit; font-weight: 700; color: #475569; cursor: pointer;
}
.sp-date { font-weight: 800; font-size: 1.1em; color: #0f172a; cursor: pointer; }
[data-theme="dark"] .sp-date { color: var(--text); }

.sp-total {
    text-align: center; font-weight: 800; color: #0369a1;
    margin-bottom: 20px; font-size: 1.1em;
}
[data-theme="dark"] .sp-total { color: var(--primary); }

.sp-list { display: flex; flex-direction: column; gap: 10px; }
.sp-card {
    background: #fff; border-radius: 12px; padding: 15px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03); cursor: pointer; transition: transform 0.15s;
    border: 1px solid #e2e8f0;
}
[data-theme="dark"] .sp-card { background: var(--bg-card); border-color: var(--border); }
.sp-card:active { transform: scale(0.98); }
.sp-card-info { display: flex; flex-direction: column; gap: 5px; }
.sp-card-subj { font-weight: 800; font-size: 0.95em; color: #334155; }
[data-theme="dark"] .sp-card-subj { color: var(--text); }
.sp-card-desc { font-size: 0.75em; color: #64748b; }
.sp-card-time {
    background: #10b981; color: #fff; padding: 6px 12px; border-radius: 20px;
    font-weight: 800; font-size: 0.85em; white-space: nowrap;
}
.sp-add-btn {
    position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%);
    background: #0ea5e9; color: #fff; border: none; padding: 15px 30px;
    border-radius: 50px; font-family: inherit; font-size: 1em; font-weight: 800;
    box-shadow: 0 5px 20px rgba(14,165,233,0.4); cursor: pointer; z-index: 100;
}

/* ============ NEW MODAL STYLES ============ */
.se-date-btn {
    flex: 1; padding: 12px; border: 1px solid #cbd5e1; background: #fff;
    border-radius: 8px; font-family: inherit; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s;
}
.se-date-btn.active { background: #38bdf8; color: #fff; border-color: #38bdf8; }
.se-activity-group { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.se-act-btn {
    padding: 8px 14px; border-radius: 20px; border: 1px solid #cbd5e1;
    background: #fff; font-family: inherit; font-size: 0.85em; font-weight: 700; color: #475569; cursor: pointer;
}
.se-act-btn.active { background: #14b8a6; color: #fff; border-color: #14b8a6; }
.se-quick-times { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
.se-quick-times button {
    padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;
    background: #fff; font-family: inherit; font-size: 0.85em; font-weight: 700; cursor: pointer;
}
`;
fs.writeFileSync('style.css', css + "\n" + newCSS);

// ==========================================
// 3. تغییرات JavaScript
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// پیدا کردن و حذف StudyEditor قبلی برای بازنویسی کامل
const oldSeStart = js.indexOf('window.StudyEditor = {');
if (oldSeStart !== -1) {
    const oldSeEnd = js.indexOf('// ============ JALALI PICKER SYNC ============', oldSeStart);
    if (oldSeEnd !== -1) {
        js = js.slice(0, oldSeStart) + js.slice(oldSeEnd);
    }
}

const newLogic = `
// ============ NEW STUDY PLAN & EDITOR ============
window.StudyPlan = {
    currentDate: today(),
    
    init: function() {
        this.currentDate = today();
        this.render();
    },
    
    changeDay: function(delta) {
        let d = new Date(this.currentDate + 'T00:00:00');
        d.setDate(d.getDate() + delta);
        let newDate = localDate(d);
        if (newDate > today()) return; // نمی‌توان به آینده رفت
        this.currentDate = newDate;
        this.render();
    },
    prevDay: function() { this.changeDay(-1); },
    nextDay: function() { this.changeDay(1); },
    
    openDatePicker: function() {
        // در صورت نیاز به تقویم کامل
        const sh = getShamsi(new Date(this.currentDate));
        toast('تاریخ: ' + sh.d + ' ' + sh.monthName);
    },
    
    render: function() {
        const dateEl = document.getElementById('spDate');
        const totalEl = document.getElementById('spTotal');
        const listEl = document.getElementById('spList');
        if (!dateEl || !totalEl || !listEl) return;
        
        const sh = getShamsi(new Date(this.currentDate));
        const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
        const dayName = dayNames[new Date(this.currentDate).getDay()];
        
        dateEl.textContent = dayName + ' ' + fa(sh.d) + ' ' + sh.monthName;
        
        const log = getData('ilia-log', []);
        const dayLogs = log.filter(e => e.date === this.currentDate);
        
        let totalMin = 0;
        dayLogs.forEach(l => totalMin += (l.hours * 60));
        
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        totalEl.textContent = 'مجموع: ' + fa(pad2(h)) + ':' + fa(pad2(m));
        
        if (dayLogs.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; color:#64748b; padding:30px 10px; font-weight:700;">در این تاریخ مطالعه‌ای انجام نشده است!</div>';
            return;
        }
        
        // مرتب سازی بر اساس زمان ثبت
        dayLogs.sort((a,b) => a.ts - b.ts);
        
        listEl.innerHTML = dayLogs.map(l => {
            const mins = Math.round(l.hours * 60);
            const act = l.activity || 'مطالعه';
            const icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[l.subject]) ? SUBJECT_ICONS[l.subject] : '📚';
            return \`
                <div class="sp-card" onclick="StudyEditor.openEdit(\${l.ts})">
                    <div class="sp-card-info">
                        <div class="sp-card-subj">\${icon} \${esc(l.subject)} (\${act})</div>
                        \${l.desc ? \`<div class="sp-card-desc">\${esc(l.desc)}</div>\` : ''}
                    </div>
                    <div class="sp-card-time">\${fa(mins)} دقیقه</div>
                </div>
            \`;
        }).join('');
    }
};

window.StudyEditor = {
    currentDate: today(),
    activity: 'مطالعه',
    editingTs: null,

    open: function() {
        this.editingTs = null;
        this.currentDate = today();
        this.activity = 'مطالعه';
        
        document.getElementById('seTitle').textContent = 'ثبت مطالعه';
        document.getElementById('seDeleteBtn').style.display = 'none';
        document.getElementById('seSaveBtn').textContent = 'ثبت';
        document.getElementById('editMinutes').value = '';
        document.getElementById('editDesc').value = '';
        
        // تنظیم تاریخ‌های تب
        const t = getShamsi(new Date());
        const y = getShamsi(new Date(Date.now() - 86400000));
        document.getElementById('seTodayDate').textContent = t.d + '/' + t.m;
        document.getElementById('seYestDate').textContent = y.d + '/' + y.m;
        
        this.setDate('today');
        this.setActivity('مطالعه', document.querySelector('.se-act-btn'));
        
        document.getElementById('studyEditorModal').classList.add('active');
        document.getElementById('editMinutes').focus();
    },
    
    openEdit: function(ts) {
        const log = getData('ilia-log', []);
        const target = log.find(x => x.ts === ts);
        if (!target) return;
        
        this.editingTs = ts;
        this.currentDate = target.date;
        this.activity = target.activity || 'مطالعه';
        
        document.getElementById('seTitle').textContent = 'ویرایش مطالعه';
        document.getElementById('seDeleteBtn').style.display = 'block';
        document.getElementById('seSaveBtn').textContent = 'ویرایش';
        
        // پر کردن فرم
        document.getElementById('editSubject').value = target.subject;
        document.getElementById('editMinutes').value = Math.round(target.hours * 60);
        document.getElementById('editDesc').value = target.desc || '';
        
        // تنظیم تب تاریخ
        const t = getShamsi(new Date());
        const targetSh = getShamsi(new Date(target.date));
        if (target.date === today()) this.setDate('today');
        else if (target.date === localDate(new Date(Date.now() - 86400000))) this.setDate('yesterday');
        else {
            // اگر تاریخ دیگری بود
            document.querySelectorAll('.se-date-btn').forEach(b => b.classList.remove('active'));
        }
        
        // تنظیم فعالیت
        document.querySelectorAll('.se-act-btn').forEach(btn => {
            if(btn.textContent.trim() === this.activity) this.setActivity(this.activity, btn);
        });
        
        document.getElementById('studyEditorModal').classList.add('active');
    },
    
    close: function() {
        document.getElementById('studyEditorModal').classList.remove('active');
    },
    
    setDate: function(type) {
        document.querySelectorAll('.se-date-btn').forEach(b => b.classList.remove('active'));
        if (type === 'today') {
            this.currentDate = today();
            document.getElementById('seBtnToday').classList.add('active');
        } else {
            this.currentDate = localDate(new Date(Date.now() - 86400000));
            document.getElementById('seBtnYesterday').classList.add('active');
        }
    },
    
    setActivity: function(act, btn) {
        this.activity = act;
        document.querySelectorAll('.se-act-btn').forEach(b => b.classList.remove('active'));
        if(btn) btn.classList.add('active');
    },
    
    setMin: function(m) {
        document.getElementById('editMinutes').value = m;
    },
    
    save: function() {
        const subj = document.getElementById('editSubject').value;
        const min = parseInt(document.getElementById('editMinutes').value);
        const desc = document.getElementById('editDesc').value.trim();
        
        if (!min || min <= 0) return toast('لطفاً مدت زمان معتبر وارد کنید');
        
        let log = getData('ilia-log', []);
        let sessions = getData('ilia-sessions', []);
        
        if (this.editingTs) {
            // ویرایش
            const logIdx = log.findIndex(x => x.ts === this.editingTs);
            if (logIdx !== -1) {
                log[logIdx].subject = subj;
                log[logIdx].hours = min / 60;
                log[logIdx].activity = this.activity;
                log[logIdx].desc = desc;
                log[logIdx].date = this.currentDate; // اجازه تغییر تاریخ هم بدهیم
            }
            
            const sesIdx = sessions.findIndex(x => x.ts === this.editingTs);
            if (sesIdx !== -1) {
                sessions[sesIdx].subj = subj;
                sessions[sesIdx].min = min;
                sessions[sesIdx].topic = this.activity;
                sessions[sesIdx].desc = desc;
                sessions[sesIdx].date = this.currentDate;
            }
            toast('✅ مطالعه ویرایش شد');
        } else {
            // ثبت جدید
            const newTs = Date.now();
            log.push({ date: this.currentDate, hours: min / 60, subject: subj, activity: this.activity, desc: desc, ts: newTs });
            sessions.push({ id: newTs, date: this.currentDate, subj: subj, min: min, topic: this.activity, desc: desc, pages: 0, tests: 0, ts: newTs });
            toast('✅ مطالعه ثبت شد');
        }
        
        setData('ilia-log', log);
        setData('ilia-sessions', sessions);
        
        this.close();
        
        // آپدیت همه بخش‌ها
        if (typeof refreshAppData === 'function') refreshAppData();
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
        if (typeof renderStats === 'function') renderStats();
        if (typeof StudyPlan !== 'undefined') StudyPlan.render();
    },
    
    deleteCurrent: function() {
        if (!this.editingTs) return;
        if (!confirm('آیا از حذف این رکورد مطمئن هستید؟')) return;
        
        let log = getData('ilia-log', []);
        log = log.filter(x => x.ts !== this.editingTs);
        setData('ilia-log', log);
        
        let sessions = getData('ilia-sessions', []);
        sessions = sessions.filter(x => x.ts !== this.editingTs);
        setData('ilia-sessions', sessions);
        
        toast('🗑 رکورد حذف شد');
        this.close();
        
        if (typeof refreshAppData === 'function') refreshAppData();
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
        if (typeof renderStats === 'function') renderStats();
        if (typeof StudyPlan !== 'undefined') StudyPlan.render();
    }
};

// اتصال به go
if (typeof go !== 'undefined') {
    const originalGo = go;
    window.go = function(id) {
        originalGo(id);
        if (id === 'study-plan') {
            setTimeout(() => StudyPlan.init(), 50);
        }
    };
}

// متصل کردن کلیک ویجت به مودال جدید
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

js = js.replace('// ============ FINAL CLEAN STUDY EDITOR ============', '// StudyEditor removed and replaced by new logic');
js += "\n" + newLogic;

fs.writeFileSync('app.js', js);
console.log("✅ JS با موفقیت آپدیت شد.");

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

console.log("🎉 برنامه مطالعاتی و مودال‌های جدید ساخته شد! حالا Ctrl+F5 بزن.");
