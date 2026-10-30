// ============= مدیریت خطا =============
window.addEventListener('error', (e) => console.error('خطا:', e.message));
window.addEventListener('unhandledrejection', (e) => console.error('خطای Promise:', e.reason));

// ============= ابزارهای پایه =============
const pad2 = n => String(n).padStart(2, '0');
const fa = n => String(n ?? '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const localDate = (d = new Date()) => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
};
const today = () => localDate();

const getData = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch(e) { return d; } };
const setData = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch(e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) toast('⚠️ حافظه پر شده — پشتیبان بگیر');
    console.error('setData:', e);
    return false;
  }
};
function timeToMin(t) {
  if (!t || typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<span>${msg}</span>`;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), 2500);
}

// ============= هشدار تایمر — بلند و طولانی =============
let _alarmSound = null;
let _alarmInterval = null;

function stopAlarmSound() {
  if (_alarmInterval) { clearInterval(_alarmInterval); _alarmInterval = null; }
  if (_alarmSound) { try { _alarmSound.close(); } catch(e) {} _alarmSound = null; }
  const t = document.getElementById('toast');
  if (t) { clearTimeout(t._tm); t.classList.remove('show'); }
}

function alertTimerDone(title) {
  const msg = title || 'وقت تموم شد';

  try {
    if ('vibrate' in navigator) navigator.vibrate([
      1000, 400, 1000, 400, 1000, 400, 1500, 600, 1500, 600, 2000
    ]);
  } catch(e) {}

  stopAlarmSound();
  try {
    _alarmSound = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _alarmSound;

    const playSequence = () => {
      try {
        const t = ctx.currentTime;
        const playTone = (freq, start, dur, vol) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = 'square';
          g.gain.setValueAtTime(vol, start);
          g.gain.exponentialRampToValueAtTime(0.001, start + dur);
          o.start(start); o.stop(start + dur);
        };
        for (let i = 0; i < 3; i++) {
          const base = t + i * 1.4;
          playTone(1200, base, 0.18, 0.5);
          playTone(900, base + 0.2, 0.18, 0.5);
          playTone(1200, base + 0.4, 0.18, 0.5);
          playTone(900, base + 0.6, 0.18, 0.5);
          playTone(1400, base + 0.8, 0.5, 0.6);
        }
      } catch(e) {}
    };

    playSequence();
    _alarmInterval = setInterval(playSequence, 4500);
  } catch(e) {}

  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ ' + msg, {
        body: 'برای قطع صدا روی اپ کلیک کن',
        icon: './icon-192.png',
        vibrate: [1000, 400, 1000, 400, 2000],
        tag: 'timer-done',
        requireInteraction: true
      });
    }
  } catch(e) {}

  const t = document.getElementById('toast');
  if (t) {
    t.innerHTML = `<div style="display:flex;align-items:center;gap:10px;justify-content:center">
      <span>⏰ ${esc(msg)}</span>
      <button onclick="stopAlarmSound()" style="background:#ef4444;color:#fff;border:none;padding:8px 16px;border-radius:10px;font-family:inherit;font-size:.9em;font-weight:800;cursor:pointer">⏹ قطع</button>
    </div>`;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => stopAlarmSound(), 60000);
  }

  try { window.focus(); } catch(e) {}
}

function requestNotifPermission() {
  try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch(e) {}
}

// ============= APK Banner =============
function renderApkBanner() {
  const el = document.getElementById('apkBanner');
  if (!el) return;
  if (isStandalone() || localStorage.getItem('ilia-apk-banner-dismissed') === 'true') { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="apk-banner">
      <button class="apk-close" aria-label="بستن بنر" onclick="dismissApkBanner()">✕</button>
      <div class="apk-banner-content">
        <div class="apk-banner-icon">📲</div>
        <div style="flex:1">
          <div class="apk-banner-title">نسخه اندروید اپ</div>
          <div class="apk-banner-sub">روی گوشیت نصب کن — مثل بقیه اپ‌ها</div>
        </div>
      </div>
      <a href="./study-app.apk" download="study-app.apk" class="apk-banner-btn">⬇️ دانلود APK</a>
    </div>`;
}
function dismissApkBanner() {
  localStorage.setItem('ilia-apk-banner-dismissed', 'true');
  const el = document.getElementById('apkBanner'); if (el) el.innerHTML = '';
}

// ============= PWA =============
let deferredPrompt = null;
let swReady = false;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        console.log('✅ SW registered:', reg.scope);
        swReady = true;
        updatePwaStatus('✅ Service Worker فعال');
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast('🔄 نسخه جدید آماده — صفحه رو رفرش کن');
            }
          });
        });
      })
      .catch(err => { console.error('❌ SW error:', err); updatePwaStatus('❌ خطا: ' + err.message); });
  });
} else updatePwaStatus('❌ مرورگر پشتیبانی نمی‌کند');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updatePwaStatus('✅ آماده نصب — دکمه نصب رو بزن');
});

async function installPWA() {
  if (isStandalone()) { toast('✅ اپ در حالت PWA باز است'); return; }
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { toast('🎉 اپ نصب شد!'); updatePwaStatus('✅ اپ نصب شد'); }
      else toast('لغو شد');
      deferredPrompt = null;
    } catch (err) { toast('خطا در نصب'); }
    return;
  }
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edg|OPR/.test(ua);
  let msg = '';
  if (isIOS) msg = '📲 iPhone:\n\n۱. دکمه Share\n۲. Add to Home Screen\n۳. Add';
  else if (isAndroid && isChrome) msg = '📲 Android:\n\n۱. منوی ۳ نقطه Chrome\n۲. Install app یا Add to Home screen';
  else if (isAndroid) msg = '📲 با Chrome باز کن و Install app رو بزن';
  else msg = 'از منوی مرورگر، Install رو بزن.';
  alert(msg);
  updatePwaStatus('ℹ️ راهنما نمایش داده شد');
}

window.addEventListener('appinstalled', () => {
  toast('🎉 اپ نصب شد!');
  updatePwaStatus('✅ اپ نصب شد');
  deferredPrompt = null;
});
function updatePwaStatus(text) { const el = document.getElementById('pwaStatus'); if (el) el.textContent = text; }
function checkPwaStatus() {
  if (isStandalone()) { updatePwaStatus('✅ در حالت PWA اجرا می‌شه'); return; }
  if (deferredPrompt) { updatePwaStatus('✅ آماده نصب'); return; }
  if (swReady) { updatePwaStatus('✅ Service Worker فعال'); return; }
  updatePwaStatus('⏳ در حال بررسی...');
}

// ============= تقویم =============
function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
  let jy = (gy <= 1600) ? 0 : 979; gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365*gy) + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) - 80 + gd + g_d_m[gm-1];
  jy += 33 * Math.floor(days/12053); days %= 12053;
  jy += 4 * Math.floor(days/1461); days %= 1461;
  if (days > 365) { jy += Math.floor((days-1)/365); days = (days-1)%365; }
  const jm = (days < 186) ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
  const jd = 1 + ((days < 186) ? (days%31) : ((days-186)%30));
  return [jy, jm, jd];
}
function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + (365*jy) + (Math.floor(jy/33)*8) + Math.floor(((jy%33)+3)/4) + jd + ((jm<7) ? (jm-1)*31 : ((jm-7)*30)+186);
  let gy = 400 * Math.floor(days/146097); days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days/36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days/1461); days %= 1461;
  if (days > 365) { gy += Math.floor((days-1)/365); days = (days-1)%365; }
  let gd = days + 1;
  const sal_a = [0,31,(gy%4===0 && gy%100!==0)||(gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
  let gm;
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return [gy, gm, gd];
}
function jalaliDaysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const r = jy % 33;
  return [1,5,9,13,17,22,26,30].includes(r) ? 30 : 29;
}
const JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const WEEK_DAYS_FA = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
const WEEK_DAYS_SHORT = ['ی','د','س','چ','پ','ج','ش'];
function getShamsi(d) {
  const dt = d || new Date();
  const [jy, jm, jd] = gregorianToJalali(dt.getFullYear(), dt.getMonth()+1, dt.getDate());
  return {y: jy, m: jm, d: jd, monthName: JALALI_MONTHS[jm-1], dayName: WEEK_DAYS_FA[dt.getDay()], jsDay: dt.getDay()};
}


// ============ CUSTOM JALALI DATE PICKER ============
window.JalaliPicker = {
    currentY: 0, currentM: 0,
    targetInput: null,
    open: function(inputEl) {
        this.targetInput = inputEl;
        const todaySh = getShamsi();
        this.currentY = todaySh.y;
        this.currentM = todaySh.m;
        document.getElementById('jalaliModal').classList.add('active');
        this.render();
    },
    close: function() { document.getElementById('jalaliModal').classList.remove('active'); },
    prevMonth: function() {
        this.currentM--;
        if (this.currentM < 1) { this.currentM = 12; this.currentY--; }
        this.render();
    },
    nextMonth: function() {
        this.currentM++;
        if (this.currentM > 12) { this.currentM = 1; this.currentY++; }
        this.render();
    },
    render: function() {
        const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
        document.getElementById('jpTitle').textContent = months[this.currentM - 1] + ' ' + fa(this.currentY);
        
        const daysInMonth = jalaliDaysInMonth(this.currentY, this.currentM);
        // پیدا کردن روز هفته اول ماه
        const firstDayG = jalaliToGregorian(this.currentY, this.currentM, 1);
        const firstDayDate = new Date(firstDayG[0], firstDayG[1]-1, firstDayG[2]);
        const startDayOfWeek = (firstDayDate.getDay() + 1) % 7; // شنبه=0، یکشنبه=1 ...
        
        let html = '';
        const wDays = ['ش','ی','د','س','چ','پ','ج'];
        wDays.forEach(d => html += '<div class="jp-day-name">' + d + '</div>');
        
        for (let i = 0; i < startDayOfWeek; i++) html += '<div class="jp-day empty"></div>';
        
        const today = getShamsi();
        let selectedStr = this.targetInput ? this.targetInput.value : '';
        
        for (let d = 1; d <= daysInMonth; d++) {
            let cls = 'jp-day';
            if (this.currentY === today.y && this.currentM === today.m && d === today.d) cls += ' today';
            
            // بررسی انتخاب شده بودن
            const thisDateStr = this.currentY + '-' + pad2(this.currentM) + '-' + pad2(d);
            if (selectedStr === thisDateStr) cls += ' selected';
            
            html += '<div class="' + cls + '" onclick="JalaliPicker.select(' + d + ')">' + fa(d) + '</div>';
        }
        document.getElementById('jpGrid').innerHTML = html;
    },
    select: function(d) {
        const dateStr = this.currentY + '-' + pad2(this.currentM) + '-' + pad2(d);
        if (this.targetInput) this.targetInput.value = dateStr;
        this.close();
        // اگر ورودی مربوط به جلسات است، تاریخ پیش‌فرض رو ست کن
        if (this.targetInput.id === 'exDate') document.getElementById('exDate').focus();
    }
};

// ============ GLOBAL REFRESH (اتصال همه بخش‌ها) ============
function refreshAppData() {
    try { if (typeof renderTodayTotal === 'function') renderTodayTotal(); } catch(e){}
    try { if (typeof updateLauncherWidget === 'function') updateLauncherWidget(); } catch(e){}
    try { if (typeof scanDeficits === 'function') scanDeficits(); } catch(e){}
    try { if (typeof renderMakeupCard === 'function') renderMakeupCard(); } catch(e){}
    try { if (typeof renderStats === 'function') renderStats(); } catch(e){}
    try { if (typeof renderNow === 'function') renderNow(); } catch(e){}
    try { if (typeof renderTodaySchedule === 'function') renderTodaySchedule(); } catch(e){}
    try { if (typeof renderExams === 'function') renderExams(); } catch(e){}
    try { if (typeof renderSessions === 'function') renderSessions(); } catch(e){}
    console.log('🔄 تمام داده‌ها و ویجت‌ها آپدیت شدند.');
}

// ============= داده‌ها =============



const SCHOOL_SCHEDULE = { 
  6: ['جغرافیا', 'فارسی', 'نگارش', 'شیمی'], // شنبه
  0: ['ریاضی', 'تفکر', 'فیزیک', 'آمادگی دفاعی'], // یکشنبه
  1: ['دینی', 'شیمی', 'زبان', 'آزمایشگاه'],
  2: ['فیزیک', 'هندسه', 'عربی', 'ریاضی'],
  3: [], // چهارشنبه تعطیل است
  4: [], // پنجشنبه تعطیل
  5: []  // جمعه تعطیل
};
const SUBJECT_ICONS = {'هندسه':'📏','دفاعی':'🛡','فارسی':'📜','شیمی':'🧪','آزمایشگاه':'🔬','فیزیک':'⚛️','نگارش':'✍️','ریاضی':'📐','جغرافیا':'🌍','دینی':'📖','زبان':'🌐','عربی':'🕌','ورزش':'⚽','تفکر':'💭','انگلیسی':'🌐'};
const ALL_SUBJECTS = ['ریاضی','فیزیک','هندسه','شیمی','عربی','زبان','فارسی','نگارش','جغرافیا','دینی','تفکر','دفاعی','آزمایشگاه'];







const SCHOOL_SUBJECTS = SCHOOL_SCHEDULE;
const ALL_SUBJECTS_LIST = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'نگارش', 'جغرافیا', 'دینی', 'تفکر', 'آمادگی دفاعی', 'آزمایشگاه'];

const SCHEDULE = (function() {
  const sched = {};
  const minToTime = (m) => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');

  function getIcon(subj) {
      return (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[subj]) ? SUBJECT_ICONS[subj] : '📖';
  }

  for (let day = 0; day <= 6; day++) {
    sched[day] = [];
    const isSchool = [6, 0, 1, 2].includes(day); 
    const hasGym = [6, 1, 3].includes(day); 
    
    let queue = [...(SCHOOL_SUBJECTS[day] || [])];
    (SCHOOL_SUBJECTS[(day+1)%7] || []).forEach(s => { if(!queue.includes(s)) queue.push(s); });
    ALL_SUBJECTS_LIST.forEach(s => { if(!queue.includes(s)) queue.push(s); });

    if (day === 3) queue = ['ریاضی', 'فیزیک', 'شیمی', 'هندسه', ...ALL_SUBJECTS_LIST];
    if (day === 5) queue = ['مرور آزمون', 'تحلیل آزمون', ...ALL_SUBJECTS_LIST];

    // شمارنده برای محدودیت ۲ بار تکرار در روز
    let counts = {};
    let qIdx = 0;

    function getNextSubject() {
        let attempts = 0;
        while(attempts < queue.length) {
            let subj = queue[qIdx % queue.length];
            qIdx++;
            if (!counts[subj] || counts[subj] < 2) {
                counts[subj] = (counts[subj] || 0) + 1;
                return subj;
            }
            attempts++;
        }
        return "مرور آزاد"; // در صورتی که همه درس‌ها ۲ بار تکرار شدند
    }

    function addStudyBlock(dayArr, tStart, tEnd) {
        let subj = getNextSubject();
        dayArr.push([tStart, tEnd, 'پیشنهاد: ' + subj, "study", getIcon(subj)]);
    }

    function addRestBlock(dayArr, tStart, tEnd) {
        dayArr.push([tStart, tEnd, 'استراحت', "rest", "☕"]);
    }

    if (isSchool) {
       sched[day].push(["06:30","07:00","بیداری، صبحانه","wake","🌅"]);
       sched[day].push(["07:00","14:00","مدرسه","school","🏫"]);
       sched[day].push(["14:00","15:00","ناهار و استراحت","rest","🍽"]);
       
       if (hasGym) {
           addStudyBlock(sched[day], "15:00","15:40");
           addRestBlock(sched[day], "15:40","16:00");
           addStudyBlock(sched[day], "16:00","16:40");
           addRestBlock(sched[day], "16:40","17:00");
           sched[day].push(["17:00","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           addStudyBlock(sched[day], "20:45","21:25");
           addRestBlock(sched[day], "21:25","21:45");
       } else {
           addStudyBlock(sched[day], "15:00","15:40");
           addRestBlock(sched[day], "15:40","16:00");
           addStudyBlock(sched[day], "16:00","16:40");
           addRestBlock(sched[day], "16:40","17:00");
           addStudyBlock(sched[day], "17:00","17:40");
           addRestBlock(sched[day], "17:40","18:00");
           addStudyBlock(sched[day], "18:00","18:40");
           addRestBlock(sched[day], "18:40","19:00");
           addStudyBlock(sched[day], "19:00","19:40");
           addRestBlock(sched[day], "19:40","20:00");
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           addStudyBlock(sched[day], "20:45","21:25");
           addRestBlock(sched[day], "21:25","21:45");
       }
       sched[day].push(["21:45","22:00", 'آماده‌سازی خواب', "rest", "🛌"]);
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);
    } else {
       if (day === 5) { // جمعه
           sched[day].push(["06:30","07:00","آماده‌سازی آزمون","wake","🌅"]);
           sched[day].push(["07:00","11:00","آزمون ماز","school","📝"]);
           sched[day].push(["11:00","13:00","استراحت","rest","☕"]);
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           for(let h=14; h<20; h++) {
               addStudyBlock(sched[day], minToTime(h*60), minToTime(h*60+40));
               addRestBlock(sched[day], minToTime(h*60+40), minToTime(h*60+60));
           }
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           addStudyBlock(sched[day], "20:45","21:25");
           addRestBlock(sched[day], "21:25","21:45");
       } 
       else if (day === 3) { // چهارشنبه
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           for(let h=9; h<13; h++) {
               addStudyBlock(sched[day], minToTime(h*60), minToTime(h*60+40));
               addRestBlock(sched[day], minToTime(h*60+40), minToTime(h*60+60));
           }
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           for(let h=14; h<16; h++) {
               addStudyBlock(sched[day], minToTime(h*60), minToTime(h*60+40));
               addRestBlock(sched[day], minToTime(h*60+40), minToTime(h*60+60));
           }
           sched[day].push(["16:00","17:30","کلاس رباتیک","study","🤖"]);
           sched[day].push(["17:30","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           addStudyBlock(sched[day], "20:45","21:25");
           addRestBlock(sched[day], "21:25","21:45");
       } 
       else { // پنجشنبه
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           for(let h=9; h<13; h++) {
               addStudyBlock(sched[day], minToTime(h*60), minToTime(h*60+40));
               addRestBlock(sched[day], minToTime(h*60+40), minToTime(h*60+60));
           }
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           for(let h=14; h<20; h++) {
               addStudyBlock(sched[day], minToTime(h*60), minToTime(h*60+40));
               addRestBlock(sched[day], minToTime(h*60+40), minToTime(h*60+60));
           }
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           addStudyBlock(sched[day], "20:45","21:25");
           addRestBlock(sched[day], "21:25","21:45");
       }
       sched[day].push(["21:45","22:00", 'آماده‌سازی خواب', "rest", "🛌"]);
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);
    }
  }
  return sched;
})();




const PHASES = {
  1:{title:'جلو افتادن',icon:'⚡',goals:['تعطیلات: ۳ تا ۴ ساعت','پیش‌خوانی نیمسال دوم','مرور سبک نیمسال اول','از مدرسه جلوتری']},
  2:{title:'تثبیت',icon:'💪',goals:['روزی ۳ تا ۴ ساعت','تست‌زنی جدی','هفته‌ای یک آزمون','رفع ضعف‌ها']},
  3:{title:'امتحانات پایان سال',icon:'🏆',goals:['مرور همه چیز','نمونه سوال','دفتر اشتباهات','خواب کافی']},
  4:{title:'جمع‌بندی تیر',icon:'🌞',goals:['استراحت','مرور سبک','یادگیری هک','کتاب غیردرسی']},
  5:{title:'مرداد — پیش‌خوانی',icon:'🌻',goals:['پیش‌خوانی یازدهم','مرور ریاضی دهم','روزی ۱ ساعت انگلیسی','برنامه‌نویسی']},
  6:{title:'شهریور — آماده‌سازی',icon:'🎒',goals:['مرور ریاضی و فیزیک','پیش‌خوانی عربی','تنظیم خواب','خرید منابع']},
  7:{title:'مهر — عادت‌سازی',icon:'🌱',goals:['هفته ۱: ۹۰ دقیقه','هفته ۲: ۲ ساعت','هفته ۳: ۲.۵ ساعت','هفته ۴: ۳ ساعت']},
  8:{title:'آبان — ثبات',icon:'🌿',goals:['روزی ۳ ساعت','مرور فاصله‌دار','بدون عقب‌افتادگی','دفتر اشتباهات']},
  9:{title:'آذر — آماده میان‌ترم',icon:'📝',goals:['روزی ۳ ساعت + تست','۲ هفته آخر','نمونه سوال','دفتر اشتباهات']},
  10:{title:'دی — آماده پایان‌ترم',icon:'🎯',goals:['روزی ۳ تا ۳.۵ ساعت','مرور کل نیمسال','نمونه سوال','خواب + تغذیه']},
  11:{title:'بهمن — جمع‌بندی',icon:'📊',goals:['روزی ۲.۵ تا ۳ ساعت','مرور ضعف‌ها','پیش‌خوانی نیمسال دوم','استراحت']},
  12:{title:'اسفند — پیش به جلو',icon:'🚀',goals:['روزی ۳ تا ۳.۵ ساعت','جلو برو','تست‌زنی','برنامه نوروز']}
};

const EXAMS = {
  schoolStart: { name: 'شروع مدرسه', jy: 1405, jm: 7, jd: 4 },
  midterm: { name: 'میان‌ترم', jy: 1405, jm: 9, jd: 15 },
  final: { name: 'پایان‌ترم', jy: 1405, jm: 10, jd: 20 }
};
function examDateToGregorian(exam) { const [gy, gm, gd] = jalaliToGregorian(exam.jy, exam.jm, exam.jd); return new Date(gy, gm-1, gd, 0, 0, 0); }

function isSchoolStarted() {
  try {
    const schoolStart = examDateToGregorian(EXAMS.schoolStart);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return now >= schoolStart;
  } catch(e) { return true; }
}
function daysUntilSchool() {
  try {
    const schoolStart = examDateToGregorian(EXAMS.schoolStart);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((schoolStart - now) / 86400000));
  } catch(e) { return 0; }
}

// ============= فاز عادت‌سازی (۴ هفته اول مدرسه) =============
const HABIT_WEEKS = { 1: 90, 2: 120, 3: 150, 4: 180 };

function getSchoolWeekNumber() {
  try {
    const schoolStart = examDateToGregorian(EXAMS.schoolStart);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now - schoolStart) / 86400000);
    if (diffDays < 0) return 0;
    return Math.floor(diffDays / 7) + 1;
  } catch(e) { return 99; }
}

function getHabitStudyCap() {
  const week = getSchoolWeekNumber();
  if (week >= 1 && week <= 4) return HABIT_WEEKS[week];
  return null;
}

function minToTime(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)}`;
}

function getAdjustedSchedule(day) {
  let list = SCHEDULE[day] || [];
  if (!isSchoolStarted()) list = list.filter(x => x[3] !== 'school');
  const cap = getHabitStudyCap();
  if (cap === null) return list;
  const totalStudy = list.filter(x => x[3] === 'study')
    .reduce((sum, x) => sum + (timeToMin(x[1]) - timeToMin(x[0])), 0);
  if (totalStudy <= cap) return list;
  const newList = [];
  let accumulated = 0;
  let done = false;
  for (const x of list) {
    if (x[3] !== 'study') { newList.push(x); continue; }
    if (done) continue;
    const dur = timeToMin(x[1]) - timeToMin(x[0]);
    if (accumulated + dur <= cap) {
      newList.push(x);
      accumulated += dur;
    } else {
      const remaining = cap - accumulated;
      if (remaining >= 15) {
        const newEn = minToTime(timeToMin(x[0]) + remaining);
        newList.push([x[0], newEn, x[2], x[3], x[4]]);
        accumulated = cap;
      }
      done = true;
    }
  }
  return newList;
}

// ============= ساعت و فعالیت =============
function updateClock() {
  const now = new Date();
  const lt = document.getElementById('liveTime');
  const ld = document.getElementById('liveDate');
  if (lt) lt.textContent = `${fa(pad2(now.getHours()))}:${fa(pad2(now.getMinutes()))}:${fa(pad2(now.getSeconds()))}`;
  if (ld) { const sh = getShamsi(); ld.textContent = `${sh.dayName} — ${fa(sh.d)} ${sh.monthName} ${fa(sh.y)}`; }
}
function getCurrent() {
  const now = new Date();
  const curMin = now.getHours()*60 + now.getMinutes();
  const day = now.getDay();
  const list = getAdjustedSchedule(day);
  for (let i = 0; i < list.length; i++) {
    const [st, en, task, kind, icon] = list[i];
    const s = timeToMin(st), e = timeToMin(en);
    if (curMin >= s && curMin < e) {
      return {item:{st,en,task,kind,icon}, progress:(curMin-s)/(e-s), remaining:e-curMin,
              next: list[i+1] ? {st:list[i+1][0],en:list[i+1][1],task:list[i+1][2],kind:list[i+1][3],icon:list[i+1][4]} : null};
    }
  }
  return null;
}

// ============= راهنمای مطالعه =============
const SUBJECT_GUIDES = {
  math: {
    icon:'📐', color:'#e74c3c', name:'ریاضی',
    subtitle:'کتاب اول، ویدیو فقط اگه گیر کردی',
    ratio:{book:70, video:30}, time:90,
    steps:[
      '<b>۵ دقیقه:</b> فصل رو ورق بزن، ببین چه چیزایی قراره یاد بگیری',
      '<b>۱۰ دقیقه:</b> تعریف‌ها و فرمول‌های اصلی رو تو دفتر فرمول بنویس',
      '<b>۱۵ دقیقه:</b> مثال‌های حل‌شده کتاب رو با دقت بخون (خیلی مهم!)',
      '<b>۳۰ دقیقه:</b> خودت ۵ تا تمرین حل کن، بدون نگاه کردن به حل',
      '<b>۱۰ دقیقه:</b> اگه جایی گیر کردی، ویدیوی همون قسمت رو ببین',
      '<b>۱۵ دقیقه:</b> اشتباهاتت رو تو دفتر اشتباهات بنویس',
      '<b>۵ دقیقه:</b> با زبان خودت بگو «امروز چی یاد گرفتم»'
    ],
    tips:[
      '💡 ریاضی با حل کردن یاد می‌گیری نه با خوندن. حداقل ۶۰٪ وقتت باید تمرین باشه.',
      '💡 اگه یه تمرین رو بعد ۱۰ دقیقه نتونستی، جوابش رو ببین، ۳ روز بعد دوباره خودت حل کن.',
      '💡 فرمول‌ها رو حفظ نکن، بفهم از کجا اومدن.'
    ]
  },
  geometry: {
    icon:'📏', color:'#9b59b6', name:'هندسه',
    subtitle:'با شکل کشیدن یاد می‌گیری',
    ratio:{book:60, video:40}, time:75,
    steps:[
      '<b>۵ دقیقه:</b> شکل‌های کتاب رو نگاه کن، ببین قراره چی رو ثابت کنی',
      '<b>۱۵ دقیقه:</b> قضیه رو با دقت بخون، <b>خودت شکلش رو بکش</b>',
      '<b>۱۰ دقیقه:</b> اثبات رو با شکل دنبال کن، مرحله به مرحله',
      '<b>۲۵ دقیقه:</b> ۳ تا تمرین حل کن، هر کدوم با شکل جدا',
      '<b>۱۰ دقیقه:</b> اگه گیر کردی ویدیو ببین، ولی اول خودت تلاش کن',
      '<b>۱۰ دقیقه:</b> خلاصه قضیه رو با شکل تو دفتر بنویس'
    ],
    tips:[
      '💡 هندسه بدون شکل مثل ریاضی بدون فرموله.',
      '💡 هر قضیه رو با یه شکل رنگی بکش، خیلی بهتر یادت میمونه.',
      '💡 اثبات‌ها رو با کلمات خودت بنویس، نه کپی از کتاب.'
    ]
  },
  physics: {
    icon:'⚛️', color:'#3498db', name:'فیزیک',
    subtitle:'اول ویدیو، بعد کتاب (چون مفهومی‌ست)',
    ratio:{book:50, video:50}, time:90,
    steps:[
      '<b>۱۵ دقیقه:</b> ویدیوی مبحث رو ببین (مفهوم کلی رو بگیر)',
      '<b>۱۰ دقیقه:</b> کتاب رو بخون، فرمول‌های اصلی رو جدا کن',
      '<b>۱۵ دقیقه:</b> مثال‌های حل‌شده رو با دقت دنبال کن',
      '<b>۳۰ دقیقه:</b> خودت ۴-۵ مسئله حل کن',
      '<b>۱۵ دقیقه:</b> یه آزمایش ذهنی بساز: «اگه این‌طور می‌شد چی می‌شد؟»',
      '<b>۵ دقیقه:</b> فرمول‌ها رو تو دفتر فرمول بنویس'
    ],
    tips:[
      '💡 فیزیک با تصویرسازی ذهنی یاد می‌گیری. هر مسئله رو تصور کن.',
      '💡 واحدها رو حتماً تو حل بنویس، نصف اشتباهات از واحدهاست.',
      '💡 قانون‌ها رو حفظ نکن، ببین از کجا اومدن.'
    ]
  },
  chemistry: {
    icon:'🧪', color:'#16a085', name:'شیمی',
    subtitle:'ویدیو برای واکنش‌ها، کتاب برای جزئیات',
    ratio:{book:60, video:40}, time:75,
    steps:[
      '<b>۱۵ دقیقه:</b> ویدیوی واکنش‌ها یا مبحث رو ببین',
      '<b>۱۵ دقیقه:</b> کتاب رو بخون، مفاهیم کلیدی رو هایلایت کن',
      '<b>۱۵ دقیقه:</b> یه جدول برای واکنش‌ها بکش (واکنش‌دهنده → فرآورده)',
      '<b>۲۰ دقیقه:</b> تمرین‌های کتاب رو حل کن',
      '<b>۱۰ دقیقه:</b> جدول رو یه بار از حفظ بنویس'
    ],
    tips:[
      '💡 شیمی پر از جزئیاته، جدول و نمودار خیلی کمکت می‌کنه.',
      '💡 هر واکنش رو با تصویر ذهنی بساز (رنگ، بو، صدا).',
      '💡 موازنه رو روزی ۲-۳ تا تمرین کن، ملکه ذهنت می‌شه.'
    ]
  },
  arabic: {
    icon:'🕌', color:'#f39c12', name:'عربی',
    subtitle:'کتاب برای متن، ویدیو برای قواعد',
    ratio:{book:75, video:25}, time:60,
    steps:[
      '<b>۱۵ دقیقه:</b> متن درس رو با معنی بخون',
      '<b>۱۰ دقیقه:</b> لغت‌های جدید رو تو فلش‌کارت لایتنر ثبت کن',
      '<b>۱۵ دقیقه:</b> قواعد درس رو با ویدیو یا کتاب یاد بگیر',
      '<b>۱۵ دقیقه:</b> ۵ تا تمرین قواعد حل کن',
      '<b>۵ دقیقه:</b> فلش‌کارت‌های امروز رو یه دور مرور کن'
    ],
    tips:[
      '💡 عربی با تکرار یاد می‌گیری. هر روز حتی ۱۰ دقیقه بهتر از هفته‌ای ۲ ساعته.',
      '💡 لغت‌ها رو تو جمله یاد بگیر، نه تنها.',
      '💡 قواعد رو با کورنل بنویس: راست توضیح، چپ سوال.'
    ]
  },
  english: {
    icon:'🌐', color:'#27ae60', name:'زبان انگلیسی',
    subtitle:'لغت با فلش‌کارت، گرامر با کورنل',
    ratio:{book:75, video:25}, time:60,
    steps:[
      '<b>۱۰ دقیقه:</b> لغت‌های جدید درس رو استخراج کن',
      '<b>۱۵ دقیقه:</b> لغت‌ها رو تو فلش‌کارت لایتنر ثبت کن + یه جمله بساز',
      '<b>۱۵ دقیقه:</b> Reading کتاب رو با معنی بخون',
      '<b>۱۰ دقیقه:</b> گرامر رو با کورنل خلاصه کن',
      '<b>۱۰ دقیقه:</b> یه پاراگراف کوتاه با لغت‌های امروز بنویس'
    ],
    tips:[
      '💡 انگلیسی با استفاده یاد می‌گیری، نه با حفظ کردن.',
      '💡 روزی ۵-۱۰ لغت با فلش‌کارت، بهتر از ۵۰ لغت یه روزه.',
      '💡 فیلم و آهنگ با زیرنویس انگلیسی خیلی کمکت می‌کنه.'
    ]
  },
  persian: {
    icon:'📜', color:'#c0392b', name:'فارسی',
    subtitle:'فقط کتاب، ولی درست',
    ratio:{book:100, video:0}, time:60,
    steps:[
      '<b>۱۵ دقیقه:</b> متن درس رو با دقت بخون',
      '<b>۱۰ دقیقه:</b> آرایه‌های ادبی رو پیدا کن و بنویس',
      '<b>۱۰ دقیقه:</b> معنی لغت‌های سخت رو جدا کن',
      '<b>۱۵ دقیقه:</b> دستور زبان رو با کورنل خلاصه کن',
      '<b>۱۰ دقیقه:</b> یه نقشه ذهنی برای آرایه‌های درس بکش'
    ],
    tips:[
      '💡 آرایه‌های ادبی رو با مثال یاد بگیر، نه با تعریف.',
      '💡 دستور رو با کورنل بنویس، خیلی سریع‌تر مرور می‌شه.',
      '💡 معنی لغت‌ها رو تو جمله یاد بگیر.'
    ]
  },
  religion: {
    icon:'📖', color:'#7f8c8d', name:'دینی',
    subtitle:'فقط کتاب، با دقت',
    ratio:{book:100, video:0}, time:45,
    steps:[
      '<b>۱۵ دقیقه:</b> درس رو با دقت بخون',
      '<b>۱۰ دقیقه:</b> مفاهیم اصلی رو خلاصه کن',
      '<b>۱۰ دقیقه:</b> سوال‌های آخر درس رو جواب بده',
      '<b>۱۰ دقیقه:</b> مفاهیم کلیدی رو با نقشه ذهنی بکش'
    ],
    tips:[
      '💡 دینی رو با معنی بخون، نه فقط برای امتحان.',
      '💡 مثال‌های واقعی از زندگی خودت بساز.'
    ]
  },
  geography: {
    icon:'🌍', color:'#16a085', name:'جغرافیا',
    subtitle:'نقشه + خلاصه',
    ratio:{book:100, video:0}, time:45,
    steps:[
      '<b>۱۵ دقیقه:</b> متن درس رو بخون',
      '<b>۱۵ دقیقه:</b> نقشه‌ها و نمودارها رو با دقت ببین',
      '<b>۱۰ دقیقه:</b> خلاصه رو با کلمات خودت بنویس',
      '<b>۵ دقیقه:</b> ۵ تا سوال کلیدی از خودت بپرس'
    ],
    tips:[
      '💡 جغرافیا با دیدن یاد می‌گیری، از نقشه زیاد استفاده کن.',
      '💡 مکان‌ها رو با داستان یاد بگیر.'
    ]
  },
  writing: {
    icon:'✍️', color:'#3498db', name:'نگارش',
    subtitle:'تمرین + خلاقیت',
    ratio:{book:80, video:20}, time:45,
    steps:[
      '<b>۱۰ دقیقه:</b> متن نمونه رو بخون و ساختارش رو ببین',
      '<b>۲۰ دقیقه:</b> خودت یه متن کوتاه بنویس',
      '<b>۱۰ دقیقه:</b> متن رو با نمونه مقایسه کن',
      '<b>۵ دقیقه:</b> اشتباهات رو یادداشت کن'
    ],
    tips:[
      '💡 نوشتن مثل ورزشه، هر روز تمرین لازمه.',
      '💡 یه دفترچه برای ایده‌های خوب داشته باش.'
    ]
  },
  review: {
    icon:'📓', color:'#9b59b6', name:'مرور',
    subtitle:'مرور فاصله‌دار',
    ratio:{book:100, video:0}, time:60,
    steps:[
      '<b>۱۰ دقیقه:</b> خلاصه‌های قبلی رو یه دور بخون',
      '<b>۱۵ دقیقه:</b> فلش‌کارت‌های لایتنر رو مرور کن',
      '<b>۱۵ دقیقه:</b> دفتر اشتباهات رو نگاه کن',
      '<b>۱۵ دقیقه:</b> ۳ تا سوال سخت از خودت بپرس',
      '<b>۵ دقیقه:</b> هر چی یادت نیومد رو علامت بزن برای مرور بعدی'
    ],
    tips:[
      '💡 مرور کوتاه و زیاد، بهتر از مرور بلند و کم.',
      '💡 مرور قبل خواب، بهترین زمانه.'
    ]
  },
  homework: {
    icon:'✍️', color:'#f59e0b', name:'تکالیف',
    subtitle:'سریع و با تمرکز',
    ratio:{book:100, video:0}, time:45,
    steps:[
      '<b>۵ دقیقه:</b> لیست تکالیف رو بنویس، از سخت به آسون',
      '<b>۳۰ دقیقه:</b> با تمرکز کامل انجام بده (گوشی بیرون!)',
      '<b>۵ دقیقه:</b> یه بار چک کن',
      '<b>۵ دقیقه:</b> سوال‌های سخت رو علامت بزن برای سوال از معلم'
    ],
    tips:[
      '💡 تکالیف رو تو خونه انجام نده، تو راه یا وقت مرده.',
      '💡 ۲۵ دقیقه تمرکز + ۵ دقیقه استراحت.'
    ]
  },
  school: {
    icon:'🏫', color:'#805ad5', name:'مدرسه',
    subtitle:'فعال گوش کن، جزوه بنویس',
    ratio:{book:100, video:0}, time:0,
    steps:[
      '<b>قبل از کلاس:</b> یه نگاه به درس جدید بنداز',
      '<b>سر کلاس:</b> جزوه کورنل بکش (راست: یادداشت، چپ: سوال)',
      '<b>سر کلاس:</b> سوال بپرس اگه نفهمیدی',
      '<b>بعد از کلاس:</b> یه بار تو راه خونه مرور کن',
      '<b>آخر شب:</b> خلاصه بنویس'
    ],
    tips:[
      '💡 سر کلاس تمرکز کامل، بهترین صرفه‌جویی زمانه.',
      '💡 گوشی رو تو کوله‌ات بذار، نه تو جیبت.'
    ]
  },
  morning: {
    icon:'🌅', color:'#f6ad55', name:'شروع روز',
    subtitle:'با انرژی شروع کن',
    ratio:{book:100, video:0}, time:0,
    steps:[
      '<b>بیداری:</b> بلافاصله بلند شو، گوشی نگاه نکن',
      '<b>۵ دقیقه:</b> یه لیوان آب بخور',
      '<b>۱۵ دقیقه:</b> صبحانه پروتئینی (تخم‌مرغ، پنیر، گردو)',
      '<b>۵ دقیقه:</b> برنامه امروز رو یه نگاه بنداز',
      '<b>۵ دقیقه:</b> کوتاه مرور کن (لغت، فرمول)'
    ],
    tips:[
      '💡 صبح‌ها ذهنت آماده‌تره، ازش برای سخت‌ترین کارها استفاده کن.',
      '💡 گوشی رو یک ساعت اول روز نگاه نکن.'
    ]
  },
  meal: {
    icon:'🍽', color:'#48bb78', name:'وعده غذایی',
    subtitle:'با آرامش، بدون گوشی',
    ratio:{book:100, video:0}, time:0,
    steps:[
      'با آرامش غذا بخور، تند نخور',
      'گوشی و تلویزیون رو خاموش کن',
      'اگه می‌تونی با خانواده باش',
      '۱۵ دقیقه بعد غذا استراحت کن'
    ],
    tips:[
      '💡 تغذیه خوب = تمرکز بالا. پروتئین و سبزیجات فراموش نشه.',
      '💡 آب زیاد بخور، مخصوصاً قبل از مطالعه.'
    ]
  },
  break: {
    icon:'☕', color:'#48bb78', name:'استراحت',
    subtitle:'درست و کوتاه',
    ratio:{book:100, video:0}, time:0,
    steps:[
      '<b>۵-۱۵ دقیقه:</b> از جات بلند شو، چند قدم برو',
      '<b>آب بخور</b> و به پنجره نگاه کن (چشمت استراحت کنه)',
      '<b>گوشی رو چک نکن</b> (بیشتر خسته‌ات می‌کنه)',
      'وقتی وقت تموم شد، بلافاصله برگرد سر کار'
    ],
    tips:[
      '💡 استراحت طولانی‌تر از ۱۵ دقیقه، تمرکزت رو می‌بره.',
      '💡 تو استراحت مدیتیشن کوتاه یا تنفس عمیق خیلی خوبه.'
    ]
  },
  gym: {
    icon:'🥊', color:'#ed8936', name:'باشگاه',
    subtitle:'بدن سالم، ذهن فعال',
    ratio:{book:100, video:0}, time:0,
    steps:[
      '<b>۵ دقیقه:</b> گرم کردن',
      '<b>تمام مدت:</b> تمرکز روی تمرین، نه گوشی',
      '<b>آب کافی</b> بخور',
      '<b>سرد کردن</b> فراموش نشه',
      '<b>بعد:</b> پروتئین بخور (شیر، تخم‌مرغ)'
    ],
    tips:[
      '💡 ورزش منظم، حافظه و تمرکز رو ۲۰-۳۰٪ بهتر می‌کنه.',
      '💡 باشگاه ساعت خوابت رو هم تنظیم می‌کنه.'
    ]
  },
  sleep: {
    icon:'😴', color:'#718096', name:'خواب',
    subtitle:'کیفیت مهم‌تر از کمیت',
    ratio:{book:100, video:0}, time:0,
    steps:[
      '<b>۳۰ دقیقه قبل:</b> گوشی و صفحه رو بذار کنار',
      '<b>۱۵ دقیقه:</b> یه مرور سبک (فلش‌کارت، خلاصه)',
      '<b>۱۰ دقیقه:</b> مسواک، دوش اگه نیازه',
      '<b>۵ دقیقه:</b> چند نفس عمیق، اتاق تاریک',
      '<b>ساعت خواب مشخص</b> — همیشه یه ساعت'
    ],
    tips:[
      '💡 ۷-۸ ساعت خواب، بهترین دوست حافظه‌اته.',
      '💡 مغز موقع خواب، درس‌های روز رو تثبیت می‌کنه.',
      '💡 صفحه گوشی قبل خواب = دشمن خواب عمیق.'
    ]
  }
};

function getGuideForTask(task, kind) {
  const t = (task || '').trim();
  if (t.includes('ریاضی')) return SUBJECT_GUIDES.math;
  if (t.includes('هندسه')) return SUBJECT_GUIDES.geometry;
  if (t.includes('فیزیک')) return SUBJECT_GUIDES.physics;
  if (t.includes('شیمی')) return SUBJECT_GUIDES.chemistry;
  if (t.includes('عربی')) return SUBJECT_GUIDES.arabic;
  if (t.includes('زبان') || t.includes('انگلیسی')) return SUBJECT_GUIDES.english;
  if (t.includes('فارسی')) return SUBJECT_GUIDES.persian;
  if (t.includes('دینی')) return SUBJECT_GUIDES.religion;
  if (t.includes('جغرافیا')) return SUBJECT_GUIDES.geography;
  if (t.includes('نگارش')) return SUBJECT_GUIDES.writing;
  if (t.includes('تکالیف') || t.includes('تکلیف')) return SUBJECT_GUIDES.homework;
  if (t.includes('مرور')) return SUBJECT_GUIDES.review;
  if (t.includes('مدرسه')) return SUBJECT_GUIDES.school;
  if (t.includes('بیداری') || t.includes('صبحانه')) return SUBJECT_GUIDES.morning;
  if (t.includes('ناهار') || t.includes('شام') || t.includes('دوش')) return SUBJECT_GUIDES.meal;
  if (t.includes('استراحت') || t.includes('آزاد')) return SUBJECT_GUIDES.break;
  if (t.includes('باشگاه')) return SUBJECT_GUIDES.gym;
  if (t.includes('خواب')) return SUBJECT_GUIDES.sleep;
  if (kind === 'school') return SUBJECT_GUIDES.school;
  if (kind === 'sleep') return SUBJECT_GUIDES.sleep;
  if (kind === 'rest') return SUBJECT_GUIDES.break;
  if (kind === 'sport') return SUBJECT_GUIDES.gym;
  if (kind === 'wake') return SUBJECT_GUIDES.morning;
  if (kind === 'study') return SUBJECT_GUIDES.review;
  return SUBJECT_GUIDES.review;
}

window._todayList = [];
window._fullList = [];

function showGuideItem(source, idx) {
  const list = source === 'today' ? window._todayList : window._fullList;
  const item = list[idx];
  if (!item) return;
  const [st, en, task, kind, icon] = item;
  openGuide(task, kind, st, en, icon);
}

function openGuide(task, kind, st, en, icon) {
  const g = getGuideForTask(task, kind);
  const overlay = document.getElementById('guideOverlay');
  const iconEl = document.getElementById('guideIcon');
  const titleEl = document.getElementById('guideTitle');
  const subEl = document.getElementById('guideSubtitle');
  const bodyEl = document.getElementById('guideBody');
  const footerEl = document.getElementById('guideFooter');

  iconEl.textContent = icon || g.icon || '📚';
  iconEl.style.background = `linear-gradient(135deg, ${g.color}, ${g.color}cc)`;
  titleEl.textContent = g.name;
  subEl.textContent = g.subtitle || 'راهنمای مطالعه';

  let html = '';
  if (st && en) {
    html += `<div class="guide-time-badge" style="background:linear-gradient(135deg,${g.color},${g.color}cc)">⏰ ${fa(st)} تا ${fa(en)}</div>`;
  }
  if (g.time) {
    html += `<div class="guide-stat-row">
      <div class="guide-stat"><div class="guide-stat-v">${fa(g.time)}</div><div class="guide-stat-l">دقیقه پیشنهادی</div></div>
      <div class="guide-stat"><div class="guide-stat-v">${fa(g.steps.length)}</div><div class="guide-stat-l">مرحله</div></div>
      <div class="guide-stat"><div class="guide-stat-v">${g.ratio ? fa(g.ratio.book) + '٪' : '۱۰۰٪'}</div><div class="guide-stat-l">کتاب</div></div>
    </div>`;
  }
  if (g.ratio && g.ratio.video > 0 && g.ratio.book > 0) {
    html += `<div class="guide-ratio">`;
    html += `<div class="guide-ratio-video" style="width:${g.ratio.video}%">ویدیو ${fa(g.ratio.video)}٪</div>`;
    html += `<div class="guide-ratio-book" style="width:${g.ratio.book}%">کتاب ${fa(g.ratio.book)}٪</div>`;
    html += `</div>`;
  }
  if (g.steps && g.steps.length) {
    html += `<div class="guide-section"><div class="guide-section-title">📋 مرحله به مرحله</div><ol class="guide-steps">`;
    g.steps.forEach(s => { html += `<li>${s}</li>`; });
    html += `</ol></div>`;
  }
  if (g.tips && g.tips.length) {
    html += `<div class="guide-section"><div class="guide-section-title">💡 نکته‌های کلیدی</div>`;
    g.tips.forEach(t => { html += `<div class="guide-tip">${t}</div>`; });
    html += `</div>`;
  }
  bodyEl.innerHTML = html;

  if (g.time && g.time > 0) {
    footerEl.innerHTML = `
      <button class="btn btn-secondary" onclick="closeGuide()">بستن</button>
      <button class="btn btn-primary" onclick="startSessionFromGuide('${esc(g.name)}', ${g.time})">▶ شروع (${fa(g.time)} دقیقه)</button>
    `;
  } else {
    footerEl.innerHTML = `<button class="btn btn-primary" onclick="closeGuide()">فهمیدم</button>`;
  }

  overlay.classList.add('active');
  bodyEl.scrollTop = 0;
}

function closeGuide() {
  document.getElementById('guideOverlay').classList.remove('active');
}

function startSessionFromGuide(name, minutes) {
  closeGuide();
  pTot = minutes * 60; pT = pTot;
  document.querySelectorAll('.pomo-mode').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.pomo-mode[data-m="${minutes}"]`);
  if (btn) btn.classList.add('active');
  updPom();
  const subjEl = document.getElementById('pomSubj');
  if (subjEl) subjEl.value = name;
  go('pomodoro');
  toast('▶ پومودورو ' + fa(minutes) + ' دقیقه برای ' + name);
}

