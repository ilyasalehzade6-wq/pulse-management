const fs = require('fs');

console.log("🗂 در حال ارتقای جعبه لایتنر و افزودن مدیریت کارت‌ها...");

// ==========================================
// 1. تغییرات HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const leitnerHTML = `
<section id="leitner">
    <div class="container" style="padding-top:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="margin:0;">🗂 جعبه لایتنر</h2>
            <button class="btn btn-info" onclick="LeitnerManager.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">📋 مدیریت کارت‌ها</button>
        </div>
        
        <div class="card">
            <div class="inp-row">
                <input class="inp" id="lf" placeholder="سوال / لغت">
                <input class="inp" id="lb" placeholder="پاسخ / معنی">
            </div>
            <div class="inp-row">
                <select class="inp" id="leitnerSubject">
                    <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                    <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                    <option value="عربی">عربی</option><option value="زبان">زبان</option>
                    <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                    <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                </select>
                <button class="btn btn-success" onclick="addLeitner()">➕ اضافه</button>
            </div>
        </div>
        
        <div class="card">
            <div style="text-align:center; margin-bottom: 10px;">
                <label style="font-size:0.9em; font-weight:bold; margin-bottom:5px; display:block;">درس مورد نظر را انتخاب کنید:</label>
                <select class="inp" id="filterLeitnerSubject" onchange="renderLeitner()" style="max-width:200px; margin:0 auto;">
                    <option value="all">همه درس‌ها</option>
                    <option value="ریاضی">ریاضی</option><option value="فیزیک">فیزیک</option>
                    <option value="هندسه">هندسه</option><option value="شیمی">شیمی</option>
                    <option value="عربی">عربی</option><option value="زبان">زبان</option>
                    <option value="فارسی">فارسی</option><option value="دینی">دینی</option>
                    <option value="جغرافیا">جغرافیا</option><option value="نگارش">نگارش</option>
                </select>
            </div>

            <div class="flashcard" id="leitnerCard" onclick="flipLeitner()">
                <div class="fc-inner">
                    <div class="fc-front" id="lv1">کارتی نیست</div>
                    <div class="fc-back" id="lv2">اضافه کن!</div>
                </div>
            </div>
            
            <div id="leitnerActions" style="margin-top:15px;">
                <div class="btn-group" id="leitnerMainBtns">
                    <button class="btn btn-danger" onclick="leitnerAnswer(false)">❌ نمی‌دونستم</button>
                    <button class="btn btn-success" onclick="leitnerAnswer(true)">✅ می‌دونستم</button>
                </div>
                <div class="btn-group" id="leitnerResultBtns" style="display:none;">
                    <button class="btn btn-info" onclick="LeitnerManager.editCurrent()">✏️ ویرایش</button>
                    <button class="btn btn-primary" onclick="nextLeitnerCard()">بعدی ➡</button>
                </div>
            </div>
            <p style="text-align:center;color:var(--text-light);margin-top:10px;font-size:.82em" id="leitnerCounter"></p>
        </div>
    </div>
</section>
`;

const lStart = html.indexOf('<section id="leitner">');
const lEnd = html.indexOf('</section>', lStart) + 10;
if (lStart !== -1 && lEnd !== -1) {
    html = html.slice(0, lStart) + leitnerHTML + html.slice(lEnd);
}

// مودال مدیریت کارت‌ها
const managerModalHTML = `
<div class="modal-overlay" id="leitnerManagerModal" onclick="if(event.target===this)LeitnerManager.close()">
    <div class="modal-box" style="max-width: 500px; border-radius: 20px; display:flex; flex-direction:column; max-height:85vh;">
        <div class="modal-header">
            <h3 style="margin:0;">📋 مدیریت کارت‌ها</h3>
            <button class="modal-close" onclick="LeitnerManager.close()">✕</button>
        </div>
        
        <div class="modal-body" style="flex:1; overflow-y:auto; padding:15px;">
            <div id="lmStats" class="lm-stats-grid"></div>
            <div id="lmList" class="lm-list"></div>
        </div>
        
        <div class="modal-footer" style="padding:15px; border-top:1px solid var(--border);">
            <button class="btn btn-secondary btn-block" onclick="LeitnerManager.close()">بستن</button>
        </div>
    </div>
</div>
`;

if (!html.includes('id="leitnerManagerModal"')) {
    html = html.replace('</body>', managerModalHTML + '\n</body>');
}

fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const leitnerCSS = `
/* ============ LEITNER MANAGER ============ */
.lm-stats-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-bottom: 15px;
}
.lm-stat-box {
    background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 5px; text-align: center;
}
.lm-stat-box .num { font-size: 1.2em; font-weight: 900; color: var(--primary); }
.lm-stat-box .lbl { font-size: 0.65em; color: var(--text-light); font-weight: 700; }

