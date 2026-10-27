const fs = require('fs');

console.log("🌳 در حال ساخت باغ واقعی با گرافیک SVG و نمای هفته به هفته...");

// ==========================================
// 1. پاکسازی HTML (حذف لیگ و ساخت ساختار جدید)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// حذف لیگ‌های بالای باغ
html = html.replace(/<div class="league-header" id="leagueHeader">[\s\S]*?<\/div>\s*<\/div>/, '');
html = html.replace(/<div class="league-progress-wrap">[\s\S]*?<\/div>\s*<\/div>/, '');

const gardenHTML = `
<section id="garden">
    <div class="container" style="padding-top:20px;">
        <h2>🌳 باغ مطالعه‌ی من</h2>
        
        <!-- ناوبری هفته -->
        <div class="week-navigator">
            <button class="wn-btn" onclick="GardenPro.changeWeek(1)">هفته قبل ❯</button>
            <div class="wn-title" id="weekTitle">این هفته</div>
            <button class="wn-btn" onclick="GardenPro.changeWeek(-1)" id="btnNextWeek">❮ هفته بعد</button>
        </div>

        <!-- آمار -->
        <div class="garden-stats-grid">
            <div class="gs-box">
                <div class="gs-icon">📅</div>
                <div class="gs-val" id="statDaily">۰</div>
                <div class="gs-label">میانگین روزانه</div>
            </div>
            <div class="gs-box">
                <div class="gs-icon">📆</div>
                <div class="gs-val" id="statWeekly">۰</div>
                <div class="gs-label">کل هفته</div>
            </div>
            <div class="gs-box">
                <div class="gs-icon">🗓️</div>
                <div class="gs-val" id="statMonthly">۰</div>
                <div class="gs-label">کل ماه</div>
            </div>
        </div>

        <!-- باغ واقعی -->
        <div class="garden-scene-realistic" id="gardenScene">
            <div class="sky-realistic" id="gardenSky"></div>
            <div class="garden-grid-realistic" id="gardenGridLarge"></div>
            <div class="soil-bed"></div>
        </div>
        
        <div class="garden-tips">
            <div class="gt-icon">💡</div>
            <div class="gt-text" id="gardenMessage">...</div>
        </div>

        <div id="gardenTooltip" class="garden-tooltip"></div>
    </div>
</section>
`;

const start = html.indexOf('<section id="garden">');
const end = html.indexOf('</section>', start) + 10;
if (start !== -1 && end !== -1) {
    html = html.slice(0, start) + gardenHTML + html.slice(end);
}
fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS (طراحی واقعی درختان و خاک)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const realCSS = `
/* ============ REALISTIC GARDEN ============ */
.week-navigator {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--bg-card); padding: 10px 15px; border-radius: 12px;
    margin-bottom: 15px; border: 1px solid var(--border); box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.wn-btn { background: var(--bg); border: 1px solid var(--border); padding: 6px 12px; border-radius: 8px; font-family: inherit; font-size: 0.8em; font-weight: bold; cursor: pointer; color: var(--text); }
.wn-btn:disabled { opacity: 0.3; cursor: default; }
.wn-title { font-weight: 800; font-size: 0.95em; color: var(--primary); }

.garden-scene-realistic {
    background: linear-gradient(to bottom, #bae6fd 0%, #f0fdf4 70%, #f0fdf4 100%);
    border-radius: 20px; padding: 20px 10px 60px 10px; position: relative;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.05); border: 2px solid #bbf7d0;
    margin-bottom: 15px; overflow: hidden; transition: background 1s;
}
.garden-scene-realistic.night { background: linear-gradient(to bottom, #1e1b4b 0%, #064e3b 70%, #064e3b 100%); border-color: #166534; }

.sky-realistic { position: absolute; top: 15px; right: 20px; font-size: 2.5em; z-index: 1; filter: drop-shadow(0 0 15px rgba(255,255,255,0.6)); transition: all 0.5s; }

.soil-bed {
    position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
    background: linear-gradient(to bottom, #065f46, #064e3b);
    border-top: 8px solid #10b981;
    border-radius: 50% 50% 0 0 / 20px 20px 0 0;
    z-index: 1; box-shadow: inset 0 5px 15px rgba(0,0,0,0.5);
}
.garden-scene-realistic.night .soil-bed { background: linear-gradient(to bottom, #022c22, #064e3b); border-color: #047857; }

.garden-grid-realistic {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; position: relative; z-index: 2;
    height: 140px; align-items: flex-end;
}
.gd-cell-real {
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
    height: 100%; position: relative; cursor: pointer;
}
/* انیمیشن رشد درخت */
.svg-plant { width: 100%; max-width: 60px; height: auto; transition: transform 0.3s; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.3)); transform-origin: bottom center; animation: growPlant 1s ease-out forwards; }
.gd-cell-real:hover .svg-plant { transform: scale(1.15); animation-play-state: paused; }
@keyframes growPlant { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }

/* اگر خالی باشد (خاک) */
.svg-empty { width: 20px; height: 10px; background: #064e3b; border-radius: 50%; opacity: 0.6; margin-bottom: 5px; }

.gd-day-real {
    position: absolute; bottom: -25px; font-size: 0.75em; color: #fff;
    font-weight: bold; text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}
.gd-hours-real {
    position: absolute; top: -20px; font-size: 0.65em; color: #fff; font-weight: 800;
    background: rgba(16,185,129,0.9); padding: 2px 6px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 3;
}
`;
fs.writeFileSync('style.css', css + "\n" + realCSS);