// ============= رندر =============
function renderClasses() {
  const el = document.getElementById('classesContainer'); if (!el) return;
  if (!isSchoolStarted()) {
    const days = daysUntilSchool();
    el.innerHTML = `<div class="classes-card" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)">
      <div class="classes-title">🌞 تعطیلات تابستانی</div>
      <div class="classes-list"><span class="class-chip">${fa(days)} روز تا شروع مدرسه</span></div>
    </div>`;
    return;
  }
  const day = new Date().getDay();
  const classes = SCHOOL_SCHEDULE[day] || [];
  const dayName = WEEK_DAYS_FA[day];
  const chips = classes.length === 0 ? '<span class="class-chip off">🎉 امروز تعطیله!</span>' :
    classes.map(c => `<span class="class-chip" onclick="openGuide('${jsq(c)}','school','','','${SUBJECT_ICONS[c]||'📚'}')">${SUBJECT_ICONS[c]||'📚'} ${c}</span>`).join('');
  el.innerHTML = `<div class="classes-card"><div class="classes-title">🏫 کلاس‌های امروز (${dayName}) — برای راهنما کلیک کن</div><div class="classes-list">${chips}</div></div>`;
}

function renderNow() {
  const cur = getCurrent();
  const el = document.getElementById('nowContainer'); if (!el) return;
  const sh = getShamsi();
  const tn = document.getElementById('todayName'); if (tn) tn.textContent = sh.dayName;
  if (!cur) {
    el.innerHTML = `<div class="now-card" style="background:linear-gradient(135deg,#718096,#4a5568)"><div class="now-label"><span class="now-pulse"></span>الان</div><div class="now-task">😴 زمان استراحت / خواب</div><div class="now-time">برنامه‌ای نیست</div></div>`;
    return;
  }
  const {item, progress, remaining, next} = cur;
  const rtxt = remaining >= 60 ? `${fa(Math.floor(remaining/60))} ساعت و ${fa(remaining%60)} دقیقه` : `${fa(remaining)} دقیقه`;
  const pct = Math.round(progress*100);
  const nextHtml = next ? `<div class="next-card"><div class="next-label">⏭ بعدی</div><div class="next-task">${next.icon} ${esc(next.task)}</div><div class="next-time">${fa(next.st)} تا ${fa(next.en)}</div></div>` : `<div class="free-card">🌙 <b>آخرین فعالیت امروز</b></div>`;
  el.innerHTML = `<div class="now-card" style="cursor:pointer" onclick="openGuide('${esc(item.task)}','${item.kind}','${item.st}','${item.en}','${item.icon}')"><div class="now-label"><span class="now-pulse"></span>الان باید انجام بدی</div><div class="now-task">${item.icon} ${esc(item.task)}</div><div class="now-time">${fa(item.st)} تا ${fa(item.en)}</div><div class="now-progress"><div class="now-progress-fill" style="width:${pct}%"></div></div><div class="now-remaining">⏳ ${rtxt} مانده</div><div class="now-hint">👆 برای دیدن راهنما کلیک کن</div></div>${nextHtml}`;
}

function renderPhase() {
  const el = document.getElementById('phaseContainer'); if (!el) return;
  const sh = getShamsi();
  const phase = PHASES[sh.m] || {title:'—',icon:'📅',goals:[]};
  const daysInMonth = jalaliDaysInMonth(sh.y, sh.m);
  const pct = Math.round((sh.d / daysInMonth) * 100);
  el.innerHTML = `<div class="phase-hero"><div class="phase-month"><span>📅 ${sh.monthName} ${fa(sh.y)}</span><span>روز ${fa(sh.d)} از ${fa(daysInMonth)}</span></div><div class="phase-title"><span>${phase.icon}</span>${phase.title}</div><ul class="phase-goals">${phase.goals.map(g=>`<li>${g}</li>`).join('')}</ul><div class="phase-progress"><div class="phase-progress-fill" style="width:${pct}%"></div></div><div class="phase-footer">${fa(pct)}٪ از این ماه گذشته</div></div>`;
}

function renderCountdown() {
  const el = document.getElementById('countdownGrid'); if (!el) return;
  const now = Date.now();
  const items = [
    {exam: EXAMS.schoolStart, cls: 'school'},
    {exam: EXAMS.midterm, cls: 'midterm'},
    {exam: EXAMS.final, cls: 'final'}
  ];
  if (!el.dataset.built) {
    el.innerHTML = items.map(({exam, cls}) => {
      const target = examDateToGregorian(exam).getTime();
      const isSchool = exam.name === 'شروع مدرسه';
      const ended = target <= now;
      return `<div class="cd-card ${cls} ${ended?'ended':''}" data-target="${target}">
        <div class="cd-title">${esc(exam.name)}</div>
        ${ended ? `<div style="font-size:1.3em;margin:8px 0">✅</div><div class="cd-msg">${isSchool?'شروع شد':'گذشت'}</div>` :
        `<div class="cd-numbers">
          <div class="cd-num ${cls}"><div class="cd-num-v" data-i="0">۰</div><div class="cd-num-l">روز</div></div>
          <div class="cd-num ${cls}"><div class="cd-num-v" data-i="1">۰</div><div class="cd-num-l">ساعت</div></div>
          <div class="cd-num ${cls}"><div class="cd-num-v" data-i="2">۰</div><div class="cd-num-l">دقیقه</div></div>
          <div class="cd-num ${cls}"><div class="cd-num-v" data-i="3">۰</div><div class="cd-num-l">ثانیه</div></div>
        </div>
        <div class="cd-msg"></div>`}
        <div class="cd-date">${fa(exam.jd)} ${JALALI_MONTHS[exam.jm-1]}</div>
      </div>`;
    }).join('');
    el.dataset.built = '1';
  }
  el.querySelectorAll('.cd-card:not(.ended)').forEach(card => {
    const target = +card.dataset.target;
    const diff = target - now;
    if (diff <= 0) { card.classList.add('ended'); el.dataset.built = ''; renderCountdown(); return; }
    const vals = [Math.floor(diff/864e5), Math.floor(diff%864e5/36e5), Math.floor(diff%36e5/6e4), Math.floor(diff%6e4/1e3)];
    card.querySelectorAll('.cd-num-v').forEach((n, i) => { n.textContent = fa(vals[i]); });
    if (!card._msgTs || now - card._msgTs > 60000) {
      const days = vals[0];
      const msgEl = card.querySelector('.cd-msg');
      let msg = '', msgCls = '';
      if (days <= 3) { msg = '⏰ نزدیک!'; msgCls = 'warn'; }
      else if (days <= 14) { msg = '⚠️ جدی'; msgCls = 'warn'; }
      else if (days <= 30) { msg = '📚 آماده'; }
      else { msg = '✅ وقت داری'; msgCls = 'ok'; }
      msgEl.textContent = msg;
      msgEl.className = 'cd-msg ' + msgCls;
      card._msgTs = now;
    }
  });
}

function renderTodaySchedule() {
  const now = new Date();
  const curMin = now.getHours()*60 + now.getMinutes();
  const day = now.getDay();
  const list = getAdjustedSchedule(day);
  window._todayList = list;
  const el = document.getElementById('todaySchedule'); if (!el) return;
  if (!list.length) { el.innerHTML = '<p style="text-align:center;color:var(--text-light);font-size:.85em">تعطیلات تابستانی 🌞</p>'; return; }
  let extraHtml = '';
  if (!isSchoolStarted()) {
    const days = daysUntilSchool();
    extraHtml = `<div style="text-align:center;padding:12px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;border-radius:12px;margin-bottom:12px;font-weight:700">🌞 ${fa(days)} روز تا شروع مدرسه</div>`;
  }
  el.innerHTML = extraHtml + list.map(([st,en,task,kind,icon], idx) => {
    const s = timeToMin(st), e = timeToMin(en);
    let cls = 'today-item';
    if (curMin >= e) cls += ' past';
    else if (curMin >= s && curMin < e) cls += ' current';
    return `<div class="${cls} k-${kind}" onclick="showGuideItem('today', ${idx})"><div class="today-icon">${icon}</div><div class="today-time">${fa(st)}–${fa(en)}</div><div class="today-task">${esc(task)}</div></div>`;
  }).join('');
}

function renderSchoolGrid() {
  const el = document.getElementById('schoolGrid'); if (!el) return;
  if (!isSchoolStarted()) {
    const days = daysUntilSchool();
    el.innerHTML = `<div style="grid-column:1/-1;padding:20px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:14px;text-align:center;color:#fff;font-weight:700">🌞 تعطیلات تابستانی<br>${fa(days)} روز تا شروع مدرسه</div>`;
    return;
  }
  const todayJs = new Date().getDay();
  el.innerHTML = [6,0,1,2,3,4,5].map(d => {
    const classes = SCHOOL_SCHEDULE[d] || [];
    const isToday = d === todayJs;
    const dayName = WEEK_DAYS_FA[d];
    const inner = classes.length === 0 ? '<div class="school-class off">تعطیل</div>' :
      classes.map(c => `<div class="school-class" onclick="openGuide('${jsq(c)}','school','','','${SUBJECT_ICONS[c]||'📚'}')">${SUBJECT_ICONS[c]||'📚'} ${c}</div>`).join('');
    return `<div class="school-day ${isToday?'today':''}"><div class="school-day-name"><span>${dayName}</span>${isToday?'<span>امروز</span>':''}</div><div class="school-classes">${inner}</div></div>`;
  }).join('');
}

let selectedDay = null;
function renderFullSchedule() {
  const el = document.getElementById('fullSchedule'); if (!el) return;
  const todayJs = new Date().getDay();
  if (selectedDay === null) selectedDay = todayJs;
  const list = getAdjustedSchedule(selectedDay);
  const schoolOn = isSchoolStarted();
  window._fullList = list;
  const dayName = WEEK_DAYS_FA[selectedDay];
  const isToday = selectedDay === todayJs;
  const sh = getShamsi();
  const now = new Date();
  const curMin = now.getHours()*60 + now.getMinutes();
  let classesHtml;
  if (!schoolOn) {
    classesHtml = `<div style="margin:8px 0 12px;padding:14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:10px;text-align:center;color:#fff;font-weight:700;font-size:.9em">🌞 تعطیلات تابستانی — مدرسه شروع نشده</div>`;
  } else {
    const classes = SCHOOL_SCHEDULE[selectedDay] || [];
    classesHtml = classes.length
      ? `<div style="margin:8px 0 12px;padding:8px 12px;background:var(--bg);border-radius:10px;border-right:3px solid var(--accent)"><div style="font-size:.75em;color:var(--text-light);margin-bottom:6px">🏫 کلاس‌ها:</div><div style="display:flex;flex-wrap:wrap;gap:5px">${classes.map(c=>`<span style="font-size:.8em;padding:3px 10px;background:var(--bg-card);border-radius:14px;border:1px solid var(--border);cursor:pointer" onclick="openGuide('${jsq(c)}','school','','','${SUBJECT_ICONS[c]||'📚'}')">${SUBJECT_ICONS[c]||'📚'} ${c}</span>`).join('')}</div></div>`
      : `<div style="margin:8px 0 12px;padding:8px 12px;background:var(--bg);border-radius:10px;text-align:center;font-size:.82em;color:var(--text-light)">🎉 تعطیل</div>`;
  }
  el.innerHTML = `<div class="card">
    <h3 style="display:flex;justify-content:space-between"><span>${dayName} ${isToday?'— امروز':''}</span>${isToday?`<span style="font-size:.75em;color:var(--text-light);font-weight:normal">${fa(sh.d)} ${sh.monthName}</span>`:''}</h3>
    ${classesHtml}
    <div class="timeline">${list.map(([st,en,task,kind,icon], idx) => {
      const s = timeToMin(st), e = timeToMin(en);
      let cls = 'ti t-' + kind;
      if (isToday && curMin >= e) cls += ' past';
      else if (isToday && curMin >= s && curMin < e) cls += ' current-item';
      return `<div class="${cls}" onclick="showGuideItem('full', ${idx})"><div class="td"></div><div class="tt">${fa(st)}–${fa(en)}</div><div class="tx">${icon} ${esc(task)}</div></div>`;
    }).join('')}</div>
    <div style="text-align:center;margin-top:10px;font-size:.75em;color:var(--text-light)">👆 روی هر مورد بزن تا راهنمای کاملش رو ببینی</div>
  </div>`;
}

function renderWeekTabs() {
  const el = document.getElementById('weekTabs'); if (!el) return;
  const todayJs = new Date().getDay();
  if (selectedDay === null) selectedDay = todayJs;
  el.innerHTML = [6,0,1,2,3,4,5].map(d => {
    const dayName = WEEK_DAYS_FA[d];
    const isToday = d === todayJs;
    const isSelected = d === selectedDay;
    let cls = 'wd-tab';
    if (isSelected) cls += ' active';
    if (isToday && !isSelected) cls += ' today';
    return `<div class="${cls}" onclick="selectDay(${d})"><div class="wd-name">${dayName.slice(0,1)}</div><div>${dayName.slice(0,5)}</div></div>`;
  }).join('');
}
function selectDay(d) { selectedDay = d; renderWeekTabs(); renderFullSchedule(); }

function go(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById(id); if (!sec) return;
  sec.classList.add('active');
  const btn = document.querySelector(`.bottom-nav button[data-t="${id}"]`);
  if (btn) btn.classList.add('active');
  else { const moreBtn = document.querySelector('.bottom-nav button[data-t="more"]'); if (moreBtn) moreBtn.classList.add('active'); }
  const backBtn = document.getElementById('globalBackBtn'); if (backBtn) { if (id === 'dashboard') backBtn.style.display = 'none'; else backBtn.style.display = 'flex'; }
  window.scrollTo({top:0,behavior:'smooth'});
  const render = {
    dashboard: () => { renderTodayTotal(); renderTomorrowPrep(); if (typeof renderReviewQueue === "function") renderReviewQueue(); if (typeof renderAutoPlan === "function") renderAutoPlan(); renderNow(); renderTodaySchedule(); renderTodayReports(); renderMakeupCard(); renderAlert(); renderCountdown(); },
    schedule: () => { renderWeekTabs(); renderFullSchedule(); renderSchoolGrid(); },
    profile: renderProfile,
    checklist: renderChecklists,
    sessions: renderSessions,
    exams: renderExams,
    journal: renderJournal,
    weakness: renderWeakness,
    weekly: renderWeeklyReport,
    health: renderHealth,
    distraction: renderDistractionPage,
    backup: () => { checkPwaStatus(); renderBackupStatus(); },
    settings: renderSettings,
    rules: renderRules,
    techniques: renderTechniques,
    sourceguide: initSourceGuideClicks
  };
  if (render[id]) render[id]();
}
function toggleMore() { document.getElementById('moreMenu').classList.toggle('active'); }
function closeMore() { document.getElementById('moreMenu').classList.remove('active'); }

function toggleTheme() {
  const cur = document.body.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'dark' ? '#151a24' : '#667eea');
}
(function(){
  const s = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', s);
  const btn = document.getElementById('themeBtn'); if (btn) btn.textContent = s === 'dark' ? '☀️' : '🌙';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', s === 'dark' ? '#151a24' : '#667eea');
})();

// ============= پرونده =============
const PROFILE_KEY = 'ilia-profile';
function getProfile() { return getData(PROFILE_KEY, {}); }
function saveProfile() {
  const p = getProfile();
  p.name = document.getElementById('pfName').value.trim() || p.name || 'ایلیا';
  p.school = document.getElementById('pfSchool').value.trim() || p.school || '';
  p.avg9 = parseFloat(document.getElementById('pfAvg9').value) || p.avg9 || 0;
  p.avgTarget = parseFloat(document.getElementById('pfAvgTarget').value) || p.avgTarget || 0;
  setData(PROFILE_KEY, p); renderProfile(); toast('✅ ذخیره شد');
}
function setLearningStyle(s) { const p = getProfile(); p.learning = s; setData(PROFILE_KEY, p); renderProfile(); }
function setSubjectLevel(subj, lvl) { const p = getProfile(); if (!p.levels) p.levels = {}; p.levels[subj] = lvl; setData(PROFILE_KEY, p); renderProfile(); }
function renderProfile() {
  const p = getProfile();
  const hdr = document.getElementById('profileHeader');
  if (hdr) hdr.innerHTML = `<div class="profile-header"><h3>${esc(p.name || 'ایلیا')}</h3><p>${esc(p.school || 'دبیرستان شاهد سیرجان')} — دهم ریاضی</p></div>`;
  const nameEl = document.getElementById('pfName'); if (nameEl) nameEl.value = p.name || '';
  const sEl = document.getElementById('pfSchool'); if (sEl) sEl.value = p.school || '';
  const a9 = document.getElementById('pfAvg9'); if (a9) a9.value = p.avg9 || '';
  const at = document.getElementById('pfAvgTarget'); if (at) at.value = p.avgTarget || '';
  const levels = p.levels || {};
  const subjList = ['ریاضی','هندسه','فیزیک','شیمی','عربی','زبان','فارسی','دینی','جغرافیا','نگارش'];
  const names = ['', 'ضعیف', 'متوسط', 'خوب', 'عالی'];
  const classes = ['', 'sel-1', 'sel-2', 'sel-3', 'sel-4'];
  const levelEl = document.getElementById('levelAssess');
  if (levelEl) levelEl.innerHTML = subjList.map(s => {
    const lvl = levels[s] || 0;
    return `<div class="level-bar"><div class="level-head"><span class="name">${SUBJECT_ICONS[s]||'📚'} ${s}</span><span class="val">${lvl?names[lvl]:'انتخاب کن'}</span></div><div class="level-select">${[1,2,3,4].map(n => `<button class="lvl-btn ${lvl===n?classes[n]:''}" onclick="setSubjectLevel('${jsq(s)}', ${n})">${names[n]}</button>`).join('')}</div></div>`;
  }).join('');
  ['visual','auditory','kinesthetic','reading'].forEach(k => {
    const el = document.getElementById('ls-' + k);
    if (el) {
      if (p.learning === k) { el.style.background = 'linear-gradient(135deg,#667eea,#764ba2)'; el.style.color = '#fff'; el.style.borderColor = 'transparent'; }
      else { el.style.background = ''; el.style.color = ''; el.style.borderColor = ''; }
    }
  });
  const lsResult = document.getElementById('lsResult');
  const lsMap = {visual:'👁 بصری',auditory:'👂 شنیداری',kinesthetic:'✋ جنبشی',reading:'📖 خواندنی'};
  if (lsResult) lsResult.textContent = p.learning ? lsMap[p.learning] : '—';
}

// ============= چک‌لیست =============
const CL_KEY = 'ilia-checklist';
const DAILY_CHECKS = ['خواب ۲۲:۳۰ تا ۶:۰۰','صبحانه خوردم','۱۰ دقیقه مرور صبح','سر کلاس جزوه نوشتم','مرور درس‌های امروز','بلوک اصلی ۹۰ دقیقه','عربی یا انگلیسی','دفتر اشتباهات','دفتر افکار مزاحم','برنامه فردا','بدون صفحه قبل خواب'];
function renderChecklists() {
  const sh = getShamsi();
  const clDate = document.getElementById('clTodayDate'); if (clDate) clDate.textContent = `${fa(sh.d)} ${sh.monthName}`;
  const data = getData(CL_KEY, {});
  const t = today();
  const todayData = data[t] || {};
  const todayEl = document.getElementById('clToday');
  if (todayEl) todayEl.innerHTML = DAILY_CHECKS.map((c, i) => `<label class="check-item"><input type="checkbox" ${todayData[i]?'checked':''} onchange="toggleCheck('${t}', ${i}, this.checked)"><span class="cm"></span><span class="ct">${esc(c)}</span></label>`).join('');
  const doneToday = Object.values(todayData).filter(Boolean).length;
  const clTP = document.getElementById('clTodayProgress');
  if (clTP) clTP.innerHTML = `<div class="pb" style="margin-top:10px"><div class="pf ${doneToday===DAILY_CHECKS.length?'pf-ok':''}" style="width:${(doneToday/DAILY_CHECKS.length)*100}%"></div></div><span>${fa(doneToday)} از ${fa(DAILY_CHECKS.length)} — ${fa(Math.round((doneToday/DAILY_CHECKS.length)*100))}٪</span>`;
}
function toggleCheck(key, i, val) { const data = getData(CL_KEY, {}); if (!data[key]) data[key] = {}; data[key][i] = val; setData(CL_KEY, data); renderChecklists(); }

// ============= جلسات =============
const SS_KEY = 'ilia-sessions';

function addSession() {
  const subj = document.getElementById('ssSubj').value;
  const dateInput = document.getElementById('ssDate');
  const selectedDate = dateInput && dateInput.value ? dateInput.value : today();
  
  const min = parseInt(document.getElementById('ssMin').value);
  const topic = document.getElementById('ssTopic').value.trim();
  const source = document.getElementById('ssSource').value.trim();
  const pages = parseInt(document.getElementById('ssPages').value) || 0;
  const tests = parseInt(document.getElementById('ssTests').value) || 0;
  
  if (!min || min <= 0) return toast('دقیقه رو وارد کن');
  if (!topic) return toast('مبحث رو وارد کن');
  
  const sessions = getData(SS_KEY, []);
  sessions.push({id:Date.now(), date:selectedDate, subj, min, topic, source, pages, tests, ts:Date.now()});
  setData(SS_KEY, sessions);
  
  const log = getData('ilia-log', []);
  log.push({date:selectedDate, hours:min/60, subject:subj, ts:Date.now()});
  setData('ilia-log', log);
  
  renderStats(); renderTodayTotal();
  ['ssMin','ssTopic','ssSource','ssPages','ssTests'].forEach(id => document.getElementById(id).value = '');
  if (dateInput) dateInput.value = '';
  renderSessions();
  toast('✅ جلسه برای تاریخ ' + selectedDate + ' ثبت شد');
  refreshAppData();
}

function renderSessions() {
  const sessions = getData(SS_KEY, []);
  const t = today();
  const wkDate = new Date(); wkDate.setDate(wkDate.getDate() - 7);
  const wk = localDate(wkDate);
  const weekSessions = sessions.filter(s => s.date >= wk);
  const todaySessions = sessions.filter(s => s.date === t);
  const sv = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fa(v); };
  sv('ssWeekMin', weekSessions.reduce((s,x) => s+x.min, 0));
  sv('ssWeekPages', weekSessions.reduce((s,x) => s+x.pages, 0));
  sv('ssWeekTests', weekSessions.reduce((s,x) => s+x.tests, 0));
  sv('ssWeekSess', weekSessions.length);
  const fmt = (s) => `<div class="session-item"><div class="session-head"><span class="session-subj">${SUBJECT_ICONS[s.subj]||'📚'} ${esc(s.subj)}</span><span class="session-hrs">${fa(s.min)} دقیقه <button class="btn btn-sm btn-secondary" style="margin-right:8px; padding:2px 8px; font-size:0.7em" onclick="editSession(${s.id})">✏️ ویرایش</button></span></div><div class="session-meta">${esc(s.topic)}${s.source?` — ${esc(s.source)}`:''}${s.pages?` — ${fa(s.pages)} صفحه`:''}${s.tests?` — ${fa(s.tests)} تست`:''}</div></div>`;
  const tl = document.getElementById('ssTodayList');
  if (tl) tl.innerHTML = todaySessions.length ? todaySessions.map(fmt).join('') : '<p style="text-align:center;color:var(--text-light);font-size:.85em">هنوز جلسه‌ای ثبت نکردی</p>';
}

// ============= خواب =============
const HL_KEY = 'ilia-health';
function setSleepQuality(n) { window._slQuality = n; document.querySelectorAll('#slStars .sleep-star').forEach((el, i) => el.classList.toggle('active', i < n)); }
function logSleep() {
  const s = document.getElementById('slSleep').value;
  const w = document.getElementById('slWake').value;
  if (!s || !w) return toast('ساعت خواب و بیداری رو وارد کن');
  const [sh, sm] = s.split(':').map(Number);
  const [wh, wm] = w.split(':').map(Number);
  let total = (wh*60 + wm) - (sh*60 + sm);
  if (total < 0) total += 24*60;
  const hrs = total / 60;
  const data = getData(HL_KEY, { sleep: [] });
  data.sleep = (data.sleep || []).filter(x => x.date !== today());
  data.sleep.push({ date: today(), sleep: s, wake: w, hours: hrs, quality: window._slQuality || 0 });
  setData(HL_KEY, data);
  renderHealth();
  toast('✅ خواب ثبت شد');
}
function renderHealth() {
  const data = getData(HL_KEY, { sleep: [] });
  const sleeps = data.sleep || [];
  const t = today();
  const todaySleep = sleeps.find(x => x.date === t);
  const sv = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fa(v); };
  sv('slToday', todaySleep ? todaySleep.hours.toFixed(1) : 0);
  const wkDate = new Date(); wkDate.setDate(wkDate.getDate() - 7);
  const wk = localDate(wkDate);
  const wkSleeps = sleeps.filter(x => x.date >= wk);
  const avg = wkSleeps.length ? (wkSleeps.reduce((s,x) => s+x.hours, 0) / wkSleeps.length) : 0;
  sv('slWeek', avg.toFixed(1));
  const chart = document.getElementById('sleepChart');
  if (chart) {
    let html = ''; let max = 1; const days = [];
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(); dd.setDate(dd.getDate() - i);
      const ds = localDate(dd);
      const nm = WEEK_DAYS_SHORT[dd.getDay()];
      const e = sleeps.find(x => x.date === ds);
      const h = e ? e.hours : 0;
      days.push({n:nm, h}); if (h > max) max = h;
    }
    days.forEach(d => { const pct = (d.h/max)*100; html += `<div class="bar" style="height:${Math.max(4,pct)}%"><div class="bar-v">${fa(d.h.toFixed(1))}</div><div class="bar-lbl">${d.n}</div></div>`; });
    chart.innerHTML = html;
  }
  const histEl = document.getElementById('sleepHistory');
  if (histEl) histEl.innerHTML = sleeps.length === 0 ? '<p style="text-align:center;color:var(--text-light);font-size:.85em">چیزی ثبت نشده</p>' :
    sleeps.slice().reverse().slice(0, 14).map(s => `<div class="item"><span>${esc(s.date)}</span><span style="font-size:.85em;color:var(--text-light)">${esc(s.sleep)} → ${esc(s.wake)} (${fa(s.hours.toFixed(1))} ساعت)</span></div>`).join('');
}

// ============= حواس‌پرتی =============
const DS_KEY = 'ilia-distraction';
let _distractTags = [];
function toggleDistractTag(tag, el) {
  const i = _distractTags.indexOf(tag);
  if (i >= 0) _distractTags.splice(i, 1); else _distractTags.push(tag);
  el.classList.toggle('selected');
}
function logDistraction() {
  if (_distractTags.length === 0) return toast('حداقل یه دلیل انتخاب کن');
  const note = document.getElementById('distractNote').value.trim();
  const list = getData(DS_KEY, []);
  list.push({ id: Date.now(), date: today(), tags: [..._distractTags], note, ts: Date.now() });
  setData(DS_KEY, list);
  _distractTags = [];
  document.querySelectorAll('.distract-tag').forEach(el => el.classList.remove('selected'));
  document.getElementById('distractNote').value = '';
  renderDistractionPage();
  toast('✅ ثبت شد');
}
function renderDistractionPage() {
  const list = getData(DS_KEY, []);
  const wkDate = new Date(); wkDate.setDate(wkDate.getDate() - 7);
  const wk = localDate(wkDate);
  const wkList = list.filter(x => x.date >= wk);
  const tagCounts = {};
  wkList.forEach(x => x.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1));
  const sorted = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]);
  const analysisEl = document.getElementById('distractAnalysis');
  if (analysisEl) {
    if (sorted.length === 0) analysisEl.innerHTML = '<p style="text-align:center;color:var(--text-light);font-size:.85em">هیچ حواس‌پرتی‌ای ثبت نشده 🎉</p>';
    else {
      const max = sorted[0][1];
      analysisEl.innerHTML = sorted.map(([tag, count]) => `<div style="margin:8px 0;font-size:.85em"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><b>${esc(tag)}</b><span>${fa(count)} بار</span></div><div class="pb"><div class="pf pf-bad" style="width:${(count/max)*100}%"></div></div></div>`).join('');
      analysisEl.innerHTML += `<div class="analysis-box warn" style="margin-top:12px"><b>💡 پیشنهاد:</b><br>بیشترین علت حواس‌پرتی تو <b>${esc(sorted[0][0])}</b> هست.</div>`;
    }
  }
}

// ============= آزمون =============
const EX_KEY = 'ilia-exam-analysis';

