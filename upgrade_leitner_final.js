const fs = require('fs');

console.log("🚀 در حال اعمال ارتقاهای نهایی روی جعبه لایتنر...");

// ==========================================
// 1. اصلاح HTML و CSS (برای ظاهر بهتر)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('style.css', 'utf8');

// اضافه کردن دکمه مطالعه آزاد
html = html.replace(
    '<button class="btn btn-info" onclick="LeitnerManager.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">📋 مدیریت کارت‌ها</button>',
    '<div style="display:flex; gap:8px;"><button class="btn btn-accent" onclick="startFreeStudy()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">🎲 مطالعه آزاد</button><button class="btn btn-info" onclick="LeitnerManager.open()" style="padding: 8px 15px; font-size: 0.85em; border-radius: 10px;">📋 مدیریت</button></div>'
);

// استایل دکمه بلندگو
const ttsCSS = `
.tts-btn {
    position: absolute; top: 15px; left: 15px;
    background: rgba(255,255,255,0.2); border: none; border-radius: 50%;
    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
    font-size: 1.2em; cursor: pointer; transition: 0.2s; z-index: 10;
}
.tts-btn:hover { background: rgba(255,255,255,0.4); transform: scale(1.1); }
`;
fs.writeFileSync('style.css', css + "\n" + ttsCSS);

// اضافه کردن دکمه TTS به کارت
html = html.replace(
    '<div class="fc-front" id="lv1">کارتی نیست</div>',
    '<button class="tts-btn" onclick="speakCurrentCard(event)" title="پخش صدا">🔊</button>\n          <div class="fc-front" id="lv1">کارتی نیست</div>'
);

fs.writeFileSync('index.html', html);

