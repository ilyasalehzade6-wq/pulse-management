const fs = require('fs');

console.log("🔄 در حال جابجایی درس جغرافیا و آمادگی دفاعی در برنامه هفتگی...");

let js = fs.readFileSync('app.js', 'utf8');

// تعریف برنامه جدید
const newSchedule = `
const SCHOOL_SCHEDULE = { 
  6: ['جغرافیا', 'فارسی', 'نگارش', 'شیمی'], // شنبه
  0: ['ریاضی', 'تفکر', 'فیزیک', 'آمادگی دفاعی'], // یکشنبه
  1: ['دینی', 'شیمی', 'زبان', 'آزمایشگاه'],
  2: ['فیزیک', 'هندسه', 'عربی', 'ریاضی'],
  3: [], // چهارشنبه تعطیل است
  4: [], // پنجشنبه تعطیل
  5: []  // جمعه تعطیل
};`;

// جایگزینی برنامه قبلی با برنامه جدید
js = js.replace(/const SCHOOL_SCHEDULE = \{[\s\S]*?\};/, newSchedule);

fs.writeFileSync('app.js', js);
console.log("✅ برنامه هفتگی با موفقیت آپدیت شد.");

// آپدیت کش مرورگر
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را رفرش کن (Ctrl+F5) و به برنامه هفتگی برو.");