function addExam() {
  const title = document.getElementById('exTitle').value.trim();
  const date = document.getElementById('exDate').value || today();
  const total = parseInt(document.getElementById('exTotal').value);
  const correct = parseInt(document.getElementById('exCorrect').value) || 0;
  const wrong = parseInt(document.getElementById('exWrong').value) || 0;
  const unans = parseInt(document.getElementById('exUnanswered').value) || 0;
  const subject = document.getElementById('exSubject').value.trim();
  
  if (!title || !total) return toast('عنوان و تعداد کل رو وارد کن');
  if (correct + wrong + unans > total) return toast('جمع درست+غلط+نزده بیشتر از کل است');
  
  const exams = getData(EX_KEY, []);
  exams.push({id:Date.now(), title, date, total, correct, wrong, unans, subject, ts:Date.now()});
  setData(EX_KEY, exams);
  
  ['exTitle','exTotal','exCorrect','exWrong','exUnanswered','exSubject'].forEach(id => document.getElementById(id).value = '');
  renderExams();
  toast('✅ آزمون ثبت شد');
  refreshAppData();
}

function renderExams() {
  const exams = getData(EX_KEY, []);
  const sv = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fa(v); };
  
  // محاسبه میانگین با نمره منفی
  if (exams.length) { 
    const avg = exams.reduce((s,e) => {
        let score = (e.correct * 3) - e.wrong;
        let pct = (score / (e.total * 3)) * 100;
        return s + pct;
    }, 0) / exams.length; 
    sv('exAvg', Math.round(avg)); 
    sv('exCount', exams.length); 
  }
  else { sv('exAvg', 0); sv('exCount', 0); }
  
  const el = document.getElementById('examsList'); if (!el) return;
  el.innerHTML = exams.length === 0 ? '<div class="card" style="text-align:center;color:var(--text-light);font-size:.88em">هنوز آزمونی ثبت نشده</div>' :
    exams.slice().reverse().map(e => {
      // محاسبه درصد کنکوری (هر ۳ غلط = ۱ درست)
      let score = (e.correct * 3) - e.wrong;
      let pctRaw = (score / (e.total * 3)) * 100;
      let pct = Math.max(0, Math.round(pctRaw)); // درصد منفی رو صفر نشون می‌دیم
      
      const col = pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
      return `<div class="exam-item">
        <div class="exam-head" onclick="toggleExamBody(${e.id})">
            <div class="exam-head-info">
                <div class="exam-title">${e.subject?SUBJECT_ICONS[e.subject]||'📚':''} ${esc(e.title)}</div>
                <div class="exam-sub">${esc(e.date)} — ${fa(e.total)} سوال — ${fa(e.correct)} درست / ${fa(e.wrong)} غلط / ${fa(e.unans)} نزده</div>
            </div>
            <div class="exam-score" style="color:${col}">${fa(pct)}٪</div>
        </div>
        <div class="exam-body" id="eb-${e.id}">
            <b>تراز کنکوری:</b> ${fa(score)} از ${fa(e.total * 3)}<br><br>
            <button class="btn btn-sm btn-danger" onclick="delExam(${e.id})" style="margin-top:8px">🗑 حذف</button>
        </div>
      </div>`;
    }).join('');
}

function toggleExamBody(id) { const el = document.getElementById('eb-' + id); if (el) el.classList.toggle('open'); }
function tagErr(id, tag) { const exams = getData(EX_KEY, []); const e = exams.find(x => x.id === id); if (!e) return; if (!e.errs) e.errs = {}; e.errs[tag] = (e.errs[tag] || 0) + 1; setData(EX_KEY, exams); toast('ثبت شد'); }
function setExamLesson(id, val) { const exams = getData(EX_KEY, []); const e = exams.find(x => x.id === id); if (e) { e.lesson = val; setData(EX_KEY, exams); } }
function delExam(id) { if (!confirm('حذف بشه؟')) return; setData(EX_KEY, getData(EX_KEY, []).filter(e => e.id !== id)); renderExams(); }

// ============= ژورنال =============
const J_KEY = 'ilia-journal';
function saveJournal() {
  const j1 = document.getElementById('jq1').value.trim();
  const j2 = document.getElementById('jq2').value.trim();
  const j3 = document.getElementById('jq3').value.trim();
  if (!j1 && !j2 && !j3) return toast('حداقل یکی رو پر کن');
  const journals = getData(J_KEY, []);
  const idx = journals.findIndex(x => x.date === today());
  const entry = {date: today(), learned: j1, hard: j2, tomorrow: j3, ts: Date.now()};
  if (idx >= 0) journals[idx] = entry; else journals.push(entry);
  setData(J_KEY, journals);
  document.getElementById('jq1').value = ''; document.getElementById('jq2').value = ''; document.getElementById('jq3').value = '';
  renderJournal();
  toast('✅ ژورنال ذخیره شد');
}
function renderJournal() {
  const journals = getData(J_KEY, []);
  const t = today();
  const todayJ = journals.find(x => x.date === t);
  if (todayJ) { document.getElementById('jq1').value = todayJ.learned || ''; document.getElementById('jq2').value = todayJ.hard || ''; document.getElementById('jq3').value = todayJ.tomorrow || ''; }
  const el = document.getElementById('journalList'); if (!el) return;
  el.innerHTML = journals.length === 0 ? '<p style="text-align:center;color:var(--text-light);font-size:.85em">هنوز ژورنالی نیست</p>' :
    journals.slice().reverse().slice(0, 14).map(j => `<div class="card" style="border-right:4px solid var(--primary)"><div style="font-size:.8em;color:var(--primary);font-weight:700;margin-bottom:8px">📅 ${esc(j.date)}</div>${j.learned?`<div style="font-size:.83em;margin:5px 0"><b>✅</b> ${esc(j.learned)}</div>`:''}${j.hard?`<div style="font-size:.83em;margin:5px 0"><b>⚠️</b> ${esc(j.hard)}</div>`:''}${j.tomorrow?`<div style="font-size:.83em;margin:5px 0"><b>🎯</b> ${esc(j.tomorrow)}</div>`:''}</div>`).join('');
}

