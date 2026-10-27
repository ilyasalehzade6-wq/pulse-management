const fs = require('fs');

console.log("🧠 در حال بازنویسی الگوریتم برای پوشش تمام دروس و اصلاح چهارشنبه‌ها...");

let js = fs.readFileSync('app.js', 'utf8');

const newSmartSchedule = `
const SCHOOL_SUBJECTS = {
  6: ['آمادگی دفاعی', 'فارسی', 'نگارش', 'شیمی'],
  0: ['ریاضی', 'تفکر', 'فیزیک', 'جغرافیا'],
  1: ['دینی', 'شیمی', 'زبان', 'آزمایشگاه'],
  2: ['فیزیک', 'هندسه', 'عربی', 'ریاضی'],
  3: [], // چهارشنبه تعطیل است
  4: [], // پنجشنبه تعطیل
  5: []  // جمعه تعطیل
};

const ALL_SUBJECTS = ['ریاضی', 'فیزیک', 'هندسه', 'شیمی', 'عربی', 'زبان', 'فارسی', 'نگارش', 'جغرافیا', 'دینی', 'تفکر', 'دفاعی', 'آزمایشگاه'];

const SCHEDULE = (function() {
  const sched = {};
  const minToTime = (m) => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');

  // تابع کمکی برای پر کردن یک بازه زمانی با بلوک‌های ۴۰-۲۰ مطالعه
  function fillStudyBlocks(daySched, startMin, endMin, queue) {
      let cur = startMin;
      let qIdx = 0;
      while (cur + 40 <= endMin) {
          const subj = queue[qIdx % queue.length];
          qIdx++;
          const icon = (typeof SUBJECT_ICONS !== 'undefined' && SUBJECT_ICONS[subj]) ? SUBJECT_ICONS[subj] : '📖';
          daySched.push([minToTime(cur), minToTime(cur + 40), 'مطالعه ' + subj, "study", icon]);
          cur += 40;
          // استراحت ۲۰ دقیقه‌ای
          if (cur + 20 <= endMin) {
              daySched.push([minToTime(cur), minToTime(cur + 20), 'استراحت', "rest", "☕"]);
              cur += 20;
          }
      }
  }

  for (let day = 0; day <= 6; day++) {
    sched[day] = [];
    const isSchool = [6, 0, 1, 2].includes(day); // شنبه، یکشنبه، دوشنبه، سه‌شنبه
    const hasGym = [6, 1, 3].includes(day); // شنبه، دوشنبه، چهارشنبه
    const todaySubs = SCHOOL_SUBJECTS[day] || [];
    const tomorrowSubs = SCHOOL_SUBJECTS[(day + 1) % 7] || [];

    // 1. ساخت صف دروس (مرور امروز، پیش‌خوانی فردا، و بقیه دروس برای پوشش کامل)
    let queue = [];
    todaySubs.forEach(s => queue.push(s));
    tomorrowSubs.forEach(s => { if(!queue.includes(s)) queue.push(s); });
    ALL_SUBJECTS.forEach(s => { if(!queue.includes(s)) queue.push(s); }); // تضمین پوشش همه دروس

    // 2. اولویت‌بندی خاص برای چهارشنبه و جمعه
    if (day === 3) { // چهارشنبه: آماده‌سازی آزمون ماز
       queue = ['ریاضی', 'فیزیک', 'شیمی', 'هندسه', ...ALL_SUBJECTS.filter(s => !['ریاضی','فیزیک','شیمی','هندسه'].includes(s))];
    }
    if (day === 5) { // جمعه: روز آزمون
       queue = ['مرور آزمون', 'تحلیل آزمون', ...ALL_SUBJECTS];
    }

    // 3. برنامه‌ریزی روزهای مدرسه (شنبه تا سه‌شنبه)
    if (isSchool) {
       sched[day].push(["06:30","07:00","بیداری، صبحانه","wake","🌅"]);
       sched[day].push(["07:00","14:00","مدرسه","school","🏫"]);
       sched[day].push(["14:00","15:00","ناهار و استراحت","rest","🍽"]);

       if (hasGym) {
           fillStudyBlocks(sched[day], 15*60, 17*60, queue); // 15:00 تا 17:00
           sched[day].push(["17:00","20:00","باشگاه","sport","🥊"]);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue); // 20:45 تا 22:00
       } else {
           fillStudyBlocks(sched[day], 15*60, 20*60, queue); // 15:00 تا 20:00 (بدون باشگاه)
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       }
       sched[day].push(["22:00","23:59","خواب","sleep","😴"]);

    } else {
       // 4. برنامه‌ریزی روزهای تعطیل (چهارشنبه، پنجشنبه، جمعه)
       if (day === 5) { // جمعه (آزمون ماز)
           sched[day].push(["06:30","07:00","آماده‌سازی آزمون","wake","🌅"]);
           sched[day].push(["07:00","11:00","آزمون ماز","school","📝"]);
           sched[day].push(["11:00","13:00","استراحت پس از آزمون","rest","☕"]);
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           fillStudyBlocks(sched[day], 14*60, 20*60, queue);
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       } 
       else if (day === 3) { // چهارشنبه (رباتیک و باشگاه)
           sched[day].push(["08:00","09:00","بیداری، صبحانه","wake","🌅"]);
           fillStudyBlocks(sched[day], 9*60, 13*60, queue); // 9 تا 13
           sched[day].push(["13:00","14:00","ناهار","rest","🍽"]);
           fillStudyBlocks(sched[day], 14*60, 16*60, queue); // 14 تا 16
           sched[day].push(["16:00","17:30","کلاس رباتیک","study","🤖"]); // دقیقاً طبق درخواست
           sched[day].push(["17:30","20:00","باشگاه","sport","🥊"]); // 5:30 تا 8 باشگاه
           sched[day].push(["20:00","20:45","شام","rest","🍽"]);
           fillStudyBlocks(sched[day], 20*60 + 45, 22*60, queue);
       } 
       else { // پنجشنبه (تعطیل کامل)
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
})();`;

// جایگزینی SCHEDULE قبلی
js = js.replace(/const SCHOOL_SUBJECTS = \{[\s\S]*?\}\)\(\);/, newSmartSchedule);
js = js.replace(/const SCHEDULE = \{[\s\S]*?\n\};/, newSmartSchedule);

fs.writeFileSync('app.js', js);
console.log("🎉 الگوریتم هوشمند جدید اعمال شد! (پوشش تمام دروس، برنامه دقیق چهارشنبه و تعطیلات)");
