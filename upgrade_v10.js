const fs = require('fs');

console.log("🧠 در حال اعمال فلسفه جدید: مشاور پیشنهاددهنده و مقایسه با خود...");

// ==========================================
// 1. بازنویسی SCHEDULE (اعمال محدودیت ۲ بار در روز و متن پیشنهادی)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const newScheduleCode = `
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
`;

js = js.replace(/const SCHOOL_SUBJECTS = SCHOOL_SCHEDULE;[\s\S]*?\}\)\(\);/, newScheduleCode);

// ==========================================
// 2. بازنویسی ویجت (مقایسه با خود، نه هدف)
// ==========================================
const newWidgetLogic = `
function updateLauncherWidget() {
    const widget = document.getElementById('launcherWidget');
    if (!widget) return;
    
    // گرفتن داده‌های امروز و دیروز
    const log = getData('ilia-log', []);
    const t = today();
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yesterday = localDate(d);

    const todayHours = log.filter(e => e.date === t).reduce((s,e) => s + e.hours, 0);
    const yesterdayHours = log.filter(e => e.date === yesterday).reduce((s,e) => s + e.hours, 0);
    
    // محاسبه درصد نسبت به دیروز (اگر دیروز صفر بوده، یک پایه ۱ ساعته در نظر می‌گیریم)
    let pct = 0;
    if (yesterdayHours > 0) {
        pct = Math.min(100, Math.round((todayHours / yesterdayHours) * 100));
    } else {
        pct = todayHours > 0 ? 100 : 0;
    }
    
    const elPct = document.getElementById('lw-percent');
    const elHours = document.getElementById('lw-hours');
    const elGoal = document.getElementById('lw-goal');
    const elFill = document.getElementById('lw-fill');
    
    // تغییر متن‌ها از "هدف" به "مقایسه با دیروز"
    const headerEl = widget.querySelector('.lw-header span:first-child');
    if(headerEl) headerEl.textContent = '📊 عملکرد امروز';
    
    if (elPct) elPct.textContent = fa(pct) + '٪';
    if (elHours) elHours.textContent = fa(todayHours.toFixed(1));
    if (elGoal) elGoal.textContent = fa(yesterdayHours.toFixed(1));
    if (elFill) elFill.style.width = pct + '%';
    
    // رنگ‌بندی بر اساس عملکرد
    if (todayHours > yesterdayHours && todayHours > 0) {
        widget.style.background = 'linear-gradient(135deg, #10b981, #059669)'; // سبز: بهتر از دیروز
    } else if (todayHours === 0) {
        widget.style.background = 'linear-gradient(135deg, #64748b, #475569)'; // خاکستری: هنوز شروع نکردی
    } else {
        widget.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))'; // آبی: در حال تلاش
    }
}
setTimeout(updateLauncherWidget, 1000);
setInterval(updateLauncherWidget, 60000);
`;

// جایگزینی تابع ویجت
js = js.replace(/function updateLauncherWidget\(\) \{[\s\S]*?setInterval\(updateLauncherWidget, 60000\);/, newWidgetLogic);

fs.writeFileSync('app.js', js);

// ==========================================
// 3. آپدیت متن HTML ویجت
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<span>🎯 هدف امروز</span>', '<span>📊 عملکرد امروز</span>');
html = html.replace('<span>خوندی: <b id="lw-hours">۰</b> ساعت</span>', '<span>امروز: <b id="lw-hours">۰</b> ساعت</span>');
html = html.replace('<span>هدف: <b id="lw-goal">۰</b> ساعت</span>', '<span>دیروز: <b id="lw-goal">۰</b> ساعت</span>');
fs.writeFileSync('index.html', html);

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تغییرات فلسفی با موفقیت اعمال شد! حالا Ctrl+F5 بزن.");