// ============= نمرات =============
const GRK = 'ilia-grades';
function addGrade() {
  const s = document.getElementById('gS').value.trim();
  const v = parseFloat(document.getElementById('gV').value);
  const t = document.getElementById('gT').value.trim() || 'آزمون';
  if (!s || isNaN(v)) return toast('فیلدها رو پر کن');
  const l = getData(GRK, []);
  l.push({id:Date.now(), subject:s, value:v, title:t, date:today()});
  setData(GRK, l);
  document.getElementById('gS').value = ''; document.getElementById('gV').value = ''; document.getElementById('gT').value = '';
  renderGrades();
  toast('✅ ثبت شد');
}
function renderGrades() {
  const list = getData(GRK, []);
  const inputEl = document.getElementById('searchGrades');
  const q = inputEl ? inputEl.value.trim() : '';
  const qLow = q.toLowerCase();

  const filtered = qLow ? list.filter(g => {
    const hay = ((g.subject||'') + ' ' + (g.title||'')).toLowerCase();
    return hay.includes(qLow);
  }) : list;

  const el = document.getElementById('gradesList');
  if (el) {
    if (list.length === 0) {
      el.innerHTML = '<div class="card search-empty"><span class="ico">📊</span>نمره‌ای ثبت نشده</div>';
    } else if (filtered.length === 0) {
      el.innerHTML = '<div class="card search-empty"><span class="ico">🔍</span>چیزی با «' + esc(q) + '» پیدا نشد</div>';
    } else {
      let info = '';
      if (qLow) {
        info = '<div class="search-result-info">🔍 <b>' + fa(filtered.length) + '</b> نتیجه از <b>' + fa(list.length) + '</b> نمره</div>';
      }
      el.innerHTML = info + filtered.slice().reverse().map(g => {
        const col = g.value >= 17 ? 'var(--success)' : g.value >= 14 ? 'var(--accent)' : 'var(--danger)';
        let subj = esc(g.subject);
        let title = esc(g.title);
        if (qLow) {
          try {
            const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            subj = subj.replace(re, '<mark style="background:rgba(243,156,18,.35);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
            title = title.replace(re, '<mark style="background:rgba(243,156,18,.35);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
          } catch(e) {}
        }

        return '<div class="item" style="border-right-color:' + col + '">' +
          '<div style="flex:1"><b>' + subj + '</b> — ' + title + '<div style="font-size:.75em;color:var(--text-light)">' + esc(g.date) + '</div></div>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<span style="font-weight:900;color:' + col + ';font-size:1.1em">' + fa(g.value) + '</span>' +
            '<button class="x-btn" onclick="delGrade(' + g.id + ')">✕</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  const sv = (id, v) => { const el2 = document.getElementById(id); if (el2) el2.textContent = fa(v); };
  if (list.length) {
    const avg = list.reduce((s,g) => s+g.value, 0)/list.length;
    sv('avgAll', avg.toFixed(2));
    sv('maxG', Math.max(...list.map(g => g.value)));
    sv('minG', Math.min(...list.map(g => g.value)));
    sv('cntG', list.length);
  } else {
    ['avgAll','maxG','minG','cntG'].forEach(id => { const el2 = document.getElementById(id); if (el2) el2.textContent = '۰'; });
  }
}

function delGrade(id) { setData(GRK, getData(GRK, []).filter(g => g.id !== id)); renderGrades(); }

// ============= کارها =============
const TK = 'ilia-todos';
function addTodo() {
  const t = document.getElementById('tdT').value.trim();
  const p = document.getElementById('tdP').value;
  if (!t) return;
  const l = getData(TK, []);
  l.push({id:Date.now(), text:t, priority:p, done:false});
  setData(TK, l);
  document.getElementById('tdT').value = '';
  renderTodo();
  toast('✅ اضافه شد');
}
function renderTodo() {
  const l = getData(TK, []);
  const pend = l.filter(t => !t.done), done = l.filter(t => t.done);
  const pMap = {high:'فوری', med:'متوسط', low:'کم'};
  const pCls = {high:'p-high', med:'p-med', low:'p-low'};
  const el1 = document.getElementById('todoList');
  if (el1) el1.innerHTML = pend.length === 0 ? '<p style="text-align:center;color:var(--text-light);font-size:.85em">کاری نیست 🎉</p>' : pend.map(t => `<div class="item ${pCls[t.priority]}"><input type="checkbox" onchange="toggleTodo(${t.id})"><span class="item-txt">${esc(t.text)}</span><span style="font-size:.72em;color:var(--text-light);background:var(--bg);padding:2px 8px;border-radius:10px">${pMap[t.priority]}</span><button class="x-btn" onclick="delTodo(${t.id})">✕</button></div>`).join('');
  const el2 = document.getElementById('todoDone');
  if (el2) el2.innerHTML = done.length === 0 ? '<p style="text-align:center;color:var(--text-light);font-size:.85em">هنوز تمومی نداشته</p>' : done.map(t => `<div class="item done"><input type="checkbox" checked onchange="toggleTodo(${t.id})"><span class="item-txt">${esc(t.text)}</span><button class="x-btn" onclick="delTodo(${t.id})">✕</button></div>`).join('');
}
function toggleTodo(id) { const l = getData(TK, []); const i = l.find(x => x.id === id); if (i) i.done = !i.done; setData(TK, l); renderTodo(); }
function delTodo(id) { setData(TK, getData(TK, []).filter(t => t.id !== id)); renderTodo(); }

// ============= اهداف =============
const GK = 'ilia-goals';
function addGoal() {
  const t = document.getElementById('glT').value.trim();
  const ty = document.getElementById('glTy').value;
  const tg = parseInt(document.getElementById('glTg').value) || 1;
  if (!t) return toast('عنوان رو بنویس');
  const l = getData(GK, []);
  l.push({id:Date.now(), title:t, type:ty, target:tg, current:0, done:false});
  setData(GK, l);
  document.getElementById('glT').value = '';
  renderGoals();
  toast('✅ هدف اضافه شد');
}
function renderGoals() {
  const l = getData(GK, []);
  const tMap = {short:'🎯 کوتاه‌مدت', mid:'🎯 میان‌مدت', long:'🎯 بلندمدت'};
  const el = document.getElementById('goalsList'); if (!el) return;
  el.innerHTML = l.length === 0 ? '<div class="card" style="text-align:center;color:var(--text-light);font-size:.88em">هنوز هدفی نداری</div>' : l.map(g => {
    const pct = Math.min(100, (g.current/g.target)*100);
    const col = pct >= 100 ? 'pf-ok' : pct >= 50 ? '' : 'pf-warn';
    return `<div class="card" style="border-right:4px solid var(--primary)"><div style="display:flex;justify-content:space-between;gap:6px;font-size:.9em;flex-wrap:wrap"><div style="flex:1"><b>${esc(g.title)}</b> <span style="font-size:.75em;color:var(--text-light)">${tMap[g.type]}</span></div><div style="display:flex;gap:4px"><button class="btn btn-sm btn-success" onclick="progGoal(${g.id})">+۱</button><button class="btn btn-sm btn-info" onclick="toggleGoalDone(${g.id})">${g.done?'↩':'✓'}</button><button class="btn btn-sm btn-danger" onclick="delGoal(${g.id})">✕</button></div></div><div class="pb" style="margin-top:10px"><div class="pf ${col}" style="width:${pct}%"></div></div><div style="font-size:.78em;color:var(--text-light);text-align:center">${fa(g.current)} از ${fa(g.target)}</div></div>`;
  }).join('');
}
function progGoal(id) { const l = getData(GK, []); const g = l.find(x => x.id === id); if (g) g.current = Math.min(g.target, g.current+1); setData(GK, l); renderGoals(); }
function toggleGoalDone(id) { const l = getData(GK, []); const g = l.find(x => x.id === id); if (g) g.done = !g.done; setData(GK, l); renderGoals(); }
function delGoal(id) { setData(GK, getData(GK, []).filter(g => g.id !== id)); renderGoals(); }

// ============= عادت‌ها =============
const HK = 'ilia-habits';
function addHabit() {
  const n = document.getElementById('hN').value.trim();
  if (!n) return;
  const l = getData(HK, []);
  l.push({id:Date.now(), name:n, checks:{}});
  setData(HK, l);
  document.getElementById('hN').value = '';
  renderHabits();
  toast('✅ عادت اضافه شد');
}
function renderHabits() {
  const h = getData(HK, []);
  const el = document.getElementById('habitsList');
  if (el) el.innerHTML = h.length === 0 ? '<p style="text-align:center;color:var(--text-light);font-size:.85em">عادتی نیست</p>' : h.map(x => {
    const done = x.checks && x.checks[today()];
    return `<div class="item"><div style="flex:1;font-size:.88em"><b>${esc(x.name)}</b><div style="font-size:.75em;color:var(--text-light)">${done?'✅ امروز':'امروز نه'}</div></div><button class="btn btn-sm ${done?'btn-info':'btn-success'}" onclick="toggleHabit(${x.id})">${done?'↩':'✓'}</button><button class="x-btn" onclick="delHabit(${x.id})">✕</button></div>`;
  }).join('');
  const grid = document.getElementById('habitGrid');
  if (grid) {
    if (h.length === 0) grid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;font-size:.85em">اول عادت اضافه کن</p>';
    else {
      let html = '';
      for (let i = 13; i >= 0; i--) {
        const dd = new Date(); dd.setDate(dd.getDate() - i);
        const ds = localDate(dd);
        const dn = h.filter(x => x.checks && x.checks[ds]).length;
        const pct = h.length ? dn/h.length : 0;
        const bg = pct === 1 ? 'linear-gradient(135deg,var(--success),#1e8449)' : pct >= .5 ? 'linear-gradient(135deg,var(--accent),#d68910)' : 'var(--bg)';
        const col = pct > 0 ? '#fff' : 'var(--text)';
        const shd = getShamsi(dd);
        html += `<div style="text-align:center;padding:8px 4px;border-radius:10px;background:${bg};color:${col};border:1px solid var(--border);font-size:.75em"><b>${fa(shd.d)}</b><div style="font-size:.7em;opacity:.8">${fa(dn)}/${fa(h.length)}</div></div>`;
      }
      grid.innerHTML = html;
    }
  }
}
function toggleHabit(id) { const l = getData(HK, []); const h = l.find(x => x.id === id); if (h) { if (!h.checks) h.checks = {}; h.checks[today()] = !h.checks[today()]; } setData(HK, l); renderHabits(); }
function delHabit(id) { setData(HK, getData(HK, []).filter(h => h.id !== id)); renderHabits(); }

// ============= لایتنر =============
const LK = 'ilia-leitner';

let currentLeitnerCard = null;
let isLeitnerAnswered = false;

window.addLeitner = function() {
  const f = document.getElementById('lf').value.trim();
  const b = document.getElementById('lb').value.trim();
  const subj = document.getElementById('leitnerSubject').value;
  if (!f || !b) return toast('هر دو فیلد رو پر کن');
  const l = getData(LK, []);
  l.push({id: Date.now(), front: f, back: b, box: 1, next: today(), subject: subj});
  setData(LK, l);
  document.getElementById('lf').value = ''; document.getElementById('lb').value = '';
  renderLeitner();
  toast('✅ کارت اضافه شد');
};

window.renderLeitner = function() {
  const l = getData(LK, []);
  const filter = document.getElementById('filterLeitnerSubject') ? document.getElementById('filterLeitnerSubject').value : 'all';
  
  let filtered = l;
  if (filter !== 'all') filtered = l.filter(c => c.subject === filter);
  
  const stats = {1:0,2:0,3:0,4:0,5:0}; 
  filtered.forEach(c => stats[c.box]++);
  const st = document.getElementById('leitnerStats');
  
  const due = filtered.filter(c => c.next <= today());
  const card = document.getElementById('leitnerCard'); if (card) card.classList.remove('flipped');
  
  document.getElementById('leitnerMainBtns').style.display = 'flex';
  document.getElementById('leitnerResultBtns').style.display = 'none';
  isLeitnerAnswered = false;

  const cnt = document.getElementById('leitnerCounter');
  if (filtered.length === 0) {
    document.getElementById('lv1').textContent = 'کارتی نیست';
    document.getElementById('lv2').textContent = 'اضافه کن!';
    if (cnt) cnt.textContent = '۰ کارت';
    currentLeitnerCard = null;
    return;
  }
  if (due.length === 0) {
    document.getElementById('lv1').textContent = '🎉 مرور تمومه!';
    document.getElementById('lv2').textContent = 'فردا برگرد';
    if (cnt) cnt.textContent = 'کل: ' + fa(filtered.length) + ' کارت';
    currentLeitnerCard = null;
    return;
  }
  
  currentLeitnerCard = due[0];
  document.getElementById('lv1').textContent = currentLeitnerCard.front;
  document.getElementById('lv2').textContent = currentLeitnerCard.back;
  if (cnt) cnt.textContent = fa(due.length) + ' کارت آماده مرور';
};

window.leitnerAnswer = function(knew) {
  if (!currentLeitnerCard || isLeitnerAnswered) return;
  isLeitnerAnswered = true;
  
  // چرخش کارت برای نمایش جواب
  document.getElementById('leitnerCard').classList.add('flipped');
  
  // مخفی کردن دکمه‌های اصلی و نمایش دکمه‌های بعدی/ویرایش
  document.getElementById('leitnerMainBtns').style.display = 'none';
  document.getElementById('leitnerResultBtns').style.display = 'flex';
  
  // آپدیت دیتابیس
  const l = getData(LK, []);
  const c = l.find(x => x.id === currentLeitnerCard.id);
  const intervals = {1:1, 2:3, 3:7, 4:14, 5:30};
  if (knew) c.box = Math.min(5, c.box+1);
  else c.box = 1;
  const nd = new Date(); nd.setDate(nd.getDate() + intervals[c.box]);
  c.next = localDate(nd);
  setData(LK, l);
};

window.nextLeitnerCard = function() {
  renderLeitner();
};

window.editLeitnerCard = function() {
  if (!currentLeitnerCard) return;
  const l = getData(LK, []);
  const c = l.find(x => x.id === currentLeitnerCard.id);
  const nf = prompt('سوال جدید:', c.front);
  if (nf === null) return;
  const nb = prompt('پاسخ جدید:', c.back);
  if (nb === null) return;
  
  c.front = nf.trim() || c.front;
  c.back = nb.trim() || c.back;
  setData(LK, l);
  renderLeitner();
  toast('✅ کارت ویرایش شد');
};

function flipLeitner() { document.getElementById('leitnerCard').classList.toggle('flipped'); }
function leitnerAnswer(knew) {
  const l = getData(LK, []);
  const due = l.filter(c => c.next <= today());
  if (!due.length) return;
  const c = due[0];
  const intervals = {1:1, 2:3, 3:7, 4:14, 5:30};
  if (knew) c.box = Math.min(5, c.box+1);
  else c.box = 1;
  const nd = new Date(); nd.setDate(nd.getDate() + intervals[c.box]);
  c.next = localDate(nd);
  setData(LK, l);
  renderLeitner();
}

// ============= اشتباهات =============
const MK = 'ilia-mistakes';
function addMistake() {
  const s = document.getElementById('mS').value.trim();
  const q = document.getElementById('mQ').value.trim();
  const r = document.getElementById('mR').value.trim();
  if (!s || !q) return toast('درس و سوال اجباریه');
  const l = getData(MK, []);
  l.push({id:Date.now(), subject:s, question:q, reason:r, date:today()});
  setData(MK, l);
  document.getElementById('mS').value = ''; document.getElementById('mQ').value = ''; document.getElementById('mR').value = '';
  renderMistakes();
  toast('✅ ثبت شد');
}
function renderMistakes() {
  const list = getData(MK, []);
  const inputEl = document.getElementById('searchMistakes');
  const q = inputEl ? inputEl.value.trim() : '';
  const qLow = q.toLowerCase();

  const filtered = qLow ? list.filter(m => {
    const hay = ((m.subject||'') + ' ' + (m.question||'') + ' ' + (m.reason||'')).toLowerCase();
    return hay.includes(qLow);
  }) : list;

  const el = document.getElementById('mistakesList');
  if (!el) return;

  if (list.length === 0) {
    el.innerHTML = '<div class="card search-empty"><span class="ico">📕</span>هنوز اشتباهی ثبت نشده</div>';
    return;
  }

  if (filtered.length === 0) {
    el.innerHTML = '<div class="card search-empty"><span class="ico">🔍</span>چیزی با «' + esc(q) + '» پیدا نشد<div style="font-size:.85em;margin-top:8px;opacity:.7">یه کلمه دیگه امتحان کن</div></div>';
    return;
  }

  let info = '';
  if (qLow) {
    info = '<div class="search-result-info">🔍 <b>' + fa(filtered.length) + '</b> نتیجه از <b>' + fa(list.length) + '</b> اشتباه</div>';
  }

  const cards = filtered.slice().reverse().map(m => {
    let subj = esc(m.subject);
    let quest = esc(m.question);
    let reason = m.reason ? esc(m.reason) : '';

    if (qLow) {
      try {
        const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        subj = subj.replace(re, '<mark style="background:rgba(243,156,18,.35);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
        quest = quest.replace(re, '<mark style="background:rgba(243,156,18,.35);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
        if (reason) reason = reason.replace(re, '<mark style="background:rgba(243,156,18,.35);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
      } catch(e) {}
    }

    return '<div class="card" style="border-right:4px solid var(--danger)">' +
      '<div style="display:flex;justify-content:space-between;gap:6px;font-size:.88em">' +
        '<div style="flex:1"><b style="color:var(--primary)">' + subj + '</b> — ' + quest + '</div>' +
        '<button class="x-btn" onclick="delMistake(' + m.id + ')">✕</button>' +
      '</div>' +
      (reason ? '<div style="margin-top:6px;font-size:.82em;color:var(--text-light)">💡 ' + reason + '</div>' : '') +
      '<div style="font-size:.72em;color:var(--text-light);margin-top:4px">' + esc(m.date) + '</div>' +
    '</div>';
  }).join('');

  el.innerHTML = info + cards;
}

function delMistake(id) { setData(MK, getData(MK, []).filter(m => m.id !== id)); renderMistakes(); }

// ============= یادداشت =============
const NK = 'ilia-notes';
const nA = document.getElementById('notesA');
if (nA) {
  nA.value = localStorage.getItem(NK) || '';
  let tm;
  nA.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { try { localStorage.setItem(NK, nA.value); } catch(e) {} }, 700); });
}
function saveNotes() { if (!nA) return; try { localStorage.setItem(NK, nA.value); toast('✅ ذخیره شد'); } catch(e) { toast('خطا در ذخیره'); } }
function clearNotes() { if (!nA) return; if (confirm('پاک بشه؟')) { nA.value = ''; localStorage.removeItem(NK); } }

// ============= پومودورو =============
let pT = 25*60, pTot = 25*60, pI = null, pR = false;
function setPom(m, btn) {
  document.querySelectorAll('.pomo-mode').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  pTot = m*60; pT = pTot; updPom();
  if (pR) { clearInterval(pI); pR = false; document.getElementById('startBtn').textContent = '▶ شروع'; localStorage.removeItem('ilia-pom-end'); }
}
function updPom() {
  const t = `${fa(pad2(Math.floor(pT/60)))}:${fa(pad2(pT%60))}`;
  const pEl = document.getElementById('pomD'); if (pEl) pEl.textContent = t;
  const ft = document.getElementById('focusTimer'); if (ft) ft.textContent = t;
}
function startPom() {
  const b = document.getElementById('startBtn');
  if (pR) { clearInterval(pI); pR = false; b.textContent = '▶ ادامه'; localStorage.removeItem('ilia-pom-end'); }
  else {
    pR = true; b.textContent = '⏸ توقف';
    localStorage.setItem('ilia-pom-end', (Date.now() + pT*1000).toString());
    pI = setInterval(() => {
      pT--;
      if (pT <= 0) {
        clearInterval(pI); pR = false; b.textContent = '▶ شروع';
        localStorage.removeItem('ilia-pom-end');
        const s = document.getElementById('pomSubj').value.trim();
        alertTimerDone(s ? `درس: ${s}` : 'وقت پومودورو تموم شد');
        autoLog();
        pT = pTot;
      }
      updPom();
    }, 1000);
  }
}
function resetPom() { clearInterval(pI); pR = false; pT = pTot; updPom(); document.getElementById('startBtn').textContent = '▶ شروع'; localStorage.removeItem('ilia-pom-end'); }
function autoLog() {
  if (!confirm('این جلسه به آمار اضافه بشه؟')) return;
  const s = document.getElementById('pomSubj').value.trim() || 'مطالعه';
  const log = getData('ilia-log', []);
  log.push({date:today(), hours:pTot/3600, subject:s, ts:Date.now()});
  setData('ilia-log', log);
  renderStats(); renderTodayTotal();
}
let fT = 25*60, fI = null, fR = false;
function startFocusMode() {
  document.getElementById('focusMode').classList.add('active');
  document.getElementById('focusSubject').textContent = document.getElementById('pomSubj').value.trim() || 'حالت تمرکز';
  fT = pTot; updF();
}
function exitFocus() { document.getElementById('focusMode').classList.remove('active'); clearInterval(fI); fR = false; document.getElementById('focusStartBtn').textContent = '▶ شروع'; }
function updF() { document.getElementById('focusTimer').textContent = `${fa(pad2(Math.floor(fT/60)))}:${fa(pad2(fT%60))}`; }
function toggleFocusTimer() {
  const b = document.getElementById('focusStartBtn');
  if (fR) { clearInterval(fI); fR = false; b.textContent = '▶ ادامه'; }
  else {
    fR = true; b.textContent = '⏸ توقف';
    fI = setInterval(() => {
      fT--;
      if (fT <= 0) { clearInterval(fI); fR = false; b.textContent = '▶ شروع'; alertTimerDone('حالت تمرکز تموم شد'); autoLog(); fT = pTot; }
      updF();
    }, 1000);
  }
}
(function restorePom() {
  const end = parseInt(localStorage.getItem('ilia-pom-end') || '0');
  if (end > Date.now()) {
    pT = Math.round((end - Date.now())/1000);
    if (pT > 0 && pT <= pTot) { setTimeout(() => startPom(), 500); }
  } else if (end) localStorage.removeItem('ilia-pom-end');
})();

// ============= آمار =============
function renderStats() {
  const log = getData('ilia-log', []);
  const t = today();
  const wkDate = new Date(); wkDate.setDate(wkDate.getDate() - 7);
  const wk = localDate(wkDate);
  const todayT = log.filter(e => e.date === t).reduce((s,e) => s+e.hours, 0);
  const weekT = log.filter(e => e.date >= wk).reduce((s,e) => s+e.hours, 0);
  const allT = log.reduce((s,e) => s+e.hours, 0);
  let streak = 0;
  const ds = new Set(log.map(e => e.date));
  let d = new Date();
  while (ds.has(localDate(d))) { streak++; d.setDate(d.getDate()-1); }
  const sv = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fa(v); };
  sv('tT', todayT.toFixed(1)); sv('wT', weekT.toFixed(1)); sv('aT', allT.toFixed(1)); sv('stT', streak);
  sv('dbToday', todayT.toFixed(1)); sv('dbStreak', streak);
  const chart = document.getElementById('chart');
  if (chart) {
    let html = ''; let max = .1; const days = [];
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(); dd.setDate(dd.getDate() - i);
      const ds2 = localDate(dd);
      const nm = WEEK_DAYS_SHORT[dd.getDay()];
      const tot = log.filter(e => e.date === ds2).reduce((s,e) => s+e.hours, 0);
      days.push({n:nm, t:tot}); if (tot > max) max = tot;
    }
    days.forEach(dd => { const h = (dd.t/max)*100; html += `<div class="bar" style="height:${Math.max(4,h)}%"><div class="bar-v">${fa(dd.t.toFixed(1))}</div><div class="bar-lbl">${dd.n}</div></div>`; });
    chart.innerHTML = html;
  }
  const logEl = document.getElementById('logList');
  if (logEl) logEl.innerHTML = log.length === 0 ? '<p style="text-align:center;color:var(--text-light);padding:16px;font-size:.85em">هنوز چیزی ثبت نشده</p>' :
    log.slice().reverse().slice(0, 20).map(e => `<div class="item"><span>${esc(e.subject)}</span><span style="color:var(--text-light);font-size:.85em">${fa(e.hours.toFixed(1))} ساعت — ${esc(e.date)}</span></div>`).join('');
}

// ============= جبران =============
// getDailyGoal — dynamic v2 (از جدول برنامه محاسبه میشه)
function getDailyGoal(day = new Date().getDay()) {
  const list = getAdjustedSchedule(day);
  const studyBlocks = list.filter(x => x[3] === 'study');
  let totalMin = 0;
  studyBlocks.forEach(([st, en]) => {
    const s = timeToMin(st), e = timeToMin(en);
    if (e > s) totalMin += (e - s);
  });
  return Math.round((totalMin / 60) * 10) / 10;
}
function getStudiedOn(dateStr) { const log = getData('ilia-log', []); return log.filter(e => e.date === dateStr).reduce((s,e) => s+e.hours, 0); }
function getDeficitData() { return getData('ilia-deficit', { total: 0, history: [] }); }
function addDeficit(hours, dateStr) { if (hours <= 0.25) return; const d = getDeficitData(); d.total = Math.min(50, (d.total || 0) + hours); d.history = d.history || []; d.history.push({date:dateStr, hours, ts:Date.now(), type:'add'}); d.history = d.history.slice(-90); setData('ilia-deficit', d); }
function reduceDeficit(hours) { if (hours <= 0) return; const d = getDeficitData(); d.total = Math.max(0, (d.total || 0) - hours); d.history = d.history || []; d.history.push({date:today(), hours:-hours, ts:Date.now(), type:'makeup'}); setData('ilia-deficit', d); }
function getMakeupPlan() {
  const d = getDeficitData(); const total = d.total || 0;
  if (total <= 0.5) return { total: 0, days: [] };
  const upcoming = [];
  for (let i = 0; i <= 6; i++) {
    const dt = new Date(); dt.setDate(dt.getDate() + i);
    const day = dt.getDay();
    const capacity = day === 4 ? 2 : day === 5 ? 1.5 : 1;
    upcoming.push({date:localDate(dt), dayName:WEEK_DAYS_FA[day], dayIndex:day, capacity, extra:0});
  }
  const sorted = [...upcoming].sort((a,b) => b.capacity - a.capacity);
  let remaining = total;
  for (const day of sorted) {
    if (remaining <= 0) break;
    const add = Math.min(day.capacity, remaining);
    day.extra = add; remaining -= add;
    const orig = upcoming.find(u => u.date === day.date);
    if (orig) orig.extra = add;
  }
  return { total, days: upcoming.filter(d => d.extra > 0).sort((a,b) => a.date.localeCompare(b.date)) };
}
function getTodayExtra() { const plan = getMakeupPlan(); const d = plan.days.find(x => x.date === today()); return d ? d.extra : 0; }

// ⭐ اسکن بدهی با دوره رحمت و فقط روزهای مدرسه
function scanDeficits() {
  if (!isSchoolStarted()) return;

  // Migration
  const v = localStorage.getItem('ilia-deficit-version');
  if (v !== '3') {
    localStorage.removeItem('ilia-deficit');
    localStorage.removeItem('ilia-deficit-processed');
    localStorage.setItem('ilia-deficit-version', '3');
  }

  let installDate = localStorage.getItem('ilia-install-date');
  if (!installDate) { installDate = today(); localStorage.setItem('ilia-install-date', installDate); }

  const schoolStartStr = localDate(examDateToGregorian(EXAMS.schoolStart));
  // دوره رحمت ۳ روز
  const graceDate = new Date(schoolStartStr + 'T00:00:00');
  graceDate.setDate(graceDate.getDate() + 3);
  const graceStr = localDate(graceDate);

  const processed = getData('ilia-deficit-processed', {});
  const log = getData('ilia-log', []);
  let d = new Date(); d.setDate(d.getDate() - 1);
  let changed = false;

  for (let i = 0; i < 30; i++) {
    const ds = localDate(d);
    if (ds < installDate) break;

    if (ds < schoolStartStr) { processed[ds] = true; changed = true; d.setDate(d.getDate() - 1); continue; }
    if (ds < graceStr) { processed[ds] = true; changed = true; d.setDate(d.getDate() - 1); continue; }

    const dayIdx = d.getDay();
    if ((SCHOOL_SCHEDULE[dayIdx] || []).length === 0) {
      processed[ds] = true; changed = true; d.setDate(d.getDate() - 1); continue;
    }

    if (!processed[ds]) {
      const studied = log.filter(e => e.date === ds).reduce((s,e) => s + e.hours, 0);
      const goal = getDailyGoal(dayIdx);
      if (studied < goal - 0.25) addDeficit(goal - studied, ds);
      processed[ds] = true;
      changed = true;
    }
    d.setDate(d.getDate() - 1);
  }
  if (changed) setData('ilia-deficit-processed', processed);
}

// ⭐ کارت هدف امروز
function renderTodayTotal() {
  const el = document.getElementById('todayTotalContainer');
  if (!el) return;
  if (!isSchoolStarted()) { el.innerHTML = ''; return; }
  const todayGoal = getDailyGoal(new Date().getDay());
  const todayExtra = getTodayExtra();
  const totalGoal = todayGoal + todayExtra;
  const studied = getStudiedOn(today());
  const remaining = Math.max(0, totalGoal - studied);
  const pct = Math.min(100, (studied / totalGoal) * 100);
  const done = studied >= totalGoal && totalGoal > 0;
  el.innerHTML = `<div class="today-total-card ${done ? 'done' : ''}">
    <div class="tt-header">
      <span class="tt-icon">${done ? '🎉' : '📚'}</span>
      <span class="tt-title">هدف امروز</span>
      <span class="tt-val">${fa(totalGoal.toFixed(1))} ساعت</span>
    </div>
    <div class="tt-progress"><div class="tt-fill" style="width:${pct}%"></div></div>
    <div class="tt-meta">
      <span>خوندی: <b>${fa(studied.toFixed(1))}</b></span>
      <span>${done ? '✅ هدف زده شد!' : 'مونده: <b>' + fa(remaining.toFixed(1)) + '</b>'}</span>
    </div>
    ${todayExtra > 0 ? `<div class="tt-extra">💡 شامل <b>${fa(todayExtra.toFixed(1))} ساعت</b> جبران بدهی (${fa(todayGoal.toFixed(1))} عادی + ${fa(todayExtra.toFixed(1))} جبران)</div>` : ''}
  </div>`;
}

function renderMakeupCard() {
  const el = document.getElementById('makeupContainer'); if (!el) return;
  if (!isSchoolStarted()) { el.innerHTML = ''; return; }
  const plan = getMakeupPlan();
  if (plan.total <= 0.5) { el.innerHTML = ''; return; }
  const todayExtra = getTodayExtra();
  const todayGoal = getDailyGoal(new Date().getDay());
  const html = `<div class="makeup-card"><div class="makeup-title">📊 برنامه جبران مطالعه</div><div class="makeup-total"><div><span class="label">بدهی کل:</span> <b>${fa(plan.total.toFixed(1))} ساعت</b></div>${todayExtra > 0 ? `<div><span class="label">اضافه امروز:</span> <b>+${fa(todayExtra.toFixed(1))} ساعت</b></div>` : ''}</div><div class="makeup-plan"><div style="font-size:.78em;color:var(--text-light);margin-bottom:8px;font-weight:700">📅 تقسیم روی روزها:</div>${plan.days.map(d => `<div class="makeup-day ${d.date === today() ? 'today' : ''}"><span class="makeup-day-name">${d.dayName}${d.date === today() ? ' (امروز)' : ''}</span><span class="makeup-day-amount">+${fa(d.extra.toFixed(1))} ساعت</span></div>`).join('')}</div><div class="makeup-tip">💡 هدف امروزت: <b>${fa((todayGoal + todayExtra).toFixed(1))} ساعت</b></div></div>`;
  el.innerHTML = html;
}

// ============= زنگ خودکار برنامه =============
let alarmTimers = [];

function clearAlarms() {
  alarmTimers.forEach(t => clearTimeout(t));
  alarmTimers = [];
}

function scheduleAlarms() {
  clearAlarms();
  const now = new Date();
  const day = now.getDay();
  const list = getAdjustedSchedule(day);

  const importantKinds = ['study', 'school', 'wake', 'sport'];

  list.forEach(([st, en, task, kind, icon]) => {
    const [sh, sm] = st.split(':').map(Number);
    const start = new Date();
    start.setHours(sh, sm, 0, 0);
    const ms = start - now;
    if (ms > 1000 && ms < 24*3600*1000) {
      const isImportant = importantKinds.includes(kind);
      const timer = setTimeout(() => {
        if (isImportant) {
          alertTimerDone(`وقت ${task}`);
        } else {
          toast(`⏰ ${icon || ''} ${task}`);
          try { if ('vibrate' in navigator) navigator.vibrate([400, 200, 400]); } catch(e) {}
        }
      }, ms);
      alarmTimers.push(timer);
    }
  });

  // بیداری فردا
  const tomorrow = (day + 1) % 7;
  const tomorrowList = SCHEDULE[tomorrow] || [];
  if (tomorrowList[0]) {
    const [st, , task] = tomorrowList[0];
    const [sh, sm] = st.split(':').map(Number);
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(sh, sm, 0, 0);
    const ms = start - now;
    if (ms > 0) {
      const timer = setTimeout(() => alertTimerDone(`⏰ بیدار شو! ${task}`), ms);
      alarmTimers.push(timer);
    }
  }
}

// ============= تحلیل ضعف =============
function renderWeakness() {
  const grades = getData(GRK, []);
  const profile = getProfile();
  const levels = profile.levels || {};
  const by = {};
  grades.forEach(g => { if (!by[g.subject]) by[g.subject] = []; by[g.subject].push(g); });
  const subjects = ['ریاضی','فیزیک','هندسه','شیمی','عربی','زبان','فارسی','دینی','جغرافیا','نگارش'];
  const analysis = subjects.map(s => {
    const gs = by[s] || [];
    const avg = gs.length ? gs.reduce((a,g) => a+g.value, 0)/gs.length : null;
    const level = levels[s] || 0;
    let status = 'normal';
    if (avg !== null && avg < 15) status = 'weak';
    else if (avg !== null && avg >= 17) status = 'strong';
    else if (avg === null && level === 1) status = 'weak';
    else if (avg === null && level === 4) status = 'strong';
    return { name: s, avg, level, status, count: gs.length };
  });
  const weak = analysis.filter(a => a.status === 'weak');
  const strong = analysis.filter(a => a.status === 'strong');
  const summaryEl = document.getElementById('weaknessSummary');
  if (summaryEl) {
    let text = '';
    if (weak.length === 0) text = '🎉 <b>هیچ درس ضعیفی نداری!</b><br>همه درس‌هات خوب هستن.';
    else if (weak.length <= 2) text = `✅ فقط <b>${weak.length} درس</b> نیاز به توجه داره.`;
    else if (weak.length <= 4) text = `⚠️ <b>${weak.length} درس</b> نیاز به توجه داره.`;
    else text = `🔴 <b>${weak.length} درس</b> ضعیف داری. باید برنامه جدی بذاری.`;
    if (strong.length > 0) text += `<br><b>💪 نقاط قوت:</b> ${strong.map(a => a.name).join('، ')}`;
    summaryEl.innerHTML = `<div class="analysis-box ${weak.length > 3 ? 'danger' : weak.length > 0 ? 'warn' : 'info'}">${text}</div>`;
  }
  const weakEl = document.getElementById('weakSubjectsList');
  if (weakEl) {
    if (weak.length === 0) weakEl.innerHTML = '<p style="text-align:center;color:var(--success);font-size:.88em;font-weight:700">🎉 همه چیز خوبه</p>';
    else weakEl.innerHTML = weak.map(a => {
      let desc = '';
      if (a.avg !== null) desc += `میانگین: <b>${fa(a.avg.toFixed(2))}</b><br>`;
      desc += `پیشنهاد: <b>روزی ۳۰ دقیقه اختصاصی برای ${esc(a.name)}</b> + تمرین بیشتر`;
      return `<div class="weakness-item"><div class="weakness-title">${SUBJECT_ICONS[a.name]||'📚'} ${esc(a.name)}</div><div class="weakness-desc">${desc}</div></div>`;
    }).join('');
  }
  const trendEl = document.getElementById('gradeTrend');
  if (trendEl) {
    let html = '';
    subjects.forEach(s => {
      const gs = grades.filter(g => g.subject === s);
      if (gs.length < 2) return;
      gs.sort((a,b) => a.date.localeCompare(b.date));
      const recent = gs.slice(-3);
      const older = gs.slice(-6, -3);
      const recentAvg = recent.reduce((a,g) => a+g.value, 0) / recent.length;
      const olderAvg = older.length ? older.reduce((a,g) => a+g.value, 0) / older.length : recentAvg;
      const diff = recentAvg - olderAvg;
      let arrow = '➡️', color = 'var(--text-light)', text = 'ثابت';
      if (diff > 0.5) { arrow = '📈'; color = 'var(--success)'; text = 'بهبود'; }
      else if (diff < -0.5) { arrow = '📉'; color = 'var(--danger)'; text = 'افت'; }
      html += `<div class="item"><div style="flex:1"><b>${esc(s)}</b></div><span style="font-size:1.4em">${arrow}</span><span style="color:${color};font-weight:700;margin-right:8px">${text}</span></div>`;
    });
    trendEl.innerHTML = html || '<p style="text-align:center;color:var(--text-light);font-size:.85em">برای تحلیل روند، حداقل ۲ آزمون لازمه</p>';
  }
}

// ============= گزارش هفتگی =============
function renderWeeklyReport() {
  const el = document.getElementById('weeklyContent'); if (!el) return;
  const wkDate = new Date(); wkDate.setDate(wkDate.getDate() - 7);
  const wk = localDate(wkDate);
  const sessions = getData(SS_KEY, []).filter(s => s.date >= wk);
  const logs = getData('ilia-log', []).filter(l => l.date >= wk);
  const sleeps = (getData(HL_KEY, {sleep:[]}).sleep || []).filter(s => s.date >= wk);
  const distractions = getData(DS_KEY, []).filter(d => d.date >= wk);
  const totalHours = logs.reduce((s,x) => s+x.hours, 0);
  const totalTests = sessions.reduce((s,x) => s+x.tests, 0);
  const avgSleep = sleeps.length ? (sleeps.reduce((s,x) => s+x.hours, 0) / sleeps.length) : 0;
  const target = 18;
  let perf = 'normal';
  if (totalHours >= target) perf = 'good';
  else if (totalHours < target * 0.6) perf = 'bad';
  const tagCounts = {};
  distractions.forEach(d => d.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1));
  const topDistract = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 3);
  let html = `<div class="phase-hero" style="background:linear-gradient(135deg,#27ae60,#16a085)"><div class="phase-month"><span>📅 هفته اخیر</span><span>${fa(sessions.length)} جلسه</span></div><div class="phase-title"><span>📊</span>گزارش هفتگی</div></div>`;
  html += `<div class="grid-2"><div class="stat"><div class="stat-v">${fa(totalHours.toFixed(1))}</div><div class="stat-l">ساعت</div></div><div class="stat"><div class="stat-v">${fa(totalTests)}</div><div class="stat-l">تست</div></div><div class="stat"><div class="stat-v">${fa(avgSleep.toFixed(1))}</div><div class="stat-l">خواب</div></div><div class="stat"><div class="stat-v">${fa(sessions.length)}</div><div class="stat-l">جلسه</div></div></div>`;
  if (perf === 'good') html += `<div class="analysis-box"><b>🎉 عملکرد عالی!</b><br>این هفته <b>${fa(totalHours.toFixed(1))} ساعت</b> خوندی.</div>`;
  else if (perf === 'bad') html += `<div class="analysis-box danger"><b>⚠️ عملکرد ضعیف</b><br>هدف ${fa(target)} ساعت بود ولی ${fa(totalHours.toFixed(1))} ساعت شد.</div>`;
  else html += `<div class="analysis-box warn"><b>📚 عملکرد متوسط</b><br>روزی ۳۰ دقیقه اضافه کن.</div>`;
  if (avgSleep > 0 && avgSleep < 6.5) html += `<div class="analysis-box danger"><b>😴 کم‌خوابی!</b><br>میانگین ${fa(avgSleep.toFixed(1))} ساعت. هدف: ۷-۸ ساعت.</div>`;
  if (topDistract.length) html += `<div class="card"><h3>🧠 بیشترین حواس‌پرتی</h3>${topDistract.map(([tag, count]) => `<div class="item"><span>${esc(tag)}</span><span style="color:var(--danger);font-weight:700">${fa(count)} بار</span></div>`).join('')}</div>`;
  el.innerHTML = html;
}

// ============= پشتیبان =============
function exportData() {
  const data = {};
  Object.keys(localStorage).forEach(k => { if (k.startsWith('ilia-')) data[k] = localStorage.getItem(k); });
  data.theme = localStorage.getItem('theme');
  data.exportDate = new Date().toISOString();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `backup-ilia-${today()}.json`; a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('ilia-last-backup', Date.now().toString());
  renderBackupStatus();
  toast('✅ فایل ذخیره شد');
}
function renderBackupStatus() {
  const el = document.getElementById('backupStatus'); if (!el) return;
  const last = parseInt(localStorage.getItem('ilia-last-backup') || '0');
  if (!last) { el.textContent = 'هنوز پشتیبان نگرفتی'; return; }
  const days = Math.floor((Date.now() - last) / 86400000);
  const d = new Date(last);
  const j = getShamsi(d);
  el.textContent = `آخرین پشتیبان: ${fa(j.d)} ${j.monthName} (${days === 0 ? 'امروز' : fa(days) + ' روز پیش'})`;
}
function importData(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = (ev) => {
    try {
      const d = JSON.parse(ev.target.result);
      if (!d.exportDate && !Object.keys(d).some(k => k.startsWith('ilia-'))) {
        toast('❌ فایل معتبر نیست'); return;
      }
      Object.entries(d).forEach(([k, v]) => {
        if ((k.startsWith('ilia-') || k === 'theme') && v != null) {
          try { localStorage.setItem(k, v); } catch(e) {}
        }
      });
      toast('✅ بازگردانی شد');
      setTimeout(() => location.reload(), 800);
    } catch(err) { toast('❌ فایل معتبر نیست'); }
  };
  r.readAsText(f);
}
function resetAll() {
  if (!confirm('همه چیز پاک بشه؟')) return;
  if (!confirm('مطمئنی؟')) return;
  Object.keys(localStorage)
    .filter(k => k.startsWith('ilia-') || k === 'theme')
    .forEach(k => localStorage.removeItem(k));
  location.reload();
}

// ============= مشاور =============
let asst = {mode:null, step:0, school_subjects:[], school_missed:[], study_hours:0, study_subjects:[], study_quality:0};
let asstPending = false;
const ASSISTANT_CONFIG = {
  minCooldown: 45*60*1000,
  maxAsksPerDay: 4,
  schoolWindows: [{start:14*60, end:15*60}, {start:20*60, end:20*60+45}],
  nightWindows: [{start:20*60+45, end:21*60+15}, {start:22*60, end:22*60+45}],
  doNotDisturbKinds: ['school', 'study', 'sport', 'sleep'],
  bootDelay: 6000
};
function todaySchoolReportKey() { return 'ilia-school-report-' + today(); }
function todayStudyReportKey() { return 'ilia-study-report-' + today(); }
function getTodaySchoolReport() { return getData(todaySchoolReportKey(), null); }
function getTodayStudyReport() { return getData(todayStudyReportKey(), null); }
function isInDNDBlock() { const cur = getCurrent(); if (!cur) return false; return ASSISTANT_CONFIG.doNotDisturbKinds.includes(cur.item.kind); }
function isUserTyping() {
  const ae = document.activeElement;
  if (!ae) return false;
  const tag = ae.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (document.getElementById('focusMode').classList.contains('active')) return true;
  if (document.getElementById('assistantOverlay').classList.contains('active')) return true;
  if (document.getElementById('guideOverlay').classList.contains('active')) return true;
  return false;
}
function isInWindow(type) {
  const now = new Date();
  const curMin = now.getHours()*60 + now.getMinutes();
  const windows = type === 'school' ? ASSISTANT_CONFIG.schoolWindows : ASSISTANT_CONFIG.nightWindows;
  return windows.some(w => curMin >= w.start && curMin < w.end);
}
function isCooldownOk() { const last = parseInt(localStorage.getItem('ilia-assistant-last-ask') || '0'); return (Date.now() - last) >= ASSISTANT_CONFIG.minCooldown; }
function getTodayAskCount() { return parseInt(localStorage.getItem('ilia-assistant-asks-' + today()) || '0'); }
function isDailyLimitOk() { return getTodayAskCount() < ASSISTANT_CONFIG.maxAsksPerDay; }
function recordAsk() {
  localStorage.setItem('ilia-assistant-last-ask', Date.now().toString());
  const key = 'ilia-assistant-asks-' + today();
  localStorage.setItem(key, (parseInt(localStorage.getItem(key) || '0') + 1).toString());
}
function isGoodTimeForReport(type) {
  if (type === 'school' && getTodaySchoolReport()) return false;
  if (type === 'night' && getTodayStudyReport()) return false;
  if (type === 'school' && !isSchoolStarted()) return false;
  if (type === 'school') {
    const day = new Date().getDay();
    if ((SCHOOL_SCHEDULE[day] || []).length === 0) return false;
  }
  if (!isInWindow(type)) return false;
  if (isInDNDBlock()) return false;
  if (isUserTyping()) return false;
  if (!isCooldownOk()) return false;
  if (!isDailyLimitOk()) return false;
  return true;
}
function getSmartIntro(type) {
  const h = new Date().getHours();
  let timeGreeting = '';
  if (h < 12) timeGreeting = 'صبح بخیر';
  else if (h < 17) timeGreeting = 'وقت بخیر';
  else if (h < 20) timeGreeting = 'عصر بخیر';
  else timeGreeting = 'شب بخیر';
  const streak = (() => { const log = getData('ilia-log', []); let s = 0; const ds = new Set(log.map(e => e.date)); let d = new Date(); while (ds.has(localDate(d))) { s++; d.setDate(d.getDate()-1); } return s; })();
  const deficitData = getDeficitData();
  const todayExtra = getTodayExtra();
  if (type === 'school') {
    let msg = `${timeGreeting} ایلیا! 👋<br>از مدرسه برگشتی؟ بذار گزارش امروزت رو بگیرم.`;
    if (streak >= 3) msg += `<br><br>🔥 <b>${fa(streak)} روز پیوسته!</b>`;
    if (deficitData.total > 0.5) msg += `<br>📊 بدهی: <b>${fa(deficitData.total.toFixed(1))} ساعت</b>`;
    return msg;
  } else {
    let msg = `${timeGreeting} ایلیا 🌙<br>بذار یه گزارش امروزت بگیرم.`;
    if (streak >= 3) msg += `<br><br>🔥 <b>${fa(streak)} روز پیوسته!</b>`;
    if (deficitData.total > 0.5) { msg += `<br>📊 <b>بدهی: ${fa(deficitData.total.toFixed(1))} ساعت</b>`; if (todayExtra > 0) msg += `<br>امروز <b>+${fa(todayExtra.toFixed(1))} ساعت</b> اضافه داری`; }
    return msg;
  }
}
function checkAssistant() {
  if (asstPending || isUserTyping()) return;
  const mode = isGoodTimeForReport('school') ? 'school' : isGoodTimeForReport('night') ? 'night' : null;
  if (!mode) return;
  asstPending = true;
  setTimeout(() => {
    asstPending = false;
    if (isUserTyping()) return;
    if (isGoodTimeForReport(mode)) { recordAsk(); openAssistant(mode); }
  }, 2500);
}
function openAssistant(mode) {
  asst = {mode, step:0, school_subjects:[], school_missed:[], study_hours:0, study_subjects:[], study_quality:0};
  document.getElementById('assistantOverlay').classList.add('active');
  renderAsst();
}
function closeAssistant() {
  document.getElementById('assistantOverlay').classList.remove('active');
  localStorage.setItem('ilia-assistant-last-ask', Date.now().toString());
  renderTodayReports(); renderTodayTotal(); renderTomorrowPrep(); renderMakeupCard(); renderAlert();
}
function snoozeAssistant() { localStorage.setItem('ilia-assistant-last-ask', Date.now().toString()); document.getElementById('assistantOverlay').classList.remove('active'); toast('⏰ بعداً یادت میندازم'); }
function openAssistantManual(mode) { if (!mode) { const h = new Date().getHours(); mode = h < 19 ? 'school' : 'night'; } openAssistant(mode); }
function asstMsg(t, w) { return `<div class="msg ${w==='user'?'msg-user':'msg-bot'}">${t}</div>`; }
function scrollAsstToBottom() { const body = document.getElementById('assistantBody'); if (body) setTimeout(() => body.scrollTop = body.scrollHeight, 50); }

function renderAsst() {
  const body = document.getElementById('assistantBody');
  const footer = document.getElementById('assistantFooter');
  if (!body || !footer) return;
  if (asst.mode === 'school') {
    if (asst.step === 0) {
      body.innerHTML = asstMsg(getSmartIntro('school'));
      footer.innerHTML = '<button class="btn btn-primary" onclick="asstNext()">شروع کن</button><button class="btn btn-secondary" onclick="snoozeAssistant()">⏰ بعداً</button>';
    } else if (asst.step === 1) {
      const day = new Date().getDay();
      const dayClasses = SCHOOL_SCHEDULE[day] || [];
      if (asst.school_subjects.length === 0) asst.school_subjects = [...dayClasses];
      const opts = dayClasses.map(s => `<button class="opt ${asst.school_subjects.includes(s)?'selected':''}" onclick="toggleSchoolSubj('${jsq(s)}',this)"><span class="opt-check"></span>${SUBJECT_ICONS[s]||'📚'} ${esc(s)}</button>`).join('');
      body.innerHTML = asstMsg('امروز معلم‌ها چه درس‌هایی دادن؟') + '<div class="opt-list">' + opts + '</div>';
      footer.innerHTML = '<button class="btn btn-primary" onclick="asstNext()">ادامه</button><button class="btn btn-secondary" onclick="closeAssistant()">بستن</button>';
    } else if (asst.step === 2) {
      let html = asstMsg('کدوم رو <b>کامل نفهمیدی</b>؟');
      const opts = asst.school_subjects.map(s => `<button class="opt ${asst.school_missed.includes(s)?'selected':''}" onclick="toggleSchoolMissed('${jsq(s)}',this)"><span class="opt-check"></span>${SUBJECT_ICONS[s]||'📚'} ${esc(s)}</button>`).join('');
      html += '<div class="opt-list">' + (opts || '<p style="text-align:center;font-size:.85em;color:var(--text-light)">اول درس انتخاب کن</p>') + '</div>';
      body.innerHTML = html;
      footer.innerHTML = '<button class="btn btn-primary" onclick="asstNext()">تحلیل کن</button><button class="btn btn-secondary" onclick="closeAssistant()">بستن</button>';
    } else if (asst.step === 3) {
      setData(todaySchoolReportKey(), {subjects:asst.school_subjects, missed:asst.school_missed, date:today(), ts:Date.now()});
      let html = asstMsg('گزارش ثبت شد 🌱');
      html += `<div class="summary-box"><b>📖 امروز داشتی:</b><br>${asst.school_subjects.map(s => (SUBJECT_ICONS[s]||'📚') + ' ' + esc(s)).join(' • ')}</div>`;
      if (asst.school_missed.length) html += `<div class="analysis-box warn"><b>⚠️ تمرکز امشب:</b><br>${asst.school_missed.map(s => '• ' + (SUBJECT_ICONS[s]||'📚') + ' ' + esc(s)).join('<br>')}</div>`;
      else html += `<div class="analysis-box"><b>🎉 آفرین!</b></div>`;
      body.innerHTML = html;
      footer.innerHTML = '<button class="btn btn-primary" onclick="closeAssistant()">باشه</button>';
    }
  } else if (asst.mode === 'night') {
    if (asst.step === 0) {
      body.innerHTML = asstMsg(getSmartIntro('night'));
      footer.innerHTML = '<button class="btn btn-primary" onclick="asstNext()">شروع کن</button><button class="btn btn-secondary" onclick="snoozeAssistant()">⏰ بعداً</button>';
    } else if (asst.step === 1) {
      const todayLogged = getData('ilia-log', []).filter(e => e.date === today()).reduce((s,e) => s+e.hours, 0);
      body.innerHTML = asstMsg('امروز <b>چند ساعت</b> مطالعه کردی؟' + (todayLogged > 0 ? `<br><span style="font-size:.85em;color:var(--text-light)">(تا الان ${fa(todayLogged.toFixed(1))} ساعت ثبت شده)</span>` : ''));
      footer.innerHTML = '<input type="number" class="asst-input" id="asstHours" min="0" max="16" step="0.5" placeholder="۲.۵"><button class="btn btn-primary" onclick="asstSubmitHours()">ادامه</button>';
      setTimeout(() => { const el = document.getElementById('asstHours'); if (el) el.focus(); }, 100);
    } else if (asst.step === 2) {
      let html = asstMsg(`ثبت شد: <b>${fa(asst.study_hours)} ساعت</b> 🌟`);
      const opts = ALL_SUBJECTS.map(s => `<button class="opt ${asst.study_subjects.includes(s)?'selected':''}" onclick="toggleStudySubj('${jsq(s)}',this)"><span class="opt-check"></span>${SUBJECT_ICONS[s]||'📚'} ${esc(s)}</button>`).join('');
      html += '<div class="opt-list">' + opts + '</div>';
      body.innerHTML = html;
      footer.innerHTML = '<button class="btn btn-primary" onclick="asstNext()">ادامه</button><button class="btn btn-secondary" onclick="closeAssistant()">بستن</button>';
    } else if (asst.step === 3) {
      let html = asstMsg('این جلسه‌ها چقدر <b>مفید</b> بودن؟');
      html += `<div class="stars" id="asstStars">${[1,2,3,4,5].map(n => `<span class="star ${asst.study_quality>=n?'active':''}" onclick="setStudyQuality(${n})">⭐</span>`).join('')}</div>`;
      body.innerHTML = html;
      footer.innerHTML = '<button class="btn btn-primary" onclick="asstNext()">پایان</button><button class="btn btn-secondary" onclick="closeAssistant()">بستن</button>';
    } else if (asst.step === 4) {
      setData(todayStudyReportKey(), {hours:asst.study_hours, subjects:asst.study_subjects, quality:asst.study_quality, date:today(), ts:Date.now()});
      if (asst.study_hours > 0) {
        const log = getData('ilia-log', []);
        log.push({date:today(), hours:asst.study_hours, subject:asst.study_subjects.join('، ') || 'مطالعه', ts:Date.now()});
        setData('ilia-log', log);
        renderStats(); renderTodayTotal();
      }
      const todayGoal = getDailyGoal(new Date().getDay());
      const todayDeficit = Math.max(0, todayGoal - asst.study_hours);
      const todayExcess = Math.max(0, asst.study_hours - todayGoal);
      if (todayDeficit > 0.25) addDeficit(todayDeficit, today());
      else if (todayExcess > 0.25) reduceDeficit(todayExcess);
      let html = asstMsg('گزارش شب ثبت شد ✅');
      html += `<div class="summary-box"><b>⏱:</b> ${fa(asst.study_hours)} ساعت<br><b>📚:</b> ${asst.study_subjects.length ? asst.study_subjects.map(s => (SUBJECT_ICONS[s]||'📚') + ' ' + esc(s)).join('، ') : 'ثبت نشده'}<br><b>⭐:</b> ${fa(asst.study_quality)} از ۵</div>`;
      const goal = todayGoal;
      let cls = '', msg = '';
      if (asst.study_hours >= goal) { cls = ''; msg = `🎉 <b>آفرین!</b> به هدف رسیدی.`; }
      else if (asst.study_hours >= goal * .6) { cls = 'warn'; msg = `⚠️ <b>خوب بود ولی کافی نبود.</b>`; }
      else if (asst.study_hours > 0) { cls = 'danger'; msg = `😐 <b>کم بود.</b>`; }
      else { cls = 'danger'; msg = `😢 <b>امروز نخوندی.</b>`; }
      html += `<div class="analysis-box ${cls}">${msg}</div>`;
      const plan = getMakeupPlan();
      if (plan.total > 0.5) {
        html += `<div class="analysis-box warn"><b>📊 برنامه جبران</b><br>بدهی: <b>${fa(plan.total.toFixed(1))} ساعت</b><br><br>${plan.days.map(d => `• ${d.dayName}: <b>+${fa(d.extra.toFixed(1))} ساعت</b>`).join('<br>')}</div>`;
      }
      html += asstMsg('شب بخیر! 😴');
      body.innerHTML = html;
      footer.innerHTML = '<button class="btn btn-primary" onclick="closeAssistant()">شب بخیر</button>';
    }
  }
  scrollAsstToBottom();
}
function asstNext() { asst.step++; renderAsst(); }
function toggleSchoolSubj(s, el) { const i = asst.school_subjects.indexOf(s); if (i >= 0) asst.school_subjects.splice(i, 1); else asst.school_subjects.push(s); el.classList.toggle('selected'); }
function toggleSchoolMissed(s, el) { const i = asst.school_missed.indexOf(s); if (i >= 0) asst.school_missed.splice(i, 1); else asst.school_missed.push(s); el.classList.toggle('selected'); }
function toggleStudySubj(s, el) { const i = asst.study_subjects.indexOf(s); if (i >= 0) asst.study_subjects.splice(i, 1); else asst.study_subjects.push(s); el.classList.toggle('selected'); }
function setStudyQuality(n) { asst.study_quality = n; document.querySelectorAll('#asstStars .star').forEach((el, i) => el.classList.toggle('active', i < n)); }
function asstSubmitHours() {
  const v = parseFloat(document.getElementById('asstHours').value);
  if (isNaN(v) || v < 0 || v > 16) { toast('عدد درست وارد کن'); return; }
  asst.study_hours = v; asstNext();
}
function renderTodayReports() {
  const el = document.getElementById('todayReportsContainer'); if (!el) return;
  const sr = getTodaySchoolReport();
  const nr = getTodayStudyReport();
  if (!sr && !nr) { el.innerHTML = ''; return; }
  let html = '<div class="today-reports"><div class="tr-title">📋 گزارش امروز</div>';
  if (sr) {
    html += `<div class="tr-line"><b>🏫:</b> ${sr.subjects.map(s => (SUBJECT_ICONS[s]||'📚') + ' ' + esc(s)).join('، ')}</div>`;
    if (sr.missed && sr.missed.length) html += `<div class="tr-line" style="color:var(--danger)"><b>⚠️:</b> ${sr.missed.map(esc).join('، ')}</div>`;
  }
  if (nr) {
    html += `<div class="tr-line"><b>⏱:</b> ${fa(nr.hours)} ساعت</div>`;
    if (nr.subjects && nr.subjects.length) html += `<div class="tr-line"><b>📚:</b> ${nr.subjects.map(esc).join('، ')}</div>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

// ============= هشدار =============
function renderAlert() {
  const el = document.getElementById('alertContainer'); if (!el) return;
  if (!isSchoolStarted()) { el.innerHTML = ''; return; }
  const log = getData('ilia-log', []);
  let badDays = 0;
  for (let i = 1; i <= 3; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if ((SCHOOL_SCHEDULE[d.getDay()] || []).length === 0) continue;
    if (d < examDateToGregorian(EXAMS.schoolStart)) continue;
    const ds = localDate(d);
    const goal = getDailyGoal(d.getDay());
    const studied = log.filter(e => e.date === ds).reduce((s,e) => s+e.hours, 0);
    if (studied < goal * 0.5) badDays++;
  }
  if (badDays >= 3) el.innerHTML = `<div class="alert-card"><div class="alert-title">🔔 هشدار افت</div><div class="alert-text">۳ روز اخیر کم خوندی. امروز فقط <b>۲۰ دقیقه</b> شروع کن.</div></div>`;
  else el.innerHTML = '';
}

// ============= کیبورد =============
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const focusOn = document.getElementById('focusMode').classList.contains('active');
  const guideOn = document.getElementById('guideOverlay').classList.contains('active');
  if (e.key === 'Escape' && guideOn) { closeGuide(); return; }
  if (e.key === 'Escape' && focusOn) { exitFocus(); return; }
  if (e.key === 'Escape' && document.getElementById('assistantOverlay').classList.contains('active')) { closeAssistant(); return; }
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); focusOn ? exitFocus() : startFocusMode(); return; }
  if (e.key === 't' || e.key === 'T') { toggleTheme(); return; }
  if (e.key === ' ') {
    if (document.getElementById('pomodoro').classList.contains('active')) { e.preventDefault(); startPom(); }
    else if (focusOn) { e.preventDefault(); toggleFocusTimer(); }
  }
});

// ============= آماده‌سازی فردا =============
function renderTomorrowPrep() {
  const el = document.getElementById('tomorrowContainer');
  if (!el) return;
  if (!isSchoolStarted()) { el.innerHTML = ''; return; }

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDay = tomorrowDate.getDay();
  const tomorrowName = WEEK_DAYS_FA[tomorrowDay];
  const tomorrowKey = localDate(tomorrowDate);
  const classes = SCHOOL_SCHEDULE[tomorrowDay] || [];

  if (classes.length === 0) {
    el.innerHTML = `<div class="tomorrow-card off"><div class="tmr-title">🎒 آماده‌سازی فردا</div><div class="tmr-off">فردا (${tomorrowName}) تعطیله — کیف لازم نداری 🎉</div></div>`;
    return;
  }

  const checks = getData('ilia-tomorrow-checks', {});
  const todayChecks = checks[tomorrowKey] || {};

  const items = [];
  classes.forEach(c => { items.push({ id: 'book-' + c, icon: SUBJECT_ICONS[c] || '📚', label: 'کتاب ' + c }); });
  items.push({ id: 'notebook', icon: '📓', label: 'دفتر مشق' });
  items.push({ id: 'pencilcase', icon: '✏️', label: 'جامدادی' });
  if (classes.includes('ورزش')) items.push({ id: 'sport', icon: '👟', label: 'لباس ورزشی' });
  if (classes.includes('آزمایشگاه')) items.push({ id: 'lab', icon: '🥼', label: 'روپوش آزمایشگاه' });

  const studyList = (SCHEDULE[tomorrowDay] || []).filter(x => x[3] === 'study');
  const doneCount = items.filter(it => todayChecks[it.id]).length;
  const allDone = doneCount === items.length;

  el.innerHTML = `<div class="tomorrow-card">
    <div class="tmr-title">🎒 آماده‌سازی فردا — ${tomorrowName} ${allDone ? '✅' : ''}</div>
    <div class="tmr-subtitle">📚 کلاس‌های فردا (${fa(classes.length)} درس):</div>
    <div class="tmr-classes">${classes.map(c => `<span class="tmr-class-chip">${SUBJECT_ICONS[c]||'📚'} ${esc(c)}</span>`).join('')}</div>
    <div class="tmr-subtitle">✅ چک‌لیست وسایل (${fa(doneCount)}/${fa(items.length)}):</div>
    <div class="tmr-checklist">${items.map(it => `<label class="tmr-check"><input type="checkbox" ${todayChecks[it.id]?'checked':''} onchange="toggleTomorrowCheck('${it.id}', this.checked)"><span class="tmr-box"></span><span>${it.icon} ${esc(it.label)}</span></label>`).join('')}</div>
    ${studyList.length ? `<div class="tmr-subtitle">📖 مطالعه فردا:</div><div class="tmr-study">${studyList.map(s => `<div class="tmr-study-item"><span>${s[4]} ${esc(s[2])}</span><span style="opacity:.8;font-size:.9em">${fa(s[0])}–${fa(s[1])}</span></div>`).join('')}</div>` : ''}
  </div>`;
}

function toggleTomorrowCheck(id, val) {
  const checks = getData('ilia-tomorrow-checks', {});
  const tomorrowKey = localDate(new Date(Date.now() + 86400000));
  if (!checks[tomorrowKey]) checks[tomorrowKey] = {};
  checks[tomorrowKey][id] = val;
  setData('ilia-tomorrow-checks', checks);
  renderTomorrowPrep();
}


// ============= قوانین قابل ویرایش =============
const RULES_KEY = 'ilia-rules';
const RULES_CHECK_KEY = 'ilia-rules-checks';
const DEFAULT_RULES = [
  'هدف: هکر سایبری → ریاضی + انگلیسی',
  'خواب ۲۲:۳۰ تا ۶:۰۰',
  'گوشی بیرون اتاق',
  'هر روز عربی یا انگلیسی',
  'هر روز یک بلوک ۹۰ دقیقه‌ای',
  'دفتر اشتباهات + دفتر فرمول',
  'جمعه: مرور صبح، استراحت',
  'یه روز خراب شد؟ برگرد به روال',
  'مقایسه فقط با خودت هفته قبل',
  'هک یاد بگیر، ولی جای درس رو نگیر'
];

function getRules() {
  const r = getData(RULES_KEY, null);
  if (!r || !Array.isArray(r) || r.length === 0) return DEFAULT_RULES.slice();
  return r;
}
function saveRules(r) { setData(RULES_KEY, r); }

function renderRules() {
  const el = document.getElementById('rulesList');
  if (!el) return;
  const rules = getRules();
  const checks = getData(RULES_CHECK_KEY, {});
  const t = today();
  const todayChecks = checks[t] || {};

  el.innerHTML = rules.map((r, i) => {
    const isDone = !!todayChecks[i];
    return `<li class="rule ${isDone ? 'done-rule' : ''}" style="border-right-color:${isDone ? 'var(--success)' : 'var(--danger)'}">
      <span class="rule-n ${isDone ? 'done' : ''}" onclick="toggleRuleCheck(${i})">${isDone ? '✓' : fa(i+1)}</span>
      <input class="rule-edit" value="${esc(r)}" onchange="editRule(${i}, this.value)" onblur="editRule(${i}, this.value)">
      <button class="x-btn" onclick="delRule(${i})" title="حذف">✕</button>
    </li>`;
  }).join('');

  // Progress bar
  const doneCount = Object.values(todayChecks).filter(Boolean).length;
  const total = rules.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const infoEl = document.getElementById('rulesTodayInfo');
  if (infoEl) {
    infoEl.innerHTML = `<div class="rule-progress">
      <span>امروز: <b>${fa(doneCount)}</b> از <b>${fa(total)}</b></span>
      <div class="pb"><div class="pf ${pct >= 80 ? 'pf-ok' : pct >= 50 ? 'pf-warn' : 'pf-bad'}" style="width:${pct}%"></div></div>
      <span><b>${fa(pct)}٪</b></span>
    </div>`;
  }
}

function addRule() {
  const inp = document.getElementById('newRuleInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) { toast('متن قانون رو بنویس'); return; }
  const rules = getRules();
  rules.push(v);
  saveRules(rules);
  inp.value = '';
  renderRules();
  toast('✅ قانون اضافه شد');
}

function delRule(i) {
  if (!confirm('این قانون حذف بشه؟')) return;
  const rules = getRules();
  if (i < 0 || i >= rules.length) return;
  rules.splice(i, 1);
  saveRules(rules);
  renderRules();
  toast('🗑 حذف شد');
}

function editRule(i, v) {
  const rules = getRules();
  if (i < 0 || i >= rules.length) return;
  const nv = (v || '').trim();
  if (!nv) {
    rules[i] = rules[i]; // no change
  } else {
    rules[i] = nv;
  }
  saveRules(rules);
}

function toggleRuleCheck(i) {
  const checks = getData(RULES_CHECK_KEY, {});
  const t = today();
  if (!checks[t]) checks[t] = {};
  const wasDone = !!checks[t][i];
  checks[t][i] = !wasDone;
  setData(RULES_CHECK_KEY, checks);
  renderRules();
  if (!wasDone) {
    const rules = getRules();
    const doneCount = Object.values(checks[t]).filter(Boolean).length;
    if (doneCount === rules.length) {
      toast('🎉 آفرین! همه قوانین امروز رعایت شد');
    } else {
      toast('✅ ' + fa(doneCount) + ' از ' + fa(rules.length));
    }
  }
}


// ============= تکنیک‌ها با دکمه اجرا =============
const TECHNIQUES_DATA = [
  {
    icon: '⏰',
    title: 'مدیریت زمان — پومودورو',
    short: 'برای هر کاری که تنبلی می‌کنی شروع کنی',
    body: '<b>چطور؟</b><br>۲۵ دقیقه تمرکز کامل → ۵ دقیقه استراحت.<br>هر ۴ دور، یه استراحت ۱۵ دقیقه‌ای.<br><br><b>چرا؟</b><br>ذهن تو ۲۵ دقیقه راحت‌تر تمرکز می‌کنه تا ۲ ساعت پشت سر هم.',
    tags: ['زمان', '۲۵ دقیقه'],
    tagTypes: ['time', 'easy'],
    action: { type: 'pomo', minutes: 25, label: '▶ شروع پومودورو ۲۵' }
  },
  {
    icon: '🎯',
    title: 'تمرکز عمیق',
    short: 'وقتی باید سخت‌ترین کار رو انجام بدی',
    body: '<b>قوانین:</b><br>۱. گوشی بیرون اتاق<br>۲. اعلان‌ها خاموش<br>۳. فقط یک تب باز<br>۴. دفتر افکار مزاحم کنار دستت<br><br><b>چه زمانی؟</b><br>برای ریاضی، فیزیک، هر چیزی که نیاز به فکر عمیق داره.',
    tags: ['۵۰ دقیقه', 'سخت'],
    tagTypes: ['time', 'hard'],
    action: { type: 'focus', minutes: 50, label: '▶ شروع ۵۰ دقیقه' }
  },
  {
    icon: '📖',
    title: 'مطالعه فعال',
    short: 'قبل، حین، بعد، پایان',
    body: '<b>قبل:</b> پیش‌خوانی ۵ دقیقه‌ای<br><b>در حین:</b> سوال بساز، جواب بده<br><b>بعد:</b> خودآزمایی<br><b>پایان:</b> خلاصه‌نویسی<br><br>این روش، ۳ برابر مؤثرتر از خوندن ساده‌ست.',
    tags: ['همه درس‌ها'],
    tagTypes: [],
    action: { type: 'guide', subject: 'مرور', label: '▶ راهنمای مرور' }
  },
  {
    icon: '📐',
    title: 'حل مسئله — ریاضی و فیزیک',
    short: 'مرحله به مرحله',
    body: '<b>۶ مرحله:</b><br>۱. صورت مسئله رو با دقت بخون<br>۲. شکل بکش<br>۳. داده‌ها رو بنویس<br>۴. فرمول رو پیدا کن<br>۵. حل کن<br>۶. جواب رو بازبینی کن',
    tags: ['ریاضی', 'فیزیک'],
    tagTypes: [],
    action: { type: 'guide', subject: 'ریاضی', label: '▶ راهنمای ریاضی' }
  },
  {
    icon: '📓',
    title: 'دفتر اشتباهات',
    short: 'طلایی‌ترین دفتر تو',
    body: '<b>چی می‌نویسی؟</b><br>سوال + چرا غلط زدی + جواب درست<br><br><b>کی مرور می‌کنی؟</b><br>هفته‌ای یک‌بار، جمعه‌ها.<br><br>اکثر رتبه‌های برتر این دفتر رو دارن.',
    tags: ['مرور', 'هفتگی'],
    tagTypes: ['easy'],
    action: { type: 'page', page: 'mistakes', label: '▶ دفتر اشتباهات' }
  },
  {
    icon: '🧑‍🏫',
    title: 'روش فاینمن',
    short: 'بهترین روش فهمیدن',
    body: '<b>چطور؟</b><br>مفهوم رو مثل اینکه داری به یه بچه ۱۲ ساله توضیح می‌دی، بلند توضیح بده.<br><br>هر جا گیر کردی → یعنی اونجا رو نفهمیدی → برگرد بخون.',
    tags: ['فهم', '۲۵ دقیقه'],
    tagTypes: ['time'],
    action: { type: 'focus', minutes: 25, label: '▶ شروع ۲۵ دقیقه' }
  },
  {
    icon: '📖',
    title: 'مرور فاصله‌دار',
    short: 'قوی‌ترین تکنیک حافظه',
    body: '<b>برنامه:</b><br>۲۴ ساعت بعد → ۳ روز بعد → ۱ هفته بعد → ۲ هفته بعد → ۱ ماه بعد<br><br>هر مرور، حافظه‌ت رو ۲ برابر قوی‌تر می‌کنه.<br><br>با <b>جعبه لایتنر</b> خودکار اجرا می‌شه.',
    tags: ['حافظه', 'بلندمدت'],
    tagTypes: ['easy'],
    action: { type: 'page', page: 'leitner', label: '▶ جعبه لایتنر' }
  },
  {
    icon: '😴',
    title: 'خواب و حافظه',
    short: 'مغز موقع خواب درس رو تثبیت می‌کنه',
    body: '<b>قوانین:</b><br>۷-۸ ساعت خواب شبانه<br>قبل خواب ۱۵ دقیقه مرور سبک<br>گوشی رو ۳۰ دقیقه قبل خواب بذار کنار<br><br>یه شب کم‌خوابی = ۳۰٪ افت تمرکز فردا.',
    tags: ['سلامت', 'شب'],
    tagTypes: [],
    action: { type: 'page', page: 'health', label: '▶ ثبت خواب' }
  },
  {
    icon: '⚡',
    title: 'قانون ۲ دقیقه',
    short: 'وقتی انگیزه نداری',
    body: '<b>قانون:</b><br>فقط ۲ دقیقه شروع کن.<br>می‌تونی بعد ۲ دقیقه ول کنی.<br><br><b>ولی ۹۵٪ مواقع، ادامه می‌دی.</b><br>سخت‌ترین بخش، شروع کردنه.',
    tags: ['شروع', 'انگیزه'],
    tagTypes: ['easy'],
    action: { type: 'focus', minutes: 5, label: '▶ شروع ۵ دقیقه' }
  },
  {
    icon: '🍅',
    title: 'تکنیک بلوک‌بندی',
    short: 'برای روزهای شلوغ',
    body: '<b>چطور؟</b><br>یه ساعت خاص برای یه درس مشخص:<br>«۱۵:۳۰ تا ۱۷:۰۰ فقط ریاضی»<br><br><b>چرا؟</b><br>ذهنت تصمیم‌گیری نمی‌خواد، فقط اجرا می‌کنه.',
    tags: ['زمان', 'برنامه'],
    tagTypes: ['time'],
    action: { type: 'pomo', minutes: 45, label: '▶ شروع بلوک ۴۵' }
  }
];

function renderTechniques() {
  const el = document.getElementById('techniquesList');
  if (!el) return;
  el.innerHTML = TECHNIQUES_DATA.map((t, i) => `<div class="tech" data-tech="${i}">
    <div class="tech-head" onclick="toggleTech(${i})">
      <span class="ico">${t.icon}</span>
      <div style="flex:1">
        <div>${t.title}</div>
        <div style="font-size:.72em;color:var(--text-light);font-weight:500;margin-top:2px">${t.short}</div>
      </div>
      <span style="font-size:.85em;color:var(--text-light)">▼</span>
    </div>
    <div class="tech-body">
      ${t.body}
      <div class="tech-meta">
        ${t.tags.map((tag, idx) => `<span class="tech-tag ${t.tagTypes[idx] || ''}">${tag}</span>`).join('')}
      </div>
      <div class="tech-action">
        <button class="btn btn-sm btn-primary" onclick="runTechnique(${i}, event)">${t.action.label}</button>
      </div>
    </div>
  </div>`).join('');
}

function toggleTech(i) {
  const el = document.querySelector(`.tech[data-tech="${i}"]`);
  if (el) el.classList.toggle('open');
}

function runTechnique(i, event) {
  if (event) event.stopPropagation();
  const t = TECHNIQUES_DATA[i];
  if (!t) return;
  const a = t.action;
  if (a.type === 'pomo') {
    document.querySelectorAll('.pomo-mode').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.pomo-mode[data-m="${a.minutes}"]`);
    if (btn) btn.classList.add('active');
    pTot = a.minutes * 60; pT = pTot; updPom();
    closeMore();
    go('pomodoro');
    toast('▶ ' + fa(a.minutes) + ' دقیقه — شروع کن!');
  } else if (a.type === 'focus') {
    pTot = a.minutes * 60; pT = pTot; updPom();
    startFocusMode();
  } else if (a.type === 'page') {
    closeMore();
    go(a.page);
  } else if (a.type === 'guide') {
    openGuide(a.subject, 'study', '', '', SUBJECT_ICONS[a.subject] || '📖');
  }
}


// ============= راهنمای منبع کلیک‌پذیر =============
function initSourceGuideClicks() {
  const sourceCards = document.querySelectorAll('#sourceguide .source-card');
  sourceCards.forEach(card => {
    if (card.dataset.clickable === '1') return;
    card.dataset.clickable = '1';
    card.addEventListener('click', () => {
      const nameEl = card.querySelector('.source-name');
      if (!nameEl) return;
      const fullName = nameEl.textContent.trim();
      const subjectMap = {
        'ریاضی':'ریاضی',
        'فیزیک':'فیزیک',
        'هندسه':'هندسه',
        'شیمی':'شیمی',
        'عربی':'عربی',
        'انگلیسی':'انگلیسی',
        'فارسی':'فارسی'
      };
      let subj = subjectMap[fullName];
      if (!subj && fullName.includes('دینی')) subj = 'دینی';
      if (!subj && fullName.includes('جغرافیا')) subj = 'جغرافیا';
      if (!subj) subj = fullName.split('،')[0].trim();
      openGuide(subj, 'study', '', '', SUBJECT_ICONS[subj] || '📖');
    });
  });
}


// ============= PROFILE_EFFECT_V1 — اثر سبک یادگیری و سطح درس روی راهنما =============
(function() {
  if (typeof getGuideForTask !== 'function') {
    console.warn('getGuideForTask پیدا نشد — profile effect اعمال نشد');
    return;
  }

  const _originalGetGuideForTask = getGuideForTask;

  const STYLE_TIPS = {
    visual:      '👁 <b>سبک یادگیریت بصری‌ه:</b> شکل بکش، از رنگ‌های مختلف استفاده کن، نمودار و نقشه ذهنی بساز، ویدیو ببین.',
    auditory:    '👂 <b>سبک یادگیریت شنیداری‌ه:</b> بلند توضیح بده، با خودت حرف بزن، مطلب رو ضبط کن و گوش بده.',
    kinesthetic: '✋ <b>سبک یادگیریت جنبشی‌ه:</b> وقتی مرور می‌کنی راه برو، با دست کار کن، مثال واقعی بساز، از وسایل کمک‌آموزشی استفاده کن.',
    reading:     '📖 <b>سبک یادگیریت خواندنی‌ه:</b> خلاصه بنویس، متن رو چند بار بخون، فلش‌کارت بساز، یادداشت برداری کن.'
  };

  const LEVEL_TIPS = {
    1: { cls:'level-tip-1', icon:'🚨', label:'نیاز به توجه جدی',
         text:'<b>این درس رو تو پرونده «ضعیف» زدی.</b> وقت بیشتری بذار، از پایه شروع کن، روزی ۳۰ دقیقه اختصاصی. قبل از رفتن به مبحث جدید، مطمئن شو قبلی رو خوب فهمیدی.' },
    2: { cls:'level-tip-2', icon:'⚠️', label:'متوسط',
         text:'<b>این درس «متوسط»ه.</b> تمرین بیشتر، تست‌زنی جدی، اشتباهاتت رو تو دفتر اشتباهات بنویس و هفتگی مرور کن.' },
    3: { cls:'level-tip-3', icon:'👍', label:'خوب',
         text:'<b>این درس «خوب»ه.</b> مرور فاصله‌دار کافیه. وقتت رو بذار روی تست‌زنی و نکات ریز.' },
    4: { cls:'level-tip-4', icon:'🏆', label:'عالی',
         text:'<b>این درس «عالی»ه.</b> فقط با مرور نگه‌دار. وقتت رو بذار روی درس‌های ضعیف‌ترت.' }
  };

  getGuideForTask = function(task, kind) {
    const g = _originalGetGuideForTask(task, kind);
    if (!g) return g;

    // کپی shallow بساز تا روی اصل تأثیر نذاره
    const copy = Object.assign({}, g);
    copy.tips = Array.isArray(g.tips) ? g.tips.slice() : [];

    const profile = (typeof getProfile === 'function') ? getProfile() : {};

    // سطح درس (اگه تو پرونده ست شده)
    const subjName = g.name;
    const lvl = (profile.levels || {})[subjName];
    if (lvl && LEVEL_TIPS[lvl]) {
      const lt = LEVEL_TIPS[lvl];
      copy.tips.unshift(`<span class="guide-tip-badge">${lt.icon} ${lt.label}</span> ${lt.text}`);
      // ذخیره نوع برای رندر — از طریق پرچم روی خودِ گایید
      copy._levelCls = lt.cls;
    }

    // سبک یادگیری
    if (profile.learning && STYLE_TIPS[profile.learning]) {
      copy.tips.push(`<span class="guide-tip-badge">سبک یادگیری</span> ${STYLE_TIPS[profile.learning]}`);
      copy._hasStyleTip = true;
    }

    return copy;
  };

  // بازنویسی openGuide تا کلاس CSS رو هم به تیپ‌ها بده
  if (typeof openGuide === 'function') {
    const _originalOpenGuide = openGuide;

    openGuide = function(task, kind, st, en, icon) {
      // از قبل پروفایل رو گرفتیم، حالا موقع رندر decorate می‌کنیم
      // کاری که می‌کنیم: قبل از صدا زدن openGuide، تیپ‌ها رو تو DOM مخصوص علامت‌گذاری می‌کنیم
      try { _originalOpenGuide.apply(this, arguments); } catch(_e) { console.error("chain _originalOpenGuide:", _e && _e.message); }

      // بعد از رندر، تیپ‌ها رو decorate کن
      const body = document.getElementById('guideBody');
      if (!body) return;
      const tips = body.querySelectorAll('.guide-tip');
      const g = getGuideForTask(task, kind);
      tips.forEach(t => {
        const html = t.innerHTML;
        if (html.includes('guide-tip-badge') && /ضعیف|متوسط|خوب|عالی/.test(html)) {
          // سطح درس
          if (html.includes('ضعیف') || html.includes('🚨')) t.classList.add('level-tip-1');
          else if (html.includes('متوسط') || html.includes('⚠️')) t.classList.add('level-tip-2');
          else if (html.includes('خوب') || html.includes('👍')) t.classList.add('level-tip-3');
          else if (html.includes('عالی') || html.includes('🏆')) t.classList.add('level-tip-4');
        }
        if (html.includes('سبک یادگیری')) t.classList.add('style-tip');
      });
    };
  }
})();


// ============= SEARCH_JS — جستجو در اشتباهات و نمرات =============
(function() {
  function updateBarState(inputEl) {
    const bar = inputEl.closest('.search-bar');
    if (!bar) return;
    if (inputEl.value.trim().length > 0) bar.classList.add('has-value');
    else bar.classList.remove('has-value');
  }

  window.onSearchMistakesInput = function(el) {
    updateBarState(el);
    renderMistakes();
  };

  window.clearSearchMistakes = function() {
    const el = document.getElementById('searchMistakes');
    if (!el) return;
    el.value = '';
    updateBarState(el);
    renderMistakes();
    el.focus();
  };

  window.onSearchGradesInput = function(el) {
    updateBarState(el);
    renderGrades();
  };

  window.clearSearchGrades = function() {
    const el = document.getElementById('searchGrades');
    if (!el) return;
    el.value = '';
    updateBarState(el);
    renderGrades();
    el.focus();
  };

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlightText(text, query) {
    const safe = esc(String(text || ''));
    if (!query) return safe;
    try {
      const re = new RegExp('(' + escapeRegex(query) + ')', 'gi');
      return safe.replace(re, '<mark style="background:rgba(243,156,18,.35);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
    } catch(e) {
      return safe;
    }
  }

  // ---------- اشتباهات ----------
  if (typeof renderMistakes === 'function') {
    const _origRenderMistakes = renderMistakes;

    renderMistakes = function() {
      const list = getData(MK, []);
      const inputEl = document.getElementById('searchMistakes');
      const q = inputEl ? inputEl.value.trim() : '';
      const qLow = q.toLowerCase();

      const filtered = qLow ? list.filter(m => {
        const hay = ((m.subject||'') + ' ' + (m.question||'') + ' ' + (m.reason||'')).toLowerCase();
        return hay.includes(qLow);
      }) : list;

      const el = document.getElementById('mistakesList');
      if (!el) return;

      if (list.length === 0) {
        el.innerHTML = '<div class="card search-empty"><span class="ico">📕</span>هنوز اشتباهی ثبت نشده</div>';
        return;
      }

      if (filtered.length === 0) {
        el.innerHTML = '<div class="card search-empty"><span class="ico">🔍</span>چیزی با «' + esc(q) + '» پیدا نشد<div style="font-size:.85em;margin-top:8px;opacity:.7">یه کلمه دیگه امتحان کن</div></div>';
        return;
      }

      let info = '';
      if (qLow) {
        info = '<div class="search-result-info">🔍 <b>' + fa(filtered.length) + '</b> نتیجه از <b>' + fa(list.length) + '</b> اشتباه</div>';
      }

      const cards = filtered.slice().reverse().map(m => {
        const subj = highlightText(m.subject, q);
        const quest = highlightText(m.question, q);
        const reason = m.reason ? highlightText(m.reason, q) : '';
        return '<div class="card" style="border-right:4px solid var(--danger)">' +
          '<div style="display:flex;justify-content:space-between;gap:6px;font-size:.88em">' +
            '<div style="flex:1"><b style="color:var(--primary)">' + subj + '</b> — ' + quest + '</div>' +
            '<button class="x-btn" onclick="delMistake(' + m.id + ')">✕</button>' +
          '</div>' +
          (reason ? '<div style="margin-top:6px;font-size:.82em;color:var(--text-light)">💡 ' + reason + '</div>' : '') +
          '<div style="font-size:.72em;color:var(--text-light);margin-top:4px">' + esc(m.date) + '</div>' +
        '</div>';
      }).join('');

      el.innerHTML = info + cards;
    };
  }

  // ---------- نمرات ----------
  if (typeof renderGrades === 'function') {
    const _origRenderGrades = renderGrades;

    renderGrades = function() {
      const list = getData(GRK, []);
      const inputEl = document.getElementById('searchGrades');
      const q = inputEl ? inputEl.value.trim() : '';
      const qLow = q.toLowerCase();

      const filtered = qLow ? list.filter(g => {
        const hay = ((g.subject||'') + ' ' + (g.title||'')).toLowerCase();
        return hay.includes(qLow);
      }) : list;

      const el = document.getElementById('gradesList');
      if (el) {
        if (list.length === 0) {
          el.innerHTML = '<div class="card search-empty"><span class="ico">📊</span>نمره‌ای ثبت نشده</div>';
        } else if (filtered.length === 0) {
          el.innerHTML = '<div class="card search-empty"><span class="ico">🔍</span>چیزی با «' + esc(q) + '» پیدا نشد</div>';
        } else {
          let info = '';
          if (qLow) {
            info = '<div class="search-result-info">🔍 <b>' + fa(filtered.length) + '</b> نتیجه از <b>' + fa(list.length) + '</b> نمره</div>';
          }
          el.innerHTML = info + filtered.slice().reverse().map(g => {
            const col = g.value >= 17 ? 'var(--success)' : g.value >= 14 ? 'var(--accent)' : 'var(--danger)';
            const subj = highlightText(g.subject, q);
            const title = highlightText(g.title, q);
            return '<div class="item" style="border-right-color:' + col + '">' +
              '<div style="flex:1"><b>' + subj + '</b> — ' + title + '<div style="font-size:.75em;color:var(--text-light)">' + esc(g.date) + '</div></div>' +
              '<div style="display:flex;gap:8px;align-items:center">' +
                '<span style="font-weight:900;color:' + col + ';font-size:1.1em">' + fa(g.value) + '</span>' +
                '<button class="x-btn" onclick="delGrade(' + g.id + ')">✕</button>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      const sv = (id, v) => { const el2 = document.getElementById(id); if (el2) el2.textContent = fa(v); };
      if (list.length) {
        const avg = list.reduce((s,g) => s+g.value, 0)/list.length;
        sv('avgAll', avg.toFixed(2));
        sv('maxG', Math.max(...list.map(g => g.value)));
        sv('minG', Math.min(...list.map(g => g.value)));
        sv('cntG', list.length);
      } else {
        ['avgAll','maxG','minG','cntG'].forEach(id => { const el2 = document.getElementById(id); if (el2) el2.textContent = '۰'; });
      }
    };
  }

  // بعد از add، اگه فیلتری هست، پاکش کن
  if (typeof addMistake === 'function') {
    const _am = addMistake;
    addMistake = function() {
      _am.apply(this, arguments);
      const el = document.getElementById('searchMistakes');
      if (el && el.value.trim()) {
        el.value = '';
        const bar = el.closest('.search-bar');
        if (bar) bar.classList.remove('has-value');
        renderMistakes();
      }
    };
  }

  if (typeof addGrade === 'function') {
    const _ag = addGrade;
    addGrade = function() {
      _ag.apply(this, arguments);
      const el = document.getElementById('searchGrades');
      if (el && el.value.trim()) {
        el.value = '';
        const bar = el.closest('.search-bar');
        if (bar) bar.classList.remove('has-value');
        renderGrades();
      }
    };
  }

})();


// ============= WEEKLY_SHARE_V1 — اشتراک‌گذاری گزارش هفتگی =============
(function() {

  function buildWeeklyText() {
    const wkDate = new Date(); wkDate.setDate(wkDate.getDate() - 7);
    const wk = localDate(wkDate);
    const sessions = getData(SS_KEY, []).filter(s => s.date >= wk);
    const logs = getData('ilia-log', []).filter(l => l.date >= wk);
    const sleeps = (getData(HL_KEY, {sleep:[]}).sleep || []).filter(s => s.date >= wk);
    const distractions = getData(DS_KEY, []).filter(d => d.date >= wk);
    const exams = (getData(EX_KEY, []) || []).filter(e => e.date >= wk);

    const totalHours = logs.reduce((s,x) => s + x.hours, 0);
    const totalTests = sessions.reduce((s,x) => s + x.tests, 0);
    const totalPages = sessions.reduce((s,x) => s + (x.pages||0), 0);
    const avgSleep = sleeps.length ? (sleeps.reduce((s,x) => s + x.hours, 0) / sleeps.length) : 0;

    // تفکیک درس‌ها
    const bySubj = {};
    sessions.forEach(s => {
      if (!bySubj[s.subj]) bySubj[s.subj] = { min:0, tests:0, pages:0 };
      bySubj[s.subj].min += s.min || 0;
      bySubj[s.subj].tests += s.tests || 0;
      bySubj[s.subj].pages += s.pages || 0;
    });

    // حواس‌پرتی‌ها
    const tagCounts = {};
    distractions.forEach(d => d.tags.forEach(t => tagCounts[t] = (tagCounts[t]||0) + 1));
    const topDistract = Object.entries(tagCounts).sort((a,b) => b[1]-a[1]).slice(0, 3);

    const sh = getShamsi();

    let txt = '';
    txt += '📊 گزارش هفتگی — مرکز مطالعه ایلیا\n';
    txt += 'تاریخ: ' + fa(sh.d) + ' ' + sh.monthName + ' ' + fa(sh.y) + '\n';
    txt += '─────────────────────\n\n';

    txt += '⏱ ساعت مطالعه کل: ' + fa(totalHours.toFixed(1)) + ' ساعت\n';
    txt += '📝 جلسات: ' + fa(sessions.length) + ' جلسه\n';
    txt += '📖 صفحه: ' + fa(totalPages) + '\n';
    txt += '✅ تست: ' + fa(totalTests) + '\n';
    txt += '🛌 میانگین خواب: ' + fa(avgSleep.toFixed(1)) + ' ساعت\n\n';

    if (Object.keys(bySubj).length) {
      txt += '📚 تفکیک درس‌ها:\n';
      Object.entries(bySubj).sort((a,b) => b[1].min - a[1].min).forEach(([subj, v]) => {
        txt += '  • ' + subj + ': ' + fa(Math.round(v.min/60*10)/10) + ' ساعت';
        if (v.tests) txt += ' / ' + fa(v.tests) + ' تست';
        if (v.pages) txt += ' / ' + fa(v.pages) + ' صفحه';
        txt += '\n';
      });
      txt += '\n';
    }

    if (exams.length) {
      txt += '📝 آزمون‌ها:\n';
      exams.forEach(e => {
        const pct = Math.round((e.correct/e.total)*100);
        txt += '  • ' + e.title + ': ' + fa(pct) + '٪ (' + fa(e.correct) + '/' + fa(e.total) + ')\n';
      });
      txt += '\n';
    }

    if (topDistract.length) {
      txt += '🧠 بیشترین حواس‌پرتی:\n';
      topDistract.forEach(([tag, count]) => {
        txt += '  • ' + tag + ': ' + fa(count) + ' بار\n';
      });
      txt += '\n';
    }

    // streak
    const log = getData('ilia-log', []);
    let streak = 0;
    const ds = new Set(log.map(e => e.date));
    let d = new Date();
    while (ds.has(localDate(d))) { streak++; d.setDate(d.getDate()-1); }
    if (streak > 0) txt += '🔥 روزهای پیوسته: ' + fa(streak) + '\n\n';

    txt += '─────────────────────\n';
    txt += 'ساخته شده با اپ مرکز مطالعه ایلیا';

    return txt;
  }

  window.shareWeeklyReport = async function() {
    const text = buildWeeklyText();
    // نمایش پیش‌نمایش
    showSharePreview(text);
  };

  window.copyWeeklyReport = async function() {
    const text = buildWeeklyText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast('✅ کپی شد');
        return;
      }
    } catch(e) {}
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('✅ کپی شد');
    } catch(e) {
      toast('❌ خطا در کپی');
    }
    document.body.removeChild(ta);
  };

  window.shareViaNative = async function() {
    const text = buildWeeklyText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'گزارش هفتگی — مرکز مطالعه ایلیا', text });
      } catch(e) {
        if (e.name !== 'AbortError') toast('اشتراک‌گذاری لغو شد');
      }
    } else {
      toast('مرورگر از اشتراک‌گذاری پشتیبانی نمی‌کنه — کپی کن');
      copyWeeklyReport();
    }
  };

  window.showSharePreview = function(text) {
    let box = document.getElementById('sharePreviewBox');
    if (box) box.remove();
    const weeklyEl = document.getElementById('weeklyContent');
    if (!weeklyEl) return;
    box = document.createElement('div');
    box.id = 'sharePreviewBox';
    box.className = 'card';
    box.innerHTML = '<div class="share-preview-label">👁 پیش‌نمایش گزارش:</div>' +
      '<div class="share-preview">' + esc(text) + '</div>' +
      '<div class="weekly-actions" style="margin-top:12px">' +
        '<button class="btn btn-primary" onclick="shareViaNative()">📤 اشتراک‌گذاری</button>' +
        '<button class="btn btn-info" onclick="copyWeeklyReport()">📋 کپی متن</button>' +
        '<button class="btn btn-secondary" onclick="document.getElementById(\'sharePreviewBox\').remove()">بستن</button>' +
      '</div>';
    weeklyEl.appendChild(box);
    box.scrollIntoView({behavior:'smooth', block:'nearest'});
  };

  // بازنویسی renderWeeklyReport — اضافه کردن دکمه بالای گزارش
  if (typeof renderWeeklyReport === 'function') {
    const _origRenderWeeklyReport = renderWeeklyReport;

    renderWeeklyReport = function() {
      try { _origRenderWeeklyReport.apply(this, arguments); } catch(_e) { console.error("chain _origRenderWeeklyReport:", _e && _e.message); }

      const el = document.getElementById('weeklyContent');
      if (!el) return;

      // اگه دکمه قبلاً هست، پاکش کن (چون رندر قبلی دوباره صدا زده شده)
      const oldActions = el.querySelector('.weekly-actions');
      if (oldActions) oldActions.remove();
      const oldPreview = document.getElementById('sharePreviewBox');
      if (oldPreview) oldPreview.remove();

      // یه نوار دکمه‌ها بالای محتوا
      const bar = document.createElement('div');
      bar.className = 'weekly-actions';
      bar.innerHTML = '<button class="btn btn-primary" onclick="shareWeeklyReport()">👁 پیش‌نمایش گزارش</button>' +
        '<button class="btn btn-info" onclick="copyWeeklyReport()">📋 کپی سریع</button>';
      el.insertBefore(bar, el.firstChild);
    };
  }

})();