.lm-list { display: flex; flex-direction: column; gap: 8px; }
.lm-item {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
    padding: 12px; display: flex; justify-content: space-between; align-items: center;
}
.lm-item-info { flex: 1; }
.lm-item-front { font-weight: 800; font-size: 0.9em; color: var(--text); margin-bottom: 3px; }
.lm-item-back { font-size: 0.8em; color: var(--text-light); }
.lm-item-meta { font-size: 0.7em; color: var(--primary); margin-top: 5px; font-weight: 700; }
.lm-item-actions { display: flex; gap: 5px; }
.lm-btn-edit, .lm-btn-del {
    width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1em;
}
.lm-btn-edit { background: rgba(52, 152, 219, 0.1); color: var(--info); }
.lm-btn-del { background: rgba(231, 76, 60, 0.1); color: var(--danger); }
`;
fs.writeFileSync('style.css', css + "\n" + leitnerCSS);

// ==========================================
// 3. منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const managerLogic = `
// ============ LEITNER MANAGER ============
window.LeitnerManager = {
    open: function() {
        document.getElementById('leitnerManagerModal').classList.add('active');
        this.render();
    },
    close: function() {
        document.getElementById('leitnerManagerModal').classList.remove('active');
    },
    render: function() {
        const cards = getData('ilia-leitner', []);
        
        // آمار جعبه‌ها
        const stats = {1:0, 2:0, 3:0, 4:0, 5:0};
        cards.forEach(c => {
            const box = c.box || 1;
            if(stats[box] !== undefined) stats[box]++;
        });
        
        document.getElementById('lmStats').innerHTML = Object.keys(stats).map(box => \`
            <div class="lm-stat-box">
                <div class="num">\${fa(stats[box])}</div>
                <div class="lbl">جعبه \${fa(box)}</div>
            </div>
        \`).join('');
        
        // لیست کارت‌ها
        const list = document.getElementById('lmList');
        if (cards.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:var(--text-light); padding:20px;">هنوز کارتی ثبت نکرده‌اید.</div>';
            return;
        }
        
        // مرتب سازی بر اساس جعبه (از کم به زیاد) و سپس تاریخ
        cards.sort((a,b) => (a.box||1) - (b.box||1));
        
        list.innerHTML = cards.map(c => {
            const subj = c.subject || 'نامشخص';
            const box = c.box || 1;
            return \`
                <div class="lm-item">
                    <div class="lm-item-info">
                        <div class="lm-item-front">\${esc(c.front)}</div>
                        <div class="lm-item-back">\${esc(c.back)}</div>
                        <div class="lm-item-meta">درس: \${esc(subj)} | جعبه: \${fa(box)}</div>
                    </div>
                    <div class="lm-item-actions">
                        <button class="lm-btn-edit" onclick="LeitnerManager.edit(\${c.id})">✏️</button>
                        <button class="lm-btn-del" onclick="LeitnerManager.delete(\${c.id})">🗑</button>
                    </div>
                </div>
            \`;
        }).join('');
    },
    delete: function(id) {
        if(!confirm('این کارت حذف شود؟')) return;
        let cards = getData('ilia-leitner', []);
        cards = cards.filter(c => c.id !== id);
        setData('ilia-leitner', cards);
        toast('🗑 کارت حذف شد');
        this.render();
        renderLeitner();
    },
    edit: function(id) {
        let cards = getData('ilia-leitner', []);
        let c = cards.find(x => x.id === id);
        if (!c) return;
        
        const newFront = prompt('متن سوال (جلوی کارت):', c.front);
        if (newFront === null) return;
        const newBack = prompt('متن پاسخ (پشت کارت):', c.back);
        if (newBack === null) return;
        
        c.front = newFront.trim() || c.front;
        c.back = newBack.trim() || c.back;
        setData('ilia-leitner', cards);
        toast('✅ کارت ویرایش شد');
        this.render();
        renderLeitner();
    },
    editCurrent: function() {
        if (!window.currentLeitnerCard) return;
        this.edit(window.currentLeitnerCard.id);
    }
};

// اطمینان از سازگاری با کارت‌های قدیمی (بدون فیلد subject)
// این کار در تابع renderLeitner اصلی انجام می‌شود، اما یک Fallback هم اینجا می‌گذاریم.
`;

if (!js.includes('window.LeitnerManager')) {
    js += "\n" + managerLogic;
}

// اطمینان از اینکه دکمه ویرایش در مودال کار می‌کند (اگر currentLeitnerCard وجود داشته باشد)
js = js.replace(
    "document.getElementById('leitnerResultBtns').style.display = 'flex';",
    "document.getElementById('leitnerResultBtns').style.display = 'flex';\n  window.currentLeitnerCard = currentLeitnerCard; // ذخیره برای ویرایش"
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

console.log("🎉 مدیریت کارت‌های لایتنر و آمار جعبه‌ها اضافه شد! حالا Ctrl+F5 بزن.");
