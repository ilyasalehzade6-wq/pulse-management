const fs = require('fs');

console.log("🏆 در حال ساخت سیستم لیگ و ارتقای ۵ برابری باغ...");

// ==========================================
// 1. آپدیت HTML (لیگ و آمار)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const newGardenHTML = `
<section id="garden">
    <div class="container" style="padding-top:20px;">
        
        <!-- هدر لیگ -->
        <div class="league-header" id="leagueHeader">
            <div class="lh-badge" id="leagueBadge">🥉</div>
            <div class="lh-info">
                <div class="lh-title" id="leagueName">لیگ برنز</div>
                <div class="lh-sub">میانگین روزانه: <b id="leagueAvg">۰</b> ساعت</div>
            </div>
            <div class="lh-water">
                <button class="water-btn" id="waterBtn" onclick="GardenPro.water()">💧 آبیاری</button>
            </div>
        </div>

        <!-- نوار پیشرفت لیگ -->
        <div class="league-progress-wrap">
            <div class="lp-text"><span id="lpCurrent">لیگ برنز</span> <span id="lpNext">تا لیگ نقره: ۱ ساعت</span></div>
            <div class="lp-bar-bg"><div class="lp-bar-fill" id="lpBar"></div></div>
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

        <!-- باغ -->
        <div class="garden-scene" id="gardenScene">
            <div class="sky" id="gardenSky"></div>
            <div class="garden-grid-large" id="gardenGridLarge"></div>
            <div class="garden-ground"></div>
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
    html = html.slice(0, start) + newGardenHTML + html.slice(end);
}
fs.writeFileSync('index.html', html);

// ==========================================
// 2. افزودن CSS (طراحی لیگ و آسمان پویا)
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const leagueCSS = `
/* ============ LEAGUE & GARDEN PRO MAX ============ */
.league-header {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    color: #fff; border-radius: 20px; padding: 16px;
    display: flex; align-items: center; gap: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3); margin-bottom: 15px;
    position: relative; overflow: hidden;
}
.league-header::before {
    content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1), transparent 60%);
    animation: rot 20s linear infinite;
}
.lh-badge {
    font-size: 2.5em; background: rgba(255,255,255,0.1);
    width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); z-index: 1;
}
.lh-info { flex: 1; z-index: 1; }
.lh-title { font-size: 1.1em; font-weight: 900; margin-bottom: 4px; }
.lh-sub { font-size: 0.8em; opacity: 0.8; }
.lh-sub b { color: var(--accent); font-size: 1.2em; }
.lh-water { z-index: 1; }
.water-btn {
    background: #fff; color: #059669; border: none; padding: 10px 14px;
    border-radius: 12px; font-family: inherit; font-weight: 800; cursor: pointer;
    font-size: 0.8em; transition: all 0.2s;
}
.water-btn:disabled { opacity: 0.5; background: #cbd5e1; color: #64748b; }

.league-progress-wrap {
    background: var(--bg-card); border-radius: 14px; padding: 12px;
    margin-bottom: 15px; border: 1px solid var(--border);
}
.lp-text { display: flex; justify-content: space-between; font-size: 0.75em; font-weight: 700; margin-bottom: 8px; color: var(--text-light); }
.lp-bar-bg { height: 8px; background: var(--border); border-radius: 10px; overflow: hidden; }
.lp-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 10px; transition: width 0.5s ease; }

.garden-stats-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;
}
.gs-box {
    background: var(--bg-card); border-radius: 14px; padding: 12px 8px;
    text-align: center; border: 1px solid var(--border); box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}
.gs-icon { font-size: 1.2em; margin-bottom: 5px; }
.gs-val { font-size: 1.3em; font-weight: 900; color: var(--primary); }
.gs-label { font-size: 0.65em; color: var(--text-light); font-weight: 700; margin-top: 2px; }

.garden-scene {
    background: linear-gradient(to bottom, #e0f2fe 0%, #f0fdf4 100%);
    border-radius: 20px; padding: 20px 15px; position: relative;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.05); border: 2px solid #bbf7d0;
    margin-bottom: 15px; overflow: hidden; transition: background 1s;
}
.garden-scene.night { background: linear-gradient(to bottom, #1e1b4b 0%, #064e3b 100%); border-color: #166534; }
.sky { position: absolute; top: 15px; right: 20px; font-size: 2em; z-index: 1; transition: all 0.5s; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)); }
.garden-ground {
    position: absolute; bottom: 0; left: 0; right: 0; height: 30px;
    background: #a7f3d0; border-top: 3px dashed #10b981; z-index: 1;
}
.garden-scene.night .garden-ground { background: #064e3b; border-color: #059669; }

.garden-grid-large {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; position: relative; z-index: 2;
}
.gd-cell {
    background: rgba(255,255,255,0.6); border-radius: 12px; padding: 10px 4px;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    border: 1px solid rgba(16,185,129,0.2); cursor: pointer; transition: all 0.2s;
    backdrop-filter: blur(4px);
}
.garden-scene.night .gd-cell { background: rgba(15,23,42,0.6); border-color: rgba(16,185,129,0.3); }
.gd-cell:hover { transform: translateY(-5px) scale(1.05); background: #fff; box-shadow: 0 8px 15px rgba(0,0,0,0.1); z-index: 10; }
.gd-cell.today { border: 2px solid #10b981; box-shadow: 0 0 15px rgba(16,185,129,0.4); }
.gd-icon { font-size: 1.8em; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1)); }
.gd-day { font-size: 0.65em; color: var(--text-light); font-weight: bold; }
.gd-hours { font-size: 0.6em; color: #059669; font-weight: 800; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 8px; }

.garden-tips {
    background: rgba(243,156,18,0.1); border-right: 4px solid var(--accent);
    border-radius: 12px; padding: 12px 15px; display: flex; align-items: center; gap: 10px;
    font-size: 0.9em; font-weight: 600; line-height: 1.7; color: var(--text);
}
`;
fs.writeFileSync('style.css', css + "\n" + leagueCSS);