// ============= WEAKNESS_PLAN_V1 — برنامه عملی برای نقاط ضعف =============
(function() {

  // محاسبه اطلاعات کامل هر درس
  function getSubjectStats(subj) {
    const grades = getData(GRK, []).filter(g => g.subject === subj);
    const sessions = getData(SS_KEY, []).filter(s => s.subj === subj);
    const mistakes = getData(MK, []).filter(m => m.subject === subj);
    const exams = getData(EX_KEY, []).filter(e => e.subject === subj);
    const profile = getProfile();
    const lvl = (profile.levels || {})[subj] || 0;

    const avg = grades.length ? grades.reduce((s,g) => s+g.value, 0)/grades.length : null;
    const totalMin = sessions.reduce((s,x) => s + (x.min||0), 0);
    const totalTests = sessions.reduce((s,x) => s + (x.tests||0), 0);
    const recent30 = sessions.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return (Date.now() - d.getTime()) < 30*86400000;
    });
    const min30 = recent30.reduce((s,x) => s + (x.min||0), 0);

    return { subj, avg, lvl, totalMin, totalTests, mistakes: mistakes.length, exams: exams.length, min30 };
  }

  function isWeak(subj) {
    const st = getSubjectStats(subj);
    if (st.avg !== null && st.avg < 15) return true;
    if (st.avg === null && st.lvl === 1) return true;
    return false;
  }

  function getPriority(st) {
    // P1: خیلی ضعیف یا خیلی کم کار
    if (st.avg !== null && st.avg < 12) return 1;
    if (st.lvl === 1) return 1;
    if (st.totalMin < 60) return 1;
    // P2: ضعیف
    if (st.avg !== null && st.avg < 15) return 2;
    // P3: مرزی
    return 3;
  }

  function getRecommendation(st) {
    const recs = [];

    // ساعت پیشنهادی
    let hoursPerDay = 0.5;
    if (st.avg !== null && st.avg < 10) hoursPerDay = 1;
    else if (st.avg !== null && st.avg < 13) hoursPerDay = 0.75;
    else if (st.lvl === 1) hoursPerDay = 0.75;
    recs.push('<b>روزانه:</b> ' + fa(Math.round(hoursPerDay*60)) + ' دقیقه اختصاصی');

    // تست پیشنهادی
    if (st.totalTests < 20) recs.push('<b>هفتگی:</b> حداقل ۱۵ تست از این درس');
    else if (st.totalTests < 50) recs.push('<b>هفتگی:</b> ۲۰ تا ۳۰ تست');

    // اشتباهات
    if (st.mistakes > 5) recs.push('<b>دفتر اشتباهات:</b> ' + fa(st.mistakes) + ' مورد داری — این هفته مرورشون کن');

    // پیشنهاد مطالعه
    if (st.totalMin < 60) recs.push('<b>هنوز شروع نکردی:</b> از فصل ۱ شروع کن، روزی یه بخش کوچیک');
    else if (st.min30 < 120) recs.push('<b>۳۰ روز اخیر:</b> فقط ' + fa(Math.round(st.min30/60*10)/10) + ' ساعت — باید بیشتر شه');

    // پیشنهاد کلی
    const tips = [
      'اول مفاهیم پایه رو قوی کن، بعد برو سراغ تمرین سخت',
      'هر مبحثی رو که نفهمیدی، تو دفتر اشتباهات یادداشت کن',
      'هفته‌ای یه‌بار با خودت آزمون بگیر',
      'از راهنما استفاده کن — روی اسم درس بزن'
    ];
    recs.push('<b>راهکار:</b> ' + tips[Math.floor(Math.random()*tips.length)]);

    return recs;
  }

  function renderWeakPlan() {
    const el = document.getElementById('weakPlanContainer');
    if (!el) return;

    const subjects = ['ریاضی','فیزیک','هندسه','شیمی','عربی','زبان','فارسی','دینی','جغرافیا','نگارش'];
    const weak = subjects.filter(isWeak).map(getSubjectStats);

    if (weak.length === 0) {
      el.innerHTML = '<div class="plan-card"><div class="plan-title">💡 برنامه عملی</div>' +
        '<div class="plan-empty"><span class="ico">🎉</span><b>هیچ درس ضعیفی نداری!</b>' +
        '<div style="font-size:.85em;margin-top:8px;opacity:.8">وقتت رو بذار روی مرور فاصله‌دار و تست‌زنی</div></div></div>';
      return;
    }

    // مرتب‌سازی بر اساس اولویت
    weak.sort((a,b) => getPriority(a) - getPriority(b));

    let html = '<div class="plan-card"><div class="plan-title">💡 برنامه عملی این هفته — ' + fa(weak.length) + ' درس نیاز به توجه</div>';
    html += '<div class="plan-list">';

    weak.forEach(st => {
      const p = getPriority(st);
      const pClass = 'p' + p;
      const pLabel = p === 1 ? '🔥 فوری' : p === 2 ? '⚠️ مهم' : '📌 معمولی';

      let avgHtml = '';
      if (st.avg !== null) {
        const cls = st.avg < 12 ? 'bad' : st.avg < 15 ? 'warn' : 'ok';
        avgHtml = '<span class="plan-item-avg ' + cls + '">میانگین: ' + fa(st.avg.toFixed(1)) + '</span>';
      } else if (st.lvl === 1) {
        avgHtml = '<span class="plan-item-avg bad">سطح: ضعیف</span>';
      }

      const recs = getRecommendation(st).map(r => '• ' + r).join('<br>');
      const icon = SUBJECT_ICONS[st.subj] || '📚';

      html += '<div class="plan-item">' +
        '<div class="plan-item-head">' +
          '<div class="plan-item-subj"><span class="plan-priority ' + pClass + '">' + pLabel + '</span>' + icon + ' ' + esc(st.subj) + '</div>' +
          avgHtml +
        '</div>' +
        '<div class="plan-item-body">' + recs + '</div>' +
        '<div class="plan-item-actions">' +
          '<button class="btn btn-sm btn-primary" onclick="openGuideForWeak(\'' + esc(st.subj) + '\')">📖 راهنمای ' + esc(st.subj) + '</button>' +
          '<button class="btn btn-sm btn-info" onclick="quickLogWeak(\'' + esc(st.subj) + '\')">⏱ ثبت جلسه</button>' +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';
    el.innerHTML = html;
  }

  window.openGuideForWeak = function(subj) {
    openGuide(subj, 'study', '', '', SUBJECT_ICONS[subj] || '📖');
  };

  window.quickLogWeak = function(subj) {
    // برو به صفحه جلسات و درس رو پیش‌فرض کن
    closeMore();
    go('sessions');
    setTimeout(() => {
      const sel = document.getElementById('ssSubj');
      if (sel) {
        // پیدا کن option که متنش با subj می‌خوره
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text === subj) { sel.selectedIndex = i; break; }
        }
      }
      const minEl = document.getElementById('ssMin');
      if (minEl) minEl.focus();
      toast('📝 جلسه ' + subj + ' رو ثبت کن');
    }, 300);
  };

  // رندر وقتی صفحه‌ی weakness باز شد
  if (typeof renderWeakness === 'function') {
    const _origRenderWeakness = renderWeakness;
    renderWeakness = function() {
      try { _origRenderWeakness.apply(this, arguments); } catch(_e) { console.error("chain _origRenderWeakness:", _e && _e.message); }
      // renderWeakPlan حذف شد
    };
  }

  // رندر اولیه تو Init (اگه کاربر مستقیم رفت weakness، کار کنه)
  setTimeout(() => {
    if (document.getElementById('weakness') && document.getElementById('weakness').classList.contains('active')) {
      // renderWeakPlan حذف شد
    }
  }, 500);

})();


// ============= TOMORROW_RESET_V1 — بهبود آماده‌سازی فردا =============
(function() {

  const CHECKS_KEY = 'ilia-tomorrow-checks';
  const MAX_DAYS = 7; // فقط ۷ روز اخیر نگه‌دار

  // پاک‌سازی کلیدهای قدیمی
  function cleanOldChecks() {
    const all = getData(CHECKS_KEY, {});
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_DAYS);
    const cutoffStr = localDate(cutoff);
    let changed = false;
    Object.keys(all).forEach(k => {
      if (k < cutoffStr) { delete all[k]; changed = true; }
    });
    if (changed) setData(CHECKS_KEY, all);
  }

  // گرفتن وضعیت چک‌لیست یه تاریخ خاص
  function getCheckStatusForDate(dateStr) {
    const all = getData(CHECKS_KEY, {});
    return all[dateStr] || {};
  }

  // شمارش تیک‌های یه تاریخ
  function countChecks(dateStr) {
    const data = getCheckStatusForDate(dateStr);
    return Object.values(data).filter(Boolean).length;
  }

  // ریست دستی چک‌لیست فردا
  window.resetTomorrowChecklist = function() {
    if (!confirm('همه‌ی تیک‌های چک‌لیست فردا پاک شن؟')) return;
    const all = getData(CHECKS_KEY, {});
    const tomorrowKey = localDate(new Date(Date.now() + 86400000));
    delete all[tomorrowKey];
    setData(CHECKS_KEY, all);
    renderTomorrowPrep();
    toast('🔄 چک‌لیست پاک شد');
  };

  // بازنویسی toggleTomorrowCheck — کار با کلید فردا
  window.toggleTomorrowCheck = function(id, val) {
    const all = getData(CHECKS_KEY, {});
    const tomorrowKey = localDate(new Date(Date.now() + 86400000));
    if (!all[tomorrowKey]) all[tomorrowKey] = {};
    all[tomorrowKey][id] = val;
    setData(CHECKS_KEY, all);
    renderTomorrowPrep();
  };

  // بازنویسی renderTomorrowPrep
  window.renderTomorrowPrep = function() {
    const el = document.getElementById('tomorrowContainer');
    if (!el) return;
    if (!isSchoolStarted()) { el.innerHTML = ''; return; }

    cleanOldChecks();

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDay = tomorrowDate.getDay();
    const tomorrowName = WEEK_DAYS_FA[tomorrowDay];
    const tomorrowKey = localDate(tomorrowDate);
    const classes = SCHOOL_SCHEDULE[tomorrowDay] || [];

    // ===== فردا تعطیله =====
    if (classes.length === 0) {
      el.innerHTML = '<div class="tomorrow-card off"><div class="tmr-title">🎒 آماده‌سازی فردا</div>' +
        '<div class="tmr-off">فردا (' + tomorrowName + ') تعطیله — کیف لازم نداری 🎉</div></div>';
      return;
    }

    // ===== وسایل مورد نیاز =====
    const items = [];
    classes.forEach(c => {
      items.push({ id: 'book-' + c, icon: SUBJECT_ICONS[c] || '📚', label: 'کتاب ' + c });
    });
    items.push({ id: 'notebook', icon: '📓', label: 'دفتر مشق' });
    items.push({ id: 'pencilcase', icon: '✏️', label: 'جامدادی' });
    if (classes.includes('ورزش')) items.push({ id: 'sport', icon: '👟', label: 'لباس ورزشی' });
    if (classes.includes('آزمایشگاه')) items.push({ id: 'lab', icon: '🥼', label: 'روپوش آزمایشگاه' });

    // ===== لیست مطالعه =====
    let scheduleList = SCHEDULE[tomorrowDay] || [];
    if (typeof getAdjustedSchedule === 'function') {
      scheduleList = getAdjustedSchedule(tomorrowDay);
    } else {
      scheduleList = scheduleList.filter(x => x[3] !== 'school');
    }
    const studyList = scheduleList.filter(x => x[3] === 'study');

    // ===== چک‌های موجود =====
    const todayChecks = getCheckStatusForDate(tomorrowKey);
    const doneCount = items.filter(it => todayChecks[it.id]).length;
    const allDone = doneCount === items.length;
    const pct = Math.round((doneCount / items.length) * 100);

    // ===== وضعیت دیروز (یعنی امشب چی تیک زده بودی؟) =====
    // کلیدی که فردا باید پرش کنی: فردای فردا
    const dayAfterTomorrow = new Date(Date.now() + 2*86400000);
    const datKey = localDate(dayAfterTomorrow);
    const yesterdayChecks = getCheckStatusForDate(datKey);
    // اگه کاربر دیشب چک‌لیست امروز رو ناتموم گذاشته، اینجا هشدار
    // چک‌لیست امروز یعنی چیزی که دیشب پرش کردی
    const todayKey = localDate();
    const yesterdayStatus = getCheckStatusForDate(todayKey);
    const yesterdayDone = Object.values(yesterdayStatus).filter(Boolean).length;

    // ===== هشدار ناتموم بودن چک‌لیست قبلی =====
    // تعداد آیتم‌های دیروز چقدر بوده؟
    const yesterdayDay = new Date().getDay();
    const yesterdayClasses = SCHOOL_SCHEDULE[yesterdayDay] || [];
    let yesterdayItemCount = 0;
    if (yesterdayClasses.length > 0) {
      yesterdayItemCount = yesterdayClasses.length + 2;
      if (yesterdayClasses.includes('ورزش')) yesterdayItemCount++;
      if (yesterdayClasses.includes('آزمایشگاه')) yesterdayItemCount++;
    }
    const yesterdayWasIncomplete = yesterdayItemCount > 0 &&
                                     yesterdayDone > 0 &&
                                     yesterdayDone < yesterdayItemCount;

    // ===== ساخت HTML =====
    let html = '<div class="tomorrow-card">' +
      '<div class="tmr-title">🎒 آماده‌سازی فردا — ' + tomorrowName + ' ' + (allDone ? '✅' : '') + '</div>' +
      '<div class="tmr-subtitle">📚 کلاس‌های فردا (' + fa(classes.length) + ' درس):</div>' +
      '<div class="tmr-classes">' + classes.map(c => '<span class="tmr-class-chip">' + (SUBJECT_ICONS[c]||'📚') + ' ' + esc(c) + '</span>').join('') + '</div>';

    // هشدار ناتموم
    if (yesterdayWasIncomplete) {
      html += '<div class="tmr-warn">⚠️ <b>دیشب چک‌لیست ناتموم موند!</b> ' +
        fa(yesterdayDone) + ' از ' + fa(yesterdayItemCount) + ' تیک خورده بود. ' +
        'امشب کامل کن.</div>';
    }

    html += '<div class="tmr-subtitle">✅ چک‌لیست وسایل (' + fa(doneCount) + '/' + fa(items.length) + ' — ' + fa(pct) + '٪):</div>' +
      '<div class="tmr-checklist">' +
        items.map(it => '<label class="tmr-check">' +
          '<input type="checkbox" ' + (todayChecks[it.id] ? 'checked' : '') + ' onchange="toggleTomorrowCheck(\'' + it.id + '\', this.checked)">' +
          '<span class="tmr-box"></span>' +
          '<span>' + it.icon + ' ' + esc(it.label) + '</span>' +
        '</label>').join('') +
      '</div>';

    if (studyList.length) {
      html += '<div class="tmr-subtitle">📖 مطالعه فردا:</div>' +
        '<div class="tmr-study">' +
          studyList.map(s => '<div class="tmr-study-item">' +
            '<span>' + s[4] + ' ' + esc(s[2]) + '</span>' +
            '<span style="opacity:.8;font-size:.9em">' + fa(s[0]) + '–' + fa(s[1]) + '</span>' +
          '</div>').join('') +
        '</div>';
    }

    html += '<div class="tmr-actions">' +
      '<button class="tmr-reset-btn" onclick="resetTomorrowChecklist()">🔄 ریست چک‌لیست</button>' +
      (allDone ? '<span class="tmr-last-status" style="flex:1;text-align:right">✅ کیف آماده‌ست!</span>' : '') +
    '</div>';

    html += '</div>';
    el.innerHTML = html;
  };

})();


