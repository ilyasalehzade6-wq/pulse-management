const fs = require('fs');

console.log("🧠 در حال ارتقای الگوریتم لایتنر (سیستم صف و حذف کارت‌های تکراری)...");

let js = fs.readFileSync('app.js', 'utf8');

const queueLogic = `
// ============ LEITNER QUEUE ENGINE ============
window.LeitnerEngine = {
    mainQueue: [],
    retryQueue: [],
    isInitialized: false,
    currentFilter: 'all',

    init: function(filter) {
        const l = getData('ilia-leitner', []);
        this.currentFilter = filter || 'all';
        
        let filtered = l;
        if (this.currentFilter !== 'all') {
            filtered = l.filter(c => c.subject === this.currentFilter);
        }
        
        // فیلتر کارت‌های آماده مرور (تاریخ امروز یا گذشته)
        const due = filtered.filter(c => c.next <= today());
        
        // حذف کارت‌های تکراری با استفاده از ID
        const uniqueIds = new Set();
        this.mainQueue = [];
        due.forEach(c => {
            if (!uniqueIds.has(c.id)) {
                uniqueIds.add(c.id);
                this.mainQueue.push(c);
            }
        });
        
        // اگر حالت مطالعه آزاد بود، همه کارت‌های درس انتخابی را در صف می‌گذاریم
        if (window.isFreeStudyMode) {
            this.mainQueue = [];
            const allUniqueIds = new Set();
            filtered.forEach(c => {
                if (!allUniqueIds.has(c.id)) {
                    allUniqueIds.add(c.id);
                    this.mainQueue.push(c);
                }
            });
        }
        
        // به هم زدن ترتیب برای تنوع (اختیاری)
        this.mainQueue.sort(() => Math.random() - 0.5);
        
        this.retryQueue = [];
        this.isInitialized = true;
    },

    getNextCard: function() {
        if (this.mainQueue.length > 0) {
            return { card: this.mainQueue[0], isRetry: false };
        }
        if (this.retryQueue.length > 0) {
            // اگر صف اصلی خالی بود، از صف تلاش مجدد بیاور
            return { card: this.retryQueue[0], isRetry: true };
        }
        return null;
    },

    processAnswer: function(knew) {
        let currentSession = this.mainQueue.length > 0 ? this.mainQueue : this.retryQueue;
        if (currentSession.length === 0) return;
        
        const currentCard = currentSession.shift(); // کارت را از ابتدای صف بردار
        
        if (!knew) {
            // اگر غلط جواب داد، به صف تلاش مجدد بفرست (اگر از قبل در صف اصلی بود)
            // اگر از قبل در صف تلاش مجدد بود (یعنی برای دومین بار غلط جواب داد)، دیگر برنگردان تا حلقه ایجاد نشود
            if (this.mainQueue.length > 0 && !window.isFreeStudyMode) {
                this.retryQueue.push(currentCard);
            }
        }
    }
};

// بازنویسی تابع رندر برای استفاده از صف جدید
window.renderLeitner = function() {
    const filterEl = document.getElementById('filterLeitnerSubject');
    const filter = filterEl ? filterEl.value : 'all';
    
    // اگر صف هنوز ساخته نشده یا فیلتر عوض شده، صف را بساز
    if (!LeitnerEngine.isInitialized || LeitnerEngine.currentFilter !== filter) {
        LeitnerEngine.init(filter);
    }
    
    const current = LeitnerEngine.getNextCard();
    const card = document.getElementById('leitnerCard'); 
    if (card) card.classList.remove('flipped');
    
    const mainBtns = document.getElementById('leitnerMainBtns');
    const resultBtns = document.getElementById('leitnerResultBtns');
    const cnt = document.getElementById('leitnerCounter');
    
    if (!current) {
        // پایان مرور
        document.getElementById('lv1').textContent = '🎉 مرور تمومه!';
        document.getElementById('lv2').textContent = 'برای مطالعه بیشتر، روی «مطالعه آزاد» بزن';
        if (cnt) cnt.textContent = 'هیچ کارتی برای مرور باقی نمانده است.';
        window.currentLeitnerCard = null;
        if (mainBtns) mainBtns.style.display = 'none';
        if (resultBtns) resultBtns.style.display = 'none';
        return;
    }
    
    window.currentLeitnerCard = current.card;
    document.getElementById('lv1').textContent = current.card.front;
    document.getElementById('lv2').textContent = current.card.back;
    
    const remaining = LeitnerEngine.mainQueue.length + LeitnerEngine.retryQueue.length;
    if (cnt) {
        cnt.textContent = (current.isRetry ? '🔁 مرور مجدد: ' : '') + fa(remaining) + ' کارت باقی مانده';
    }
    
    if (mainBtns) mainBtns.style.display = 'flex';
    if (resultBtns) resultBtns.style.display = 'none';
};

// بازنویسی تابع پاسخ به کارت
window.leitnerAnswer = function(knew) {
    if (!window.currentLeitnerCard) return;
    
    // انیمیشن چرخش کارت
    document.getElementById('leitnerCard').classList.add('flipped');
    
    const mainBtns = document.getElementById('leitnerMainBtns');
    const resultBtns = document.getElementById('leitnerResultBtns');
    if (mainBtns) mainBtns.style.display = 'none';
    if (resultBtns) resultBtns.style.display = 'flex';
    
    // آپدیت دیتابیس (جعبه و تاریخ)
    const l = getData('ilia-leitner', []);
    const c = l.find(x => x.id === window.currentLeitnerCard.id);
    if (c) {
        const intervals = {1:1, 2:3, 3:7, 4:14, 5:30};
        if (knew) c.box = Math.min(5, (c.box || 1) + 1);
        else c.box = 1;
        const nd = new Date(); nd.setDate(nd.getDate() + intervals[c.box]);
        c.next = localDate(nd);
        setData('ilia-leitner', l);
    }
    
    // پردازش در صف
    LeitnerEngine.processAnswer(knew);
};

// بازنویسی دکمه بعدی
window.nextLeitnerCard = function() {
    if (!window.isFreeStudyMode && LeitnerEngine.mainQueue.length === 0 && LeitnerEngine.retryQueue.length === 0) {
        window.isFreeStudyMode = false;
        LeitnerEngine.isInitialized = false; // ریست کردن برای دفعه بعد
    }
    window.renderLeitner();
};

// هنگام تغییر درس در منوی کشویی، صف را ریست کن
const filterSelect = document.getElementById('filterLeitnerSubject');
if (filterSelect) {
    filterSelect.addEventListener('change', function() {
        LeitnerEngine.isInitialized = false;
        window.isFreeStudyMode = false;
    });
}

// بازنویسی startFreeStudy
window.startFreeStudy = function() {
    window.isFreeStudyMode = true;
    LeitnerEngine.isInitialized = false; // مجبور کردن به ساخت صف جدید
    renderLeitner();
    toast('🎲 حالت مطالعه آزاد فعال شد');
};

// اصلاح addLeitner برای جلوگیری از تکرار ID
const originalAdd = addLeitner;
window.addLeitner = function() {
    const f = document.getElementById('lf').value.trim();
    const b = document.getElementById('lb').value.trim();
    const subj = document.getElementById('leitnerSubject').value;
    if (!f || !b) return toast('هر دو فیلد رو پر کن');
    
    const l = getData('ilia-leitner', []);
    l.push({ 
        id: Date.now() + Math.floor(Math.random() * 10000), // جلوگیری از تکرار ID
        front: f, back: b, box: 1, next: today(), subject: subj 
    });
    setData('ilia-leitner', l);
    
    document.getElementById('lf').value = ''; 
    document.getElementById('lb').value = '';
    
    LeitnerEngine.isInitialized = false; // ریست صف برای دیدن کارت جدید
    renderLeitner();
    toast('✅ کارت اضافه شد');
};
`;

// حذف کدهای قبلی و جایگزینی
const oldStart = js.indexOf('// ============ LEITNER QUEUE ENGINE ============');
const fallbackStart = js.indexOf('window.startFreeStudy = function()');
if (oldStart !== -1) {
    js = js.slice(0, oldStart);
} else if (fallbackStart !== -1) {
    js = js.slice(0, fallbackStart);
}

js += "\n" + queueLogic;
fs.writeFileSync('app.js', js);

// آپدیت کش
const version = Date.now();
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="app\.js.*?"><\/script>/, '<script src="app.js?v=' + version + '"></script>');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + version + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 الگوریتم صف لایتنر با موفقیت اعمال شد! حالا Ctrl+F5 بزن.");