// ==========================================
// 3. منطق جاوااسکریپت (محاسبه لیگ و آمار)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const leagueJS = `
window.GardenPro = {
    leagues: [
        { name: 'لیگ برنز', icon: '🥉', minAvg: 0, color: '#cd7f32' },
        { name: 'لیگ نقره', icon: '🥈', minAvg: 1, color: '#c0c0c0' },
        { name: 'لیگ طلا', icon: '🥇', minAvg: 2, color: '#ffd700' },
        { name: 'لیگ الماس', icon: '💎', minAvg: 3, color: '#b9f2ff' },
        { name: 'لیگ استاد', icon: '👑', minAvg: 4, color: '#f59e0b' },
        { name: 'لیگ افسانه', icon: '🌌', minAvg: 5, color: '#8b5cf6' }
    ],

    getLeague: function(avg) {
        let current = this.leagues[0];
        let next = this.leagues[1];
        for (let i = 0; i < this.leagues.length; i++) {
            if (avg >= this.leagues[i].minAvg) {
                current = this.leagues[i];
                next = this.leagues[i+1] || null;
            }
        }
        return { current, next };
    },

    render: function() {
        const grid = document.getElementById('gardenGridLarge');
        if (!grid) return;
        
        const log = getData('ilia-log', []);
        const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
        
        // 1. محاسبه آمار
        let last7DaysHours = 0;
        let last30DaysHours = 0;
        const t = new Date();
        
        for (let i = 0; i < 30; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dateStr = localDate(d);
            const hours = log.filter(e => e.date === dateStr).reduce((s,e) => s + e.hours, 0);
            last30DaysHours += hours;
            if (i < 7) last7DaysHours += hours;
        }
        
        const dailyAvg = last7DaysHours / 7;
        const weeklyTotal = last7DaysHours;
        const monthlyTotal = last30DaysHours;

        // 2. آپدیت لیگ
        const { current, next } = this.getLeague(dailyAvg);
        
        document.getElementById('leagueBadge').textContent = current.icon;
        document.getElementById('leagueName').textContent = current.name;
        document.getElementById('leagueAvg').textContent = fa(dailyAvg.toFixed(1));
        document.getElementById('leagueName').style.color = current.color;
        document.getElementById('leagueBadge').style.textShadow = '0 0 15px ' + current.color;
        
        // نوار پیشرفت
        const lpBar = document.getElementById('lpBar');
        const lpNext = document.getElementById('lpNext');
        if (next) {
            const range = next.minAvg - current.minAvg;
            const progress = ((dailyAvg - current.minAvg) / range) * 100;
            lpBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
            lpNext.textContent = 'تا ' + next.name + ': ' + fa((next.minAvg - dailyAvg).toFixed(1)) + ' ساعت';
            lpBar.style.background = 'linear-gradient(90deg, ' + current.color + ', ' + next.color + ')';
        } else {
            lpBar.style.width = '100%';
            lpNext.textContent = 'تو در بالاترین لیگ هستی! 🎉';
            lpBar.style.background = current.color;
        }

        // 3. آپدیت آمار
        document.getElementById('statDaily').textContent = fa(dailyAvg.toFixed(1));
        document.getElementById('statWeekly').textContent = fa(weeklyTotal.toFixed(1));
        document.getElementById('statMonthly').textContent = fa(monthlyTotal.toFixed(1));

        // 4. ساخت گرید باغ
        let html = '';
        let totalTrees = 0, totalFlowers = 0;
        
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
            else if (hours >= 2 && hours < 3) { icon = '🌻'; totalFlowers++; }
            else if (hours >= 3) { icon = '🌳'; totalTrees++; }
            
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

        // 5. آسمان پویا
        const skyEl = document.getElementById('gardenSky');
        const sceneEl = document.getElementById('gardenScene');
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 6) {
            skyEl.textContent = '🌙';
            sceneEl.classList.add('night');
        } else {
            skyEl.textContent = '☀️';
            sceneEl.classList.remove('night');
        }
        
        // پیام
        const msg = document.getElementById('gardenMessage');
        if (dailyAvg >= 4) msg.textContent = 'تو داری مثل یک افسانه پیش میری! مغزت داره قدرتمندتر میشه. 🧠🔥';
        else if (dailyAvg >= 2) msg.textContent = 'عالیه! تو در مسیر درستی قرار داری. برای رسیدن به لیگ بالاتر فقط کمی بیشتر تلاش کن.';
        else msg.textContent = 'جوانه‌ها دارن سبز میشن. با کمی تلاش بیشتر، باغت رو به یک جنگل تبدیل کن! 🌱';

        this.checkWatering();
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
        const lastWater = localStorage.getItem('ilia-garden-water');
        if (lastWater === t) return;
        
        localStorage.setItem('ilia-garden-water', t);
        const scene = document.getElementById('gardenScene');
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

window.renderGardenPage = function() { GardenPro.render(); };

if (typeof go !== 'undefined') {
    const originalGo3 = go;
    window.go = function(id) {
        originalGo3(id);
        if (id === 'garden') setTimeout(() => { GardenPro.render(); }, 50);
    };
}
`;

// جایگزینی کد قبلی GardenPro
const oldGardenStart = js.indexOf('window.GardenPro = {');
if (oldGardenStart !== -1) {
    const oldGardenEnd = js.indexOf('// بازنویسی renderGardenPage');
    js = js.slice(0, oldGardenStart) + leagueJS + '\n' + js.slice(oldGardenEnd);
} else {
    js += "\n" + leagueJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 سیستم لیگ و آمار ۵ برابری ساخته شد! حالا Ctrl+F5 بزن.");
