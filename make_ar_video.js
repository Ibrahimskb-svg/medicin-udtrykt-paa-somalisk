/**
 * guide-ar.mp4 — 100% synkroniseret med arabisk lydspor (99.10s)
 *
 * Whisper-transskription timing:
 *  0-22s:  Homepage hero (velkomst, 4 sprog, Ibrahim)
 * 22-50s:  Video-guide sektion, sprog-skift, lyd-funktion
 * 50-54s:  Søgefelt  ("استخدم شريط البحث")
 * 54-58s:  Skriv ibuprofen  ("ابدأ بالكتابة")
 * 58-68s:  Kategori-knapper  ("تصفح الأدوية حسب الفئة")
 * 68-80s:  Ibuprofen-siden: hold + scroll igennem indhold
 * 80s:     TILBAGE TIL FORSIDEN (narrator: "في أعلى الصفحة في القائمة")
 * 80-83s:  About me modal  ("نبذة عني")
 * 83-86s:  About Somalimed modal  ("حول Somalimed")
 * 86-89s:  FAQ modal  ("الأسئلة الشائعة")
 * 89-92s:  Contact modal  ("وزر التواصل")
 * 92-99s:  Ibuprofen-siden igen → hop til kilde-sektionen ("til sidst")
 *
 * NOTE: Alle 4 modaler kræver forsiden (SiteIndex). Vi navigerer
 * tilbage til forsiden ved t=80s og viser modalerne der.
 * Til allersidst navigeres til ibuprofen-kildesektionen.
 */
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG  = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO   = '/tmp/ar_audio.aac';
const OUTPUT  = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-ar.mp4';
const VID_DIR = '/tmp/pw_video_ar/';

const W = 1280, H = 720;
const DUR  = 99.10;
const TRIM = 8;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function removeDev(page) {
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach(e => e.remove());
    const s = document.createElement('style');
    s.textContent = `
      nextjs-portal,[data-nextjs-dialog]{display:none!important}
      .reveal-on-scroll{opacity:1!important;transform:none!important;transition:none!important}
      #sm-bubble{display:none!important}
    `;
    document.head.appendChild(s);
  });
}

async function scrollReveal(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 300) {
    await page.evaluate(p => window.scrollTo(0, p), y);
    await sleep(30);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
}

async function smoothScroll(page, fromY, toY, ms) {
  const steps = Math.max(1, Math.round(ms / 16));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2*t*t : 1-(-2*t+2)**2/2;
    await page.evaluate(y => window.scrollTo(0, y), Math.round(fromY + (toY-fromY)*e));
    await sleep(16);
  }
}

async function showModal(page, btnText, durationMs) {
  await page.click(`button:has-text("${btnText}")`);
  await sleep(600);
  await page.mouse.move(640, 380);
  const steps = Math.max(2, Math.round(durationMs / 700));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 55);
    await sleep(durationMs / steps);
  }
  await page.keyboard.press('Escape');
  await sleep(400);
}

