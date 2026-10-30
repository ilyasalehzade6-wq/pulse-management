const fs = require('fs');

console.log("🔗 در حال اتصال پومودورو به برنامه مطالعاتی و ساخت بخش جزوه‌ها...");

// ==========================================
// 1. تغییرات HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن دکمه جزوه‌ها به داشبورد
const notesBtn = `<div class="nimkat-card" onclick="go('notes-hub')"><div class="nimkat-icon">📁</div><div class="nimkat-title">جزوه‌ها و فایل‌ها</div></div>`;
if (!html.includes('onclick="go(\'notes-hub\')"')) {
    html = html.replace('<div class="nimkat-card" onclick="go(\'notes\')">', notesBtn + '\n<div class="nimkat-card" onclick="go(\'notes\')">');
}

// ب) ساخت سکشن جزوه‌ها
const notesSection = `
<section id="notes-hub">
    <div class="container" style="padding-top:20px; padding-bottom:100px;">
        <h2>📁 جزوه‌ها و فایل‌های من</h2>
        <p style="color:var(--text-light); font-size:0.85em; margin-bottom:15px;">فایل‌های PDF یا عکس‌های جزوه‌هایت را اینجا آپلود کن تا همیشه در دسترس باشند.</p>
        
        <div class="card" style="text-align:center; border: 2px dashed var(--primary); background: rgba(0,150,136,0.05);">
            <div style="font-size:2em; margin-bottom:10px;">☁️</div>
            <div style="font-weight:800; margin-bottom:10px;">آپلود فایل جدید</div>
            <input type="file" id="notesFileInput" accept="image/*,application/pdf" style="display:none" onchange="NotesHub.handleUpload(event)">
            <button class="btn btn-primary" onclick="document.getElementById('notesFileInput').click()">انتخاب فایل از گوشی</button>
        </div>

        <div class="notes-filter">
            <button class="nf-btn active" onclick="NotesHub.filter('all', this)">همه</button>
            <button class="nf-btn" onclick="NotesHub.filter('ریاضی', this)">ریاضی</button>
            <button class="nf-btn" onclick="NotesHub.filter('فیزیک', this)">فیزیک</button>
            <button class="nf-btn" onclick="NotesHub.filter('شیمی', this)">شیمی</button>
            <button class="nf-btn" onclick="NotesHub.filter('عربی', this)">عربی</button>
            <button class="nf-btn" onclick="NotesHub.filter('زبان', this)">زبان</button>
        </div>

        <div id="notesGrid" class="notes-grid"></div>
    </div>
</section>
`;

if (!html.includes('<section id="notes-hub">')) {
    html = html.replace('<section id="settings">', notesSection + '\n<section id="settings">');
}

// ج) مودال هوشمند اتمام پومودورو
const pomoModalHTML = `
<div class="modal-overlay" id="pomoLogModal" onclick="if(event.target===this)PomodoroIntegration.close()">
    <div class="modal-box" style="max-width: 400px; border-radius: 20px;">
        <div class="modal-header">
            <h3 style="margin:0;">🎉 پومودورو تمام شد!</h3>
            <button class="modal-close" onclick="PomodoroIntegration.close()">✕</button>
        </div>
        <div class="modal-body" style="padding: 20px;">
            <p style="text-align:center; margin-bottom:20px; font-size:0.9em; color:var(--text-light);">حالا که تمرکزت تموم شد، بگو چیکار کردی تا توی برنامه مطالعاتی ثبت شه.</p>
            
            <div class="inp-group">
                <label>درس</label>
                <select id="plSubject" class="inp">
                    <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                    <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                    <option value="عربی">عربی</option><option value="زبان">زبان</option>
                    <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                </select>
            </div>
            
            <div class="inp-group" style="margin-top:15px;">
                <label>چند دقیقه بود؟</label>
                <input type="number" id="plMinutes" class="inp" value="25">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="PomodoroIntegration.close()" style="flex:1;">نادیده بگیر</button>
            <button class="btn btn-primary" onclick="PomodoroIntegration.save()" style="flex:2;">ثبت در برنامه</button>
        </div>
    </div>
</div>
`;

if (!html.includes('id="pomoLogModal"')) {
    html = html.replace('</body>', pomoModalHTML + '\n</body>');
}

fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const newCSS = `
/* ============ NOTES HUB ============ */
.notes-filter {
    display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin: 15px 0;
    scrollbar-width: none;
}
.notes-filter::-webkit-scrollbar { display: none; }
.nf-btn {
    padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg-card); font-family: inherit; font-weight: 700; font-size: 0.85em;
    color: var(--text-light); cursor: pointer; white-space: nowrap;
}
.nf-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.notes-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;
}
.note-item {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
    overflow: hidden; position: relative; display: flex; flex-direction: column;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.note-preview {
    height: 100px; background: var(--bg); display: flex; align-items: center; justify-content: center;
    font-size: 2.5em; border-bottom: 1px solid var(--border);
}
.note-preview img { width: 100%; height: 100%; object-fit: cover; }
.note-info { padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.note-title { font-size: 0.75em; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
.note-subj { font-size: 0.65em; color: var(--primary); font-weight: 700; background: rgba(0,150,136,0.1); padding: 2px 6px; border-radius: 6px; display: inline-block; align-self: flex-start; }
.note-del {
    position: absolute; top: 5px; left: 5px; background: rgba(239,68,68,0.9); color: #fff;
    border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 0.8em;
    display: flex; align-items: center; justify-content: center; z-index: 2;
}
`;
fs.writeFileSync('style.css', css + "\n" + newCSS);

