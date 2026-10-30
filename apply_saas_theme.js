const fs = require('fs');

console.log("💼 در حال تبدیل برنامه به یک داشبورد SaaS حرفه‌ای (تم Stripe/Linear)...");

// ==========================================
// 1. بازنویسی کامل CSS (تم SaaS)
// ==========================================
const saasCSS = `
@import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');

:root {
  /* Neutral Colors (Light Mode) */
  --bg-body: #f8fafc;
  --bg-surface: #ffffff;
  --bg-sidebar: #ffffff;
  --border-color: #e2e8f0;
  --border-hover: #cbd5e1;
  
  /* Text Colors */
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-inverse: #ffffff;

  /* Brand & Status */
  --primary: #4f46e5; /* Indigo */
  --primary-hover: #4338ca;
  --primary-light: #e0e7ff;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  
  /* Shadows & Radii */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --radius-btn: 6px;
  --radius-card: 12px;
  --radius-input: 8px;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}

[data-theme="dark"] {
  --bg-body: #0f172a;
  --bg-surface: #1e293b;
  --bg-sidebar: #0f172a;
  --border-color: #334155;
  --border-hover: #475569;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-light: #1e1b4b;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Vazirmatn', sans-serif;
  background-color: var(--bg-body);
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.6;
  direction: rtl;
  min-height: 100vh;
  transition: background-color 0.2s, color 0.2s;
}

/* ============ LAYOUT ============ */
.saas-layout {
  display: flex;
  min-height: 100vh;
}

/* سایدبار */
.saas-sidebar {
  width: 260px;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  transition: transform 0.3s ease;
}
.saas-sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-weight: 800;
  font-size: 1.1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}
.saas-nav {
  padding: 16px 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.saas-nav-group {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 12px 8px;
}
.saas-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-btn);
  color: var(--text-muted);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.saas-nav-item:hover {
  background: var(--bg-body);
  color: var(--text-main);
}
.saas-nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
}
.saas-nav-item .icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

/* محتوای اصلی */
.saas-main {
  flex: 1;
  margin-right: 260px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.saas-header {
  height: 64px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 90;
}
.saas-content {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* ============ COMPONENTS ============ */
h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; color: var(--text-main); display: flex; align-items: center; gap: 8px; }
h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); }

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
}

/* دکمه‌ها */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-btn);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  text-decoration: none;
}
.btn:active { transform: scale(0.98); }
.btn-primary { background: var(--primary); color: var(--text-inverse); }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary { background: var(--bg-surface); border-color: var(--border-color); color: var(--text-main); }
.btn-secondary:hover { background: var(--bg-body); border-color: var(--border-hover); }
.btn-danger { background: var(--danger); color: var(--text-inverse); }
.btn-block { width: 100%; }

/* فرم‌ها */
.inp, select.inp, textarea.inp {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: var(--radius-input);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.875rem;
  margin-bottom: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.inp:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.inp-row { display: flex; gap: 12px; margin-bottom: 12px; }
.inp-row .inp { margin-bottom: 0; }

/* گرید کارت‌های لانچر سابق -> تبدیل به دکمه‌های اکشن متراکم */
.nimkat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.nimkat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-sm);
}
.nimkat-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.nimkat-icon {
  font-size: 1.5rem;
  background: var(--bg-body);
  padding: 8px;
  border-radius: 8px;
}
.nimkat-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

/* ویجت‌ها و آمار */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.stat {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.stat-v { font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-bottom: 4px; }
.stat-l { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

/* اصلاح ویجت اصلی */
.launcher-widget {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  cursor: pointer;
}
.lw-header { display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 12px; }
.lw-progress-bg { height: 8px; background: var(--bg-body); border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
.lw-progress-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.3s; }
.lw-meta { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); }
.lw-meta b { color: var(--text-main); }

/* مخفی کردن هدر و منوهای قبلی */
header, .bottom-nav, .more-menu { display: none !important; }

/* اصلاح تایم‌لاین */
.timeline { display: flex; flex-direction: column; gap: 8px; }
.ti { display: flex; gap: 16px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; align-items: center; background: var(--bg-surface); }
.ti .tt { font-weight: 700; font-size: 0.8rem; color: var(--text-muted); min-width: 80px; direction: ltr; text-align: left; }
.ti .tx { font-size: 0.9rem; font-weight: 500; }
.ti.current-item { border-color: var(--primary); background: var(--primary-light); }

/* Responsive */
@media (max-width: 768px) {
  .saas-sidebar { transform: translateX(100%); }
  .saas-sidebar.open { transform: translateX(0); }
  .saas-main { margin-right: 0; }
  .saas-content { padding: 16px; }
  .saas-header { padding: 0 16px; }
  .nimkat-grid { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}
`;
fs.writeFileSync('style.css', saasCSS);

// ==========================================
// 2. بازنویسی HTML برای ساختار SaaS
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