(async () => {
  if (!fs.existsSync(AUDIO)) {
    console.error(`❌ Arabisk lydfil mangler: ${AUDIO}`);
    process.exit(1);
  }
  if (fs.existsSync(VID_DIR)) fs.rmSync(VID_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR);

  console.log('🎬 Starter arabisk video-optagelse...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: VID_DIR, size: { width: W, height: H } }
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('selectedLanguage', 'ar');
    localStorage.setItem('cookieConsent', 'accepted');
    const obs = new MutationObserver(() => {
      const el = document.getElementById('sm-bubble');
      if (el) el.style.setProperty('display', 'none', 'important');
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
  await page.route(/crisp\.chat/, r => r.abort());

  // ── Buffer (klippes med -ss 8) ────────────────────────────────────────────
  console.log('  Indlæser arabisk forside...');
  await page.goto('http://localhost:3000/?lang=ar', { waitUntil: 'networkidle' });
  await removeDev(page);
  await scrollReveal(page);
  await page.waitForFunction(() => document.body.innerText.includes('نبذة عني'), { timeout: 15000 }).catch(() => {});
  await sleep(TRIM * 1000);

  // ── t=0–22s: Hero ─────────────────────────────────────────────────────────
  // "مرحباً بكم... بأربع لغات... أنشأه إبراهيم ضاهر حنف"
  console.log('  [0-22s] Hero');
  await sleep(22000);

  // ── t=22–50s: Video-guide + sprog-skift + lyd ─────────────────────────────
  // "قسم الدليل المرئي... اضغط على تبويب... التسجيل الصوتي... تغيير اللغة"
  console.log('  [22-50s] Language/features');
  await sleep(28000);

  // ── t=50–54s: Scroll til søgefelt ────────────────────────────────────────
  // "استخدم شريط البحث للعثور على أي دواء بسرعة"
  console.log('  [50-54s] Scroll to search bar');
  await smoothScroll(page, 0, 1054, 4000);

  // ── t=54–58s: Skriv ibuprofen ─────────────────────────────────────────────
  // "فقط ابدأ بالكتابة وستظهر النتائج فوراً"
  console.log('  [54-58s] Type ibuprofen');
  await page.click('#medSearch');
  await sleep(200);
  await page.keyboard.type('ibuprofen', { delay: 200 });
  await sleep(1600);

  // ── t=58–68s: Kategori-knapper ────────────────────────────────────────────
  // "يمكنكم أيضاً تصفح الأدوية حسب الفئة... ضغط الدم... السكري..."
  console.log('  [58-68s] Categories');
  await sleep(10000);

  // ── t=68s: Klik ibuprofen, naviger ────────────────────────────────────────
  // "انقر على أي دواء مثلاً إيبوبروفين"
  console.log('  [68s] Click ibuprofen → navigate');
  await page.click('a[href*="ibuprofen"]');
  await page.waitForLoadState('networkidle');
  await removeDev(page);

  // ── t=68–72s: Hold øverst på ibuprofen ───────────────────────────────────
  // "لفتح صفحة مع معلومات كاملة..."
  console.log('  [68-72s] Ibuprofen top');
  const ibupH = await page.evaluate(() => document.body.scrollHeight);
  await sleep(4000);

  // ── t=72–80s: Scroll ibuprofen-siden ─────────────────────────────────────
  // "المؤشرات والجرعة والآثار الجانبية والمصادر"
  console.log('  [72-80s] Scroll ibuprofen content');
  await smoothScroll(page, 0, Math.round((ibupH - H) * 0.55), 8000);

  // ── t=80s: TILBAGE TIL FORSIDEN ───────────────────────────────────────────
  // "في أعلى الصفحة في القائمة ستجدون أزرار..."
  // Modaler kræver SiteIndex som kun er på forsiden
  console.log('  [80s] Navigate back to homepage for all 4 modals');
  await page.goto('http://localhost:3000/?lang=ar', { waitUntil: 'networkidle' });
  await removeDev(page);
  await page.waitForFunction(() => document.body.innerText.includes('نبذة عني'), { timeout: 10000 }).catch(() => {});
  await sleep(400);

  // ── t=80–83s: ABOUT ME  نبذة عني ─────────────────────────────────────────
  // "ستجدون أزرار نبذة عني"
  console.log('  [80-83s] About me modal');
  await showModal(page, 'نبذة عني', 2500);

  // ── t=83–86s: ABOUT SOMALIMED  حول Somalimed ─────────────────────────────
  // "وحول Somalimed"
  console.log('  [83-86s] About Somalimed modal');
  await showModal(page, 'حول Somalimed', 2500);

  // ── t=86–89s: FAQ  الأسئلة الشائعة ──────────────────────────────────────
  // "والأسئلة الشائعة"
  console.log('  [86-89s] FAQ modal');
  await showModal(page, 'الأسئلة الشائعة', 2500);

  // ── t=89–92s: Contact  تواصل ──────────────────────────────────────────────
  // "وزر التواصل للتواصل مع إبراهيم مباشرة"
  console.log('  [89-92s] Contact modal');
  await showModal(page, 'تواصل', 2500);

  // ── t=92s: IBUPROFEN IGEN → hop til kildesektionen ─────────────────────
  // "سوماليميد مجاني تماماً... شكراً لزيارتكم"
  // Vis kilderne til allersidst som brugeren bad om
  console.log('  [92-99s] Ibuprofen → sources section');
  await page.goto('http://localhost:3000/ibuprofen?lang=ar', { waitUntil: 'domcontentloaded' });
  await removeDev(page);
  const srcH = await page.evaluate(() => document.body.scrollHeight);
  const nearSrc = Math.max(0, srcH - H - 450);
  await page.evaluate(y => window.scrollTo(0, y), nearSrc);
  await sleep(300);
  await smoothScroll(page, nearSrc, srcH - H, 4000);
  await sleep(2100); // hold ved bunden (kilder synlige)

  console.log('  Afslutter optagelse...');
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VID_DIR).filter(f => f.endsWith('.webm'));
  if (!files.length) { console.error('❌ Ingen .webm!'); process.exit(1); }
  const webm = path.join(VID_DIR, files[0]);
  console.log(`  Rå video: ${(fs.statSync(webm).size/1024/1024).toFixed(1)} MB`);

  console.log('\n🎞️  Konverterer + arabisk lyd...');
  const r = spawnSync(FFMPEG, [
    '-y',
    '-ss', String(TRIM),
    '-i', webm,
    '-i', AUDIO,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(DUR),
    '-shortest',
    OUTPUT
  ], { encoding: 'utf8', stdio: ['ignore','inherit','pipe'] });

  if (r.status !== 0) { console.error('❌ ffmpeg fejl:', r.stderr.slice(-500)); process.exit(1); }
  console.log(`\n✅ guide-ar.mp4 klar: ${(fs.statSync(OUTPUT).size/1024/1024).toFixed(1)} MB`);
})();