// ==========================================
// 2. اصلاح منطق جاوااسکریپت
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const finalLeitnerLogic = `
// ============ LEITNER FINAL FIXES & UPGRADES ============
window.isFreeStudyMode = false;

// تابع شروع مطالعه آزاد
window.startFreeStudy = function() {
    window.isFreeStudyMode = true;
    renderLeitner();
    toast('🎲 حالت مطالعه آزاد فعال شد');
};

// تابع پخش صدا
window.speakCurrentCard = function(e) {
    if (e) e.stopPropagation(); // جلوگیری از چرخیدن کارت
    if (!window.currentLeitnerCard) return;
    
    const textToSpeak = window.currentLeitnerCard.front + '. ' + window.currentLeitnerCard.back;
    
    if ('speechSynthesis' in window) {
        // لغو کردن هر صدای در حال پخش
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fa-IR'; // فرض بر فارسی بودن، اگر عربی/انگلیسی بود تغییر میکند
        // تشخیص ساده زبان (اگر حروف انگلیسی داشت، انگلیسی بخواند)
        if (/[a-zA-Z]/.test(textToSpeak)) utterance.lang = 'en-US';
        
        utterance.rate = 0.9; // کمی آهسته‌تر برای درک بهتر
        window.speechSynthesis.speak(utterance);
    } else {
        toast('مرورگر شما از پخش صدا پشتیبانی نمی‌کند');
    }
};

// بازنویسی تابع renderLeitner برای اعمال تغییرات جدید
const originalRenderLeitner = renderLeitner;
window.renderLeitner = function() {
    const l = getData('ilia-leitner', []);
    const filter = document.getElementById('filterLeitnerSubject') ? document.getElementById('filterLeitnerSubject').value : 'all';
    
    let filtered = l;
    if (filter !== 'all') filtered = l.filter(c => c.subject === filter);
    
    const due = filtered.filter(c => c.next <= today());
    
    // اگر حالت مطالعه آزاد است، همه کارت‌ها را آماده مرور کن
    let cardsToShow = window.isFreeStudyMode ? filtered : due;
    
    const card = document.getElementById('leitnerCard'); 
    if (card) card.classList.remove('flipped');
    
    const mainBtns = document.getElementById('leitnerMainBtns');
    const resultBtns = document.getElementById('leitnerResultBtns');
    const cnt = document.getElementById('leitnerCounter');
    
    if (filtered.length === 0) {
        document.getElementById('lv1').textContent = 'کارتی نیست';
        document.getElementById('lv2').textContent = 'اضافه کن!';
        if (cnt) cnt.textContent = '۰ کارت';
        window.currentLeitnerCard = null;
        if (mainBtns) mainBtns.style.display = 'none'; // مخفی کردن دکمه‌ها
        if (resultBtns) resultBtns.style.display = 'none';
        return;
    }
    
    if (cardsToShow.length === 0) {
        document.getElementById('lv1').textContent = '🎉 مرور تمومه!';
        document.getElementById('lv2').textContent = 'برای مطالعه بیشتر، روی «مطالعه آزاد» بزن';
        if (cnt) cnt.textContent = 'کل: ' + fa(filtered.length) + ' کارت';
        window.currentLeitnerCard = null;
        if (mainBtns) mainBtns.style.display = 'none'; // مخفی کردن دکمه‌ها وقتی کارتی نیست
        if (resultBtns) resultBtns.style.display = 'none';
        return;
    }
    
    // انتخاب یک کارت برای نمایش
    window.currentLeitnerCard = cardsToShow[0];
    document.getElementById('lv1').textContent = window.currentLeitnerCard.front;
    document.getElementById('lv2').textContent = window.currentLeitnerCard.back;
    
    if (cnt) cnt.textContent = (window.isFreeStudyMode ? 'حالت آزاد: ' : '') + fa(cardsToShow.length) + ' کارت آماده مرور';
    if (mainBtns) mainBtns.style.display = 'flex'; // نمایش دکمه‌ها
    if (resultBtns) resultBtns.style.display = 'none';
};

// بازنویسی تابع leitnerAnswer برای پشتیبانی از حالت آزاد
const originalLeitnerAnswer = leitnerAnswer;
window.leitnerAnswer = function(knew) {
    if (!window.currentLeitnerCard) return;
    
    document.getElementById('leitnerCard').classList.add('flipped');
    
    const mainBtns = document.getElementById('leitnerMainBtns');
    const resultBtns = document.getElementById('leitnerResultBtns');
    if (mainBtns) mainBtns.style.display = 'none';
    if (resultBtns) resultBtns.style.display = 'flex';
    
    const l = getData('ilia-leitner', []);
    const c = l.find(x => x.id === window.currentLeitnerCard.id);
    const intervals = {1:1, 2:3, 3:7, 4:14, 5:30};
    
    if (knew) c.box = Math.min(5, c.box+1);
    else c.box = 1;
    
    const nd = new Date(); nd.setDate(nd.getDate() + intervals[c.box]);
    c.next = localDate(nd);
    setData('ilia-leitner', l);
};

// بازنویسی nextLeitnerCard
const originalNextLeitner = nextLeitnerCard;
window.nextLeitnerCard = function() {
    // اگر در حالت آزاد بودیم و کاربر جواب داد، کارت بعدی را نشان بده
    if (window.isFreeStudyMode) {
        const l = getData('ilia-leitner', []);
        const filter = document.getElementById('filterLeitnerSubject').value;
        let filtered = filter === 'all' ? l : l.filter(c => c.subject === filter);
        if (filtered.length > 1) {
            // یک کارت دیگر را تصادفی انتخاب کن برای تنوع
            const randomIndex = Math.floor(Math.random() * filtered.length);
            window.currentLeitnerCard = filtered[randomIndex];
            document.getElementById('lv1').textContent = window.currentLeitnerCard.front;
            document.getElementById('lv2').textContent = window.currentLeitnerCard.back;
            
            const card = document.getElementById('leitnerCard');
            if (card) card.classList.remove('flipped');
            
            const mainBtns = document.getElementById('leitnerMainBtns');
            const resultBtns = document.getElementById('leitnerResultBtns');
            if (mainBtns) mainBtns.style.display = 'flex';
            if (resultBtns) resultBtns.style.display = 'none';
            return;
        }
    }
    // بازگشت به حالت عادی
    window.isFreeStudyMode = false;
    window.renderLeitner();
};
`;

// تزریق کد جدید در انتهای فایل
if (!js.includes('window.startFreeStudy')) {
    js += "\n" + finalLeitnerLogic;
}

fs.writeFileSync('app.js', js);

// ==========================================
// 3. آپدیت کش
// ==========================================
const version = Date.now();
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
html = html.replace(/<link rel="stylesheet" href="style\.css.*?">/, '<link rel="stylesheet" href="style.css?v=' + version + '">');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 ارتقای نهایی لایتنر (مطالعه آزاد، صدا و رفع باگ) انجام شد! حالا Ctrl+F5 بزن.");
