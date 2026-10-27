const fs = require('fs');

console.log("🌱 در حال ساخت باغ مطالعه، صداهای محیطی و قانون یک کار...");

// ==========================================
// 1. اصلاح HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) اضافه کردن باغ مطالعه به داشبورد
const gardenHTML = `
    <div class="study-garden" id="studyGarden">
        <div class="sg-title">🌱 باغ مطالعه‌ی من</div>
        <div class="sg-grid" id="gardenGrid"></div>
    </div>
    <div class="category-title" style="display:flex !important;">📚 برنامه و مطالعه</div>
`;

if (!html.includes('studyGarden')) {
    // اضافه کردن باغ زیر ویجت اصلی
    html = html.replace('<div class="category-title" style="display:flex !important;">📚 برنامه و مطالعه</div>', gardenHTML);
}

// ب) اضافه کردن کادر "فقط یک کار" و صداها به حالت تمرکز و پومودورو
const focusExtras = `
    <div class="one-thing-box" id="oneThingBox" style="display:none;">
        <input type="text" id="oneThingInput" placeholder="توی این زمان دقیقاً چه کاری رو تموم می‌کنی؟" class="one-thing-input">
    </div>
    <div class="sound-controls" id="soundControls">
        <button class="sound-btn" onclick="SoundEngine.toggle('rain', this)" title="صدای باران">🌧️</button>
        <button class="sound-btn" onclick="SoundEngine.toggle('cafe', this)" title="صدای کافه">☕</button>
        <button class="sound-btn" onclick="SoundEngine.toggle('noise', this)" title="نویز سفید">📻</button>
    </div>
`;

// اضافه کردن به Focus Mode
html = html.replace(
    '<h2 id="focusSubject">حالت تمرکز</h2>',
    '<h2 id="focusSubject">حالت تمرکز</h2>\n<div id="focusOneThing" style="color:#fff; font-size:0.9em; margin-bottom:10px; font-weight:bold;"></div>\n' + focusExtras
);

// اضافه کردن به پومودورو
html = html.replace(
    '<input class="inp" id="pomSubj" placeholder="درس (اختیاری)" style="margin-top:14px;text-align:center">',
    focusExtras + '\n<input class="inp" id="pomSubj" placeholder="درس (اختیاری)" style="margin-top:14px;text-align:center">'
);

fs.writeFileSync('index.html', html);
console.log("✅ بخش‌های HTML اضافه شدند.");

