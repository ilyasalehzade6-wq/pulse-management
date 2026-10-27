const fs = require('fs');

console.log("🧠 در حال تزریق ویژگی‌های پیشرفته روانشناسی (Mood, Parking Lot, 5-Min Rule)...");

// ==========================================
// 1. اضافه کردن HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// الف) مودال حالت ذهنی (Mood Check)
const moodHTML = `
<div class="mood-modal" id="moodModal">
    <div style="text-align:center; width: 100%; max-width: 400px; padding:20px;">
        <h2 style="color:#fff; margin-bottom:20px; font-size:1.2em;">الان چه حسی داری؟</h2>
        <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
            <button class="mood-btn" onclick="MoodCheck.select('focused')">🧠<br><span style="font-size:.3em; display:block; margin-top:10px; color:var(--text)">سرحال</span></button>
            <button class="mood-btn" onclick="MoodCheck.select('tired')">😴<br><span style="font-size:.3em; display:block; margin-top:10px; color:var(--text)">خسته</span></button>
            <button class="mood-btn" onclick="MoodCheck.select('stressed')">😰<br><span style="font-size:.3em; display:block; margin-top:10px; color:var(--text)">مضطرب</span></button>
        </div>
        <div id="moodResult" style="display:none; color:#fff; margin-top:20px; background:rgba(255,255,255,0.1); padding:15px; border-radius:12px;">
            <!-- نتیجه اینجا نمایش داده می‌شود -->
        </div>
        <button style="margin-top:20px; background:transparent; border:1px solid #fff; color:#fff; padding:8px 16px; border-radius:20px; cursor:pointer;" onclick="document.getElementById('moodModal').style.display='none'">بستن</button>
    </div>
</div>
`;

if (!html.includes('moodModal')) {
    html = html.replace('</body>', moodHTML + '\n</body>');
}

// ب) اضافه کردن پارکینگ افکار و دکمه ۵ دقیقه به HTML
html = html.replace(
  '<div class="focus-timer" id="focusTimer">۲۵:۰۰</div>',
  `<div class="focus-timer" id="focusTimer">۲۵:۰۰</div>
   <input type="text" id="parkingInput" class="parking-input" placeholder="فکر مزاحم؟ اینجا بنویس تا بعداً بررسی کنی..." onkeydown="if(event.key==='Enter')ParkingLot.save()">
   <div style="font-size:0.75em; color:#aaa; margin-top:5px; text-align:center;">با زدن Enter ذخیره می‌شود</div>`
);

html = html.replace(
  '<button class="btn btn-primary" onclick="startPom()" id="startBtn">▶ شروع</button>',
  `<button class="btn btn-primary" onclick="startPom()" id="startBtn">▶ شروع</button>
   <button class="btn btn-success" onclick="start2MinRule()" style="font-size:0.8em; padding:8px;">🌱 فقط ۵ دقیقه شروع می‌کنم</button>`
);

fs.writeFileSync('index.html', html);

// ==========================================
// 2. اضافه کردن CSS
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const moodCSS = `
/* ============ PSYCHOLOGY FEATURES ============ */
.mood-modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    backdrop-filter: blur(10px); z-index: 99999;
    display: none; align-items: center; justify-content: center;
}
.mood-btn {
    background: var(--bg-card); border: 2px solid var(--border);
    border-radius: 20px; padding: 20px; font-size: 3em; cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
}
.mood-btn:hover { transform: scale(1.1); border-color: var(--primary); }
.mood-btn:active { transform: scale(0.95); }

.breathing-circle {
    width: 80px; height: 80px; background: var(--primary);
    border-radius: 50%; margin: 15px auto;
    animation: breathe 4s infinite ease-in-out;
}
@keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 0 rgba(0,150,136,0.7); }
    50% { transform: scale(1.5); opacity: 1; box-shadow: 0 0 20px 10px rgba(0,150,136,0); }
}

.parking-input {
    width: 90%; max-width: 300px; padding: 12px; margin-top: 15px;
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.1); color: #fff;
    font-family: inherit; font-size: 0.9em; text-align: center;
    outline: none; transition: all 0.2s;
}
.parking-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.2); }
`;
fs.writeFileSync('style.css', css + "\n" + moodCSS);

