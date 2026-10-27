const fs = require('fs');

console.log("🎨 در حال ساخت باغ سه‌بعدی و صفحه اختصاصی لیگ‌ها...");

// ==========================================
// 1. اصلاح HTML (دکمه لیگ، صفحه لیگ و تغییرات باغ)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن دکمه لیگ به صفحه اصلی
const leagueBtn = `
    <div class="nimkat-card" onclick="go('league')"><div class="nimkat-icon">🏆</div><div class="nimkat-title">لیگ مطالعه</div></div>
`;
if (!html.includes('onclick="go(\'league\')"')) {
    html = html.replace('<div class="nimkat-card" onclick="go(\'garden\')">', leagueBtn + '<div class="nimkat-card" onclick="go(\'garden\')">');
}

// ب) ساخت سکشن اختصاصی لیگ
const leagueSection = `
<section id="league">
    <div class="container" style="padding-top:20px;">
        <h2>🏆 لیگ‌های مطالعه</h2>
        <p style="color:var(--text-light); font-size:0.85em; margin-bottom:15px; line-height:1.8;">
            با افزایش میانگین مطالعه روزانه (در ۷ روز اخیر)، در لیگ‌های بالاتر قرار می‌گیری. هر لیگ نشان‌دهنده تعهد و تلاش توست!
        </p>
        
        <div class="league-current-card" id="leagueCurrentCard">
            <!-- لیگ فعلی اینجا لود می‌شود -->
        </div>

        <h3 style="margin-top:20px; font-size:1em; color:var(--text-light);">مسیر پیشرفت لیگ‌ها</h3>
        <div class="league-list" id="leagueList">
            <!-- لیست لیگ‌ها اینجا لود می‌شود -->
        </div>
    </div>
</section>
`;

if (!html.includes('<section id="league">')) {
    html = html.replace('<section id="garden">', leagueSection + '\n<section id="garden">');
}

// ج) تغییر ساختار گرید باغ برای حالت سه‌بعدی
const oldGardenScene = `<div class="garden-scene" id="gardenScene">
            <div class="sky" id="gardenSky"></div>
            <div class="garden-grid-large" id="gardenGridLarge"></div>
            <div class="garden-ground"></div>
        </div>`;

const newGardenScene = `<div class="garden-scene-3d" id="gardenScene">
            <div class="sky" id="gardenSky"></div>
            <div class="garden-3d-wrapper">
                <div class="garden-grid-large" id="gardenGridLarge"></div>
                <div class="garden-ground-3d"></div>
            </div>
        </div>`;

html = html.replace(oldGardenScene, newGardenScene);
fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS (گرافیک سه‌بعدی و طراحی لیگ)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const g3dCSS = `
/* ============ 3D GARDEN ============ */
.garden-scene-3d {
    background: linear-gradient(to bottom, #e0f2fe 0%, #f0fdf4 100%);
    border-radius: 20px; padding: 20px 10px 0 10px; position: relative;
    border: 2px solid #bbf7d0; margin-bottom: 15px; overflow: hidden;
    perspective: 1000px;
}
.garden-scene-3d.night { background: linear-gradient(to bottom, #1e1b4b 0%, #064e3b 100%); border-color: #166534; }
.garden-3d-wrapper { position: relative; padding-bottom: 40px; z-index: 2; }
.garden-ground-3d {
    position: absolute; bottom: 0; left: -10px; right: -10px; height: 40px;
    background: #10b981;
    transform: rotateX(60deg) scale(1.1);
    transform-origin: bottom;
    border-radius: 50% 50% 0 0;
    box-shadow: inset 0 10px 20px rgba(0,0,0,0.2);
    z-index: 1;
}
.garden-scene-3d.night .garden-ground-3d { background: #064e3b; }

.garden-grid-large {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; position: relative; z-index: 2;
}
.gd-cell {
    background: transparent !important; border: none !important; box-shadow: none !important;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
    height: 80px; position: relative; cursor: pointer;
}
.gd-icon {
    font-size: 2.2em;
    transition: transform 0.3s;
    animation: float3d 3s infinite ease-in-out;
    filter: drop-shadow(0 15px 5px rgba(0,0,0,0.4));
    margin-bottom: 10px;
}
.gd-cell:hover .gd-icon { transform: scale(1.3) translateY(-10px); animation-play-state: paused; }
@keyframes float3d {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
.gd-day {
    position: absolute; bottom: -15px; font-size: 0.65em; color: var(--text-light);
    font-weight: bold; background: rgba(255,255,255,0.7); padding: 2px 6px; border-radius: 8px;
}
.garden-scene-3d.night .gd-day { background: rgba(0,0,0,0.5); color: #fff; }
.gd-hours {
    position: absolute; top: -5px; font-size: 0.6em; color: #fff; font-weight: 800;
    background: #059669; padding: 2px 6px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* ============ LEAGUE PAGE ============ */
.league-current-card {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    color: #fff; border-radius: 20px; padding: 25px 20px; text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative; overflow: hidden;
}
.lc-icon { font-size: 4em; margin-bottom: 10px; filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); animation: pulse 2s infinite; }
.lc-name { font-size: 1.4em; font-weight: 900; margin-bottom: 5px; }
.lc-avg { font-size: 0.9em; opacity: 0.8; background: rgba(255,255,255,0.1); display: inline-block; padding: 5px 15px; border-radius: 15px; }

.league-list { display: flex; flex-direction: column; gap: 10px; }
.league-item {
    background: var(--bg-card); border-radius: 14px; padding: 15px;
    display: flex; align-items: center; gap: 15px; border: 1px solid var(--border);
    transition: all 0.2s; opacity: 0.6;
}
.league-item.active {
    opacity: 1; border-color: var(--accent); background: rgba(245,158,11,0.05);
    box-shadow: 0 4px 15px rgba(245,158,11,0.15); transform: scale(1.02);
}
.li-icon { font-size: 2em; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: var(--bg); border-radius: 12px; }
.league-item.active .li-icon { background: rgba(245,158,11,0.2); }
.li-info { flex: 1; }
.li-name { font-weight: 800; font-size: 1em; margin-bottom: 3px; }
.li-req { font-size: 0.75em; color: var(--text-light); }
.li-check { font-size: 1.2em; color: var(--success); display: none; }
.league-item.unlocked .li-check { display: block; }
`;
fs.writeFileSync('style.css', css + "\n" + g3dCSS);

