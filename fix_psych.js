const fs = require('fs');

console.log("🔧 در حال رفع خطای نحوی (Syntax Error) و بازگرداندن برنامه...");

let js = fs.readFileSync('app.js', 'utf8');

// پیدا کردن بلاک خراب شده و حذف آن
const brokenStart = '// ============ PSYCHOLOGY LOGIC ============';
const startIdx = js.indexOf(brokenStart);

if (startIdx !== -1) {
    js = js.slice(0, startIdx);
}

// کد سالم و تمیز با استفاده از بک‌تیک (Backtick) برای جلوگیری از تداخل
const fixedPsychJS = `
// ============ PSYCHOLOGY LOGIC (FIXED) ============

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
            result.innerHTML = \`
                😴 <b>خسته‌ای؟</b> بیا بریم فلش‌کارت‌های لایتنر رو مرور کنیم. کار سبکیه.<br><br>
                <button class="btn btn-sm btn-primary" onclick="document.getElementById('moodModal').style.display='none'; go('leitner')">بریم لایتنر</button>
            \`;
        } 
        else if (mood === 'stressed') {
            result.innerHTML = \`
                😰 <b>آرام باش.</b> ۴ ثانیه نفس بکش، ۴ ثانیه نگه دار، ۴ ثانیه بده بیرون.<br>
                <div class="breathing-circle"></div>
                <div style="font-size:0.8em; margin-top:10px;">با دایره نفس بکش...</div>
            \`;
            setTimeout(() => { 
                result.innerHTML += \`
                    <br><button class="btn btn-sm btn-primary" onclick="document.getElementById('moodModal').style.display='none'">حالم بهتر شد، بریم درس</button>
                \`;
            }, 12000);
        }
    }
};

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

window.start2MinRule = function() {
    pTot = 5 * 60; 
    pT = pTot; 
    updPom();
    document.getElementById('pomSubj').value = 'شروع ۵ دقیقه‌ای';
    startPom();
    toast('🌱 فقط ۵ دقیقه! اگه خواستی بعدش ادامه بده.');
};

const originalRenderStats = renderStats;
window.renderStats = function() {
    originalRenderStats();
    const log = getData('ilia-log', []);
    let streak = 0;
    const ds = new Set(log.map(e => e.date));
    let d = new Date();
    while (ds.has(localDate(d))) { streak++; d.setDate(d.getDate()-1); }
    
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (!ds.has(localDate(y)) && streak > 0) {
        const stEl = document.getElementById('stT');
        if (stEl) stEl.textContent = fa(streak) + ' (استراحت)';
    }
};

if (typeof startFocusMode !== 'undefined') {
    const originalStartFocus = startFocusMode;
    window.startFocusMode = function() {
        MoodCheck.open();
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
}
`;

js += "\n" + fixedPsychJS;
fs.writeFileSync('app.js', js);

// آپدیت کش برای اینکه مرورگر کد جدید رو لود کنه
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 خطا برطرف شد! حالا برنامه باید درست کار کنه.");