// ==========================================
// 3. اضافه کردن منطق JS
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const psychJS = `
// ============ PSYCHOLOGY LOGIC ============

// 1. Mood Check (حالت ذهنی)
window.MoodCheck = {
    selected: null,
    open: function() {
        document.getElementById('moodModal').style.display = 'flex';
        document.getElementById('moodResult').style.display = 'none';
        document.getElementById('moodResult').innerHTML = '';
    },
    select: function(mood) {
        this.selected = mood;
        const result = document.getElementById('moodResult');
        result.style.display = 'block';
        
        if (mood === 'focused') {
            result.innerHTML = '🧠 <b>عالیه!</b> الان بهترین زمان برای درس‌های سخت مثل ریاضی و فیزیکه.';
            setTimeout(() => { document.getElementById('moodModal').style.display = 'none'; }, 2000);
        } 
        else if (mood === 'tired') {
            result.innerHTML = '😴 <b>خسته‌ای؟</b> بیا بریم فلش‌کارت‌های لایتنر رو مرور کنیم. کار سبکیه.<br><br><button class="btn btn-sm btn-primary" onclick="document.getElementById(\'moodModal\').style.display=\'none\'; go(\'leitner\')">بریم لایتنر</button>';
        } 
        else if (mood === 'stressed') {
            result.innerHTML = '😰 <b>آرام باش.</b> ۴ ثانیه نفس بکش، ۴ ثانیه نگه دار، ۴ ثانیه بده بیرون.<br><div class="breathing-circle"></div><div style="font-size:0.8em; margin-top:10px;">با دایره نفس بکش...</div>';
            setTimeout(() => { 
                result.innerHTML += '<br><button class="btn btn-sm btn-primary" onclick="document.getElementById(\\'moodModal\\').style.display=\\'none\\'">حالم بهتر شد، بریم درس</button>';
            }, 12000);
        }
    }
};

// 2. Parking Lot (پارکینگ افکار)
window.ParkingLot = {
    save: function() {
        const input = document.getElementById('parkingInput');
        const val = input.value.trim();
        if (!val) return;
        
        const list = getData('ilia-parking-lot', []);
        list.push({ text: val, date: today(), ts: Date.now() });
        setData('ilia-parking-lot', list);
        
        input.value = '';
        toast('🧠 فکرت ثبت شد. بعداً بررسی می‌کنیم.');
    },
    checkAfterSession: function() {
        const list = getData('ilia-parking-lot', []);
        const todayList = list.filter(x => x.date === today());
        if (todayList.length > 0) {
            setTimeout(() => {
                toast('📝 ' + fa(todayList.length) + ' فکر مزاحم پارک شده داری. وقتشه بررسیشون کنی.');
            }, 3000);
        }
    }
};

// 3. 5-Minute Rule (قانون ۲ دقیقه)
window.start2MinRule = function() {
    pTot = 5 * 60; 
    pT = pTot; 
    updPom();
    document.getElementById('pomSubj').value = 'شروع ۵ دقیقه‌ای';
    startPom();
    toast('🌱 فقط ۵ دقیقه! اگه خواستی بعدش ادامه بده.');
};

// 4. Forgiving Streak (زنجیره مهربان)
const originalRenderStats = renderStats;
window.renderStats = function() {
    originalRenderStats();
    // تغییر متن استریک برای مهربان‌تر شدن
    const log = getData('ilia-log', []);
    let streak = 0;
    const ds = new Set(log.map(e => e.date));
    let d = new Date();
    while (ds.has(localDate(d))) { streak++; d.setDate(d.getDate()-1); }
    
    // چک کردن دیروز (اگه دیروز نبوده، متن رو مهربان می‌کنیم)
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (!ds.has(localDate(y)) && streak > 0) {
        // استریک شکسته، به کاربر روحیه میدیم
        const stEl = document.getElementById('stT');
        if (stEl) stEl.textContent = fa(streak) + ' (استراحت)';
    }
};

// Override startFocusMode to trigger MoodCheck
const originalStartFocus = startFocusMode;
window.startFocusMode = function() {
    MoodCheck.open();
    // کاربر باید یکی رو انتخاب کنه، بعد از انتخاب تایمر شروع میشه
    setTimeout(() => {
        const btn = document.querySelector('.mood-btn');
        if (btn) {
            btn.onclick = function() {
                MoodCheck.select('focused');
                setTimeout(() => {
                    originalStartFocus();
                    ParkingLot.checkAfterSession();
                }, 500);
            };
        }
    }, 100);
};
`;

if (!js.includes('PSYCHOLOGY LOGIC')) {
    js += "\n" + psychJS;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 ویژگی‌های روانشناسی با موفقیت اضافه شدند! حالا Ctrl+F5 بزن.");