// ============= SPACED_REP_V1 — مرور فاصله‌دار خودکار =============
(function() {

  const REVIEW_KEY = 'ilia-reviews';
  const INTERVALS = [1, 3, 7, 14, 30]; // روز

  // ---------- ساخت مرورها بعد از ثبت جلسه ----------
  function createReviewsForSession(session) {
    const reviews = getData(REVIEW_KEY, []);
    const baseDate = new Date(session.date + 'T00:00:00');
    INTERVALS.forEach((days, idx) => {
      const due = new Date(baseDate);
      due.setDate(due.getDate() + days);
      reviews.push({
        id: session.id + '_' + idx,
        sessionId: session.id,
        subj: session.subj,
        topic: session.topic,
        interval: days,
        intervalIdx: idx,
        baseDate: session.date,
        dueDate: localDate(due),
        done: false,
        created: Date.now()
      });
    });
    setData(REVIEW_KEY, reviews);
  }

  // ---------- گرفتن مرورهای امروز ----------
  function getDueReviews() {
    const all = getData(REVIEW_KEY, []);
    const t = today();
    return all.filter(r => !r.done && r.dueDate <= t)
              .sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  }

  // ---------- تعداد مرورهای پیش رو ----------
  function getUpcomingCount(days) {
    const all = getData(REVIEW_KEY, []);
    const t = today();
    const future = new Date(); future.setDate(future.getDate() + days);
    const futureStr = localDate(future);
    return all.filter(r => !r.done && r.dueDate > t && r.dueDate <= futureStr).length;
  }

  // ---------- پاک‌سازی قدیمی ----------
  function cleanOldReviews() {
    const all = getData(REVIEW_KEY, []);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);
    const cutoffStr = localDate(cutoff);
    const filtered = all.filter(r => !r.done || r.dueDate >= cutoffStr);
    if (filtered.length !== all.length) setData(REVIEW_KEY, filtered);
  }

  // ---------- علامت‌گذاری مرور انجام شده ----------
  window.markReviewOk = function(id) {
    const all = getData(REVIEW_KEY, []);
    const r = all.find(x => x.id === id);
    if (!r) return;
    r.done = true;
    r.doneAt = Date.now();
    setData(REVIEW_KEY, all);
    renderReviewQueue();
    toast('✅ مرور ثبت شد');
    // لاگ تو جلسه‌ها (فقط ۵ دقیقه)
    const log = getData('ilia-log', []);
    log.push({ date: today(), hours: 5/60, subject: 'مرور ' + r.subj, ts: Date.now() });
    setData('ilia-log', log);
    renderStats();
  };

  // ---------- یادم نیومد — برگرد از اول ----------
  window.markReviewBad = function(id) {
    const all = getData(REVIEW_KEY, []);
    const r = all.find(x => x.id === id);
    if (!r) return;
    // از اول: interval جدید ۱ روز
    const newDue = new Date();
    newDue.setDate(newDue.getDate() + 1);
    r.interval = 1;
    r.intervalIdx = 0;
    r.dueDate = localDate(newDue);
    r.failCount = (r.failCount || 0) + 1;
    setData(REVIEW_KEY, all);
    renderReviewQueue();
    toast('❌ فردا دوباره امتحان کن');
  };

  // ---------- به فردا موکول کن ----------
  window.snoozeReview = function(id) {
    const all = getData(REVIEW_KEY, []);
    const r = all.find(x => x.id === id);
    if (!r) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    r.dueDate = localDate(tomorrow);
    setData(REVIEW_KEY, all);
    renderReviewQueue();
    toast('⏰ فردا یادت می‌ندازم');
  };

  // ---------- رندر کارت مرور ----------
  window.renderReviewQueue = function() {
    const el = document.getElementById('reviewContainer');
    if (!el) return;
    if (!isSchoolStarted()) { el.innerHTML = ''; return; }

    cleanOldReviews();

    const due = getDueReviews();
    const upcoming7 = getUpcomingCount(7);
    const totalAll = getData(REVIEW_KEY, []).filter(r => !r.done).length;

    // هیچ مروری نیست
    if (due.length === 0 && upcoming7 === 0) {
      el.innerHTML = '<div class="review-card empty">' +
        '<div class="review-title">📖 مرورهای امروز</div>' +
        '<div class="review-empty-msg">🎉 مروری برای امروز نداری<br>' +
        '<span style="font-size:.85em;opacity:.85;display:block;margin-top:6px">با هر جلسه‌ی مطالعه، مرورهای خودکار ساخته میشه</span></div>' +
        '</div>';
      return;
    }

    // اگه امروز چیزی نیست ولی آینده هست
    if (due.length === 0) {
      el.innerHTML = '<div class="review-card empty">' +
        '<div class="review-title">📖 مرورهای امروز <span class="review-count">✅ تمومه</span></div>' +
        '<div class="review-empty-msg">هیچ مروری برای امروز نداری</div>' +
        '<div class="review-future">📅 ' + fa(upcoming7) + ' مرور در ۷ روز آینده — ' + fa(totalAll) + ' کل</div>' +
        '</div>';
      return;
    }

    // نمایش ۳ تا اول + دکمه برای بقیه
    const showLimit = 3;
    const visible = due.slice(0, showLimit);
    const remaining = due.length - visible.length;

    let html = '<div class="review-card">' +
      '<div class="review-title">📖 مرورهای امروز <span class="review-count">' + fa(due.length) + ' مورد</span></div>' +
      '<div class="review-list">';

    visible.forEach(r => {
      // محاسبه‌ی تأخیر
      const dueD = new Date(r.dueDate + 'T00:00:00');
      const nowD = new Date(); nowD.setHours(0,0,0,0);
      const diffDays = Math.floor((nowD - dueD) / 86400000);
      const overdue = diffDays > 0;

      const intervalLabel = overdue ? '⚠️ ' + fa(diffDays) + ' روز تأخیر' : 'مرور روز ' + fa(r.interval);
      const badgeCls = overdue ? 'review-interval-badge overdue' : 'review-interval-badge';

      const icon = SUBJECT_ICONS[r.subj] || '📚';

      html += '<div class="review-item">' +
        '<div class="review-item-info">' +
          '<div class="review-item-title">' + icon + ' ' + esc(r.subj) + ' — ' + esc(r.topic) + '</div>' +
          '<div class="review-item-meta">' +
            '<span class="' + badgeCls + '">' + intervalLabel + '</span>' +
            '<span>جلسه: ' + fa(r.baseDate) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="review-btns">' +
          '<button class="review-btn snooze" onclick="snoozeReview(\'' + r.id + '\')" title="فردا">⏰</button>' +
          '<button class="review-btn bad" onclick="markReviewBad(\'' + r.id + '\')" title="یادم نیومد">✕</button>' +
          '<button class="review-btn ok" onclick="markReviewOk(\'' + r.id + '\')" title="مرور کردم">✓</button>' +
        '</div>' +
      '</div>';
    });

    html += '</div>';

    if (remaining > 0) {
      html += '<button class="review-expand" onclick="expandReviews()">👇 ' + fa(remaining) + ' مرور دیگه</button>';
      html += '<div id="reviewExtra" style="display:none;position:relative;z-index:1;margin-top:8px">' +
        '<div class="review-list">' +
        due.slice(showLimit).map(r => {
          const dueD = new Date(r.dueDate + 'T00:00:00');
          const nowD = new Date(); nowD.setHours(0,0,0,0);
          const diffDays = Math.floor((nowD - dueD) / 86400000);
          const overdue = diffDays > 0;
          const intervalLabel = overdue ? '⚠️ ' + fa(diffDays) + ' روز تأخیر' : 'مرور روز ' + fa(r.interval);
          const badgeCls = overdue ? 'review-interval-badge overdue' : 'review-interval-badge';
          const icon = SUBJECT_ICONS[r.subj] || '📚';
          return '<div class="review-item">' +
            '<div class="review-item-info">' +
              '<div class="review-item-title">' + icon + ' ' + esc(r.subj) + ' — ' + esc(r.topic) + '</div>' +
              '<div class="review-item-meta">' +
                '<span class="' + badgeCls + '">' + intervalLabel + '</span>' +
                '<span>جلسه: ' + fa(r.baseDate) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="review-btns">' +
              '<button class="review-btn snooze" onclick="snoozeReview(\'' + r.id + '\')" title="فردا">⏰</button>' +
              '<button class="review-btn bad" onclick="markReviewBad(\'' + r.id + '\')" title="یادم نیومد">✕</button>' +
              '<button class="review-btn ok" onclick="markReviewOk(\'' + r.id + '\')" title="مرور کردم">✓</button>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div></div>';
    }

    if (upcoming7 > 0) {
      html += '<div class="review-future">📅 ' + fa(upcoming7) + ' مرور هم تو ۷ روز آینده داری</div>';
    }

    html += '</div>';
    el.innerHTML = html;
  };

  window.expandReviews = function() {
    const extra = document.getElementById('reviewExtra');
    if (extra) {
      extra.style.display = 'block';
      const btn = extra.previousElementSibling;
      if (btn) btn.style.display = 'none';
    }
  };

  // ---------- Hook به addSession — خودکار مرور بساز ----------
  if (typeof addSession === 'function') {
    const _origAddSession = addSession;
    addSession = function() {
      const before = getData(SS_KEY, []).length;
      try { _origAddSession.apply(this, arguments); } catch(_e) { console.error("chain _origAddSession:", _e && _e.message); }
      const after = getData(SS_KEY, []);
      if (after.length > before) {
        const newSession = after[after.length - 1];
        createReviewsForSession(newSession);
        renderReviewQueue();
      }
    };
  }

  // ---------- Hook به مشاور شبانه (گزارش شب) ----------
  // اگه شب از طریق مشاور ثبت شد، اونم مرور بساز
  // (مشاور مستقیم log اضافه می‌کنه، بدون addSession)
  // راه ساده: بعد از closeAssistant، چک کن آخرین لاگ چیه
  if (typeof closeAssistant === 'function') {
    const _origCloseAssistant = closeAssistant;
    closeAssistant = function() {
      try { _origCloseAssistant.apply(this, arguments); } catch(_e) { console.error("chain _origCloseAssistant:", _e && _e.message); }
      // اگه گزارش شب تازه ثبت شده، مرور بساز
      // ولی این پیچیده‌ست، فعلاً skip
      renderReviewQueue();
    };
  }

  // ---------- Init: یه بار رندر ----------
  setTimeout(() => { try { renderReviewQueue(); } catch(e) { console.error(e); } }, 800);

})();


// ============= AUTO_PLAN_V1 — برنامه‌ریز خودکار روزانه =============
(function() {

  // آخرین تاریخ مطالعه یه درس
  function getLastStudyDate(subj) {
    const logs = getData(SS_KEY, []).filter(s => s.subj === subj);
    if (!logs.length) return null;
    return logs.sort((a,b) => b.date.localeCompare(a.date))[0].date;
  }

  // چند روز پیش مطالعه شده؟
  function daysSinceStudy(subj) {
    const last = getLastStudyDate(subj);
    if (!last) return 999;
    const d = new Date(last + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    return Math.floor((now - d) / 86400000);
  }

  // میانگین نمره درس
  function getAvg(subj) {
    const grades = getData(GRK, []).filter(g => g.subject === subj);
    if (!grades.length) return null;
    return grades.reduce((s,g) => s+g.value, 0) / grades.length;
  }

  // درس ضعیفه؟
  function isWeak(subj) {
    const avg = getAvg(subj);
    const profile = getProfile();
    const lvl = (profile.levels || {})[subj] || 0;
    if (avg !== null && avg < 15) return true;
    if (avg === null && lvl === 1) return true;
    return false;
  }

  // === تولید پیشنهادها ===
  function generateSuggestions() {
    const suggestions = [];

    // 1) مرورهای عقب‌افتاده امروز
    let dueReviewsCount = 0;
    try {
      if (typeof getDueReviews === 'function') {
        // از closure فیچر ۹ استفاده نمی‌کنیم، مستقیم از localStorage
      }
      const reviews = getData('ilia-reviews', []);
      const t = today();
      dueReviewsCount = reviews.filter(r => !r.done && r.dueDate <= t).length;
    } catch(e) {}

    if (dueReviewsCount > 0) {
      suggestions.push({
        priority: 1,
        icon: '📖',
        title: 'مرور ' + fa(dueReviewsCount) + ' مبحث',
        reason: 'طبق برنامه‌ی مرور فاصله‌دار — قبل از اینکه از یادت بره',
        action: 'مرور کن',
        handler: 'goReview'
      });
    }

    // 2) درس‌های ضعیف که ۳+ روزه نخوندی
    const weakSubjects = ['ریاضی','فیزیک','هندسه','شیمی','عربی','زبان','فارسی','دینی','جغرافیا','نگارش']
      .filter(isWeak)
      .map(s => ({ subj: s, days: daysSinceStudy(s) }))
      .filter(x => x.days >= 3)
      .sort((a,b) => b.days - a.days);

    weakSubjects.slice(0, 2).forEach(x => {
      suggestions.push({
        priority: 2,
        icon: SUBJECT_ICONS[x.subj] || '📚',
        title: x.subj,
        reason: x.days === 999
          ? 'ضعیف + هیچ‌وقت مستقیم کار نکردی'
          : 'ضعیف + ' + fa(x.days) + ' روزه نخوندی',
        action: 'بریم',
        handler: 'goWeak',
        subj: x.subj
      });
    });

    // 3) درس‌های نفهمیده دیروز (از مشاور دیشب)
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = 'ilia-school-report-' + localDate(yesterday);
      const report = getData(yKey, null);
      if (report && report.missed && report.missed.length) {
        report.missed.slice(0, 2).forEach(subj => {
          // جلوگیری از تکرار
          if (suggestions.some(s => s.subj === subj || s.title === subj)) return;
          suggestions.push({
            priority: 3,
            icon: SUBJECT_ICONS[subj] || '⚠️',
            title: 'مرور ' + subj,
            reason: 'دیروز سر کلاس کامل نفهمیدی',
            action: 'بریم',
            handler: 'goWeak',
            subj: subj
          });
        });
      }
    } catch(e) {}

    // 4) اگه خالیه
    if (suggestions.length === 0) {
      return [];
    }

    return suggestions.slice(0, 3);
  }

  // === رندر ===
  window.renderAutoPlan = function() {
    const el = document.getElementById('autoPlanContainer');
    if (!el) return;
    if (!isSchoolStarted()) { el.innerHTML = ''; return; }

    const suggestions = generateSuggestions();

    if (suggestions.length === 0) {
      el.innerHTML = '<div class="plan-daily">' +
        '<div class="plan-daily-title">🎯 تمرکز امروز</div>' +
        '<div class="plan-empty-msg">🎉 همه چیز روبراهه!<br>' +
        '<span style="font-size:.82em;opacity:.75;display:block;margin-top:6px">مروری نداری، درس ضعیفی هم عقب نمونده</span></div>' +
        '</div>';
      return;
    }

    const pLabels = { 1: '🔥', 2: '🎯', 3: '📌' };

    let html = '<div class="plan-daily">' +
      '<div class="plan-daily-title">🎯 تمرکز امروز</div>' +
      '<div class="plan-daily-sub">این ' + fa(suggestions.length) + ' مورد رو امروز انجام بده</div>' +
      '<div class="plan-suggestions">';

    suggestions.forEach((s, i) => {
      html += '<div class="plan-sug">' +
        '<div class="plan-sug-num p' + s.priority + '">' + fa(i+1) + '</div>' +
        '<div class="plan-sug-info">' +
          '<div class="plan-sug-title">' + s.icon + ' ' + esc(s.title) + '</div>' +
          '<div class="plan-sug-reason">' + s.reason + '</div>' +
        '</div>' +
        '<button class="plan-sug-btn" onclick="runAutoPlanAction(' + i + ')">' + s.action + '</button>' +
      '</div>';
    });

    html += '</div></div>';
    el.innerHTML = html;

    // ذخیره‌ی آخرین پیشنهادها برای دکمه‌ها
    window._lastAutoPlan = suggestions;
  };

  // === اکشن دکمه‌ها ===
  window.runAutoPlanAction = function(i) {
    const s = (window._lastAutoPlan || [])[i];
    if (!s) return;
    if (s.handler === 'goReview') {
      const reviewEl = document.getElementById('reviewContainer');
      if (reviewEl) {
        reviewEl.scrollIntoView({behavior:'smooth', block:'center'});
        // فلش زرد موقت
        reviewEl.style.transition = 'box-shadow .3s';
        reviewEl.style.boxShadow = '0 0 0 4px rgba(6,182,212,.4)';
        setTimeout(() => { reviewEl.style.boxShadow = ''; }, 1500);
      }
      toast('📖 برو سراغ مرورها');
    } else if (s.handler === 'goWeak' && s.subj) {
      // باز کن راهنمای اون درس
      if (typeof openGuide === 'function') {
        openGuide(s.subj, 'study', '', '', SUBJECT_ICONS[s.subj] || '📖');
      }
    }
  };

  // === Hook به renderها ===
  // بعد از هر رندر dashboard، این هم رندر شه
  if (typeof renderReviewQueue === 'function') {
    const _origReview = renderReviewQueue;
    renderReviewQueue = function() {
      try { _origReview.apply(this, arguments); } catch(_e) { console.error("chain _origReview:", _e && _e.message); }
      try { renderAutoPlan(); } catch(e) {}
    };
  }

  // اگه renderReviewQueue نبود، خودمون تو Init صدا می‌زنیم
  setTimeout(() => {
    if (document.getElementById('dashboard') &&
        document.getElementById('dashboard').classList.contains('active')) {
      try { renderAutoPlan(); } catch(e) { console.error(e); }
    }
  }, 1000);

})();


// ============= WIZARD_V1 — مشاور تعاملی =============
(function() {

  const WIZARD = {
    current: 0,
    steps: [],
    data: {},
    isOpen: false
  };
  window.WIZARD = WIZARD;

  // ==== کمکی ====
  function getStarsHtml(id, current) {
    return [1,2,3,4,5].map(n =>
      '<span class="wizard-star ' + (current >= n ? 'active' : '') + '" onclick="WIZARD.setStar(\'' + id + '\', ' + n + ')">⭐</span>'
    ).join('');
  }
  function getChipsHtml(id, list, selected, multi) {
    selected = selected || [];
    if (!Array.isArray(selected)) selected = [selected];
    return '<div class="wizard-chips">' + list.map(item => {
      const sel = selected.includes(item);
      return '<button type="button" class="wizard-chip ' + (sel ? 'selected' : '') + '" onclick="WIZARD.pickChip(\'' + id + '\', \'' + item.replace(/'/g, "\\'") + '\', ' + (multi?'true':'false') + ')">' + esc(item) + '</button>';
    }).join('') + '</div>';
  }

  // ==== انتخاب چیپ ====
  WIZARD.pickChip = function(id, item, multi) {
    WIZARD.collectCurrent();
    if (!WIZARD.data[id]) WIZARD.data[id] = multi ? [] : null;
    if (multi) {
      const arr = Array.isArray(WIZARD.data[id]) ? WIZARD.data[id] : [];
      const idx = arr.indexOf(item);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(item);
      WIZARD.data[id] = arr;
    } else {
      WIZARD.data[id] = (WIZARD.data[id] === item) ? null : item;
    }
    WIZARD.render();
  };

  // ==== انتخاب ستاره ====
  WIZARD.setStar = function(id, n) {
    WIZARD.collectCurrent();
    WIZARD.data[id] = n;
    WIZARD.render();
  };

  // ==== بله/خیر ====
  WIZARD.pickYesNo = function(id, val) {
    WIZARD.collectCurrent();
    WIZARD.data[id] = val;
    WIZARD.render();
  };

  // ==== جمع‌آوری داده‌های گام فعلی ====
  WIZARD.collectCurrent = function() {
    const step = WIZARD.steps[WIZARD.current];
    if (!step || !step.collect) return;
    try {
      const d = step.collect();
      if (d && typeof d === 'object') Object.assign(WIZARD.data, d);
    } catch(e) { console.error(e); }
  };

  // ============ گام‌ها ============
  const ALL_SUBJECTS_LIST = ['ریاضی','فیزیک','هندسه','شیمی','عربی','زبان','فارسی','نگارش','جغرافیا','دینی','تفکر','دفاعی','آزمایشگاه'];
  const DISTRACT_TAGS = ['📱 گوشی','💭 فکر مزاحم','😴 خستگی','🍽 گرسنگی','🔊 سر و صدا','😐 بی‌انگیزگی','🌐 فضای مجازی','👥 دوست'];

  function buildSteps() {
    const steps = [];
    const now = new Date();
    const hour = now.getHours();
    const dayIdx = now.getDay();
    const isSchoolDay = (SCHOOL_SCHEDULE[dayIdx] || []).length > 0;

    // ---- گام ۱: خواب دیشب ----
    steps.push({
      id: 'sleep',
      icon: '😴',
      title: 'خواب دیشب',
      condition: () => {
        const d = getData('ilia-health', { sleep: [] });
        return !(d.sleep || []).find(x => x.date === today());
      },
      render: () => {
        const prev = WIZARD.data.sleep || {};
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">😴 خواب دیشب چطور بود؟</div>' +
          '<div class="wizard-q-help">وقت خواب و بیداری رو وارد کن، بعد کیفیت خواب رو با ستاره نشون بده.</div>' +
          '<div class="wizard-row">' +
            '<div><label style="font-size:.75em;color:var(--text-light);display:block;margin-bottom:4px">ساعت خواب</label>' +
            '<input type="time" class="wizard-input" id="wz-sleep" value="' + (prev.sleep || '22:30') + '"></div>' +
            '<div><label style="font-size:.75em;color:var(--text-light);display:block;margin-bottom:4px">ساعت بیداری</label>' +
            '<input type="time" class="wizard-input" id="wz-wake" value="' + (prev.wake || '06:00') + '"></div>' +
          '</div>' +
          '<div style="text-align:center;margin-top:8px">' +
            '<div style="font-size:.82em;font-weight:700;margin-bottom:4px">کیفیت خواب</div>' +
            '<div class="wizard-stars">' + getStarsHtml('sleep_quality', WIZARD.data.sleep_quality || 0) + '</div>' +
          '</div>' +
        '</div>';
      },
      collect: () => ({
        sleep_time: document.getElementById('wz-sleep')?.value,
        wake_time: document.getElementById('wz-wake')?.value
      }),
      save: () => {
        const sleep = WIZARD.data.sleep_time;
        const wake = WIZARD.data.wake_time;
        if (!sleep || !wake) return;
        const [sh, sm] = sleep.split(':').map(Number);
        const [wh, wm] = wake.split(':').map(Number);
        let total = (wh*60 + wm) - (sh*60 + sm);
        if (total < 0) total += 24*60;
        const hrs = total / 60;
        const d = getData('ilia-health', { sleep: [] });
        d.sleep = (d.sleep || []).filter(x => x.date !== today());
        d.sleep.push({ date: today(), sleep, wake, hours: hrs, quality: WIZARD.data.sleep_quality || 0 });
        setData('ilia-health', d);
        if (typeof renderHealth === 'function') renderHealth();
        return '😴 خواب: ' + fa(hrs.toFixed(1)) + ' ساعت';
      }
    });

    // ---- گام ۲: مدرسه امروز ----
    steps.push({
      id: 'school',
      icon: '🏫',
      title: 'مدرسه امروز',
      condition: () => isSchoolDay && hour >= 13 && hour <= 22,
      render: () => {
        const todayClasses = SCHOOL_SCHEDULE[dayIdx] || [];
        const prevHad = WIZARD.data.school_subjects;
        const prevMissed = WIZARD.data.school_missed;
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">🏫 امروز چی داشتی؟</div>' +
          '<div class="wizard-q-help">درس‌های امروزت رو انتخاب کن</div>' +
          getChipsHtml('school_subjects', todayClasses, prevHad || todayClasses, true) +
          '<div style="margin-top:14px">' +
            '<div class="wizard-q-title" style="font-size:.9em">🤔 کدومش رو کامل نفهمیدی؟</div>' +
            '<div class="wizard-q-help">اگه همه رو فهمیدی، خالی بذار</div>' +
            getChipsHtml('school_missed', todayClasses, prevMissed || [], true) +
          '</div>' +
        '</div>';
      },
      collect: () => ({}),
      save: () => {
        const subs = WIZARD.data.school_subjects || [];
        const missed = WIZARD.data.school_missed || [];
        if (subs.length === 0 && missed.length === 0) return;
        const key = 'ilia-school-report-' + today();
        setData(key, { subjects: subs, missed, date: today(), ts: Date.now() });
        if (typeof renderTodayReports === 'function') renderTodayReports();
        return '🏫 مدرسه: ' + subs.length + ' درس' + (missed.length ? ' — نفهمیدی: ' + missed.length : '');
      }
    });

    // ---- گام ۳: تکالیف ----
    steps.push({
      id: 'homework',
      icon: '✍️',
      title: 'تکالیف',
      condition: () => isSchoolDay && hour >= 13,
      render: () => {
        const val = WIZARD.data.has_homework;
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">✍️ تکلیف داشتی؟</div>' +
          '<div class="wizard-q-help">اگه داشتی، چی بود؟</div>' +
          '<div class="wizard-yesno">' +
            '<button type="button" class="yes ' + (val === true ? 'selected' : '') + '" onclick="WIZARD.pickYesNo(\'has_homework\', true)">✅ داشتم</button>' +
            '<button type="button" class="no ' + (val === false ? 'selected' : '') + '" onclick="WIZARD.pickYesNo(\'has_homework\', false)">❌ نداشتم</button>' +
          '</div>' +
          (val === true ? '<textarea class="wizard-textarea" id="wz-homework" placeholder="چه تکالیفی؟">' + esc(WIZARD.data.homework_text || '') + '</textarea>' : '') +
        '</div>';
      },
      collect: () => ({ homework_text: document.getElementById('wz-homework')?.value || WIZARD.data.homework_text || '' }),
      save: () => {
        if (WIZARD.data.has_homework !== true) return;
        if (!WIZARD.data.homework_text) return;
        const l = getData('ilia-todos', []);
        l.push({ id: Date.now(), text: 'تکلیف: ' + WIZARD.data.homework_text, priority: 'high', done: false });
        setData('ilia-todos', l);
        if (typeof renderTodo === 'function') renderTodo();
        return '✍️ تکلیف ثبت شد';
      }
    });

    // ---- گام ۴: مطالعه امروز ----
    steps.push({
      id: 'study',
      icon: '📚',
      title: 'مطالعه امروز',
      condition: () => true,
      render: () => {
        const subjects = WIZARD.data.study_subjects || [];
        const min = WIZARD.data.study_min || '';
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">📚 امروز چی خوندی؟</div>' +
          '<div class="wizard-q-help">اول درس‌ها رو انتخاب کن، بعد مجموع دقایق رو بنویس</div>' +
          getChipsHtml('study_subjects', ALL_SUBJECTS_LIST, subjects, true) +
          '<div style="margin-top:14px">' +
            '<label style="font-size:.82em;font-weight:700;display:block;margin-bottom:6px">⏱ مجموع دقایق مطالعه امروز</label>' +
            '<input type="number" class="wizard-input" id="wz-study-min" min="0" max="600" step="5" placeholder="مثلاً ۹۰" value="' + (min || '') + '">' +
          '</div>' +
        '</div>';
      },
      collect: () => ({ study_min: document.getElementById('wz-study-min')?.value || '' }),
      save: () => {
        const subs = WIZARD.data.study_subjects || [];
        const min = parseInt(WIZARD.data.study_min) || 0;
        if (subs.length === 0 && min === 0) return;
        if (min > 0) {
          const log = getData('ilia-log', []);
          log.push({ date: today(), hours: min/60, subject: subs.length ? subs.join('، ') : 'مطالعه', ts: Date.now() });
          setData('ilia-log', log);
        }
        if (subs.length > 0 && min > 0) {
          const sessions = getData('ilia-sessions', []);
          sessions.push({ id: Date.now(), date: today(), subj: subs[0], min, topic: 'ثبت با مشاور', source: '', pages: 0, tests: 0, ts: Date.now() });
          setData('ilia-sessions', sessions);
        }
        if (typeof renderStats === 'function') renderStats();
        if (typeof renderSessions === 'function') renderSessions();
        if (typeof renderTodayTotal === 'function') renderTodayTotal();
        return '📚 مطالعه: ' + fa(min) + ' دقیقه';
      }
    });

    // ---- گام ۵: اشتباهات ----
    steps.push({
      id: 'mistakes',
      icon: '📕',
      title: 'اشتباهات امروز',
      condition: () => true,
      render: () => {
        const val = WIZARD.data.has_mistakes;
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">📕 امروز اشتباه درسی داشتی؟</div>' +
          '<div class="wizard-q-help">سوال + دلیل اشتباه رو بنویس تا تو دفتر اشتباهات ثبت شه</div>' +
          '<div class="wizard-yesno">' +
            '<button type="button" class="yes ' + (val === true ? 'selected' : '') + '" onclick="WIZARD.pickYesNo(\'has_mistakes\', true)">✅ داشتم</button>' +
            '<button type="button" class="no ' + (val === false ? 'selected' : '') + '" onclick="WIZARD.pickYesNo(\'has_mistakes\', false)">❌ نداشتم</button>' +
          '</div>' +
          (val === true ?
            '<label style="font-size:.8em;font-weight:700;display:block;margin:8px 0 4px">📚 کدوم درس؟</label>' +
            getChipsHtml('mistake_subject', ALL_SUBJECTS_LIST, WIZARD.data.mistake_subject ? [WIZARD.data.mistake_subject] : [], false) +
            '<label style="font-size:.8em;font-weight:700;display:block;margin:12px 0 4px">❓ سوال چی بود؟</label>' +
            '<textarea class="wizard-textarea" id="wz-mq" placeholder="سوال یا مبحثی که اشتباه کردی">' + esc(WIZARD.data.mistake_q || '') + '</textarea>' +
            '<label style="font-size:.8em;font-weight:700;display:block;margin:8px 0 4px">💡 چرا اشتباه کردی؟</label>' +
            '<textarea class="wizard-textarea" id="wz-mr" placeholder="مثلاً: علامت منفی رو یادم رفت، فرمول رو قاطی کردم...">' + esc(WIZARD.data.mistake_r || '') + '</textarea>'
          : '') +
        '</div>';
      },
      collect: () => ({
        mistake_q: document.getElementById('wz-mq')?.value || '',
        mistake_r: document.getElementById('wz-mr')?.value || ''
      }),
      save: () => {
        if (WIZARD.data.has_mistakes !== true) return;
        let subj = WIZARD.data.mistake_subject || ''; if (Array.isArray(subj)) subj = subj[0] || '';
        const q = (WIZARD.data.mistake_q || '').trim();
        const r = (WIZARD.data.mistake_r || '').trim();
        if (!subj || !q) return;
        const l = getData('ilia-mistakes', []);
        l.push({ id: Date.now(), subject: subj, question: q, reason: r, date: today() });
        setData('ilia-mistakes', l);
        if (typeof renderMistakes === 'function') renderMistakes();
        return '📕 اشتباه ثبت شد';
      }
    });

    // ---- گام ۶: آزمون ----
    steps.push({
      id: 'exam',
      icon: '📝',
      title: 'آزمون / کوییز',
      condition: () => true,
      render: () => {
        const val = WIZARD.data.has_exam;
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">📝 امروز آزمون یا کوییز داشتی؟</div>' +
          '<div class="wizard-q-help">موضوع و نمره رو بگو تا تو بخش آزمون‌ها ثبت شه</div>' +
          '<div class="wizard-yesno">' +
            '<button type="button" class="yes ' + (val === true ? 'selected' : '') + '" onclick="WIZARD.pickYesNo(\'has_exam\', true)">✅ داشتم</button>' +
            '<button type="button" class="no ' + (val === false ? 'selected' : '') + '" onclick="WIZARD.pickYesNo(\'has_exam\', false)">❌ نداشتم</button>' +
          '</div>' +
          (val === true ?
            '<label style="font-size:.8em;font-weight:700;display:block;margin:8px 0 4px">📚 کدوم درس؟</label>' +
            getChipsHtml('exam_subject', ALL_SUBJECTS_LIST, WIZARD.data.exam_subject ? [WIZARD.data.exam_subject] : [], false) +
            '<input class="wizard-input" id="wz-ext" placeholder="عنوان آزمون (مثلاً: کوییز فصل ۲)" style="margin-top:8px" value="' + esc(WIZARD.data.exam_title || '') + '">' +
            '<div class="wizard-row">' +
              '<input type="number" class="wizard-input" id="wz-extot" placeholder="کل سوال" min="1" value="' + (WIZARD.data.exam_total || '') + '">' +
              '<input type="number" class="wizard-input" id="wz-excor" placeholder="درست" min="0" value="' + (WIZARD.data.exam_correct || '') + '">' +
            '</div>' +
            '<div class="wizard-row">' +
              '<input type="number" class="wizard-input" id="wz-exwr" placeholder="غلط" min="0" value="' + (WIZARD.data.exam_wrong || '') + '">' +
              '<input type="number" class="wizard-input" id="wz-exun" placeholder="نزده" min="0" value="' + (WIZARD.data.exam_unans || '') + '">' +
            '</div>'
          : '') +
        '</div>';
      },
      collect: () => ({
        exam_title: document.getElementById('wz-ext')?.value || '',
        exam_total: document.getElementById('wz-extot')?.value || '',
        exam_correct: document.getElementById('wz-excor')?.value || '',
        exam_wrong: document.getElementById('wz-exwr')?.value || '',
        exam_unans: document.getElementById('wz-exun')?.value || ''
      }),
      save: () => {
        if (WIZARD.data.has_exam !== true) return;
        let subj = WIZARD.data.exam_subject || ''; if (Array.isArray(subj)) subj = subj[0] || '';
        const title = (WIZARD.data.exam_title || '').trim() || 'آزمون';
        const total = parseInt(WIZARD.data.exam_total) || 0;
        const correct = parseInt(WIZARD.data.exam_correct) || 0;
        const wrong = parseInt(WIZARD.data.exam_wrong) || 0;
        const unans = parseInt(WIZARD.data.exam_unans) || 0;
        if (!subj || total <= 0) return;
        const exams = getData('ilia-exam-analysis', []);
        exams.push({ id: Date.now(), title, date: today(), total, correct, wrong, unans, subject: subj, ts: Date.now() });
        setData('ilia-exam-analysis', exams);
        if (typeof renderExams === 'function') renderExams();
        const pct = Math.round((correct/total)*100);
        return '📝 آزمون ثبت شد (' + fa(pct) + '٪)';
      }
    });

    // ---- گام ۷: حواس‌پرتی ----
    steps.push({
      id: 'distract',
      icon: '🧠',
      title: 'حواس‌پرتی',
      condition: () => true,
      render: () => {
        const tags = WIZARD.data.distract_tags || [];
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">🧠 امروز چی باعث شد پرت شی؟</div>' +
          '<div class="wizard-q-help">هر چی بود انتخاب کن (می‌تونی چند تا بزنی). اگه پرت نشدی، رد کن.</div>' +
          getChipsHtml('distract_tags', DISTRACT_TAGS, tags, true) +
        '</div>';
      },
      collect: () => ({}),
      save: () => {
        const tags = WIZARD.data.distract_tags || [];
        if (tags.length === 0) return;
        const l = getData('ilia-distraction', []);
        l.push({ id: Date.now(), date: today(), tags: tags.slice(), note: '', ts: Date.now() });
        setData('ilia-distraction', l);
        if (typeof renderDistractionPage === 'function') renderDistractionPage();
        return '🧠 ' + tags.length + ' عامل حواس‌پرتی';
      }
    });

    // ---- گام ۸: ژورنال شبانه ----
    steps.push({
      id: 'journal',
      icon: '🌙',
      title: 'ژورنال شبانه',
      condition: () => hour >= 19,
      render: () => {
        return '<div class="wizard-q">' +
          '<div class="wizard-q-title">🌙 چند سوال کوتاه شبانه</div>' +
          '<div class="wizard-q-help">این‌ها رو تو ژورنال ذخیره می‌کنم</div>' +
          '<label style="font-size:.8em;font-weight:700;display:block;margin:8px 0 4px">✅ امروز چی یاد گرفتی؟</label>' +
          '<textarea class="wizard-textarea" id="wz-j1" placeholder="مثلاً: مشتق زنجیره‌ای رو فهمیدم">' + esc(WIZARD.data.j1 || '') + '</textarea>' +
          '<label style="font-size:.8em;font-weight:700;display:block;margin:8px 0 4px">⚠️ چی برات سخت بود؟</label>' +
          '<textarea class="wizard-textarea" id="wz-j2" placeholder="مثلاً: انتگرال‌گیری">' + esc(WIZARD.data.j2 || '') + '</textarea>' +
          '<label style="font-size:.8em;font-weight:700;display:block;margin:8px 0 4px">🎯 فردا می‌خوای چیکار کنی؟</label>' +
          '<textarea class="wizard-textarea" id="wz-j3" placeholder="مثلاً: ۲ ساعت ریاضی">' + esc(WIZARD.data.j3 || '') + '</textarea>' +
        '</div>';
      },
      collect: () => ({
        j1: document.getElementById('wz-j1')?.value || '',
        j2: document.getElementById('wz-j2')?.value || '',
        j3: document.getElementById('wz-j3')?.value || ''
      }),
      save: () => {
        const j1 = (WIZARD.data.j1 || '').trim();
        const j2 = (WIZARD.data.j2 || '').trim();
        const j3 = (WIZARD.data.j3 || '').trim();
        if (!j1 && !j2 && !j3) return;
        const journals = getData('ilia-journal', []);
        const idx = journals.findIndex(x => x.date === today());
        const entry = { date: today(), learned: j1, hard: j2, tomorrow: j3, ts: Date.now() };
        if (idx >= 0) journals[idx] = entry; else journals.push(entry);
        setData('ilia-journal', journals);
        if (typeof renderJournal === 'function') renderJournal();
        return '🌙 ژورنال ذخیره شد';
      }
    });

    return steps;
  }

  // ============ کنترل ویزارد ============
  WIZARD.open = function() {
    // ساخت گام‌ها بر اساس زمان و وضعیت
    WIZARD.steps = buildSteps().filter(s => {
      try { return s.condition ? s.condition() : true; } catch(e) { return true; }
    });
    WIZARD.current = 0;
    WIZARD.data = {};
    WIZARD.isOpen = true;
    if (WIZARD.steps.length === 0) {
      // هیچ سوالی نیست → نمایش خلاصه
      WIZARD.steps.push({
        id: 'empty',
        icon: '🎉',
        title: 'همه چیز ثبت شده',
        render: () => '<div class="wizard-empty"><span class="ico">✅</span>' +
          '<b>امروز همه چیز رو ثبت کردی!</b>' +
          '<div style="font-size:.85em;margin-top:8px;opacity:.8">فردا دوباره سر بزن</div></div>',
        collect: () => ({}),
        save: () => null
      });
    }
    document.getElementById('wizardOverlay').classList.add('active');
    WIZARD.render();
  };

  WIZARD.close = function() {
    WIZARD.isOpen = false;
    document.getElementById('wizardOverlay').classList.remove('active');
  };

  WIZARD.render = function() {
    const step = WIZARD.steps[WIZARD.current];
    if (!step) return;
    const total = WIZARD.steps.length;

    document.getElementById('wizardIcon').textContent = step.icon || '📝';
    document.getElementById('wizardTitle').textContent = step.title || '—';
    document.getElementById('wizardSub').textContent = 'گام ' + fa(WIZARD.current + 1) + ' از ' + fa(total);
    document.getElementById('wizardProgress').style.width = ((WIZARD.current + 1) / total * 100) + '%';

    document.getElementById('wizardBody').innerHTML = step.render ? step.render() : '';

    // دکمه‌ها
    const isFirst = WIZARD.current === 0;
    const isLast = WIZARD.current === total - 1;
    const isSummary = step.id === 'summary';

    let footer = '';
    if (!isFirst) footer += '<button class="wizard-btn wizard-btn-secondary" onclick="WIZARD.prev()">← قبلی</button>';
    if (!isLast) footer += '<button class="wizard-btn wizard-btn-skip" onclick="WIZARD.next()">رد کن</button>';
    if (isLast) {
      footer += '<button class="wizard-btn wizard-btn-primary" onclick="WIZARD.finish()" style="flex:2">✅ ذخیره و بستن</button>';
    } else {
      footer += '<button class="wizard-btn wizard-btn-primary" onclick="WIZARD.next()">بعدی →</button>';
    }
    document.getElementById('wizardFooter').innerHTML = footer;
  };

  WIZARD.next = function() {
    WIZARD.collectCurrent();
    if (WIZARD.current < WIZARD.steps.length - 1) {
      WIZARD.current++;
      WIZARD.render();
      const body = document.getElementById('wizardBody');
      if (body) body.scrollTop = 0;
    }
  };

  WIZARD.prev = function() {
    WIZARD.collectCurrent();
    if (WIZARD.current > 0) {
      WIZARD.current--;
      WIZARD.render();
      const body = document.getElementById('wizardBody');
      if (body) body.scrollTop = 0;
    }
  };

  WIZARD.finish = function() {
    // ذخیره همه گام‌ها
    const results = [];
    WIZARD.steps.forEach((step, idx) => {
      if (step.save && step.id !== 'empty') {
        try {
          const r = step.save();
          if (r) results.push(r);
        } catch(e) { console.error('wizard save:', e); }
      }
    });
    WIZARD.close();

    // نمایش خلاصه در toast یا مودال کوچیک
    if (results.length > 0) {
      const msg = '✅ ' + results.length + ' مورد ذخیره شد';
      toast(msg);
      // خلاصه رو در یک مودال کوچیک نشون بده
      setTimeout(() => {
        const summary = results.map(r => '• ' + r).join('\n');
        // از toast استفاده می‌کنیم
        const t = document.getElementById('toast');
        if (t) {
          t.innerHTML = '<div style="text-align:right;line-height:1.9">' + results.map(r => '• ' + r).join('<br>') + '</div>';
          t.classList.add('show');
          t._tm = setTimeout(() => t.classList.remove('show'), 5000);
        }
      }, 400);
    } else {
      toast('هیچ چیزی ثبت نشد');
    }
  };

  // ============ کیبورد ============
  document.addEventListener('keydown', (e) => {
    if (!WIZARD.isOpen) return;
    if (e.key === 'Escape') { WIZARD.close(); return; }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Enter') { e.preventDefault(); WIZARD.next(); }
  });

  console.log('✅ WIZARD_V1 loaded');

})();


// ============= SETTINGS_V1 — تنظیمات =============
(function() {

  const KEY = 'ilia-settings';
  const DEFAULTS = {
    sound: true,
    vibrate: true,
    assistant: true,
    habitPhase: true,
    goalMode: 'auto',
    manualGoal: 2,
    autoDark: false
  };

  function getSettings() {
    return Object.assign({}, DEFAULTS, getData(KEY, {}));
  }
  function saveSettings(s) { setData(KEY, s); }
  function get(k) { return getSettings()[k]; }

  const SETTINGS = {
    get: get,

    toggle: function(k, v) {
      const s = getSettings();
      s[k] = v;
      saveSettings(s);
      toast('✅ ذخیره شد');

      // اثرات جانبی
      if (k === 'autoDark') {
        applyAutoDark(v);
      }
      if (k === 'habitPhase') {
        // رفرش همه‌جا
        if (typeof renderTodayTotal === 'function') renderTodayTotal();
        if (typeof renderTodaySchedule === 'function') renderTodaySchedule();
        if (typeof renderNow === 'function') renderNow();
      }
      if (k === 'assistant') {
        if (v === true) {
          setTimeout(() => {
            if (typeof checkAssistant === 'function') checkAssistant();
          }, 1000);
        }
      }
    },

    setGoalMode: function(mode) {
      const s = getSettings();
      s.goalMode = mode;
      saveSettings(s);
      const row = document.getElementById('manualGoalRow');
      if (row) row.style.display = mode === 'manual' ? 'flex' : 'none';
      if (typeof renderTodayTotal === 'function') renderTodayTotal();
      toast('✅ حالت هدف: ' + (mode === 'manual' ? 'دستی' : 'خودکار'));
    },

    setManualGoal: function(v) {
      const s = getSettings();
      s.manualGoal = parseFloat(v) || 2;
      saveSettings(s);
      if (typeof renderTodayTotal === 'function') renderTodayTotal();
      toast('✅ هدف: ' + fa(s.manualGoal) + ' ساعت');
    },

    cleanup: function() {
      if (!confirm('پاک‌سازی داده‌های قدیمی (چک‌لیست‌های قدیمی، لاگ‌های خیلی قدیمی)؟')) return;
      let cleaned = 0;
      // چک‌لیست فردا
      const tc = getData('ilia-tomorrow-checks', {});
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = localDate(cutoff);
      Object.keys(tc).forEach(k => { if (k < cutoffStr) { delete tc[k]; cleaned++; } });
      setData('ilia-tomorrow-checks', tc);
      // تیک قوانین
      const rc = getData('ilia-rules-checks', {});
      Object.keys(rc).forEach(k => { if (k < cutoffStr) { delete rc[k]; cleaned++; } });
      setData('ilia-rules-checks', rc);
      // لاگ قدیمی (بیشتر از ۹۰ روز)
      const logCutoff = new Date(); logCutoff.setDate(logCutoff.getDate() - 90);
      const logCutoffStr = localDate(logCutoff);
      const log = getData('ilia-log', []);
      const filteredLog = log.filter(e => e.date >= logCutoffStr);
      if (filteredLog.length < log.length) { cleaned += log.length - filteredLog.length; setData('ilia-log', filteredLog); }
      toast('🧹 ' + fa(cleaned) + ' مورد پاک شد');
      renderSettings();
    },

    resetSection: function() {
      const sel = document.getElementById('set-reset-section');
      if (!sel || !sel.value) { toast('یه بخش انتخاب کن'); return; }
      const key = sel.value;
      const label = sel.options[sel.selectedIndex].text;
      if (!confirm('«' + label + '» پاک بشه؟')) return;
      localStorage.removeItem(key);
      toast('🗑 پاک شد');
      renderSettings();
      // رفرش صفحه‌های مربوطه
      if (typeof renderStats === 'function') renderStats();
      if (typeof renderSessions === 'function') renderSessions();
      if (typeof renderHealth === 'function') renderHealth();
      if (typeof renderMistakes === 'function') renderMistakes();
      if (typeof renderExams === 'function') renderExams();
      if (typeof renderGrades === 'function') renderGrades();
      if (typeof renderTodo === 'function') renderTodo();
      if (typeof renderGoals === 'function') renderGoals();
      if (typeof renderHabits === 'function') renderHabits();
      if (typeof renderLeitner === 'function') renderLeitner();
      if (typeof renderJournal === 'function') renderJournal();
      if (typeof renderDistractionPage === 'function') renderDistractionPage();
      if (typeof renderTomorrowPrep === 'function') renderTomorrowPrep();
      if (typeof renderRules === 'function') renderRules();
      if (typeof renderReviewQueue === 'function') renderReviewQueue();
    }
  };
  window.SETTINGS = SETTINGS;

  // ============ حالت شب خودکار ============
  function applyAutoDark(enabled) {
    if (!enabled) return;
    const h = new Date().getHours();
    const shouldBeDark = h >= 19 || h < 6;
    const cur = document.body.getAttribute('data-theme');
    const target = shouldBeDark ? 'dark' : 'light';
    if (cur !== target) {
      document.body.setAttribute('data-theme', target);
      localStorage.setItem('theme', target);
      const btn = document.getElementById('themeBtn');
      if (btn) btn.textContent = target === 'dark' ? '☀️' : '🌙';
    }
  }

  // چک دوره‌ای برای حالت شب خودکار
  setInterval(() => {
    if (get('autoDark')) applyAutoDark(true);
  }, 5 * 60 * 1000);

  // ============ رندر صفحه تنظیمات ============
  function renderSettings() {
    const s = getSettings();

    // سوییچ‌ها
    const switches = {
      'set-sound': s.sound,
      'set-vibrate': s.vibrate,
      'set-assistant': s.assistant,
      'set-habit': s.habitPhase,
      'set-auto-dark': s.autoDark
    };
    Object.entries(switches).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    });

    // حالت هدف
    const gm = document.getElementById('set-goal-mode');
    if (gm) gm.value = s.goalMode;
    const row = document.getElementById('manualGoalRow');
    if (row) row.style.display = s.goalMode === 'manual' ? 'flex' : 'none';
    const mg = document.getElementById('set-manual-goal');
    if (mg) mg.value = s.manualGoal;

    // آمار حافظه
    const statsEl = document.getElementById('setStats');
    if (statsEl) {
      let totalBytes = 0;
      let keyCount = 0;
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('ilia-') || k === 'theme') {
          totalBytes += (localStorage.getItem(k) || '').length;
          keyCount++;
        }
      });
      const kb = (totalBytes / 1024).toFixed(1);
      const mb = (totalBytes / 1024 / 1024).toFixed(2);
      const totalLog = getData('ilia-log', []).length;
      const totalSessions = getData('ilia-sessions', []).length;
      const totalMistakes = getData('ilia-mistakes', []).length;
      const totalReviews = getData('ilia-reviews', []).length;

      statsEl.innerHTML =
        '<div class="set-stat"><div class="set-stat-v">' + fa(keyCount) + '</div><div class="set-stat-l">کلید</div></div>' +
        '<div class="set-stat"><div class="set-stat-v">' + (parseFloat(mb) > 1 ? fa(mb) + ' MB' : fa(kb) + ' KB') + '</div><div class="set-stat-l">حجم</div></div>' +
        '<div class="set-stat"><div class="set-stat-v">' + fa(totalLog) + '</div><div class="set-stat-l">لاگ</div></div>' +
        '<div class="set-stat"><div class="set-stat-v">' + fa(totalSessions) + '</div><div class="set-stat-l">جلسه</div></div>' +
        '<div class="set-stat"><div class="set-stat-v">' + fa(totalMistakes) + '</div><div class="set-stat-l">اشتباه</div></div>' +
        '<div class="set-stat"><div class="set-stat-v">' + fa(totalReviews) + '</div><div class="set-stat-l">مرور</div></div>';
    }

    // آخرین بکاپ
    const lbEl = document.getElementById('setLastBackup');
    if (lbEl) {
      const last = parseInt(localStorage.getItem('ilia-last-backup') || '0');
      if (!last) lbEl.textContent = 'هنوز پشتیبان نگرفتی';
      else {
        const days = Math.floor((Date.now() - last) / 86400000);
        const d = new Date(last);
        const j = getShamsi(d);
        lbEl.textContent = 'آخرین: ' + fa(j.d) + ' ' + j.monthName + ' (' + (days === 0 ? 'امروز' : fa(days) + ' روز پیش') + ')';
      }
    }
  }
  window.renderSettings = renderSettings;

  // ============ Hook به go() ============
  if (typeof go === 'function') {
    const _origGo = go;
    go = function(id) {
      try { _origGo.apply(this, arguments); } catch(_e) { console.error("chain _origGo:", _e && _e.message); }
      if (id === 'settings') {
        setTimeout(renderSettings, 50);
      }
    };
  }

  // ============ تنظیمات در توابع موجود ============
  // ۱. صدا — قبل از پخش زنگ چک کن
  if (typeof alertTimerDone === 'function') {
    const _origAlert = alertTimerDone;
    alertTimerDone = function(title) {
      if (!get('sound') && !get('vibrate')) {
        toast('⏰ ' + (title || 'وقت تموم شد'));
        return;
      }
      try { _origAlert.apply(this, arguments); } catch(_e) { console.error("chain _origAlert:", _e && _e.message); }
    };
  }

  // ۲. مشاور — قبل از چک کردن، تنظیم رو ببین
  if (typeof checkAssistant === 'function') {
    const _origCheck = checkAssistant;
    checkAssistant = function() {
      if (!get('assistant')) return;
      try { _origCheck.apply(this, arguments); } catch(_e) { console.error("chain _origCheck:", _e && _e.message); }
    };
  }

  // ۳. فاز عادت — قبل از محاسبه سقف، چک کن
  if (typeof getHabitStudyCap === 'function') {
    const _origCap = getHabitStudyCap;
    getHabitStudyCap = function() {
      if (!get('habitPhase')) return null;
      try { return _origCap.apply(this, arguments); } catch(_e) { console.error("chain _origCap:", _e && _e.message); return undefined; }
    };
  }

  // ۴. هدف روزانه — حالت دستی
  if (typeof getDailyGoal === 'function') {
    const _origGoal = getDailyGoal;
    getDailyGoal = function(day) {
      const s = getSettings();
      if (s.goalMode === 'manual') return s.manualGoal;
      try { return _origGoal.apply(this, arguments); } catch(_e) { console.error("chain _origGoal:", _e && _e.message); return undefined; }
    };
  }

  // ============ Init ============
  setTimeout(() => {
    if (get('autoDark')) applyAutoDark(true);
  }, 500);

  console.log('✅ SETTINGS_V1 loaded');

})();


