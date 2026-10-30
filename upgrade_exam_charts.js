const fs = require('fs');

console.log("📈 در حال ساخت نمودارهای خط شکسته برای آزمون‌ها...");

// ==========================================
// 1. اصلاح HTML (اضافه کردن کادر نمودار)
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// پیدا کردن سکشن آزمون‌ها و اضافه کردن کانتینر نمودار
const chartContainer = `
  <div id="examChartsContainer" style="margin-bottom: 20px;"></div>
  <div class="card">
    <h3>ثبت آزمون جدید</h3>
`;

if (!html.includes('id="examChartsContainer"')) {
    // اضافه کردن قبل از اولین کارت ثبت آزمون
    html = html.replace('<div class="card">\n    <div class="inp-row">\n      <input class="inp" id="exTitle"', chartContainer + '    <div class="inp-row">\n      <input class="inp" id="exTitle"');
    // فالبک در صورتی که ساختار کمی فرق داشت
    html = html.replace('<h2>📝 تحلیل آزمون‌ها</h2>', '<h2>📝 تحلیل آزمون‌ها</h2>\n' + chartContainer);
}
fs.writeFileSync('index.html', html);
console.log("✅ کانتینر نمودارها به HTML اضافه شد.");

// ==========================================
// 2. افزودن CSS برای نمودار
// ==========================================
let css = fs.readFileSync('style.css', 'utf8');
const chartCSS = `
/* ============ EXAM CHARTS ============ */
.chart-wrapper {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 15px 10px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
}
.chart-header {
    font-size: 0.9em;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.chart-svg {
    width: 100%;
    height: 180px;
    overflow: visible;
}
.chart-line {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.3s;
}
.chart-point {
    fill: var(--bg-card);
    stroke-width: 3;
    transition: all 0.2s;
    cursor: pointer;
}
.chart-point:hover {
    r: 6;
    stroke-width: 4;
}
.chart-text {
    font-family: 'Vazirmatn', Tahoma, sans-serif;
    font-size: 10px;
    fill: var(--text-light);
    text-anchor: middle;
}
.chart-grid {
    stroke: var(--border);
    stroke-width: 1;
    stroke-dasharray: 4;
}
`;
fs.writeFileSync('style.css', css + "\n" + chartCSS);
console.log("✅ استایل‌های نمودار اضافه شد.");

// ==========================================
// 3. افزودن منطق جاوااسکریپت (رسم نمودار)
// ==========================================
let js = fs.readFileSync('app.js', 'utf8');

