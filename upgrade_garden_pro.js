const fs = require('fs');

console.log("🌳 در حال ساخت نسخه Pro باغ مطالعه (Leveling, Tooltips, Watering)...");

// ==========================================
// 1. بازسازی کامل HTML باغ
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const gardenHTML = `
<section id="garden">
    <div class="container" style="padding-top:20px;">
        
        <div class="garden-header-card">
            <div class="gh-left">
                <div class="gh-title">🌳 باغ مطالعه‌ی من</div>
                <div class="gh-level" id="gardenLevel">تازه‌کار</div>
            </div>
            <div class="gh-right">
                <button class="water-btn" id="waterBtn" onclick="GardenPro.water()">💧 آبیاری</button>
            </div>
        </div>

        <div class="garden-scene">
            <div class="garden-stats" id="gardenStats"></div>
            <div class="garden-grid-large" id="gardenGridLarge"></div>
            <div class="garden-ground"></div>
        </div>
        
        <div class="garden-tips">
            <div class="gt-icon">💡</div>
            <div class="gt-text" id="gardenMessage">...</div>
        </div>

        <!-- Tooltip برای نمایش جزئیات -->
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
// 2. افزودن CSS لاکچری
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const proCSS = `
/* ============ GARDEN PRO ============ */
.garden-header-card {
    background: linear-gradient(135deg, #059669, #10b981);
    color: #fff; border-radius: 18px; padding: 16px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 8px 25px rgba(16,185,129,0.3); margin-bottom: 15px;
}
.gh-title { font-size: 1.1em; font-weight: 800; margin-bottom: 5px; }
.gh-level { font-size: 0.85em; background: rgba(255,255,255,0.2); display: inline-block; padding: 3px 10px; border-radius: 10px; font-weight: 700; }
.water-btn {
    background: #fff; color: #059669; border: none; padding: 10px 18px;
    border-radius: 12px; font-family: inherit; font-weight: 800; cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.2s;
}
.water-btn:active { transform: scale(0.9); }
.water-btn:disabled { opacity: 0.6; cursor: default; background: #e2e8f0; color: #94a3b8; }

.garden-scene {
    background: linear-gradient(to bottom, #e0f2fe 0%, #f0fdf4 100%);
    border-radius: 20px; padding: 20px 15px; position: relative;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.05); border: 2px solid #bbf7d0;
    margin-bottom: 15px; overflow: hidden;
}
[data-theme="dark"] .garden-scene { background: linear-gradient(to bottom, #0f172a 0%, #064e3b 100%); border-color: #166534; }
.garden-ground {
    position: absolute; bottom: 0; left: 0; right: 0; height: 30px;
    background: #a7f3d0; border-top: 3px dashed #10b981; z-index: 1;
}
[data-theme="dark"] .garden-ground { background: #064e3b; border-color: #059669; }

.garden-stats {
    display: flex; justify-content: space-around; text-align: center;
    margin-bottom: 20px; position: relative; z-index: 2;
}
.gs-item { background: rgba(255,255,255,0.7); backdrop-filter: blur(5px); padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
[data-theme="dark"] .gs-item { background: rgba(30,41,59,0.7); border-color: rgba(255,255,255,0.1); }
.gs-val { font-size: 1.3em; font-weight: 900; color: #059669; }
[data-theme="dark"] .gs-val { color: #34d399; }
.gs-label { font-size: 0.7em; color: var(--text-light); font-weight: 700; }

.garden-grid-large {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;
    position: relative; z-index: 2;
}
.gd-cell {
    background: rgba(255,255,255,0.5); border-radius: 12px; padding: 10px 4px;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    border: 1px solid rgba(16,185,129,0.2); cursor: pointer; transition: all 0.2s;
    backdrop-filter: blur(4px);
}
[data-theme="dark"] .gd-cell { background: rgba(15,23,42,0.6); border-color: rgba(16,185,129,0.3); }
.gd-cell:hover { transform: translateY(-5px) scale(1.05); background: #fff; box-shadow: 0 8px 15px rgba(0,0,0,0.1); z-index: 10; }
[data-theme="dark"] .gd-cell:hover { background: #1e293b; }
.gd-cell.today { border: 2px solid #10b981; box-shadow: 0 0 15px rgba(16,185,129,0.3); }
.gd-icon { font-size: 1.8em; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1)); }
.gd-day { font-size: 0.65em; color: var(--text-light); font-weight: bold; }
.gd-hours { font-size: 0.6em; color: #059669; font-weight: 800; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 8px; }

.garden-tips {
    background: rgba(243,156,18,0.1); border-right: 4px solid var(--accent);
    border-radius: 12px; padding: 12px 15px; display: flex; align-items: center; gap: 10px;
    font-size: 0.9em; font-weight: 600; line-height: 1.7; color: var(--text);
}
.gt-icon { font-size: 1.5em; }

.garden-tooltip {
    position: fixed; background: #1e293b; color: #fff; padding: 10px 15px;
    border-radius: 10px; font-size: 0.8em; font-weight: bold; z-index: 9999;
    pointer-events: none; opacity: 0; transition: opacity 0.2s; box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    text-align: right; line-height: 1.6;
}
.garden-tooltip.show { opacity: 1; }
`;
fs.writeFileSync('style.css', css + "\n" + proCSS);

// ==========================================
// 3. منطق جاوااسکریپت (Levels, Tooltips, Watering)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const gardenJS = `
window.GardenPro = {
    levels: [
        { name: 'تازه‌کار', minTrees: 0, icon: '🌱' },
        { name: 'باغبان مبتدی', minTrees: 3, icon: '🌿' },
        { name: 'باغبان فعال', minTrees: 7, icon: '🌻' },
        { name: 'باغبان طلایی', minTrees: 14, icon: '🌳' },
        { name: 'استاد جنگل', minTrees: 25, icon: '🌲✨' }
    ],

    getLevel: function(totalTrees) {
        let current = this.levels[0];
        for (let lvl of this.levels) {
            if (totalTrees >= lvl.minTrees) current = lvl;
        }
        return current;
    },

    render: function() {
        const grid = document.getElementById('gardenGridLarge');
        const stats = document.getElementById('gardenStats');
        const msg = document.getElementById('gardenMessage');
        const levelEl = document.getElementById('gardenLevel');
        if (!grid || !stats) return;
        
        const log = getData('ilia-log', []);
        const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
        
        let html = '';
        let totalTrees = 0, totalFlowers = 0, totalHours = 0, activeDays = 0;
        
        // 14 روز اخیر
        for (let i = 13; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dateStr = localDate(d);
            const dayLogs = log.filter(e => e.date === dateStr);
            const hours = dayLogs.reduce((s,e) => s + e.hours, 0);
            
            // ذخیره اطلاعات برای کلیک
            const subjects = [...new Set(dayLogs.map(e => e.subject))].join('، ');
            const tooltipText = hours > 0 ? \`\${hours.toFixed(1)} ساعت مطالعه\\n📚 \${subjects || 'نامشخص'}\` : 'این روز مطالعه‌ای ثبت نشده';
            
            let icon = '🟫'; // خاک
            if (hours > 0 && hours < 1) { icon = '🌱'; activeDays++; }
            else if (hours >= 1 && hours < 2) { icon = '🌿'; activeDays++; }
            else if (hours >= 2 && hours < 3) { icon = '🌻'; totalFlowers++; activeDays++; }
            else if (hours >= 3 && hours < 5) { icon = '🌳'; totalTrees++; activeDays++; }
            else if (hours >= 5) { icon = '🌲'; totalTrees += 2; activeDays++; }
            
            totalHours += hours;
            const isToday = i === 0;
            const dayName = dayNames[d.getDay()];
            
            html += \`
                <div class="gd-cell \${isToday ? 'today' : ''}" 
                     onclick="GardenPro.showTooltip(event, '\${tooltipText}')"
                     onmouseenter="GardenPro.showTooltip(event, '\${tooltipText}')"
                     onmouseleave="GardenPro.hideTooltip()">
                    <div class="gd-icon">\${icon}</div>
                    <div class="gd-day">\${dayName}</div>
                    \${hours > 0 ? \`<div class="gd-hours">\${fa(hours.toFixed(1))}س</div>\` : ''}
                </div>
            \`;
        }
        
        grid.innerHTML = html;
        
        // آپدیت آمار
        stats.innerHTML = \`
            <div class="gs-item"><div class="gs-val">\${fa(activeDays)}</div><div class="gs-label">روز فعال</div></div>
            <div class="gs-item"><div class="gs-val">\${fa(totalHours.toFixed(1))}</div><div class="gs-label">کل ساعت</div></div>
            <div class="gs-item"><div class="gs-val">\${fa(totalTrees)}</div><div class="gs-label">درخت</div></div>
        \`;
        
        // آپدیت لول
        const lvl = this.getLevel(totalTrees);
        if (levelEl) levelEl.innerHTML = lvl.icon + ' ' + lvl.name;
        
        // آپدیت پیام
        if (activeDays === 0) msg.textContent = 'باغت خشک شده! امروز با ۱۰ دقیقه مطالعه، اولین جوانه رو بکار.';
        else if (totalTrees > 10) msg.textContent = 'چه جنگل بزرگی! تو داری فوق‌العاده پیش میری. بهت افتخار می‌کنم. 🌲✨';
        else if (totalTrees > 0) msg.textContent = 'درخت‌ها دارن قد می‌کشن. با کمی تلاش بیشتر، باغت رو به یک جنگل تبدیل کن! 🌳';
        else msg.textContent = 'جوانه‌ها دارن سبز میشن. مراقبشون باش تا تبدیل به درخت بشن! 🌱';
        
        // چک کردن وضعیت آبیاری
        this.checkWatering();
    },

    showTooltip: function(e, text) {
        const tooltip = document.getElementById('gardenTooltip');
        if (!tooltip) return;
        tooltip.innerHTML = text.replace(/\\n/g, '<br>');
        tooltip.classList.add('show');
        
        let x = e.pageX;
        let y = e.pageY - 40;
        // جلوگیری از بیرون زدن از صفحه
        if (x > window.innerWidth - 150) x = window.innerWidth - 150;
        if (y < 50) y = e.pageY + 20;
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    },

    hideTooltip: function() {
        const tooltip = document.getElementById('gardenTooltip');
        if (tooltip) tooltip.classList.remove('show');
    },

    water: function() {
        const t = today();
        const lastWater = localStorage.getItem('ilia-garden-water');
        if (lastWater === t) return;
        
        localStorage.setItem('ilia-garden-water', t);
        
        // افکت بصری
        const scene = document.querySelector('.garden-scene');
        scene.style.transition = 'filter 0.5s';
        scene.style.filter = 'brightness(1.3) sepia(0.3) hue-rotate(90deg)';
        setTimeout(() => { scene.style.filter = ''; }, 1000);
        
        toast('💧 باغت آبیاری شد! امیدوارم امروز روز پرباری باشه.');
        this.checkWatering();
    },

    checkWatering: function() {
        const btn = document.getElementById('waterBtn');
        if (!btn) return;
        const lastWater = localStorage.getItem('ilia-garden-water');
        if (lastWater === today()) {
            btn.disabled = true;
            btn.innerHTML = '✅ آبیاری شد';
        } else {
            btn.disabled = false;
            btn.innerHTML = '💧 آبیاری';
        }
    }
};

// بازنویسی renderGardenPage برای استفاده از GardenPro
window.renderGardenPage = function() {
    GardenPro.render();
};

// اتصال به سیستم ناوبری
if (typeof go !== 'undefined') {
    const originalGo2 = go;
    window.go = function(id) {
        originalGo2(id);
        if (id === 'garden') {
            setTimeout(() => { GardenPro.render(); }, 50);
        }
    };
}
`;

// حذف نسخه قبلی renderGardenPage و جایگزینی با نسخه جدید
const oldGardenIndex = js.indexOf('window.renderGardenPage = function() {');
if (oldGardenIndex !== -1) {
    const endIndex = js.indexOf('};', oldGardenIndex) + 2;
    js = js.slice(0, oldGardenIndex) + gardenJS + js.slice(endIndex);
} else {
    js += "\n" + gardenJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 نسخه Pro باغ مطالعه ساخته شد! حالا Ctrl+F5 بزن.");