// ==========================================
// 3. منطق جاوااسکریپت (هفته‌ها و درختان SVG)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const realGardenJS = `
window.GardenPro = {
    weekOffset: 0, // 0 = این هفته، 1 = هفته قبل، ...

    changeWeek: function(dir) {
        this.weekOffset += dir;
        if (this.weekOffset < 0) this.weekOffset = 0;
        this.renderGarden();
    },

    getStartOfWeek: function(offset) {
        // شنبه شروع هفته است
        const now = new Date();
        const day = now.getDay(); // 0=یکشنبه, 6=شنبه
        const diff = (day + 1) % 7; 
        const start = new Date(now);
        start.setDate(start.getDate() - diff - (offset * 7));
        start.setHours(0,0,0,0);
        return start;
    },

    getSvgPlant: function(hours) {
        // بازگرداندن کد SVG بر اساس ساعت مطالعه
        if (hours <= 0) return '<div class="svg-empty"></div>';
        
        if (hours > 0 && hours < 1) {
            // جوانه (Sprout)
            return \`<svg class="svg-plant" viewBox="0 0 50 50"><path d="M25,50 Q25,30 25,20" stroke="#4ade80" stroke-width="3" fill="none"/><path d="M25,30 Q15,25 10,35 Q20,35 25,30" fill="#22c55e"/><path d="M25,25 Q35,20 40,30 Q30,30 25,25" fill="#16a34a"/></svg>\`;
        }
        if (hours >= 1 && hours < 2) {
            // نهال (Sapling)
            return \`<svg class="svg-plant" viewBox="0 0 50 50"><rect x="23" y="25" width="4" height="25" fill="#78350f"/><circle cx="25" cy="20" r="12" fill="#22c55e"/><circle cx="15" cy="25" r="8" fill="#16a34a"/><circle cx="35" cy="25" r="8" fill="#15803d"/></svg>\`;
        }
        if (hours >= 2 && hours < 3) {
            // درخت متوسط (Tree)
            return \`<svg class="svg-plant" viewBox="0 0 50 50"><path d="M22,50 L28,50 L27,25 L23,25 Z" fill="#451a03"/><path d="M25,10 L10,30 L15,30 L5,45 L45,45 L35,30 L40,30 Z" fill="#22c55e"/><path d="M25,15 L15,35 L35,35 Z" fill="#16a34a"/></svg>\`;
        }
        // درخت بزرگ (Big Tree)
        return \`<svg class="svg-plant" viewBox="0 0 50 50"><path d="M21,50 L29,50 L28,20 L22,20 Z" fill="#451a03"/><circle cx="25" cy="15" r="15" fill="#22c55e"/><circle cx="12" cy="25" r="12" fill="#16a34a"/><circle cx="38" cy="25" r="12" fill="#15803d"/><circle cx="25" cy="30" r="10" fill="#166534"/></svg>\`;
    },

    renderGarden: function() {
        const grid = document.getElementById('gardenGridLarge');
        if (!grid) return;
        
        const log = getData('ilia-log', []);
        const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']; // یکشنبه تا شنبه
        const weekStart = this.getStartOfWeek(this.weekOffset);
        
        // آپدیت عنوان هفته
        const titleEl = document.getElementById('weekTitle');
        const btnNext = document.getElementById('btnNextWeek');
        const sh = getShamsi(weekStart);
        
        if (this.weekOffset === 0) titleEl.textContent = 'این هفته';
        else if (this.weekOffset === 1) titleEl.textContent = 'هفته گذشته';
        else titleEl.textContent = this.weekOffset + ' هفته پیش';
        
        btnNext.disabled = (this.weekOffset === 0);

        let html = '';
        let weekTotalHours = 0;
        let activeDays = 0;
        
        // 7 روز هفته (از شنبه تا جمعه)
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const dateStr = localDate(d);
            const dayLogs = log.filter(e => e.date === dateStr);
            const hours = dayLogs.reduce((s,e) => s + e.hours, 0);
            
            weekTotalHours += hours;
            if (hours > 0) activeDays++;

            const subjects = [...new Set(dayLogs.map(e => e.subject))].join('، ');
            const tooltipText = hours > 0 ? \`\${hours.toFixed(1)} ساعت مطالعه\\n📚 \${subjects || 'نامشخص'}\` : 'این روز مطالعه‌ای ثبت نشده';
            
            // نام روز (شنبه=6 در JS، پس ایندکس آرایه رو درست می‌کنیم)
            const dayIdx = d.getDay(); 
            const dayName = dayNames[dayIdx];
            
            const svg = this.getSvgPlant(hours);

            html += \`
                <div class="gd-cell-real" 
                     onclick="GardenPro.showTooltip(event, '\${tooltipText}')"
                     onmouseenter="GardenPro.showTooltip(event, '\${tooltipText}')"
                     onmouseleave="GardenPro.hideTooltip()">
                    \${hours > 0 ? \`<div class="gd-hours-real">\${fa(hours.toFixed(1))}س</div>\` : ''}
                    \${svg}
                    <div class="gd-day-real">\${dayName}</div>
                </div>
            \`;
        }
        grid.innerHTML = html;

        // آسمان
        const skyEl = document.getElementById('gardenSky');
        const sceneEl = document.getElementById('gardenScene');
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 6) {
            skyEl.textContent = '🌙'; sceneEl.classList.add('night');
        } else {
            skyEl.textContent = '☀️'; sceneEl.classList.remove('night');
        }

        // آمار (تنها برای هفته فعلی محاسبه می‌شود)
        if (this.weekOffset === 0) {
            let last7 = 0;
            for(let i=0; i<7; i++) {
                const d = new Date(); d.setDate(d.getDate() - i);
                last7 += log.filter(e => e.date === localDate(d)).reduce((s,e) => s + e.hours, 0);
            }
            let total = 0; log.forEach(e => total += e.hours);
            
            document.getElementById('statDaily').textContent = fa((last7/7).toFixed(1));
            document.getElementById('statWeekly').textContent = fa(weekTotalHours.toFixed(1));
            document.getElementById('statMonthly').textContent = fa(total.toFixed(1));
        } else {
            document.getElementById('statDaily').textContent = '-';
            document.getElementById('statWeekly').textContent = fa(weekTotalHours.toFixed(1));
            document.getElementById('statMonthly').textContent = '-';
        }

        // پیام
        const msg = document.getElementById('gardenMessage');
        if (weekTotalHours === 0) msg.textContent = 'این هفته هنوز چیزی نکاشتی! با ۱۰ دقیقه مطالعه شروع کن.';
        else if (weekTotalHours > 15) msg.textContent = 'وای چه جنگلی! تو این هفته واقعاً درخشیدی. 🌳✨';
        else msg.textContent = 'گیاهانت در حال رشد هستند. برای تبدیل شدن به درخت به تلاش بیشتری نیاز دارند! 🌱';
    },

    showTooltip: function(e, text) {
        const tooltip = document.getElementById('gardenTooltip');
        if (!tooltip) return;
        tooltip.innerHTML = text.replace(/\\n/g, '<br>');
        tooltip.classList.add('show');
        let x = e.pageX; let y = e.pageY - 40;
        if (x > window.innerWidth - 150) x = window.innerWidth - 150;
        if (y < 50) y = e.pageY + 20;
        tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
    },

    hideTooltip: function() {
        const tooltip = document.getElementById('gardenTooltip');
        if (tooltip) tooltip.classList.remove('show');
    }
};

window.renderGardenPage = function() { GardenPro.renderGarden(); };

if (typeof go !== 'undefined') {
    const originalGo5 = go;
    window.go = function(id) {
        originalGo5(id);
        if (id === 'garden') setTimeout(() => { GardenPro.renderGarden(); }, 50);
    };
}
`;

// حذف GardenPro قبلی و جایگزینی
const oldGStart = js.indexOf('window.GardenPro = {');
const oldGEnd = js.indexOf('if (typeof go !== \'undefined\') {', oldGStart);
if (oldGStart !== -1 && oldGEnd !== -1) {
    js = js.slice(0, oldGStart) + realGardenJS + '\n' + js.slice(oldGEnd);
} else {
    js += "\n" + realGardenJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 باغ واقعی با درختان SVG و ناوبری هفتگی ساخته شد! حالا Ctrl+F5 بزن.");