const chartJS = `
// ============ EXAM CHARTS LOGIC ============
function drawLineChart(containerId, dataPoints, color, labelY) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (dataPoints.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-light);font-size:0.85em;padding:20px;">داده‌ای برای نمایش وجود ندارد. حداقل ۲ آزمون ثبت کنید.</div>';
        return;
    }

    const width = 400;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    
    // پیدا کردن حداقل و حداکثر برای محور Y
    let maxY = Math.max(...dataPoints.map(d => d.value));
    if (maxY === 0) maxY = 1;
    if (labelY === '%' && maxY < 100) maxY = 100;
    
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    
    let svg = \`<svg viewBox="0 0 \${width} \${height}" class="chart-svg" dir="ltr">\`;
    
    // خطوط افقی و اعداد محور Y
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (plotHeight / 4) * i;
        const val = maxY - (maxY / 4) * i;
        svg += \`<line x1="\${padding.left}" y1="\${y}" x2="\${width - padding.right}" y2="\${y}" class="chart-grid" />\`;
        svg += \`<text x="\${padding.left - 8}" y="\${y + 4}" class="chart-text" text-anchor="end">\${Math.round(val)}</text>\`;
    }
    
    // محاسبه نقاط
    const points = dataPoints.map((d, i) => {
        const x = padding.left + (plotWidth / (dataPoints.length - 1 || 1)) * i;
        const y = padding.top + plotHeight - (d.value / maxY) * plotHeight;
        return { x, y, val: d.value, label: d.label };
    });

    // رسم خط
    let pathD = '';
    points.forEach((p, i) => {
        if (i === 0) pathD += \`M \${p.x} \${p.y}\`;
        else pathD += \` L \${p.x} \${p.y}\`;
    });
    
    // افزودن سایه زیر خط
    const areaD = pathD + \` L \${points[points.length-1].x} \${padding.top + plotHeight} L \${points[0].x} \${padding.top + plotHeight} Z\`;
    svg += \`<path d="\${areaD}" fill="\${color}" opacity="0.1" />\`;
    svg += \`<path d="\${pathD}" stroke="\${color}" class="chart-line" />\`;
    
    // رسم نقاط و مقادیر
    points.forEach(p => {
        svg += \`<circle cx="\${p.x}" cy="\${p.y}" r="4" stroke="\${color}" class="chart-point" title="\${p.val}\${labelY}"><title>\${p.val}\${labelY}</title></circle>\`;
        // مقدار بالای نقطه
        svg += \`<text x="\${p.x}" y="\${p.y - 10}" class="chart-text" fill="\${color}" style="font-weight:bold;font-size:11px;">\${Math.round(p.val)}\${labelY}</text>\`;
        // نام آزمون زیر محور X
        svg += \`<text x="\${p.x}" y="\${height - 10}" class="chart-text">\${p.label}</text>\`;
    });
    
    svg += '</svg>';
    container.innerHTML = svg;
}

window.renderExamCharts = function() {
    const container = document.getElementById('examChartsContainer');
    if (!container) return;

    const exams = getData('ilia-log', []) && getData('EX_KEY', []) || []; 
    const realExams = getData('ilia-exam-analysis', []);
    const logs = getData('ilia-log', []);

    if (realExams.length === 0) {
        container.innerHTML = '';
        return;
    }

    // مرتب‌سازی آزمون‌ها بر اساس تاریخ
    realExams.sort((a, b) => a.date.localeCompare(b.date));

    const examPcts = [];
    const studyHours = [];
    let prevDate = null;

    realExams.forEach((e, index) => {
        // محاسبه درصد (نمره منفی)
        const score = (e.correct * 3) - e.wrong;
        let pct = (score / (e.total * 3)) * 100;
        pct = Math.max(0, pct); // درصد منفی نشون داده نشه

        // اسم کوتاه برای نمودار
        const shortTitle = e.title.length > 8 ? e.title.substring(0, 8) + '..' : e.title;
        
        examPcts.push({ value: pct, label: shortTitle });

        // محاسبه ساعت مطالعه در بازه این آزمون تا آزمون قبلی
        let hrs = 0;
        if (prevDate) {
            logs.forEach(l => {
                if (l.date >= prevDate && l.date <= e.date) hrs += l.hours;
            });
        }
        studyHours.push({ value: hrs, label: shortTitle });
        prevDate = e.date;
    });

    container.innerHTML = \`
        <div class="chart-wrapper">
            <div class="chart-header">📈 روند درصد آزمون‌ها</div>
            <div id="chartPct"></div>
        </div>
        <div class="chart-wrapper">
            <div class="chart-header">⏱ ساعت مطالعه بین آزمون‌ها</div>
            <div id="chartHrs"></div>
        </div>
    \`;

    drawLineChart('chartPct', examPcts, '#667eea', '%');
    drawLineChart('chartHrs', studyHours, '#10b981', 'س');
};

// اتصال به تابع رندر اصلی آزمون‌ها
const originalRenderExams = renderExams;
window.renderExams = function() {
    originalRenderExams();
    renderExamCharts();
};
`;

if (!js.includes('// ============ EXAM CHARTS LOGIC ============')) {
    js += "\n" + chartJS;
}

fs.writeFileSync('app.js', js);
console.log("✅ منطق نمودارها به JS اضافه شد.");

// ==========================================
// 4. آپدیت کش مرورگر
// ==========================================
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'ilia-study-v" + Date.now() + "';");
fs.writeFileSync('service-worker.js', sw);

console.log("🎉 نمودارهای آزمون با موفقیت ساخته شدند! حالا Ctrl+F5 بزن.");