// ==========================================
// 3. منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const newLogic = `
// ============ AUTO LOG POMODORO ============
window.PomodoroIntegration = {
    isOpen: false,
    open: function() {
        this.isOpen = true;
        document.getElementById('pomoLogModal').classList.add('active');
        // زمان پیش‌فرض تایمر
        document.getElementById('plMinutes').value = Math.floor(pTot / 60);
    },
    close: function() {
        this.isOpen = false;
        document.getElementById('pomoLogModal').classList.remove('active');
    },
    save: function() {
        const subj = document.getElementById('plSubject').value;
        const min = parseInt(document.getElementById('plMinutes').value);
        
        if (!min || min <= 0) return toast('زمان معتبر وارد کنید');
        
        const ts = Date.now();
        // ثبت در لاگ
        const log = getData('ilia-log', []);
        log.push({ date: today(), hours: min / 60, subject: subj, activity: 'مطالعه (پومودورو)', ts });
        setData('ilia-log', log);
        
        // ثبت در جلسات
        const sessions = getData('ilia-sessions', []);
        sessions.push({ id: ts, date: today(), subj, min, topic: 'مطالعه با تایمر', pages: 0, tests: 0, ts });
        setData('ilia-sessions', sessions);
        
        this.close();
        toast('✅ مطالعه با موفقیت به برنامه اضافه شد');
        
        // آپدیت ویجت‌ها
        if (typeof refreshAppData === 'function') refreshAppData();
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
    }
};

// بازنویسی تابع خودکار پومودورو
const originalAutoLog = autoLog;
window.autoLog = function() {
    PomodoroIntegration.open();
};

// ============ NOTES HUB ============
window.NotesHub = {
    currentFilter: 'all',
    
    filter: function(f, btn) {
        this.currentFilter = f;
        document.querySelectorAll('.nf-btn').forEach(b => b.classList.remove('active'));
        if(btn) btn.classList.add('active');
        this.render();
    },
    
    handleUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            return toast('⚠️ حجم فایل نباید بیشتر از ۲ مگابایت باشد.');
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            // گرفتن نام درس از کاربر
            const subj = prompt('این جزوه مربوط به کدام درس است؟ (ریاضی، فیزیک، شیمی، عربی، زبان...)', 'ریاضی');
            if (subj === null) return; // انصراف
            
            let type = 'pdf';
            if (file.type.startsWith('image/')) type = 'image';
            
            const notes = getData('ilia-notes-hub', []);
            notes.push({
                id: Date.now(),
                name: file.name,
                type: type,
                data: base64,
                subject: subj.trim() || 'عمومی',
                date: today()
            });
            
            if (setData('ilia-notes-hub', notes)) {
                toast('✅ فایل با موفقیت ذخیره شد');
                this.render();
            }
            event.target.value = ''; // ریست کردن input
        };
        reader.readAsDataURL(file);
    },
    
    delete: function(id) {
        if(!confirm('این فایل حذف شود؟')) return;
        let notes = getData('ilia-notes-hub', []);
        notes = notes.filter(n => n.id !== id);
        setData('ilia-notes-hub', notes);
        this.render();
    },
    
    view: function(id) {
        const notes = getData('ilia-notes-hub', []);
        const n = notes.find(x => x.id === id);
        if(!n) return;
        
        // باز کردن در تب جدید
        const win = window.open();
        win.document.write('<html dir="rtl"><head><title>' + n.name + '</title></head><body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#333;"><iframe src="' + n.data + '" width="100%" height="100%" style="border:none;"></iframe></body></html>');
    },
    
    render: function() {
        const grid = document.getElementById('notesGrid');
        if(!grid) return;
        
        let notes = getData('ilia-notes-hub', []);
        
        if (this.currentFilter !== 'all') {
            notes = notes.filter(n => n.subject === this.currentFilter);
        }
        
        if (notes.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-light); font-weight:700;">هیچ فایلی در این بخش وجود ندارد.</div>';
            return;
        }
        
        // مرتب سازی جدیدترین
        notes.sort((a,b) => b.id - a.id);
        
        grid.innerHTML = notes.map(n => {
            let preview = '';
            if (n.type === 'image') {
                preview = '<img src="' + n.data + '">';
            } else {
                preview = '<div style="color:var(--danger)">📄</div>';
            }
            
            return \`
                <div class="note-item">
                    <button class="note-del" onclick="NotesHub.delete(\${n.id})">✕</button>
                    <div class="note-preview" onclick="NotesHub.view(\${n.id})" style="cursor:pointer;">\${preview}</div>
                    <div class="note-info">
                        <div class="note-title" title="\${n.name}">\${n.name}</div>
                        <div class="note-subj">\${n.subject}</div>
                    </div>
                </div>
            \`;
        }).join('');
    }
};

// اتصال به سیستم ناوبری
if (typeof go !== 'undefined') {
    const originalGoNotes = go;
    window.go = function(id) {
        originalGoNotes(id);
        if (id === 'notes-hub') {
            setTimeout(() => NotesHub.render(), 50);
        }
    };
}
`;

if (!js.includes('PomodoroIntegration')) {
    js += "\n" + newLogic;
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

console.log("🎉 اتصال پومودورو و بخش جزوه‌ها ساخته شد! حالا Ctrl+F5 بزن.");