// ============= JSQ — escape برای استفاده در onclick =============
window.jsq = function(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};


// ============= INTERVAL OPTIMIZER =============
// interval هایی که وقتی تب مخفی میشه متوقف میشن
(function(){
  if (window.safeInterval) return;
  window.safeInterval = function(fn, ms) {
    return setInterval(function() {
      if (document.hidden) return;
      try { fn(); } catch(e) { console.error('safeInterval:', e && e.message); }
    }, ms);
  };
  console.log('✅ safeInterval نصب شد');
})();


// ============= FEAT_18B — Chapters + Heatmap + Weekly Goals =============

// ============= زیرساخت: Section Observer =============
(function(){
  if (window._feat18bInfra) return;
  window._feat18bInfra = true;

  window._secRenderers = window._secRenderers || {};
  window._registerSec = function(id, fn) {
    if (!window._secRenderers[id]) window._secRenderers[id] = [];
    window._secRenderers[id].push(fn);
  };
  window._fireSec = function(id) {
    var fns = window._secRenderers[id] || [];
    fns.forEach(function(fn){
      try { fn(); } catch(e) { console.error('❌ render ' + id + ':', e && e.message); }
    });
  };

  var lastId = null;
  var observer = new MutationObserver(function(){
    var active = document.querySelector('section.active');
    if (!active) return;
    if (active.id === lastId) return;
    lastId = active.id;
    window._fireSec(active.id);
  });

  function setup() {
    document.querySelectorAll('section').forEach(function(s){
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
    var active = document.querySelector('section.active');
    if (active) {
      lastId = active.id;
      setTimeout(function(){ window._fireSec(active.id); }, 300);
    }
    console.log('✅ FEAT_18B Section infra');
  }
  if (document.readyState === 'complete') setup();
  else window.addEventListener('load', setup);
})();

// ============= CHAPTERS =============
(function(){
  if (window.CH) return;

  var KEY = 'ilia-chapters';
  var DEFAULTS = {
    'ریاضی':    ['فصل ۱','فصل ۲','فصل ۳','فصل ۴','فصل ۵'],
    'فیزیک':    ['فصل ۱','فصل ۲','فصل ۳','فصل ۴'],
    'هندسه':    ['فصل ۱','فصل ۲','فصل ۳'],
    'شیمی':     ['فصل ۱','فصل ۲','فصل ۳'],
    'عربی':     ['درس ۱','درس ۲','درس ۳','درس ۴'],
    'زبان':     ['Unit 1','Unit 2','Unit 3','Unit 4'],
    'فارسی':    ['درس ۱','درس ۲','درس ۳','درس ۴','درس ۵','درس ۶'],
    'دینی':     ['درس ۱','درس ۲','درس ۳','درس ۴'],
    'جغرافیا':  ['فصل ۱','فصل ۲','فصل ۳'],
    'نگارش':    ['درس ۱','درس ۲','درس ۳']
  };

  function getAll() {
    var d = getData(KEY, null);
    if (!d) {
      var init = {};
      Object.keys(DEFAULTS).forEach(function(s){
        init[s] = DEFAULTS[s].map(function(n){ return { name: n, done: false, pageStart: 0, pageEnd: 0 }; });
      });
      setData(KEY, init);
      return init;
    }
    var changed = false;
    Object.keys(d).forEach(function(s){
      if (!Array.isArray(d[s])) return;
      d[s].forEach(function(c){
        if (typeof c.pageStart !== 'number') { c.pageStart = 0; changed = true; }
        if (typeof c.pageEnd !== 'number') { c.pageEnd = 0; changed = true; }
      });
    });
    if (changed) setData(KEY, d);
    return d;
  }
  function save(d) { setData(KEY, d); }
  function pagesOf(c) { return c.pageEnd ? Math.max(0, c.pageEnd - (c.pageStart||0) + 1) : 0; }
  function statOf(s) {
    var list = (getAll()[s]) || [];
    var done = list.filter(function(c){ return c.done; }).length;
    var total = list.length;
    return {
      done: done, total: total,
      pct: total ? Math.round((done/total)*100) : 0,
      pR: list.filter(function(c){ return c.done; }).reduce(function(a,c){ return a + pagesOf(c); }, 0),
      pT: list.reduce(function(a,c){ return a + pagesOf(c); }, 0)
    };
  }

  function toggleOpen(s) {
    document.querySelectorAll('.ch-subject').forEach(function(el){
      if (el.dataset.subj === s) el.classList.toggle('open');
    });
  }
  function toggleCh(s, i) {
    var all = getAll();
    if (!all[s] || !all[s][i]) return;
    all[s][i].done = !all[s][i].done;
    save(all);
    renderChapters(); renderDash();
    if (all[s][i].done) toast('✅ فصل تموم شد');
  }
  function addCh(s) {
    var safeId = s.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
    var inp = document.getElementById('chAdd_' + safeId);
    if (!inp) return;
    var name = inp.value.trim();
    if (!name) return;
    var all = getAll();
    if (!all[s]) all[s] = [];
    all[s].push({ name: name, done: false, pageStart: 0, pageEnd: 0 });
    save(all);
    inp.value = '';
    renderChapters(); renderDash();
    toast('✅ فصل اضافه شد');
  }
  function delCh(s, i) {
    var all = getAll();
    if (!all[s] || !all[s][i]) return;
    if (!confirm('این فصل حذف بشه؟')) return;
    all[s].splice(i, 1);
    save(all);
    renderChapters(); renderDash();
    toast('🗑 حذف شد');
  }
  function editName(s, i) {
    var all = getAll();
    if (!all[s] || !all[s][i]) return;
    var nv = prompt('اسم جدید:', all[s][i].name);
    if (nv === null) return;
    var t = nv.trim();
    if (!t) return;
    all[s][i].name = t;
    save(all);
    renderChapters(); renderDash();
  }
  function editPages(s, i) {
    var all = getAll();
    if (!all[s] || !all[s][i]) return;
    var c = all[s][i];
    var def = c.pageEnd ? (c.pageStart ? c.pageStart + '-' + c.pageEnd : '' + c.pageEnd) : '';
    var input = prompt('محدوده صفحات (مثلاً 1-25). برای پاک کردن خالی بذار:', def);
    if (input === null) return;
    var tr = input.trim();
    if (!tr) {
      c.pageStart = 0; c.pageEnd = 0;
    } else {
      var norm = tr.replace(/[۰-۹]/g, function(d){ return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); });
      var m = norm.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
      if (m) {
        var a = parseInt(m[1]), b = parseInt(m[2]);
        if (a > b) { var tmp = a; a = b; b = tmp; }
        c.pageStart = a; c.pageEnd = b;
      } else if (/^\d+$/.test(norm)) {
        c.pageStart = 0; c.pageEnd = parseInt(norm);
      } else {
        toast('❌ فرمت درست نیست — مثلاً: 1-25');
        return;
      }
    }
    save(all);
    renderChapters(); renderDash();
    toast('✅ ذخیره شد');
  }

  function renderChapters() {
    var heroEl = document.getElementById('chHero');
    var contentEl = document.getElementById('chContent');
    if (!heroEl || !contentEl) return;

    var all = getAll();
    var subjects = Object.keys(all);
    var tD = 0, tA = 0, tPR = 0, tPA = 0;
    subjects.forEach(function(s){
      var st = statOf(s);
      tD += st.done; tA += st.total; tPR += st.pR; tPA += st.pT;
    });
    var tPct = tA ? Math.round((tD/tA)*100) : 0;

    heroEl.innerHTML = '<div class="ch-hero">' +
      '<div class="ch-hero-title">📚 پیشرفت کلی</div>' +
      '<div class="ch-hero-sub">' + fa(tD) + ' از ' + fa(tA) + ' فصل — ' + fa(tPct) + '٪' +
      (tPA > 0 ? ' — ' + fa(tPR) + '/' + fa(tPA) + ' صفحه' : '') + '</div>' +
      '<div class="ch-hero-stats">' +
        '<div class="ch-hero-stat"><div class="ch-hero-stat-v">' + fa(tD) + '</div><div class="ch-hero-stat-l">فصل خونده</div></div>' +
        '<div class="ch-hero-stat"><div class="ch-hero-stat-v">' + fa(tPR) + '</div><div class="ch-hero-stat-l">صفحه خونده</div></div>' +
        '<div class="ch-hero-stat"><div class="ch-hero-stat-v">' + fa(tPct) + '٪</div><div class="ch-hero-stat-l">درصد</div></div>' +
      '</div>' +
    '</div>';

    var html = '';
    subjects.forEach(function(s){
      var list = all[s] || [];
      var st = statOf(s);
      var icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[s]) || '📚';
      var safeId = s.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
      var sEsc = s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

      html += '<div class="ch-subject" data-subj="' + esc(s) + '">' +
        '<div class="ch-subject-head" onclick="CH.toggleOpen(\'' + sEsc + '\')">' +
          '<span class="ch-subject-icon">' + icon + '</span>' +
          '<div class="ch-subject-info">' +
            '<div class="ch-subject-name">' + esc(s) + '</div>' +
            '<div class="ch-subject-meta">' + fa(st.done) + ' از ' + fa(st.total) + ' فصل' +
              (st.pT > 0 ? ' — ' + fa(st.pR) + '/' + fa(st.pT) + ' ص' : '') + '</div>' +
          '</div>' +
          '<span class="ch-subject-pct">' + fa(st.pct) + '٪</span>' +
          '<span class="ch-arrow">▼</span>' +
        '</div>' +
        '<div class="ch-subject-body">' +
          '<div class="ch-progress"><div class="ch-progress-fill" style="width:' + st.pct + '%"></div></div>' +
          (list.length === 0 ?
            '<div class="ch-empty"><span class="ico">📖</span>هنوز فصلی اضافه نکردی</div>' :
            '<ul class="ch-list">' + list.map(function(c, i){
              var pg = pagesOf(c);
              var pgLabel = pg > 0 ? ('ص ' + (c.pageStart ? fa(c.pageStart) + '-' + fa(c.pageEnd) : fa(c.pageEnd))) : 'بدون صفحه';
              var pgCls = pg > 0 ? '' : ' empty';
              var doneCls = (c.done && pg > 0) ? ' done' : '';
              return '<li class="ch-item ' + (c.done ? 'done' : '') + '">' +
                '<span class="ch-check" onclick="CH.toggleCh(\'' + sEsc + '\',' + i + ')"></span>' +
                '<span class="ch-item-name" onclick="CH.editName(\'' + sEsc + '\',' + i + ')">' + esc(c.name) + '</span>' +
                '<span class="ch-page-badge' + pgCls + doneCls + '" onclick="CH.editPages(\'' + sEsc + '\',' + i + ')">📄 ' + pgLabel + '</span>' +
                '<button class="ch-del" onclick="CH.del(\'' + sEsc + '\',' + i + ')">✕</button>' +
              '</li>';
            }).join('') + '</ul>') +
          '<div class="ch-add-row">' +
            '<input type="text" class="ch-add-input" id="chAdd_' + safeId + '" placeholder="اسم فصل جدید..." onkeydown="if(event.key===\'Enter\')CH.add(\'' + sEsc + '\')">' +
            '<button class="ch-add-btn" onclick="CH.add(\'' + sEsc + '\')">➕</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    contentEl.innerHTML = html;
  }

  function renderDash() {
    var el = document.getElementById('chaptersDashContainer');
    if (!el) return;
    var all = getAll();
    var behind = [];
    Object.keys(all).forEach(function(s){
      if (!all[s] || all[s].length === 0) return;
      var st = statOf(s);
      if (st.pct < 50) behind.push({ subj: s, done: st.done, total: st.total, pct: st.pct });
    });
    if (behind.length === 0) { el.innerHTML = ''; return; }
    behind.sort(function(a,b){ return a.pct - b.pct; });
    var top = behind.slice(0, 3);
    var html = '<div class="ch-dashboard-card"><div class="ch-dashboard-title">📚 کتاب‌هایی که عقبی</div><div class="ch-dashboard-list">';
    top.forEach(function(x){
      var icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[x.subj]) || '📚';
      html += '<div class="ch-dashboard-item"><span>' + icon + '</span><span class="name">' + esc(x.subj) + '</span><span>' + fa(x.done) + '/' + fa(x.total) + '</span><span class="pct">' + fa(x.pct) + '٪</span></div>';
    });
    html += '</div></div>';
    el.innerHTML = html;
  }

  window.CH = {
    toggleOpen: toggleOpen, toggleCh: toggleCh, add: addCh,
    del: delCh, editName: editName, editPages: editPages
  };
  window.renderChapters = renderChapters;
  window.renderChaptersDash = renderDash;

  window._registerSec('chapters', renderChapters);
  window._registerSec('dashboard', renderDash);
})();

// ============= HEATMAP =============
(function(){
  if (window.renderHeatmap) return;

  function getDayMap() {
    var log = getData('ilia-log', []);
    var m = {};
    log.forEach(function(e){ m[e.date] = (m[e.date] || 0) + (e.hours || 0); });
    return m;
  }
  function lv(h) {
    if (!h || h < 0.5) return '';
    if (h < 1.5) return 'l1';
    if (h < 2.5) return 'l2';
    if (h < 4) return 'l3';
    return 'l4';
  }

  function renderHeatmap() {
    var el = document.getElementById('heatmapContent');
    if (!el) return;
    var map = getDayMap();
    var cells = [];
    for (var i = 89; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var ds = localDate(d);
      var h = map[ds] || 0;
      var l = lv(h);
      var isT = i === 0;
      var sh = getShamsi(d);
      var wd = (typeof WEEK_DAYS_SHORT !== 'undefined' && WEEK_DAYS_SHORT[d.getDay()]) || '';
      cells.push({
        ds: ds, h: h, lv: l, isToday: isT,
        dayNum: sh.d,
        hours: h > 0 ? h.toFixed(1) : '',
        label: wd + ' ' + fa(sh.d) + ' ' + sh.monthName + ' — ' + (h > 0 ? fa(h.toFixed(1)) + ' ساعت' : 'نخونده')
      });
    }
    var totalDays = cells.filter(function(c){ return c.h > 0; }).length;
    var totalHours = cells.reduce(function(a,c){ return a + c.h; }, 0);
    var avg = totalDays ? totalHours / totalDays : 0;

    var html = '<div class="hm-stats">' +
      '<div class="stat"><div class="stat-v">' + fa(totalDays) + '</div><div class="stat-l">روز فعال</div></div>' +
      '<div class="stat"><div class="stat-v">' + fa(totalHours.toFixed(1)) + '</div><div class="stat-l">ساعت (۹۰ روز)</div></div>' +
      '<div class="stat"><div class="stat-v">' + fa(avg.toFixed(1)) + '</div><div class="stat-l">میانگین روزانه</div></div>' +
    '</div>';

    html += '<div class="hm-grid-wrap">';
    html += '<div class="hm-grid">';
    cells.forEach(function(c){
      var hrsHtml = c.hours ? '<span class="hm-hrs">' + fa(c.hours) + '</span>' : '';
      html += '<div class="hm-cell ' + c.lv + (c.isToday ? ' today' : '') + (c.h === 0 ? ' empty' : '') + '" data-label="' + esc(c.label) + '">' +
        '<span class="hm-day">' + fa(c.dayNum) + '</span>' +
        hrsHtml +
      '</div>';
    });
    html += '</div>';
    html += '<div class="hm-legend-title">رنگ‌ها = شدت مطالعه — عدد داخل = ساعت</div>';
    html += '<div class="hm-legend"><span>کم</span>' +
      '<span class="hm-cell empty"></span>' +
      '<span class="hm-cell l1"></span>' +
      '<span class="hm-cell l2"></span>' +
      '<span class="hm-cell l3"></span>' +
      '<span class="hm-cell l4"></span>' +
      '<span>زیاد</span></div>';
    html += '</div>';
    el.innerHTML = html;

    var tip = document.getElementById('hmTooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'hmTooltip';
      tip.className = 'hm-tooltip';
      document.body.appendChild(tip);
    }
    el.querySelectorAll('.hm-cell[data-label]').forEach(function(cell){
      cell.addEventListener('mouseenter', function(){
        tip.textContent = cell.dataset.label;
        tip.classList.add('show');
      });
      cell.addEventListener('mousemove', function(e){
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top = (e.clientY - 34) + 'px';
      });
      cell.addEventListener('mouseleave', function(){ tip.classList.remove('show'); });
      cell.addEventListener('touchstart', function(){
        tip.textContent = cell.dataset.label;
        tip.classList.add('show');
        setTimeout(function(){ tip.classList.remove('show'); }, 2200);
      }, { passive: true });
    });
  }

  window.renderHeatmap = renderHeatmap;
  window._registerSec('heatmap', renderHeatmap);
})();

// ============= WEEKLY GOALS + FRIDAY =============
(function(){
  if (window.WG) return;

  var KEY = 'ilia-weekly-goals';
  var FRIDAY_KEY = 'ilia-friday-dismiss';

  function getWeekStart() {
    var now = new Date();
    var day = now.getDay();
    var diff = (day + 1) % 7;
    var st = new Date(now);
    st.setDate(st.getDate() - diff);
    return localDate(st);
  }
  function getRange() {
    var ws = getWeekStart();
    var st = new Date(ws + 'T00:00:00');
    var en = new Date(st);
    en.setDate(en.getDate() + 6);
    return { start: localDate(st), end: localDate(en) };
  }
  function getGoals() {
    var all = getData(KEY, {});
    var ws = getWeekStart();
    if (!all[ws]) all[ws] = { hours: 15, pages: 200, tests: 50 };
    return all[ws];
  }
  function saveGoals(g) {
    var all = getData(KEY, {});
    all[getWeekStart()] = g;
    setData(KEY, all);
  }
  function getProg() {
    var r = getRange();
    var log = getData('ilia-log', []).filter(function(e){ return e.date >= r.start && e.date <= r.end; });
    var ses = getData('ilia-sessions', []).filter(function(s){ return s.date >= r.start && s.date <= r.end; });
    return {
      hours: log.reduce(function(a,e){ return a + (e.hours||0); }, 0),
      pages: ses.reduce(function(a,x){ return a + (x.pages||0); }, 0),
      tests: ses.reduce(function(a,x){ return a + (x.tests||0); }, 0)
    };
  }
  function bar(cur, tgt) {
    var p = tgt > 0 ? Math.min(100, (cur/tgt)*100) : 0;
    return '<div class="wg-bar"><div class="wg-bar-fill ' + (p >= 100 ? 'done' : '') + '" style="width:' + p + '%"></div></div>';
  }
  function row(icon, label, cur, tgt) {
    var cd = cur % 1 === 0 ? fa(Math.round(cur)) : fa(cur.toFixed(1));
    var td = tgt % 1 === 0 ? fa(Math.round(tgt)) : fa(tgt.toFixed(1));
    return '<div class="wg-row"><div class="wg-row-head"><span class="lbl">' + icon + ' ' + label + '</span><span class="num"><b>' + cd + '</b> / ' + td + '</span></div>' + bar(cur, tgt) + '</div>';
  }

  function renderWeeklyGoals() {
    var el = document.getElementById('weeklyGoalsContainer');
    if (!el) return;
    var g = getGoals();
    var p = getProg();
    var r = getRange();
    el.innerHTML = '<div class="wg-card">' +
      '<div class="wg-title">🎯 اهداف هفتگی</div>' +
      '<div class="wg-sub">هفته: ' + fa(r.start) + ' تا ' + fa(r.end) + '</div>' +
      '<div class="wg-rows">' +
        row('⏱', 'ساعت مطالعه', p.hours, g.hours) +
        row('📖', 'صفحه', p.pages, g.pages) +
        row('✅', 'تست', p.tests, g.tests) +
      '</div>' +
      '<div class="wg-actions">' +
        '<button class="wg-btn" onclick="WG.edit()">✏️ ویرایش اهداف</button>' +
        '<button class="wg-btn" onclick="WG.copy()">📋 کپی خلاصه</button>' +
      '</div>' +
    '</div>';
  }

  function edit() {
    var g = getGoals();
    var h = prompt('هدف ساعت این هفته:', g.hours);
    if (h === null) return;
    var p = prompt('هدف صفحه:', g.pages);
    if (p === null) return;
    var t = prompt('هدف تست:', g.tests);
    if (t === null) return;
    function n(v){ return parseInt(String(v).replace(/[۰-۹]/g, function(d){ return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })) || 0; }
    saveGoals({ hours: n(h), pages: n(p), tests: n(t) });
    renderWeeklyGoals();
    toast('✅ ذخیره شد');
  }
  function copy() {
    var r = getRange();
    var g = getGoals();
    var p = getProg();
    var txt = '🎯 خلاصه هفته\n' + fa(r.start) + ' تا ' + fa(r.end) + '\n\n';
    txt += '⏱ ساعت: ' + fa(p.hours.toFixed(1)) + ' از ' + fa(g.hours) + '\n';
    txt += '📖 صفحه: ' + fa(p.pages) + ' از ' + fa(g.pages) + '\n';
    txt += '✅ تست: ' + fa(p.tests) + ' از ' + fa(g.tests);
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      else {
        var ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      toast('✅ کپی شد');
    } catch(e) { toast('❌ خطا'); }
  }
  function renderFriday() {
    var el = document.getElementById('fridayContainer');
    if (!el) return;
    var now = new Date();
    if (now.getDay() !== 5) { el.innerHTML = ''; return; }
    if (localStorage.getItem(FRIDAY_KEY) === localDate(now)) { el.innerHTML = ''; return; }
    var p = getProg();
    el.innerHTML = '<div class="friday-card">' +
      '<div class="friday-title">🌙 جمعه — وقت مرور هفتگی</div>' +
      '<div class="friday-text">این هفته: <b>' + fa(p.hours.toFixed(1)) + ' ساعت</b> خوندی.<br>بهترین کار امروز: مرور اشتباهات + مرور فاصله‌دار + برنامه هفته بعد.</div>' +
      '<div class="friday-actions">' +
        '<button class="friday-btn" onclick="WG.goReview()">📖 برو مرور</button>' +
        '<button class="friday-btn" onclick="WG.dismissFriday()">✕ بستن</button>' +
      '</div>' +
    '</div>';
  }
  function dismissFriday() {
    localStorage.setItem(FRIDAY_KEY, localDate());
    var el = document.getElementById('fridayContainer');
    if (el) el.innerHTML = '';
  }
  function goReview() {
    dismissFriday();
    if (typeof window.go === 'function') window.go('leitner');
  }

  window.WG = {
    edit: edit, copy: copy, dismissFriday: dismissFriday, goReview: goReview,
    render: renderWeeklyGoals, renderFriday: renderFriday
  };
  window.renderWeeklyGoals = renderWeeklyGoals;
  window.renderFriday = renderFriday;

  window._registerSec('weekly', renderWeeklyGoals);
  window._registerSec('dashboard', renderFriday);
})();

// FEAT_18B END

// ============= SMART_REMINDERS_V1 =============
(function(){
  if (window.REM) return;

  var KEY = 'ilia-reminders';
  var SHOWN_KEY = 'ilia-reminders-shown';

  var DEFAULTS = {
    morning: { on: true, time: '06:30' },
    school:  { on: true, time: '14:30' },
    study:   { on: true },
    review:  { on: true },
    night:   { on: true, time: '21:30' },
    sleep:   { on: true, time: '22:15' }
  };

  function getConfig() {
    var c = getData(KEY, {});
    var out = {};
    Object.keys(DEFAULTS).forEach(function(k){
      out[k] = {};
      Object.keys(DEFAULTS[k]).forEach(function(p){ out[k][p] = DEFAULTS[k][p]; });
      if (c[k]) Object.keys(c[k]).forEach(function(p){ out[k][p] = c[k][p]; });
    });
    return out;
  }
  function saveConfig(c) { setData(KEY, c); }

  function getShown() { return getData(SHOWN_KEY, {}); }
  function markShown(type, key) {
    var s = getShown();
    var t = today();
    if (!s[t]) s[t] = {};
    s[t][type + '_' + (key || '')] = Date.now();
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 3);
    var cutStr = localDate(cutoff);
    Object.keys(s).forEach(function(d){ if (d < cutStr) delete s[d]; });
    setData(SHOWN_KEY, s);
  }
  function isShown(type, key) {
    var s = getShown();
    var t = today();
    return !!(s[t] && s[t][type + '_' + (key || '')]);
  }
  function minutesNow() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function t2m(t) {
    if (!t) return -1;
    var p = t.split(':').map(Number);
    return p[0] * 60 + p[1];
  }
  function isWithinWindow(targetMin, tol) {
    return Math.abs(minutesNow() - targetMin) <= (tol || 5);
  }
  function isUserBusy() {
    var ae = document.activeElement;
    if (!ae) return false;
    var tag = ae.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (document.getElementById('focusMode') && document.getElementById('focusMode').classList.contains('active')) return true;
    if (document.getElementById('assistantOverlay') && document.getElementById('assistantOverlay').classList.contains('active')) return true;
    if (document.getElementById('guideOverlay') && document.getElementById('guideOverlay').classList.contains('active')) return true;
    if (document.getElementById('wizardOverlay') && document.getElementById('wizardOverlay').classList.contains('active')) return true;
    if (document.getElementById('remModal') && document.getElementById('remModal').classList.contains('active')) return true;
    return false;
  }

  var currentCtx = null;

  function showReminder(icon, title, body, actionLabel, onAction, type, key) {
    if (isUserBusy()) return false;
    var modal = document.getElementById('remModal');
    if (!modal) return false;
    document.getElementById('remIcon').textContent = icon;
    document.getElementById('remTitle').textContent = title;
    document.getElementById('remBody').innerHTML = body;
    document.getElementById('remActionBtn').textContent = actionLabel;
    currentCtx = { type: type, key: key };
    window._remAction = onAction;
    modal.classList.add('active');
    markShown(type, key);
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime;
      function tone(f, s, d) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = 'sine';
        g.gain.setValueAtTime(0.2, s);
        g.gain.exponentialRampToValueAtTime(0.001, s + d);
        o.start(s); o.stop(s + d);
      }
      tone(880, t, 0.15); tone(1100, t + 0.15, 0.25);
    } catch(e) {}
    try { if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]); } catch(e) {}
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body.replace(/<[^>]*>/g, '').slice(0, 120), icon: './icon-192.png', tag: 'rem-' + type });
      }
    } catch(e) {}
    return true;
  }

  function closeModal() {
    var modal = document.getElementById('remModal');
    if (modal) modal.classList.remove('active');
    currentCtx = null;
    window._remAction = null;
  }
  function runAction() {
    if (typeof window._remAction === 'function') {
      try { window._remAction(); } catch(e) { console.error('rem action:', e); }
    }
    closeModal();
  }
  function snooze() {
    if (currentCtx) {
      var s = getShown();
      var t = today();
      if (s[t] && s[t][currentCtx.type + '_' + (currentCtx.key || '')]) {
        delete s[t][currentCtx.type + '_' + (currentCtx.key || '')];
        setData(SHOWN_KEY, s);
      }
    }
    closeModal();
    toast('⏰ بعداً یادت می‌ندازم');
  }

  function checkMorning() {
    var cfg = getConfig();
    if (!cfg.morning.on) return;
    if (isShown('morning', '')) return;
    if (!isWithinWindow(t2m(cfg.morning.time), 10)) return;
    showReminder('🌅', 'صبح بخیر ایلیا', 'برنامه امروزت آماده‌ست.<br>کیفت رو دیشب بستی؟', '▶ ببین', function(){ if (window.go) window.go('dashboard'); }, 'morning', '');
  }
  function checkSchool() {
    var cfg = getConfig();
    if (!cfg.school.on) return;
    if (isShown('school', '')) return;
    if (!isWithinWindow(t2m(cfg.school.time), 10)) return;
    var todayDay = new Date().getDay();
    var classes = (typeof SCHOOL_SCHEDULE !== 'undefined' && SCHOOL_SCHEDULE[todayDay]) || [];
    if (classes.length === 0) return;
    showReminder('🏫', 'از مدرسه برگشتی؟', 'بذار گزارش امروزت رو بگیرم:<br>سر کلاس چی فهمیدی؟ چی نفهمیدی؟', '🎓 شروع گزارش', function(){ if (window.openAssistant) window.openAssistant('school'); }, 'school', '');
  }
  function checkStudyBlock() {
    var cfg = getConfig();
    if (!cfg.study.on) return;
    var todayDay = new Date().getDay();
    var list = (typeof SCHEDULE !== 'undefined' && SCHEDULE[todayDay]) || [];
    var now = minutesNow();
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item[3] !== 'study') continue;
      if (t2m(item[0]) - now === 5) {
        var key = item[0] + '-' + item[1];
        if (isShown('study', key)) return;
        showReminder(item[4] || '📖', '۵ دقیقه دیگه: ' + item[2], 'ساعت ' + fa(item[0]) + ' تا ' + fa(item[1]) + '<br>آماده‌ای؟', '▶ شروع', function(){ if (window.go) window.go('dashboard'); }, 'study', key);
        return;
      }
    }
  }
  function checkReview() {
    var cfg = getConfig();
    if (!cfg.review.on) return;
    var now = new Date();
    var slot = 'h' + Math.floor(now.getHours() / 2);
    if (isShown('review', slot)) return;
    var t = today();
    var reviews = getData('ilia-reviews', []);
    var due = reviews.filter(function(r){ return !r.done && r.dueDate <= t; });
    if (due.length === 0) return;
    var first = due[0];
    showReminder('📖', fa(due.length) + ' مرور عقب‌افتاده', 'مبحث: <b>' + esc(first.subj) + ' — ' + esc(first.topic) + '</b><br>طبق برنامه‌ی مرور فاصله‌دار', '📖 مرور کن', function(){ if (window.go) window.go('leitner'); }, 'review', slot);
  }
  function checkNight() {
    var cfg = getConfig();
    if (!cfg.night.on) return;
    if (isShown('night', '')) return;
    if (!isWithinWindow(t2m(cfg.night.time), 10)) return;
    showReminder('🌙', 'وقت ژورنال شبانه', 'امروز چی یاد گرفتی؟<br>فردا می‌خوای چیکار کنی؟', '🌙 بنویس', function(){ if (window.go) window.go('journal'); }, 'night', '');
  }
  function checkSleep() {
    var cfg = getConfig();
    if (!cfg.sleep.on) return;
    if (isShown('sleep', '')) return;
    if (!isWithinWindow(t2m(cfg.sleep.time), 10)) return;
    showReminder('😴', 'وقت خوابه', 'گوشی رو بذار کنار.<br>کیفت رو بستی؟ برنامه فردا آماده‌ست؟', '🎒 آماده‌سازی', function(){ if (window.go) window.go('dashboard'); }, 'sleep', '');
  }

  function checkAll() {
    if (isUserBusy()) return;
    try { checkMorning(); } catch(e) { console.error(e); }
    try { checkSchool(); } catch(e) { console.error(e); }
    try { checkStudyBlock(); } catch(e) { console.error(e); }
    try { checkReview(); } catch(e) { console.error(e); }
    try { checkNight(); } catch(e) { console.error(e); }
    try { checkSleep(); } catch(e) { console.error(e); }
  }

  window.REM = {
    toggle: function(type, on) {
      var c = getConfig();
      if (!c[type]) c[type] = {};
      c[type].on = on;
      saveConfig(c);
      toast('✅ ' + (on ? 'روشن' : 'خاموش'));
    },
    setTime: function(type, time) {
      var c = getConfig();
      if (!c[type]) c[type] = {};
      c[type].time = time;
      saveConfig(c);
      toast('✅ ساعت: ' + time);
    },
    action: runAction,
    snooze: snooze,
    close: closeModal,
    test: function() {
      showReminder('🔔', 'تست یادآور', 'این یه یادآور نمونه‌ست.<br>کار می‌کنه! ✅', 'باشه', null, 'test', '');
    },
    askNotif: function() {
      try {
        if (!('Notification' in window)) { toast('مرورگر پشتیبانی نمی‌کنه'); return; }
        Notification.requestPermission().then(function(p){
          if (p === 'granted') toast('✅ نوتیفیکیشن فعال شد');
          else toast('❌ اجازه داده نشد');
        });
      } catch(e) { toast('❌ خطا'); }
    },
    check: checkAll
  };

  function bindInputs() {
    var c = getConfig();
    ['morning','school','night','sleep'].forEach(function(type){
      var inp = document.getElementById('rem-' + type);
      if (inp) {
        if (c[type] && c[type].time) inp.value = c[type].time;
        inp.addEventListener('change', function(){ window.REM.setTime(type, this.value); });
      }
    });
    var checks = { morning:'rem-morning-on', school:'rem-school-on', study:'rem-study-on', review:'rem-review-on', night:'rem-night-on', sleep:'rem-sleep-on' };
    Object.keys(checks).forEach(function(type){
      var cb = document.getElementById(checks[type]);
      if (cb) {
        cb.checked = !!(c[type] && c[type].on);
        cb.addEventListener('change', function(){ window.REM.toggle(type, this.checked); });
      }
    });
  }

  setTimeout(function(){
    try { bindInputs(); } catch(e) { console.error('rem bind:', e); }
    try { checkAll(); } catch(e) {}
  }, 5000);

  if (typeof window.safeInterval === 'function') {
    window.safeInterval(checkAll, 60000);
  } else {
    setInterval(checkAll, 60000);
  }

  console.log('✅ SMART_REMINDERS_V1 loaded');
})();


