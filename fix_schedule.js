const fs = require('fs');

console.log("🔧 در حال اعمال قوی‌ترین اصلاحات روی برنامه‌ریز...");

// ==========================================
// 1. اصلاح فایل app.js (با برش کد دقیق)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

// پیدا کردن نقطه شروع
const startStr = 'const SCHOOL_SUBJECTS =';
const startIdx = js.indexOf(startStr);

// پیدا کردن نقطه پایان (بسته شدن SCHEDULE IIFE)
const scheduleStartIdx = js.indexOf('const SCHEDULE = (function() {');
let endIdx = -1;
if (scheduleStartIdx !== -1) {
    let braceCount = 0;
    for (let i = scheduleStartIdx; i < js.length; i++) {
        if (js[i] === '{') braceCount++;
        if (js[i] === '}') braceCount--;
        if (braceCount === 0 && js[i] === '}') {
            if (js.substring(i, i + 5) === '})();') {
                endIdx = i + 5;
                break;
            }
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const newScheduleBlock = `
const SCHOOL_SUBJECTS = SCHOOL_SCHEDULE;
const ALL_SUBJECTS_LIST = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'نگارش', 'جغرافیا', 'دینی', 'تفکر', 'آمادگی دفاعی', 'آزمایشگاه'];

const SCHEDULE = (function() {
  const sched = {};
  const minToTime = (m) => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');

  // تابع پر کردن بلوک‌های ۴۰-۲۰
  function fillStudyBlocks(daySched, startMin, endMin, queue) {
      let cur = startMin;
      let qIdx = 0;
      while (cur + 40 <= endMin) {
          const subj = queue[qIdx % queue.length];
          qIdx++;
          const icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[subj]) ? SUBJECT_ICONS[subj] : '📖';
          daySched.push([minToTime(cur), minToTime(cur + 40), 'مطالعه ' + subj, "study", icon]);
          cur += 40;
          if (cur + 20 <= endMin) {
              daySched.push([minToTime(cur), minToTime(cur + 20), 'استراحت', "rest", "☕"]);
              cur += 20;
          }
      }
  }

  for (let day = 0; day <= 6; day++) {
    sched[day] = [];
    const isSchool = [6, 0, 1, 2].includes(day); // شنبه تا سه‌شنبه
    const hasGym = [6, 1, 3].includes(day); // شنبه، دوشنبه، چهارشنبه
    const todaySubs = SCHOOL_SUBJECTS[day] || [];
    const tomorrowSubs = SCHOOL_SUBJECTS[(day + 1) % 7] || [];

    // ساخت صف دروس (مرور امروز، پیش‌خوانی فردا، و بقیه دروس)
    let queue = [];
    todaySubs.forEach(s => queue.push(s));
    tomorrowSubs.forEach(s => { if(!queue.includes(s)) queue.push(s); });
    ALL_SUBJECTS_LIST.forEach(s => { if(!queue.includes(s)) queue.push(s); });

    if (day === 3) { // چهارشنبه
       queue = ['ریاضی', 'فیزیک', 'شیمی', 'هندسه', ...ALL_SUBJECTS_LIST.filter(s => !['ریاضی','فیزیک','شیمی','هندسه'].includes(s))];
    }
    if (day === 5) { // جمعه
       queue = ['مرور آزمون', 'تحلیل آزمون', ...ALL_SUBJECTS_LIST];
    }

    if (isSchool) {
       sched[day].push(["06:30","07:00","بیداری، صبحانه","wake","🌅"]);
       sched[day].push(["07:00","14:00","مدرسه","school","🏫"]);
       sched[day].push(["14:00","15:00","ناهار و استراحت","rest","🍽"]);

       if (hasGym) {
           fillStudyBlocks(sched[day], 15*60, 17*60, queue);
           sched[day].push(["17:00","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       } else {
           fillStudyBlocks(sched[day], 15*60, 20*60, queue);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       }
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);

    } else {
       if (day === 5) { // جمعه (آزمون ماز)
           sched[day].push(["06:30","07:00","آماده‌سازی آزمون","wake","🌅"]);
           sched[day].push(["07:00","11:00","آزمون ماز","school","📝"]);
           sched[day].push(["11:00","13:00","استراحت","rest","☕"]);
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           fillStudyBlocks(sched[day], 14*60, 20*60, queue);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       } 
       else if (day === 3) { // چهارشنبه (رباتیک + باشگاه)
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           fillStudyBlocks(sched[day], 9*60, 13*60, queue);
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           fillStudyBlocks(sched[day], 14*60, 16*60, queue);
           sched[day].push(["16:00","17:30","کلاس رباتیک","study","🤖"]);
           sched[day].push(["17:30","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       } 
       else { // پنجشنبه (تعطیل)
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           fillStudyBlocks(sched[day], 9*60, 13*60, queue);
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           fillStudyBlocks(sched[day], 14*60, 20*60, queue);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       }
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);
    }
  }
  return sched;
})();
`;
    js = js.slice(0, startIdx) + newScheduleBlock + js.slice(endIdx);
    fs.writeFileSync('app.js', js);
    console.log("✅ کد برنامه در app.js به طور کامل جایگزین شد.");
} else {
    console.log("⚠️ ساختار کد پیدا نشد. لطفا بررسی کنید.");
}

// ==========================================
// 2. زور زدن به مرورگر برای پاک کردن کش (Service Worker)
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
// تغییر نام کش به نسخه جدید
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);
console.log("✅ نسخه کش مرورگر آپدیت شد (مرورگر مجبور به لود کد جدید می‌شود).");

console.log("🎉 تمام شد! حالا حتما Ctrl+F5 بزن.");