// ==========================================
// 2. اصلاح CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const newCSS = `
/* ============ STUDY GARDEN ============ */
.study-garden {
    background: #fff;
    margin: 15px;
    padding: 15px;
    border-radius: 18px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
[data-theme="dark"] .study-garden { background: #1e293b; }
.sg-title { font-weight: 800; font-size: 0.95em; color: var(--text); margin-bottom: 12px; }
.sg-grid { display: flex; justify-content: space-between; align-items: flex-end; height: 60px; padding-bottom: 5px; border-bottom: 2px dashed var(--border); }
.sg-item { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 1.8em; transition: transform 0.3s; }
.sg-item:hover { transform: scale(1.2); }
.sg-label { font-size: 0.4em; color: var(--text-light); font-weight: bold; }

/* ============ SOUND CONTROLS ============ */
.sound-controls { display: flex; justify-content: center; gap: 10px; margin: 15px 0; }
.sound-btn {
    width: 45px; height: 45px; border-radius: 50%;
    border: 2px solid var(--border); background: var(--bg-card);
    font-size: 1.2em; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
}
.sound-btn.active { border-color: var(--primary); background: rgba(0,150,136,0.1); transform: scale(1.1); box-shadow: 0 0 10px rgba(0,150,136,0.3); }
[data-theme="dark"] .sound-btn.active { background: rgba(0,150,136,0.3); }

/* ============ ONE THING RULE ============ */
.one-thing-box { width: 90%; margin: 10px auto; }
.one-thing-input {
    width: 100%; padding: 12px; border-radius: 12px;
    border: 2px dashed var(--primary); background: rgba(0,150,136,0.05);
    text-align: center; font-family: inherit; font-size: 0.9em; font-weight: bold; color: var(--text);
}
.one-thing-input:focus { outline: none; border-style: solid; }
`;
fs.writeFileSync('style.css', css + "\n" + newCSS);

// ==========================================
// 3. اصلاح JS
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const newJS = `
// ============ STUDY GARDEN ============
window.renderGarden = function() {
    const grid = document.getElementById('gardenGrid');
    if (!grid) return;
    
    const log = getData('ilia-log', []);
    const days = [];
    const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    
    // گرفتن ۷ روز اخیر
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = localDate(d);
        const hours = log.filter(e => e.date === dateStr).reduce((s,e) => s + e.hours, 0);
        
        let icon = '🟫'; // خاک
        if (hours > 0 && hours <= 2) icon = '🌱'; // جوانه
        else if (hours > 2 && hours <= 4) icon = '🌿'; // گیاه
        else if (hours > 4) icon = '🌳'; // درخت
        
        const isToday = i === 0;
        days.push({ icon, label: dayNames[d.getDay()], isToday });
    }
    
    grid.innerHTML = days.map(d => \`
        <div class="sg-item" style="\${d.isToday ? 'transform: scale(1.2); filter: drop-shadow(0 0 5px #10b981);' : ''}">
            \${d.icon}
            <span class="sg-label">\${d.label}</span>
        </div>
    \`).join('');
};

// Override renderTodayTotal to also update garden
const originalRenderTodayTotal = renderTodayTotal;
window.renderTodayTotal = function() {
    originalRenderTodayTotal();
    renderGarden();
};

// ============ SOUND ENGINE (Web Audio API) ============
window.SoundEngine = {
    ctx: null,
    nodes: {},
    isPlaying: { rain: false, cafe: false, noise: false },
    
    init: function() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    toggle: function(type, btn) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        if (this.isPlaying[type]) {
            // Stop
            if (this.nodes[type]) {
                this.nodes[type].stop();
                this.nodes[type] = null;
            }
            this.isPlaying[type] = false;
            btn.classList.remove('active');
        } else {
            // Play
            this.isPlaying[type] = true;
            btn.classList.add('active');
            
            const bufferSize = this.ctx.sampleRate * 2; 
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            if (type === 'noise') {
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            } else if (type === 'rain') {
                // فیلتر کردن نویز برای شبیه شدن به باران
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    let white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; 
                }
            } else if (type === 'cafe') {
                // نویز صورتی برای شبیه شدن به همهمه
                let b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    let white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11;
                    b6 = white * 0.115926;
                }
            }

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            // کم کردن صدا که آزاردهنده نباشه
            const gain = this.ctx.createGain();
            gain.gain.value = 0.3; 
            
            source.connect(gain);
            gain.connect(this.ctx.destination);
            source.start();
            
            this.nodes[type] = source;
        }
    }
};

// ============ ONE THING RULE ============
// Override startFocusMode to ask for "One Thing" first
if (typeof startFocusMode !== 'undefined') {
    const originalStartFocus2 = startFocusMode;
    window.startFocusMode = function() {
        const box = document.getElementById('oneThingBox');
        const input = document.getElementById('oneThingInput');
        const display = document.getElementById('focusOneThing');
        
        if (box && box.style.display === 'none') {
            box.style.display = 'block';
            input.focus();
            input.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    box.style.display = 'none';
                    if (display) display.textContent = '🎯 هدف: ' + input.value;
                    originalStartFocus2();
                }
            };
            return;
        }
        originalStartFocus2();
    };
}

// Override startPom to get micro-goal
const originalStartPom = startPom;
window.startPom = function() {
    const input = document.getElementById('oneThingInput');
    if (input && input.value.trim() !== '') {
        document.getElementById('pomSubj').value = input.value;
    }
    originalStartPom();
};
`;

if (!js.includes('window.SoundEngine')) {
    js += "\n" + newJS;
}

// اجرای اولیه باغ
js = js.replace('// ============= Init =============', '// ============= Init =============\nsetTimeout(() => { if(typeof renderGarden === "function") renderGarden(); }, 1000);');

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 باغ مطالعه، صداهای محیطی و قانون یک کار اعمال شدند! حالا Ctrl+F5 بزن.");