// ============= SIMPLE_MODE_V1 =============
(function(){
  if (window.SIMPLE) return;

  var KEY = 'ilia-simple-mode';

  function apply() {
    var on = localStorage.getItem(KEY) === '1';
    if (on) document.body.classList.add('simple-mode');
    else document.body.classList.remove('simple-mode');
    var cb = document.getElementById('set-simple');
    if (cb) {
      cb.checked = on;
      if (!cb.dataset.bound) {
        cb.dataset.bound = '1';
        cb.addEventListener('change', function(){
          window.SIMPLE.toggle(this.checked);
        });
      }
    }
  }

  window.SIMPLE = {
    isOn: function() { return localStorage.getItem(KEY) === '1'; },
    toggle: function(on) {
      if (on) {
        document.body.classList.add('simple-mode');
        localStorage.setItem(KEY, '1');
        toast('✨ حالت ساده روشن شد');
      } else {
        document.body.classList.remove('simple-mode');
        localStorage.setItem(KEY, '0');
        toast('حالت عادی');
      }
      var cb = document.getElementById('set-simple');
      if (cb) cb.checked = on;
    },
    apply: apply
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
  setTimeout(apply, 2000);
  setTimeout(apply, 5000);
  window._registerSec && window._registerSec('settings', apply);

  console.log('✅ SIMPLE_MODE_V1 loaded');
})();


// ============ LIVE SCHEDULE UPDATER ============
setInterval(() => {
    try {
        if (typeof renderNow === 'function') renderNow();
        if (typeof renderTodaySchedule === 'function') renderTodaySchedule();
    } catch(e) {}
}, 30000);

// ============= Init =============
setTimeout(() => { if(typeof renderGarden === "function") renderGarden(); }, 1000);
renderApkBanner();
renderStats();
renderTodo();
renderGoals();
renderLeitner();
renderMistakes();
renderGrades();
renderHabits();
updPom();
updateClock();
renderPhase();
renderClasses();
renderNow();
renderCountdown();
renderTodaySchedule();
renderSchoolGrid();
renderWeekTabs();
renderFullSchedule();
renderTodayReports();
renderProfile();
renderChecklists();
renderSessions();
renderExams();
renderJournal();
renderHealth();
renderWeakness();
// renderWeakPlan در IIFE — داخل renderWeakness اجرا میشه
renderWeeklyReport();
renderDistractionPage();
scanDeficits();
renderTodayTotal();
renderRules();
renderTechniques();
initSourceGuideClicks();
renderTomorrowPrep();
if (typeof renderReviewQueue === "function") renderReviewQueue();
renderMakeupCard();
renderAlert();
renderBackupStatus();
requestNotifPermission();
scheduleAlarms();

safeInterval(updateClock, 1000);
safeInterval(renderCountdown, 1000);
safeInterval(() => { renderTodayTotal(); renderTomorrowPrep(); renderNow(); renderTodaySchedule(); renderMakeupCard(); renderAlert(); }, 30000);
safeInterval(renderPhase, 3600000);
safeInterval(renderClasses, 3600000);
safeInterval(scheduleAlarms, 30*60*1000);

setTimeout(checkAssistant, ASSISTANT_CONFIG.bootDelay);
safeInterval(checkAssistant, 90000);

// رفرش فوری وقتی تب برمی‌گرده
document.addEventListener('visibilitychange', function() {
  if (document.hidden) return;
  setTimeout(function() {
    try { if (typeof updateClock === 'function') updateClock(); } catch(e) {}
    try { if (typeof renderCountdown === 'function') renderCountdown(); } catch(e) {}
    try { if (typeof renderNow === 'function') renderNow(); } catch(e) {}
    try { if (typeof renderTodaySchedule === 'function') renderTodaySchedule(); } catch(e) {}
    try { if (typeof renderTodayTotal === 'function') renderTodayTotal(); } catch(e) {}
    try { if (typeof renderMakeupCard === 'function') renderMakeupCard(); } catch(e) {}
    try { if (typeof renderAlert === 'function') renderAlert(); } catch(e) {}
  }, 200);
}, { passive: true });

document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(checkAssistant, 3000); });

setTimeout(() => {
  const last = parseInt(localStorage.getItem('ilia-last-backup') || '0');
  if (last && Date.now() - last > 7*86400000) {
    if (confirm('📤 یه هفته از پشتیبان گذشته. الان بگیری؟')) exportData();
  }
}, 8000);

window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('ilia-')) {
    renderStats(); renderTodo(); renderGoals(); renderTodayTotal();
  }
});

let lastActivity = null;
setInterval(() => {
  const cur = getCurrent();
  const currentTask = cur ? cur.item.task : null;
  if (currentTask !== lastActivity && lastActivity !== null) {
    if (cur) { try { new Notification('⏰ فعالیت جدید', {body:cur.item.task}); } catch(e) {} toast('⏰ ' + cur.item.task); }
  }
  lastActivity = currentTask;
}, 60000);



function updateLauncherWidget() {
    const widget = document.getElementById('launcherWidget');
    if (!widget) return;
    const log = getData('ilia-log', []);
    const t = today();
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yesterday = localDate(d);
    const todayHours = log.filter(e => e.date === t).reduce((s,e) => s + e.hours, 0);
    const yesterdayHours = log.filter(e => e.date === yesterday).reduce((s,e) => s + e.hours, 0);
    
    let pct = 0;
    if (yesterdayHours > 0) pct = Math.min(100, Math.round((todayHours / yesterdayHours) * 100));
    else pct = todayHours > 0 ? 100 : 0;
    
    const elPct = document.getElementById('lw-percent');
    const elHours = document.getElementById('lw-hours');
    const elGoal = document.getElementById('lw-goal');
    const elFill = document.getElementById('lw-fill');
    
    const headerEl = widget.querySelector('.lw-header span:first-child');
    if(headerEl && headerEl.textContent.includes('هدف')) headerEl.textContent = '📊 عملکرد امروز';
    
    if (elPct) elPct.textContent = fa(pct) + '٪';
    if (elHours) elHours.textContent = fa(todayHours.toFixed(1));
    if (elGoal) elGoal.textContent = fa(yesterdayHours.toFixed(1));
    if (elFill) elFill.style.fill = pct + '%', elFill.style.width = pct + '%';
    
    if (todayHours > yesterdayHours && todayHours > 0) widget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    else if (todayHours === 0) widget.style.background = 'linear-gradient(135deg, #64748b, #475569)';
    else widget.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
}
setTimeout(updateLauncherWidget, 1000);
setInterval(updateLauncherWidget, 60000);

 // هر دقیقه


// ============ V3 HAPTIC FEEDBACK ============
// افزودن لرزش گوشی هنگام کلیک روی دکمه‌ها (فقط در موبایل کار می‌کند)
document.addEventListener('click', function(e) {
    const interactiveElement = e.target.closest('.nimkat-card, .btn, .set-btn, .bottom-nav button, .nimkat-card div');
    if (interactiveElement) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(30); } catch(err) {}
        }
    }
});


window.CH.editPages = function(s, i) {
  var all = getAll();
  if (!all[s] || !all[s][i]) return;
  var c = all[s][i];
  
  var total = prompt('کل صفحات این فصل چند صفحه است؟', c.totalPages || '');
  if (total === null) return;
  var read = prompt('چند صفحه از این فصل را خوانده‌اید؟', c.readPages || '');
  if (read === null) return;

  c.totalPages = parseInt(total) || 0;
  c.readPages = parseInt(read) || 0;
  
  if (c.readPages >= c.totalPages && c.totalPages > 0) {
    c.done = true;
  } else {
    c.done = false;
  }
  
  save(all);
  renderChapters(); renderDash();
  toast('✅ پیشرفت صفحه ذخیره شد');
};

const originalRenderChapters = renderChapters;
window.renderChapters = function() {
    originalRenderChapters();
    // اپدیت UI برای نمایش درصد صفحات
    document.querySelectorAll('.ch-subject').forEach(subjEl => {
        const subjName = subjEl.dataset.subj;
        const all = getAll();
        const list = all[subjName] || [];
        let totalP = 0, readP = 0;
        list.forEach(c => {
            totalP += (c.totalPages || 0);
            readP += (c.readPages || 0);
        });
        if (totalP > 0) {
            const pct = Math.round((readP / totalP) * 100);
            const metaEl = subjEl.querySelector('.ch-subject-meta');
            if (metaEl) {
                metaEl.innerHTML += ` | صفحات: ${fa(readP)} از ${fa(totalP)} (${fa(pct)}٪)`;
            }
        }
    });
};


window.editSession = function(id) {
    const sessions = getData(SS_KEY, []);
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    const newMin = prompt('دقیقه مطالعه جدید برای ' + s.topic + ' را وارد کنید:', s.min);
    if (newMin === null) return;
    const val = parseInt(newMin);
    if (isNaN(val) || val <= 0) return toast('عدد معتبر وارد کنید');
    
    const diffMin = val - s.min;
    s.min = val;
    setData(SS_KEY, sessions);
    
    // آپدیت لاگ برای هماهنگی با ویجت‌ها
    const log = getData('ilia-log', []);
    const logEntry = log.find(l => l.date === s.date && l.subject === s.subj && Math.abs(l.hours - (s.min - diffMin)/60) < 0.01);
    if (logEntry) {
        logEntry.hours = val / 60;
        setData('ilia-log', log);
    } else {
        log.push({date: s.date, hours: val/60, subject: s.subj, ts: Date.now()});
        setData('ilia-log', log);
    }
    
    if (typeof refreshAppData === 'function') refreshAppData();
    renderSessions();
    toast('✅ جلسه ویرایش شد');
};




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
            result.innerHTML = `
                😴 <b>خسته‌ای؟</b> بیا بریم فلش‌کارت‌های لایتنر رو مرور کنیم. کار سبکیه.<br><br>
                <button class="btn btn-sm btn-primary" onclick="document.getElementById('moodModal').style.display='none'; go('leitner')">بریم لایتنر</button>
            `;
        } 
        else if (mood === 'stressed') {
            result.innerHTML = `
                😰 <b>آرام باش.</b> ۴ ثانیه نفس بکش، ۴ ثانیه نگه دار، ۴ ثانیه بده بیرون.<br>
                <div class="breathing-circle"></div>
                <div style="font-size:0.8em; margin-top:10px;">با دایره نفس بکش...</div>
            `;
            setTimeout(() => { 
                result.innerHTML += `
                    <br><button class="btn btn-sm btn-primary" onclick="document.getElementById('moodModal').style.display='none'">حالم بهتر شد، بریم درس</button>
                `;
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
    
    grid.innerHTML = days.map(d => `
        <div class="sg-item" style="${d.isToday ? 'transform: scale(1.2); filter: drop-shadow(0 0 5px #10b981);' : ''}">
            ${d.icon}
            <span class="sg-label">${d.label}</span>
        </div>
    `).join('');
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
            return `<svg class="svg-plant" viewBox="0 0 50 50"><path d="M25,50 Q25,30 25,20" stroke="#4ade80" stroke-width="3" fill="none"/><path d="M25,30 Q15,25 10,35 Q20,35 25,30" fill="#22c55e"/><path d="M25,25 Q35,20 40,30 Q30,30 25,25" fill="#16a34a"/></svg>`;
        }
        if (hours >= 1 && hours < 2) {
            // نهال
            return `<svg class="svg-plant" viewBox="0 0 50 50"><rect x="23" y="25" width="4" height="25" fill="#78350f"/><circle cx="25" cy="20" r="12" fill="#22c55e"/><circle cx="15" cy="25" r="8" fill="#16a34a"/><circle cx="35" cy="25" r="8" fill="#15803d"/></svg>`;
        }
        if (hours >= 2 && hours < 3) {
            // درخت متوسط (بدون میوه)
            return `<svg class="svg-plant" viewBox="0 0 50 50"><path d="M22,50 L28,50 L27,25 L23,25 Z" fill="#451a03"/><path d="M25,10 L10,30 L15,30 L5,45 L45,45 L35,30 L40,30 Z" fill="#22c55e"/><path d="M25,15 L15,35 L35,35 Z" fill="#16a34a"/></svg>`;
        }
        if (hours >= 3 && hours < 4.5) {
            // درخت بزرگ با چند سیب
            return `<svg class="svg-plant" viewBox="0 0 50 50">
                <path d="M21,50 L29,50 L28,20 L22,20 Z" fill="#451a03"/>
                <circle cx="25" cy="15" r="15" fill="#22c55e"/>
                <circle cx="12" cy="25" r="12" fill="#16a34a"/>
                <circle cx="38" cy="25" r="12" fill="#15803d"/>
                <circle cx="25" cy="30" r="10" fill="#166534"/>
                <circle cx="18" cy="18" r="2.5" fill="#ef4444"/>
                <circle cx="32" cy="22" r="2.5" fill="#ef4444"/>
                <circle cx="25" cy="28" r="2.5" fill="#ef4444"/>
            </svg>`;
        }
        // درخت غول‌پیکر پر از میوه
        return `<svg class="svg-plant" viewBox="0 0 50 50">
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
        </svg>`;
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
            const tooltipText = hours > 0 ? `${hours.toFixed(1)} ساعت مطالعه\n📚 ${subjects || 'نامشخص'}` : 'این روز مطالعه‌ای ثبت نشده';
            
            const dayName = dayNames[d.getDay()];
            const svg = this.getSvgPlant(hours);

            html += `
                <div class="gd-cell-real" 
                     onclick="GardenPro.showTooltip(event, '${tooltipText}')"
                     onmouseenter="GardenPro.showTooltip(event, '${tooltipText}')"
                     onmouseleave="GardenPro.hideTooltip()">
                    ${hours > 0 ? `<div class="gd-hours-real">${fa(hours.toFixed(1))}س</div>` : ''}
                    ${svg}
                    <div class="gd-day-real">${dayName}</div>
                </div>
            `;
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
            card.innerHTML = `
                <div class="lc-icon">${current.icon}</div>
                <div class="lc-name" style="color:${current.color}">${current.name}</div>
                <div class="lc-avg">میانگین ۷ روز اخیر: ${fa(dailyAvg.toFixed(1))} ساعت</div>
                ${next ? `<div style="font-size:0.75em; margin-top:10px; opacity:0.8;">برای رسیدن به ${next.name}، روزانه ${fa((next.minAvg - dailyAvg).toFixed(1))} ساعت بیشتر بخوان</div>` : '<div style="font-size:0.75em; margin-top:10px; color:#fbbf24;">تو در بالاترین سطح ممکن هستی! 🎉</div>'}
            `;
        }

        const list = document.getElementById('leagueList');
        if (list) {
            list.innerHTML = this.leagues.map((l, i) => {
                const isUnlocked = i <= currentIdx;
                const isActive = i === currentIdx;
                return `
                    <div class="league-item ${isActive ? 'active' : ''} ${isUnlocked ? 'unlocked' : ''}">
                        <div class="li-icon">${l.icon}</div>
                        <div class="li-info">
                            <div class="li-name" style="${isActive ? 'color:' + l.color : ''}">${l.name}</div>
                            <div class="li-req">حداقل میانگین: ${fa(l.minAvg)} ساعت در روز</div>
                        </div>
                        <div class="li-check">✓</div>
                    </div>
                `;
            }).join('');
        }
    },

    showTooltip: function(e, text) {
        const tooltip = document.getElementById('gardenTooltip');
        if (!tooltip) return;
        tooltip.innerHTML = text.replace(/\n/g, '<br>');
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

window.renderGardenPage = function() { GardenPro.renderGarden(); };

if (typeof go !== 'undefined') {
    const originalGo5 = go;
    window.go = function(id) {
        originalGo5(id);
        if (id === 'garden') setTimeout(() => { GardenPro.renderGarden(); }, 50);
    };
}

if (typeof go !== 'undefined') {
    const originalGo4 = go;
    window.go = function(id) {
        originalGo4(id);
        if (id === 'garden') setTimeout(() => { GardenPro.renderGarden(); }, 50);
        if (id === 'league') setTimeout(() => { GardenPro.renderLeaguePage(); }, 50);
    };
}

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


// اتصال به تابع go
if (typeof go !== 'undefined') {
    const originalGo = go;
    window.go = function(id) {
        originalGo(id);
        if (id === 'garden') {
            setTimeout(renderGardenPage, 50);
        }
    };
}

// رندر اولیه در صورت لود مستقیم
setTimeout(() => {
    if (document.getElementById('garden') && document.getElementById('garden').classList.contains('active')) {
        renderGardenPage();
    }
}, 1000);


// ============ STUDY EDITOR ============


// ============ LEAGUE LOGIC (UPDATED) ============
window.GardenPro = window.GardenPro || {};
GardenPro.currentTab = 'weekly';
GardenPro.leagues = [
    { name: 'لیگ برنز', icon: '🥉', minAvg: 0, color: '#cd7f32' },
    { name: 'لیگ نقره', icon: '🥈', minAvg: 1, color: '#c0c0c0' },
    { name: 'لیگ طلا', icon: '🥇', minAvg: 2, color: '#ffd700' },
    { name: 'لیگ الماس', icon: '💎', minAvg: 3, color: '#b9f2ff' },
    { name: 'لیگ استاد', icon: '👑', minAvg: 4, color: '#f59e0b' },
    { name: 'لیگ افسانه', icon: '🌌', minAvg: 5, color: '#8b5cf6' }
];

GardenPro.switchLeagueTab = function(tab, btn) {
    this.currentTab = tab;
    document.querySelectorAll('.lt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderLeaguePage();
};

GardenPro.getLeagueData = function() {
    const log = getData('ilia-log', []);
    if (log.length === 0) return { avg: 0, type: this.currentTab };
    
    log.sort((a,b) => a.date.localeCompare(b.date));
    const firstDate = new Date(log[0].date);
    const todayDate = new Date(today());
    
    let totalHours = 0;
    let daysCount = 1;
    
    if (this.currentTab === 'weekly') {
        // 7 روز اخیر
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const startStr = localDate(sevenDaysAgo);
        log.forEach(e => { if (e.date >= startStr) totalHours += e.hours; });
        daysCount = 7;
    } 
    else if (this.currentTab === 'monthly') {
        // اول ماه شمسی تا امروز
        const sh = getShamsi();
        const monthStartG = jalaliToGregorian(sh.y, sh.m, 1);
        const monthStartStr = localDate(new Date(monthStartG[0], monthStartG[1]-1, monthStartG[2]));
        log.forEach(e => { if (e.date >= monthStartStr) totalHours += e.hours; });
        daysCount = sh.d; // روزهای گذشته از ماه
    } 
    else { // alltime
        log.forEach(e => totalHours += e.hours);
        const diffTime = Math.abs(todayDate - firstDate);
        daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (daysCount < 1) daysCount = 1;
    }
    
    return { avg: totalHours / daysCount, type: this.currentTab };
};

GardenPro.renderLeaguePage = function() {
    const { avg } = this.getLeagueData();
    
    let currentIdx = 0;
    for (let i = 0; i < this.leagues.length; i++) {
        if (avg >= this.leagues[i].minAvg) currentIdx = i;
    }
    const current = this.leagues[currentIdx];
    const next = this.leagues[currentIdx + 1];

    const card = document.getElementById('leagueCurrentCard');
    if (card) {
        let typeLabel = this.currentTab === 'weekly' ? 'میانگین هفتگی' : this.currentTab === 'monthly' ? 'میانگین ماهانه' : 'میانگین کل';
        card.innerHTML = `
            <div class="lc-icon">${current.icon}</div>
            <div class="lc-name" style="color:${current.color}">${current.name}</div>
            <div class="lc-avg">${typeLabel}: ${fa(avg.toFixed(2))} ساعت در روز</div>
            ${next ? `<div style="font-size:0.75em; margin-top:10px; opacity:0.8;">برای رسیدن به ${next.name}، روزانه ${fa((next.minAvg - avg).toFixed(1))} ساعت بیشتر بخوان</div>` : '<div style="font-size:0.75em; margin-top:10px; color:#fbbf24;">تو در بالاترین سطح ممکن هستی! 🎉</div>'}
        `;
    }

    const list = document.getElementById('leagueList');
    if (list) {
        list.innerHTML = this.leagues.map((l, i) => {
            const isUnlocked = i <= currentIdx;
            const isActive = i === currentIdx;
            return `
                <div class="league-item ${isActive ? 'active' : ''} ${isUnlocked ? 'unlocked' : ''}">
                    <div class="li-icon">${l.icon}</div>
                    <div class="li-info">
                        <div class="li-name" style="${isActive ? 'color:' + l.color : ''}">${l.name}</div>
                        <div class="li-req">حداقل میانگین: ${fa(l.minAvg)} ساعت در روز</div>
                    </div>
                    <div class="li-check">✓</div>
                </div>
            `;
        }).join('');
    }
};

// اطمینان از اینکه go لیگ رو رندر میکنه
if (typeof go !== 'undefined') {
    const originalGoFinal = go;
    window.go = function(id) {
        originalGoFinal(id);
        if (id === 'league') setTimeout(() => { GardenPro.renderLeaguePage(); }, 50);
    };
}


// ============ BIND CLICK TO WIDGET ============
setTimeout(() => {
    const widget = document.getElementById('launcherWidget');
    if (widget) {
        widget.style.cursor = 'pointer';
        widget.onclick = function(e) {
            // جلوگیری از باز شدن اگر روی دکمه‌های خاصی کلیک شد (در صورت وجود)
            e.preventDefault();
            if (typeof StudyEditor !== 'undefined') {
                StudyEditor.open();
            } else {
                console.error('StudyEditor is not defined!');
            }
        };
    }
}, 1000);


// ============ JALALI MODAL & EDITOR FIX ============
window.StudyEditor = {
    open: function() {
        document.getElementById('studyEditorModal').classList.add('active');
        const dateInput = document.getElementById('editDate');
        const t = today();
        const sh = getShamsi(new Date());
        
        // نمایش تاریخ شمسی در فیلد
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
        // ذخیره تاریخ میلادی در پس‌زمینه برای دیتابیس
        dateInput.dataset.gregorian = t;
        
        document.getElementById('editMinutes').value = '';
        document.getElementById('editMinutes').focus();
    },
    close: function() {
        document.getElementById('studyEditorModal').classList.remove('active');
    },
    save: function() {
        const dateInput = document.getElementById('editDate');
        const date = dateInput.dataset.gregorian || today();
        const subj = document.getElementById('editSubject').value;
        const min = parseInt(document.getElementById('editMinutes').value);
        
        if (!min || min <= 0) return toast('لطفاً دقیقه معتبر وارد کنید');
        
        const log = getData('ilia-log', []);
        log.push({ date, hours: min / 60, subject: subj, ts: Date.now() });
        setData('ilia-log', log);
        
        const sessions = getData('ilia-sessions', []);
        sessions.push({ id: Date.now(), date, subj, min, topic: 'ثبت سریع', pages: 0, tests: 0, ts: Date.now() });
        setData('ilia-sessions', sessions);
        
        this.close();
        toast('✅ مطالعه برای تاریخ ' + dateInput.value + ' ثبت شد');
        
        // رفرش همه بخش‌ها
        if (typeof refreshAppData === 'function') refreshAppData();
        if (typeof updateLauncherWidget === 'function') updateLauncherWidget();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderGarden) GardenPro.renderGarden();
        if (typeof GardenPro !== 'undefined' && GardenPro.renderLeaguePage) GardenPro.renderLeaguePage();
        if (typeof renderStats === 'function') renderStats();
        if (typeof renderSessions === 'function') renderSessions();
    }
};

// بازنویسی انتخاب تاریخ در تقویم شمسی
window.JalaliPicker.select = function(d) {
    const jDateStr = this.currentY + '/' + pad2(this.currentM) + '/' + pad2(d);
    if (this.targetInput) {
        this.targetInput.value = jDateStr;
        
        // تبدیل به میلادی برای ذخیره در دیتابیس
        const g = jalaliToGregorian(this.currentY, this.currentM, d);
        const gStr = g[0] + '-' + pad2(g[1]) + '-' + pad2(g[2]);
        this.targetInput.dataset.gregorian = gStr;
    }
    this.close();
};

// بازنویسی رندر تقویم برای هایلایت درست روز انتخاب شده
window.JalaliPicker.render = function() {
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    document.getElementById('jpTitle').textContent = months[this.currentM - 1] + ' ' + fa(this.currentY);
    
    const daysInMonth = jalaliDaysInMonth(this.currentY, this.currentM);
    const firstDayG = jalaliToGregorian(this.currentY, this.currentM, 1);
    const firstDayDate = new Date(firstDayG[0], firstDayG[1]-1, firstDayG[2]);
    const startDayOfWeek = (firstDayDate.getDay() + 1) % 7; 
    
    let html = '';
    const wDays = ['ش','ی','د','س','چ','پ','ج'];
    wDays.forEach(d => html += '<div class="jp-day-name">' + d + '</div>');
    
    for (let i = 0; i < startDayOfWeek; i++) html += '<div class="jp-day empty"></div>';
    
    const todaySh = getShamsi();
    let selectedStr = this.targetInput ? this.targetInput.value : '';
    
    // اگر input تاریخ شمسی ندارد، از تاریخ میلادی ذخیره شده آن را تبدیل کن
    if (this.targetInput && this.targetInput.dataset.gregorian) {
        const gParts = this.targetInput.dataset.gregorian.split('-');
        const sh = getShamsi(new Date(gParts[0], gParts[1]-1, gParts[2]));
        selectedStr = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
        let cls = 'jp-day';
        if (this.currentY === todaySh.y && this.currentM === todaySh.m && d === todaySh.d) cls += ' today';
        
        const thisDateStr = this.currentY + '/' + pad2(this.currentM) + '/' + pad2(d);
        if (selectedStr === thisDateStr) cls += ' selected';
        
        html += '<div class="' + cls + '" onclick="JalaliPicker.select(' + d + ')">' + fa(d) + '</div>';
    }
    document.getElementById('jpGrid').innerHTML = html;
};


// اضافه کردن متدهای ناوبری تاریخ به StudyEditor
StudyEditor.changeDate = function(delta) {
    const dateInput = document.getElementById('editDate');
    let currentGreg = dateInput.dataset.gregorian || today();
    
    // تبدیل رشته میلادی به آبجکت Date
    let d = new Date(currentGreg + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    
    const todayStr = today();
    const newGregStr = localDate(d);
    
    // جلوگیری از رفتن به آینده
    if (newGregStr > todayStr) {
        return;
    }
    
    // آپدیت دیتاست و UI
    dateInput.dataset.gregorian = newGregStr;
    const sh = getShamsi(d);
    dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
    
    // چک کردن وضعیت دکمه روز بعد
    this.updateNextButton(newGregStr);
};

StudyEditor.updateNextButton = function(gregStr) {
    const btn = document.getElementById('btnNextDay');
    if (btn) {
        if (gregStr === today()) {
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }
};

// بازنویسی تابع open برای آپدیت اولیه دکمه‌ها
const originalEditorOpen = StudyEditor.open;
StudyEditor.open = function() {
    originalEditorOpen();
    const dateInput = document.getElementById('editDate');
    // اگر تاریخ تنظیم نشده بود، امروز را ست کن
    if (!dateInput.dataset.gregorian) {
        dateInput.dataset.gregorian = today();
        const sh = getShamsi();
        dateInput.value = sh.y + '/' + pad2(sh.m) + '/' + pad2(sh.d);
    }
    this.updateNextButton(dateInput.dataset.gregorian);
};

// بازنویسی انتخاب تقویم برای آپدیت دکمه‌ها پس از انتخاب
const originalPickerSelect = window.JalaliPicker.select;
window.JalaliPicker.select = function(d) {
    originalPickerSelect.call(this, d);
    if (this.targetInput && this.targetInput.id === 'editDate') {
        setTimeout(() => {
            StudyEditor.updateNextButton(this.targetInput.dataset.gregorian);
        }, 100);
    }
};


// ============ GARDEN RENDER FIX ============
// اطمینان از اینکه هر دو نام render و renderGarden کار می‌کنند
if (typeof GardenPro !== 'undefined') {
    GardenPro.render = function() {
        if (typeof GardenPro.renderGarden === 'function') {
            GardenPro.renderGarden();
        }
    };
}

// اطمینان از اینکه صفحه باغ همیشه به درستی باز می‌شود
window.renderGardenPage = function() {
    if (typeof GardenPro !== 'undefined') {
        if (typeof GardenPro.renderGarden === 'function') {
            GardenPro.renderGarden();
        } else if (typeof GardenPro.render === 'function') {
            GardenPro.render();
        }
    }
};