const sidebarHTML = `
<aside class="saas-sidebar" id="saasSidebar">
    <div class="saas-sidebar-header">
        <span style="color:var(--primary);">📚</span> مرکز مطالعه ایلیا
    </div>
    <nav class="saas-nav">
        <div class="saas-nav-group">اصلی</div>
        <a class="saas-nav-item active" onclick="go('dashboard')"><span class="icon">🏠</span> داشبورد</a>
        <a class="saas-nav-item" onclick="go('schedule')"><span class="icon">📅</span> برنامه هفتگی</a>
        <a class="saas-nav-item" onclick="go('garden')"><span class="icon">🌳</span> باغ مطالعه</a>
        <a class="saas-nav-item" onclick="go('league')"><span class="icon">🏆</span> لیگ مطالعه</a>
        
        <div class="saas-nav-group">ابزارها</div>
        <a class="saas-nav-item" onclick="go('pomodoro')"><span class="icon">⏱</span> پومودورو</a>
        <a class="saas-nav-item" onclick="go('leitner')"><span class="icon">🗂</span> جعبه لایتنر</a>
        <a class="saas-nav-item" onclick="go('mistakes')"><span class="icon">📕</span> دفتر اشتباهات</a>
        <a class="saas-nav-item" onclick="go('chapters')"><span class="icon">📖</span> پیشرفت کتاب</a>

        <div class="saas-nav-group">تحلیل و گزارش</div>
        <a class="saas-nav-item" onclick="go('exams')"><span class="icon">📊</span> تحلیل آزمون‌ها</a>
        <a class="saas-nav-item" onclick="go('weakness')"><span class="icon">💡</span> تحلیل ضعف‌ها</a>
        <a class="saas-nav-item" onclick="go('weekly')"><span class="icon">📈</span> گزارش هفتگی</a>
        <a class="saas-nav-item" onclick="go('health')"><span class="icon">🛌</span> خواب و سلامت</a>

        <div class="saas-nav-group">تنظیمات</div>
        <a class="saas-nav-item" onclick="go('rules')"><span class="icon">⭐</span> قوانین</a>
        <a class="saas-nav-item" onclick="go('notes')"><span class="icon">📝</span> یادداشت‌ها</a>
        <a class="saas-nav-item" onclick="go('settings')"><span class="icon">⚙️</span> تنظیمات</a>
        <a class="saas-nav-item" onclick="go('backup')"><span class="icon">💾</span> پشتیبان</a>
    </nav>
</aside>
`;

const headerHTML = `
<header class="saas-header">
    <div style="display:flex; align-items:center; gap:16px;">
        <button class="btn btn-secondary" onclick="document.getElementById('saasSidebar').classList.toggle('open')" style="display:none; padding:0 10px;" id="mobileMenuBtn">☰</button>
        <span style="font-weight: 800; font-size: 1rem; color: var(--text-main);" id="saasPageTitle">داشبورد</span>
    </div>
    <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn btn-secondary" onclick="toggleTheme()" style="width:36px; padding:0;">🌙</button>
        <button class="btn btn-primary" onclick="if(typeof StudyEditor !== 'undefined') StudyEditor.open()">ثبت مطالعه جدید</button>
    </div>
</header>
`;

// بازسازی بدنه
const bodyStart = html.indexOf('<body>') + 6;
const bodyEnd = html.indexOf('</body>');
const oldBodyContent = html.slice(bodyStart, bodyEnd);

// پاکسازی المان‌های قدیمی مثل هدر و دکمه بازگشت
let cleanContent = oldBodyContent
    .replace(/<header>[\s\S]*?<\/header>/, '')
    .replace(/<button class="floating-back-btn"[\s\S]*?<\/button>/, '');

const newBodyContent = `
${sidebarHTML}
<div class="saas-main">
    ${headerHTML}
    <div class="saas-content">
        ${cleanContent}
    </div>
</div>
<script>
    // نمایش دکمه منو در موبایل
    if (window.innerWidth <= 768) {
        document.getElementById('mobileMenuBtn').style.display = 'block';
    }
    
    // اتصال عنوان صفحه به ناوبری
    const originalGo = window.go;
    window.go = function(id) {
        originalGo(id);
        // آپدیت سایدبار
        document.querySelectorAll('.saas-nav-item').forEach(el => el.classList.remove('active'));
        const navItem = document.querySelector(\`.saas-nav-item[onclick="go('\${id}')"]\`);
        if (navItem) navItem.classList.add('active');
        
        // آپدیت عنوان هدر
        const titles = {
            'dashboard': 'داشبورد', 'schedule': 'برنامه هفتگی', 'garden': 'باغ مطالعه',
            'league': 'لیگ مطالعه', 'pomodoro': 'پومودورو', 'leitner': 'جعبه لایتنر',
            'mistakes': 'دفتر اشتباهات', 'chapters': 'پیشرفت کتاب', 'exams': 'تحلیل آزمون‌ها',
            'weakness': 'تحلیل ضعف‌ها', 'weekly': 'گزارش هفتگی', 'health': 'خواب و سلامت',
            'rules': 'قوانین', 'notes': 'یادداشت‌ها', 'settings': 'تنظیمات', 'backup': 'پشتیبان'
        };
        document.getElementById('saasPageTitle').textContent = titles[id] || 'مرکز مطالعه';
        
        // بستن سایدبار در موبایل بعد از کلیک
        if (window.innerWidth <= 768) {
            document.getElementById('saasSidebar').classList.remove('open');
        }
    };
</script>
`;

html = html.slice(0, bodyStart) + newBodyContent + html.slice(bodyEnd);
fs.writeFileSync('index.html', html);
console.log("✅ ساختار SaaS (سایدبار و هدر) با موفقیت تزریق شد.");

// ==========================================
// 3. آپدیت کش
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 تمام شد! حالا مرورگر را با Ctrl+F5 رفرش کن.");