// ==========================================
// 3. منطق جاوااسکریپت (رندر لیگ و باغ سه‌بعدی)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const newLogic = `
window.GardenPro = {
    leagues: [
        { name: 'لیگ برنز', icon: '🥉', minAvg: 0, color: '#cd7f32' },
        { name: 'لیگ نقره', icon: '🥈', minAvg: 1, color: '#c0c0c0' },
        { name: 'لیگ طلا', icon: '🥇', minAvg: 2, color: '#ffd700' },
        { name: 'لیگ الماس', icon: '💎', minAvg: 3, color: '#b9f2ff' },
        { name: 'لیگ استاد', icon: '👑', minAvg: 4, color: '#f59e0b' },
        { name: 'لیگ افسانه', icon: '🌌', minAvg: 5, color: '#8b5cf6' }
    ],

    getLeagueInfo: function() {
        const log = getData('ilia-log', []);
        let last7DaysHours = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dateStr = localDate(d);
            last7DaysHours += log.filter(e => e.date === dateStr).reduce((s,e) => s + e.hours, 0);
        }
        const dailyAvg = last7DaysHours / 7;
        
        let currentIdx = 0;
        for (let i = 0; i < this.leagues.length; i++) {
            if (dailyAvg >= this.leagues[i].minAvg) currentIdx = i;
        }
        return { dailyAvg, currentIdx, last7DaysHours };
    },

    renderGarden: function() {
        const grid = document.getElementById('gardenGridLarge');
        if (!grid) return;
        
        const log = getData('ilia-log', []);
        const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
        let html = '';
        
        for (let i = 13; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dateStr = localDate(d);
            const dayLogs = log.filter(e => e.date === dateStr);
            const hours = dayLogs.reduce((s,e) => s + e.hours, 0);
            
            const subjects = [...new Set(dayLogs.map(e => e.subject))].join('، ');
            const tooltipText = hours > 0 ? \`\${hours.toFixed(1)} ساعت مطالعه\\n📚 \${subjects || 'نامشخص'}\` : 'این روز مطالعه‌ای ثبت نشده';
            
            let icon = '🟫';
            if (hours > 0 && hours < 1) icon = '🌱';
            else if (hours >= 1 && hours < 2) icon = '🌿';
            else if (hours >= 2 && hours < 3) icon = '🌻';
            else if (hours >= 3) icon = '🌳';
            
            const isToday = i === 0;
            const dayName = dayNames[d.getDay()];
            
            html += \`
                <div class="gd-cell" 
                     onclick="GardenPro.showTooltip(event, '\${tooltipText}')"
                     onmouseenter="GardenPro.showTooltip(event, '\${tooltipText}')"
                     onmouseleave="GardenPro.hideTooltip()">
                    \${hours > 0 ? \`<div class="gd-hours">\${fa(hours.toFixed(1))}</div>\` : ''}
                    <div class="gd-icon">\${icon}</div>
                    <div class="gd-day">\${dayName}</div>
                </div>
            \`;
        }
        grid.innerHTML = html;

        // آسمان پویا
        const skyEl = document.getElementById('gardenSky');
        const sceneEl = document.getElementById('gardenScene');
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 6) {
            skyEl.textContent = '🌙'; sceneEl.classList.add('night');
        } else {
            skyEl.textContent = '☀️'; sceneEl.classList.remove('night');
        }

        // آمار بالای باغ
        const { dailyAvg, last7DaysHours } = this.getLeagueInfo();
        const logAll = getData('ilia-log', []);
        let totalHours = 0;
        logAll.forEach(e => totalHours += e.hours);
        
        document.getElementById('statDaily').textContent = fa(dailyAvg.toFixed(1));
        document.getElementById('statWeekly').textContent = fa(last7DaysHours.toFixed(1));
        document.getElementById('statMonthly').textContent = fa(totalHours.toFixed(1));
        
        const curLvl = this.leagues[this.getLeagueInfo().currentIdx];
        document.getElementById('leagueBadge').textContent = curLvl.icon;
        document.getElementById('leagueName').textContent = curLvl.name;
        document.getElementById('leagueAvg').textContent = fa(dailyAvg.toFixed(1));
        document.getElementById('leagueName').style.color = curLvl.color;
        
        this.checkWatering();
    },

    renderLeaguePage: function() {
        const { dailyAvg, currentIdx } = this.getLeagueInfo();
        const current = this.leagues[currentIdx];
        const next = this.leagues[currentIdx + 1];

        // کارت لیگ فعلی
        const card = document.getElementById('leagueCurrentCard');
        card.innerHTML = \`
            <div class="lc-icon">\${current.icon}</div>
            <div class="lc-name" style="color:\${current.color}">\${current.name}</div>
            <div class="lc-avg">میانگین ۷ روز اخیر: \${fa(dailyAvg.toFixed(1))} ساعت</div>
            \${next ? \`<div style="font-size:0.75em; margin-top:10px; opacity:0.8;">برای رسیدن به \${next.name}، روزانه \${fa((next.minAvg - dailyAvg).toFixed(1))} ساعت بیشتر بخوان</div>\` : '<div style="font-size:0.75em; margin-top:10px; color:#fbbf24;">تو در بالاترین سطح ممکن هستی! 🎉</div>'}
        \`;

        // لیست تمام لیگ‌ها
        const list = document.getElementById('leagueList');
        list.innerHTML = this.leagues.map((l, i) => {
            const isUnlocked = i <= currentIdx;
            const isActive = i === currentIdx;
            return \`
                <div class="league-item \${isActive ? 'active' : ''} \${isUnlocked ? 'unlocked' : ''}">
                    <div class="li-icon">\${l.icon}</div>
                    <div class="li-info">
                        <div class="li-name" style="\${isActive ? 'color:' + l.color : ''}">\${l.name}</div>
                        <div class="li-req">حداقل میانگین: \${fa(l.minAvg)} ساعت در روز</div>
                    </div>
                    <div class="li-check">✓</div>
                </div>
            \`;
        }).join('');
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
    },

    water: function() {
        const t = today();
        if (localStorage.getItem('ilia-garden-water') === t) return;
        localStorage.setItem('ilia-garden-water', t);
        const scene = document.getElementById('gardenScene');
        scene.style.filter = 'brightness(1.3) sepia(0.3) hue-rotate(90deg)';
        setTimeout(() => { scene.style.filter = ''; }, 1000);
        toast('💧 باغت آبیاری شد!');
        this.checkWatering();
    },

    checkWatering: function() {
        const btn = document.getElementById('waterBtn');
        if (!btn) return;
        if (localStorage.getItem('ilia-garden-water') === today()) {
            btn.disabled = true; btn.innerHTML = '✅ آبیاری شد';
        } else {
            btn.disabled = false; btn.innerHTML = '💧 آبیاری';
        }
    }
};

window.renderGardenPage = function() { GardenPro.renderGarden(); };
window.renderLeaguePage = function() { GardenPro.renderLeaguePage(); };

if (typeof go !== 'undefined') {
    const originalGo4 = go;
    window.go = function(id) {
        originalGo4(id);
        if (id === 'garden') setTimeout(() => { GardenPro.renderGarden(); }, 50);
        if (id === 'league') setTimeout(() => { GardenPro.renderLeaguePage(); }, 50);
    };
}
`;

// حذف کد قبلی GardenPro
const oldG = js.indexOf('window.GardenPro = {');
const oldGEnd = js.indexOf('// بازنویسی renderGardenPage');
if (oldG !== -1 && oldGEnd !== -1) {
    js = js.slice(0, oldG) + newLogic + '\n' + js.slice(oldGEnd);
} else {
    // اگر پیدا نشد، به انتها اضافه کن
    js += "\n" + newLogic;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 باغ سه‌بعدی و صفحه لیگ‌ها ساخته شد! حالا Ctrl+F5 بزن.");
