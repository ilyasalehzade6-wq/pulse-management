const fs = require('fs');

console.log("🔧 در حال اصلاح تنظیمات هدف و قفل کردن ساعت مطالعه روی ۴ ساعت...");

// ==========================================
// 1. بازنویسی SCHEDULE با ساعت دقیق ۲۴۰ دقیقه
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const exactSchedule = `
const SCHOOL_SUBJECTS = SCHOOL_SCHEDULE;
const ALL_SUBJECTS_LIST = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'نگارش', 'جغرافیا', 'دینی', 'تفکر', 'آمادگی دفاعی', 'آزمایشگاه'];

const SCHEDULE = (function() {
  const sched = {};
  const minToTime = (m) => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');

  // تابع کمکی برای پوشش دروس
  function getSubject(queue, idx) {
      return queue[idx % queue.length];
  }
  
  function getIcon(subj) {
      return (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[subj]) ? SUBJECT_ICONS[subj] : '📖';
  }

  for (let day = 0; day <= 6; day++) {
    sched[day] = [];
    const isSchool = [6, 0, 1, 2].includes(day); // شنبه تا سه‌شنبه
    const hasGym = [6, 1, 3].includes(day); // شنبه، دوشنبه، چهارشنبه
    
    let queue = [...(SCHOOL_SUBJECTS[day] || [])];
    (SCHOOL_SUBJECTS[(day+1)%7] || []).forEach(s => { if(!queue.includes(s)) queue.push(s); });
    ALL_SUBJECTS_LIST.forEach(s => { if(!queue.includes(s)) queue.push(s); });

    if (day === 3) queue = ['ریاضی', 'فیزیک', 'شیمی', 'هندسه', ...ALL_SUBJECTS_LIST];
    if (day === 5) queue = ['مرور آزمون', 'تحلیل آزمون', ...ALL_SUBJECTS_LIST];

    // ================= سه‌شنبه (بدون باشگاه، دقیقاً ۴ ساعت) =================
    if (day === 2) {
       sched[day].push(["06:30","07:00","بیداری، صبحانه","wake","🌅"]);
       sched[day].push(["07:00","14:00","مدرسه","school","🏫"]);
       sched[day].push(["14:00","15:00","ناهار و استراحت","rest","🍽"]);
       
       let times = [
           ["15:00","15:40"], ["15:40","16:00"],
           ["16:00","16:40"], ["16:40","17:00"],
           ["17:00","17:40"], ["17:40","18:00"],
           ["18:00","18:40"], ["18:40","19:00"],
           ["19:00","19:40"], ["19:40","20:00"]
       ];
       let qI = 0;
       times.forEach((t, i) => {
           if (i % 2 === 0) {
               const subj = getSubject(queue, qI++);
               sched[day].push([t[0], t[1], 'مطالعه ' + subj, "study", getIcon(subj)]);
           } else {
               sched[day].push([t[0], t[1], 'استراحت', "rest", "☕"]);
           }
       });
       
       sched[day].push(["20:00","20:45","شام","rest","🍽"]);
       const subj = getSubject(queue, qI++);
       sched[day].push(["20:45","21:25", 'مطالعه ' + subj, "study", getIcon(subj)]);
       sched[day].push(["21:25","21:45", 'استراحت', "rest", "☕"]);
       sched[day].push(["21:45","22:00", 'آماده‌سازی خواب', "rest", "🛌"]);
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);
    }
    // ================= سایر روزهای مدرسه =================
    else if (isSchool) {
       sched[day].push(["06:30","07:00","بیداری، صبحانه","wake","🌅"]);
       sched[day].push(["07:00","14:00","مدرسه","school","🏫"]);
       sched[day].push(["14:00","15:00","ناهار و استراحت","rest","🍽"]);
       
       let qI = 0;
       if (hasGym) {
           sched[day].push(["15:00","15:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["15:40","16:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["16:00","16:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["16:40","17:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["17:00","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           sched[day].push(["20:45","21:25", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["21:25","21:45", 'استراحت', "rest", "☕"]);
       } else {
           sched[day].push(["15:00","15:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["15:40","16:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["16:00","16:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["16:40","17:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["17:00","17:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["17:40","18:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["18:00","18:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["18:40","19:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["19:00","19:40", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["19:40","20:00", 'استراحت', "rest", "☕"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           sched[day].push(["20:45","21:25", 'مطالعه ' + getSubject(queue, qI++), "study", getIcon(getSubject(queue, qI-1))]);
           sched[day].push(["21:25","21:45", 'استراحت', "rest", "☕"]);
       }
       sched[day].push(["21:45","22:00", 'آماده‌سازی خواب', "rest", "🛌"]);
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);
    }
    // ================= چهارشنبه و پنجشنبه و جمعه =================
    else {
       let qI = 0;
       if (day === 5) { // جمعه
           sched[day].push(["06:30","07:00","آماده‌سازی آزمون","wake","🌅"]);
           sched[day].push(["07:00","11:00","آزمون ماز","school","📝"]);
           sched[day].push(["11:00","13:00","استراحت","rest","☕"]);
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           for(let h=14; h<20; h+=1) {
               if(h%1===0) {
                 const subj = getSubject(queue, qI++);
                 sched[day].push([minToTime(h*60), minToTime(h*60+40), 'مطالعه ' + subj, "study", getIcon(subj)]);
                 sched[day].push([minToTime(h*60+40), minToTime(h*60+60), 'استراحت', "rest", "☕"]);
               }
           }
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           const subj = getSubject(queue, qI++);
           sched[day].push(["20:45","21:25", 'مطالعه ' + subj, "study", getIcon(subj)]);
           sched[day].push(["21:25","21:45", 'استراحت', "rest", "☕"]);
       } 
       else if (day === 3) { // چهارشنبه
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           for(let h=9; h<13; h+=1) {
               const subj = getSubject(queue, qI++);
               sched[day].push([minToTime(h*60), minToTime(h*60+40), 'مطالعه ' + subj, "study", getIcon(subj)]);
               sched[day].push([minToTime(h*60+40), minToTime(h*60+60), 'استراحت', "rest", "☕"]);
           }
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           for(let h=14; h<16; h+=1) {
               const subj = getSubject(queue, qI++);
               sched[day].push([minToTime(h*60), minToTime(h*60+40), 'مطالعه ' + subj, "study", getIcon(subj)]);
               sched[day].push([minToTime(h*60+40), minToTime(h*60+60), 'استراحت', "rest", "☕"]);
           }
           sched[day].push(["16:00","17:30","کلاس رباتیک","study","🤖"]);
           sched[day].push(["17:30","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           const subj = getSubject(queue, qI++);
           sched[day].push(["20:45","21:25", 'مطالعه ' + subj, "study", getIcon(subj)]);
           sched[day].push(["21:25","21:45", 'استراحت', "rest", "☕"]);
       } 
       else { // پنجشنبه
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           for(let h=9; h<13; h+=1) {
               const subj = getSubject(queue, qI++);
               sched[day].push([minToTime(h*60), minToTime(h*60+40), 'مطالعه ' + subj, "study", getIcon(subj)]);
               sched[day].push([minToTime(h*60+40), minToTime(h*60+60), 'استراحت', "rest", "☕"]);
           }
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           for(let h=14; h<20; h+=1) {
               const subj = getSubject(queue, qI++);
               sched[day].push([minToTime(h*60), minToTime(h*60+40), 'مطالعه ' + subj, "study", getIcon(subj)]);
               sched[day].push([minToTime(h*60+40), minToTime(h*60+60), 'استراحت', "rest", "☕"]);
           }
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           const subj = getSubject(queue, qI++);
           sched[day].push(["20:45","21:25", 'مطالعه ' + subj, "study", getIcon(subj)]);
           sched[day].push(["21:25","21:45", 'استراحت', "rest", "☕"]);
       }
       sched[day].push(["21:45","22:00", 'آماده‌سازی خواب', "rest", "🛌"]);
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);
    }
  }
  return sched;
})();
`;

js = js.replace(/const SCHOOL_SUBJECTS = SCHOOL_SCHEDULE;[\s\S]*?\}\)\(\);/, exactSchedule);
fs.writeFileSync('app.js', js);

// ==========================================
// 2. زور زدن به مرورگر برای پاک کردن کش و ریست تنظیمات
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 برنامه‌ریزی دقیق اعمال شد! مرورگر را رفرش کنید (Ctrl+F5).");
console.log("💡 نکته: اگر باز هم ۲۶۰ دقیقه دیدید، حتما در تنظیمات برنامه، حالت هدف را از 'دستی' به 'خودکار' تغییر دهید.");
