const fs = require('fs');

console.log("🚀 در حال اعمال آپدیت نهایی (لیگ دقیق و درختان میوه‌دار)...");

// ==========================================
// 1. بازسازی HTML صفحه لیگ
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

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

// جایگزینی یا اضافه کردن سکشن لیگ
if (html.includes('<section id="league">')) {
    const start = html.indexOf('<section id="league">');
    const end = html.indexOf('</section>', start) + 10;
    html = html.slice(0, start) + leagueSection + html.slice(end);
} else {
    html = html.replace('<section id="garden">', leagueSection + '\n<section id="garden">');
}

// اطمینان از وجود دکمه لیگ در صفحه اصلی
if (!html.includes('onclick="go(\'league\')"')) {
    const leagueBtn = `<div class="nimkat-card" onclick="go('league')"><div class="nimkat-icon">🏆</div><div class="nimkat-title">لیگ مطالعه</div></div>`;
    html = html.replace('<div class="nimkat-card" onclick="go(\'garden\')">', leagueBtn + '<div class="nimkat-card" onclick="go(\'garden\')">');
}

fs.writeFileSync('index.html', html);

// ==========================================
// 2. بازنویسی منطق باغ و لیگ در JS
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const masterLogic = `
window.GardenPro = {
    weekOffset: 0,
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

    changeWeek: function(dir) {
        this.weekOffset += dir;
        if (this.weekOffset < 0) this.weekOffset = 0;
        this.renderGarden();
    },

    getStartOfWeek: function(offset) {
        const now = new Date();
        const day = now.getDay(); 
        const diff = (day + 1) % 7; 
        const start = new Date(now);
        start.setDate(start.getDate() - diff - (offset * 7));
        start.setHours(0,0,0,0);
        return start;
    },

    getSvgPlant: function(hours) {
        if (hours <= 0) return '<div class="svg-empty"></div>';
        
        if (hours > 0 && hours < 1) {
            // جوانه
            return \`<svg class="svg-plant" viewBox="0 0 50 50"><path d="M25,50 Q25,30 25,20" stroke="#4ade80" stroke-width="3" fill="none"/><path d="M25,30 Q15,25 10,35 Q20,35 25,30" fill="#22c55e"/><path d="M25,25 Q35,20 40,30 Q30,30 25,25" fill="#16a34a"/></svg>\`;
        }
        if (hours >= 1 && hours < 2) {
            // نهال
            return \`<svg class="svg-plant" viewBox="0 0 50 50"><rect x="23" y="25" width="4" height="25" fill="#78350f"/><circle cx="25" cy="20" r="12" fill="#22c55e"/><circle cx="15" cy="25" r="8" fill="#16a34a"/><circle cx="35" cy="25" r="8" fill="#15803d"/></svg>\`;
        }
        if (hours >= 2 && hours < 3) {
            // درخت متوسط (بدون میوه)
            return \`<svg class="svg-plant" viewBox="0 0 50 50"><path d="M22,50 L28,50 L27,25 L23,25 Z" fill="#451a03"/><path d="M25,10 L10,30 L15,30 L5,45 L45,45 L35,30 L40,30 Z" fill="#22c55e"/><path d="M25,15 L15,35 L35,35 Z" fill="#16a34a"/></svg>\`;
        }
        if (hours >= 3 && hours < 4.5) {
            // درخت بزرگ با چند سیب
            return \`<svg class="svg-plant" viewBox="0 0 50 50">
                <path d="M21,50 L29,50 L28,20 L22,20 Z" fill="#451a03"/>
                <circle cx="25" cy="15" r="15" fill="#22c55e"/>
                <circle cx="12" cy="25" r="12" fill="#16a34a"/>
                <circle cx="38" cy="25" r="12" fill="#15803d"/>
                <circle cx="25" cy="30" r="10" fill="#166534"/>
                <circle cx="18" cy="18" r="2.5" fill="#ef4444"/>
                <circle cx="32" cy="22" r="2.5" fill="#ef4444"/>
                <circle cx="25" cy="28" r="2.5" fill="#ef4444"/>
            </svg>\`;
        }
        // درخت غول‌پیکر پر از میوه
        return \`<svg class="svg-plant" viewBox="0 0 50 50">
            <path d="M20,50 L30,50 L28,15 L22,15 Z" fill="#451a03"/>
            <circle cx="25" cy="12" r="18" fill="#22c55e"/>
            <circle cx="10" cy="25" r="14" fill="#16a34a"/>
            <circle cx="40" cy="25" r="14" fill="#15803d"/>
            <circle cx="25" cy="30" r="12" fill="#166534"/>
            <circle cx="15" cy="15" r="3" fill="#ef4444"/>
            <circle cx="35" cy="18" r="3" fill="#ef4444"/>
            <circle cx="20" cy="28" r="3" fill="#ef4444"/>
            <circle cx="30" cy="32" r="3" fill="#ef4444"/>
            <circle cx="25" cy="10" r="3" fill="#ef4444"/>
            <circle cx="10" cy="25" r="3" fill="#ef4444"/>
            <circle cx="40" cy="25" r="3" fill="#ef4444"/>
        </svg>\`;
    },

    renderGarden: function() {
        const grid = document.getElementById('gardenGridLarge');
        if (!grid) return;
        
        const log = getData('ilia-log', []);
        const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
        const weekStart = this.getStartOfWeek(this.weekOffset);
        
        const titleEl = document.getElementById('weekTitle');
        const btnNext = document.getElementById('btnNextWeek');
        
        if (titleEl) {
            if (this.weekOffset === 0) titleEl.textContent = 'این هفته';
            else if (this.weekOffset === 1) titleEl.textContent = 'هفته گذشته';
            else titleEl.textContent = this.weekOffset + ' هفته پیش';
        }
        if (btnNext) btnNext.disabled = (this.weekOffset === 0);

        let html = '';
        let weekTotalHours = 0;
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const dateStr = localDate(d);
            const dayLogs = log.filter(e => e.date === dateStr);
            const hours = dayLogs.reduce((s,e) => s + e.hours, 0);
            
            weekTotalHours += hours;
            const subjects = [...new Set(dayLogs.map(e => e.subject))].join('، ');
            const tooltipText = hours > 0 ? \`\${hours.toFixed(1)} ساعت مطالعه\\n📚 \${subjects || 'نامشخص'}\` : 'این روز مطالعه‌ای ثبت نشده';
            
            const dayName = dayNames[d.getDay()];
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

        const skyEl = document.getElementById('gardenSky');
        const sceneEl = document.getElementById('gardenScene');
        if (skyEl && sceneEl) {
            const hour = new Date().getHours();
            if (hour >= 19 || hour < 6) {
                skyEl.textContent = '🌙'; sceneEl.classList.add('night');
            } else {
                skyEl.textContent = '☀️'; sceneEl.classList.remove('night');
            }
        }

        if (this.weekOffset === 0) {
            let last7 = 0;
            for(let i=0; i<7; i++) {
                const d = new Date(); d.setDate(d.getDate() - i);
                last7 += log.filter(e => e.date === localDate(d)).reduce((s,e) => s + e.hours, 0);
            }
            let total = 0; log.forEach(e => total += e.hours);
            
            const sD = document.getElementById('statDaily'); if(sD) sD.textContent = fa((last7/7).toFixed(1));
            const sW = document.getElementById('statWeekly'); if(sW) sW.textContent = fa(weekTotalHours.toFixed(1));
            const sM = document.getElementById('statMonthly'); if(sM) sM.textContent = fa(total.toFixed(1));
        } else {
            const sD = document.getElementById('statDaily'); if(sD) sD.textContent = '-';
            const sW = document.getElementById('statWeekly'); if(sW) sW.textContent = fa(weekTotalHours.toFixed(1));
            const sM = document.getElementById('statMonthly'); if(sM) sM.textContent = '-';
        }

        const msg = document.getElementById('gardenMessage');
        if (msg) {
            if (weekTotalHours === 0) msg.textContent = 'این هفته هنوز چیزی نکاشتی! با ۱۰ دقیقه مطالعه شروع کن.';
            else if (weekTotalHours > 15) msg.textContent = 'وای چه جنگل پرمیوه‌ای! تو این هفته واقعاً درخشیدی. 🍎🌳✨';
            else msg.textContent = 'گیاهانت در حال رشد هستند. با تلاش بیشتر، درخت‌هایت میوه‌دار می‌شوند! 🍎';
        }
    },

    renderLeaguePage: function() {
        const { dailyAvg, currentIdx } = this.getLeagueInfo();
        const current = this.leagues[currentIdx];
        const next = this.leagues[currentIdx + 1];

        const card = document.getElementById('leagueCurrentCard');
        if (card) {
            card.innerHTML = \`
                <div class="lc-icon">\${current.icon}</div>
                <div class="lc-name" style="color:\${current.color}">\${current.name}</div>
                <div class="lc-avg">میانگین ۷ روز اخیر: \${fa(dailyAvg.toFixed(1))} ساعت</div>
                \${next ? \`<div style="font-size:0.75em; margin-top:10px; opacity:0.8;">برای رسیدن به \${next.name}، روزانه \${fa((next.minAvg - dailyAvg).toFixed(1))} ساعت بیشتر بخوان</div>\` : '<div style="font-size:0.75em; margin-top:10px; color:#fbbf24;">تو در بالاترین سطح ممکن هستی! 🎉</div>'}
            \`;
        }

        const list = document.getElementById('leagueList');
        if (list) {
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
        }
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
window.renderLeaguePage = function() { GardenPro.renderLeaguePage(); };

if (typeof go !== 'undefined') {
    const originalGoFinal = go;
    window.go = function(id) {
        originalGoFinal(id);
        if (id === 'garden') setTimeout(() => { GardenPro.renderGarden(); }, 50);
        if (id === 'league') setTimeout(() => { GardenPro.renderLeaguePage(); }, 50);
    };
}

// اجرای خودکار در صورت باز بودن صفحه
setTimeout(() => {
    const gardenSec = document.getElementById('garden');
    const leagueSec = document.getElementById('league');
    if (gardenSec && gardenSec.classList.contains('active')) GardenPro.renderGarden();
    if (leagueSec && leagueSec.classList.contains('active')) GardenPro.renderLeaguePage();
}, 1000);
`;

// پیدا کردن و جایگزینی GardenPro قبلی
const oldStart = js.indexOf('window.GardenPro = {');
if (oldStart !== -1) {
    // پیدا کردن انتهای آبجکت GardenPro (تا قبل از تابع بعدی)
    const nextFunc = js.indexOf('window.renderGardenPage', oldStart);
    if (nextFunc !== -1) {
        js = js.slice(0, oldStart) + masterLogic + '\n' + js.slice(nextFunc);
    } else {
        js += "\n" + masterLogic; // فالبک
    }
} else {
    js += "\n" + masterLogic;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 3. زور زدن به مرورگر برای پاک کردن کش (آپدیت خودکار)
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام تغییرات با موفقیت و به صورت خودکار اعمال شد! حالا کافیه مرورگر رو رفرش کنی (Ctrl+F5).");
