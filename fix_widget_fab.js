const fs = require('fs');

console.log("🔧 در حال بازگرداندن دکمه شناور (+) و فعال‌سازی مجدد ویجت عملکرد...");

// ==========================================
// 1. اصلاح CSS (نمایان کردن دکمه شناور)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const fabCSS = `
/* ============ FIX FAB AND WIDGET ============ */
.wizard-fab {
    display: flex !important;
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    width: 65px !important;
    height: 65px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
    color: #fff !important;
    font-size: 2em !important;
    font-weight: bold !important;
    z-index: 9999 !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 6px 20px rgba(0, 150, 136, 0.4) !important;
    cursor: pointer !important;
    border: none !important;
    transition: transform 0.2s !important;
}
.wizard-fab:active { transform: scale(0.9) !important; }

/* اطمینان از اینکه ویجت کلیک‌پذیر است */
#launcherWidget { cursor: pointer !important; }
#launcherWidget:active { transform: scale(0.98); }

/* استایل مودال ویرایش */
.modal-overlay { display: none; }
.modal-overlay.active { display: flex !important; }
`;
fs.writeFileSync('style.css', css + "\n" + fabCSS);
console.log("✅ استایل دکمه شناور و ویجت اصلاح شد.");

// ==========================================
// 2. اطمینان از وجود HTML مودال
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="studyEditorModal"')) {
    const modalHTML = `
<div class="modal-overlay" id="studyEditorModal" onclick="if(event.target===this)StudyEditor.close()">
    <div class="modal-box">
        <div class="modal-header">
            <h3>📝 ثبت / ویرایش مطالعه</h3>
            <button class="modal-close" onclick="StudyEditor.close()">✕</button>
        </div>
        <div class="modal-body">
            <label>تاریخ ثبت</label>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 15px;">
                <button type="button" class="btn btn-secondary" onclick="StudyEditor.changeDate(-1)" style="padding: 10px; font-size: 1.2em; flex: 0 0 auto; border-radius: 12px;">❮</button>
                <input type="text" id="editDate" class="inp" readonly onclick="if(typeof JalaliPicker !== 'undefined') JalaliPicker.open(this)" placeholder="انتخاب تاریخ" style="margin-bottom: 0; text-align: center; font-weight: bold; font-size: 1.1em;">
                <button type="button" class="btn btn-secondary" id="btnNextDay" onclick="StudyEditor.changeDate(1)" style="padding: 10px; font-size: 1.2em; flex: 0 0 auto; border-radius: 12px;">❯</button>
            </div>
            <label>درس</label>
            <select id="editSubject" class="inp">
                <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                <option value="عربی">عربی</option><option value="زبان">زبان</option>
                <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                <option value="مطالعه آزاد">مطالعه آزاد</option>
            </select>
            <label>مدت زمان (دقیقه)</label>
            <input type="number" id="editMinutes" class="inp" placeholder="مثلاً ۴۵" min="1">
            <button class="btn btn-primary btn-block" onclick="StudyEditor.save()" style="margin-top:15px;">💾 ثبت اطلاعات</button>
        </div>
    </div>
</div>
`;
    html = html.replace('</body>', modalHTML + '\n</body>');
    fs.writeFileSync('index.html', html);
    console.log("✅ مودال ویرایش به HTML اضافه شد.");
}

// ==========================================
// 3. تزریق کدهای جاوااسکریپت (StudyEditor & JalaliPicker)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// حذف هر کد خراب قبلی مربوط به StudyEditor
js = js.replace(/window\.StudyEditor = \{[\s\S]*?\}\n\};/g, '');
js = js.replace(/\/\/ ============ STUDY EDITOR ============/g, '');

const cleanEditorJS = `
// ============ FIXED STUDY EDITOR & JALALI PICKER ============
window.StudyEditor = {
    open: function() {
        const modal = document.getElementById('studyEditorModal');
        if (!modal) return;
        modal.classList.add('active');
        
        const dateInput = document.getElementById('editDate');
        const t = today();
        const sh = getShamsi(new Date());
        
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        dateInput.dataset.gregorian = t;
        
        document.getElementById('editMinutes').value = '';
        document.getElementById('editMinutes').focus();
        this.updateNextButton(t);
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
        toast('✅ مطالعه برای ' + dateInput.value + ' ثبت شد');
        
        // رفرش همه بخش‌ها
        if (typeof refreshAppData === 'function') refreshAppData();
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderLeaguePage) GardenPro.renderLeaguePage();
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
        
        if (newGregStr > todayStr) return; // جلوگیری از رفتن به آینده
        
        dateInput.dataset.gregorian = newGregStr;
        const sh = getShamsi(d);
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        
        this.updateNextButton(newGregStr);
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
    }
};

// بازنویسی امن تقویم برای کار با مودال
if (typeof window.JalaliPicker !== 'undefined') {
    const originalSelect = window.JalaliPicker.select;
    window.JalaliPicker.select = function(d) {
        const jDateStr = this.currentY + '/' + pad2(this.currentM) + '/' + pad2(d);
        if (this.targetInput) {
            this.targetInput.value = jDateStr;
            const g = jalaliToGregorian(this.currentY, this.currentM, d);
            const gStr = g[0] + '-' + pad2(g[1]) + '-' + pad2(g[2]);
            this.targetInput.dataset.gregorian = gStr;
            
            if (this.targetInput.id === 'editDate') {
                StudyEditor.updateNextButton(gStr);
            }
        }
        this.close();
    };
}
`;

// اضافه کردن کد به انتهای فایل
js += "\n" + cleanEditorJS;

// در نهایت اطمینان از متصل بودن کلیک ویجت به تابع باز شده
js = js.replace(/widget\.onclick = function\(e\) \{[\s\S]*?\};/, `widget.onclick = function(e) {
            e.preventDefault();
            if (typeof StudyEditor !== 'undefined') {
                StudyEditor.open();
            } else {
                console.error('StudyEditor is not defined!');
            }
        };`);

fs.writeFileSync('app.js', js);
console.log("✅ کدهای StudyEditor و JalaliPicker با موفقیت بازسازی شدند.");

// ==========================================
// 4. آپدیت کش
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را با Ctrl+F5 رفرش کن.");
