/**
 * guide-ar.mp4 — 100% synkroniseret med arabisk lydspor (99.10s)
 *
 * Whisper-transskription timing:
 *  0-22s:  Homepage hero (velkomst, 4 sprog, Ibrahim)
 * 22-35s:  Video-guide sektion ("في الجزء العلوي من الصفحة")
 * 35-50s:  Sprog-skift + lydfunktion ("يمكنكم الاستماع لتسجيلات صوتية")
 * 50-54s:  Søgefelt ("استخدم شريط البحث")
 * 54-58s:  Skriv ibuprofen ("ابدأ بالكتابة")
 * 58-68s:  Kategorier ("تصفح الأدوية حسب الفئة")
 * 68-70s:  Naviger til ibuprofen, hold øverst
 * 70-75s:  KLIK LYDKNAP → vis arabisk lyd-afspiller (narrator taler om lyd)
 * 75-77s:  Scroll ibuprofen indhold kortvarigt
 * 77s:     TILBAGE TIL FORSIDEN (domcontentloaded, klar til 80s)
 * 80-83s:  About me modal ("نبذة عني") ← narrator: 80.1s
 * 83-86s:  About Somalimed modal ("حول Somalimed") ← narrator: ~83s
 * 86-89s:  FAQ modal ("الأسئلة الشائعة") ← narrator: 86.6s
 * 89-92s:  Contact modal ("تواصل") ← narrator: ~87-88s
 * 92-99s:  Ibuprofen igen → hop til kildesektionen til allersidst
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
  if (!fs.existsSync(AUDIO)) { console.error(`❌ Mangler: ${AUDIO}`); process.exit(1); }
  if (fs.existsSync(VID_DIR)) fs.rmSync(VID_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR);

  console.log('🎬 Arabisk video — starter...');
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

  // ── Buffer 8s (klippes med -ss 8) ────────────────────────────────────────
  await page.goto('http://localhost:3000/?lang=ar', { waitUntil: 'networkidle' });
  await removeDev(page);
  await scrollReveal(page);
  await page.waitForFunction(() => document.body.innerText.includes('نبذة عني'), { timeout: 15000 }).catch(() => {});
  await sleep(TRIM * 1000);

  // ── t=0–22s: Hero ─────────────────────────────────────────────────────────
  console.log('  [0-22s] Hero');
  await sleep(22000);

  // ── t=22–35s: Video-guide sektion ─────────────────────────────────────────
  console.log('  [22-35s] Video guide section');
  await sleep(13000);

  // ── t=35–50s: Sprog-skift + lydfunktion ──────────────────────────────────
  // Narrator: "يمكنكم الاستماع لتسجيلات صوتية لكل دواء باللغة العربية"
  // (Vi demonstrerer lyden på ibuprofen-siden ved t≈70s)
  console.log('  [35-50s] Language + audio features');
  await sleep(15000);

  // ── t=50–54s: Scroll til søgefelt ────────────────────────────────────────
  console.log('  [50-54s] Scroll to search');
  await smoothScroll(page, 0, 1054, 4000);

  // ── t=54–58s: Skriv ibuprofen ─────────────────────────────────────────────
  console.log('  [54-58s] Type ibuprofen');
  await page.click('#medSearch');
  await sleep(200);
  await page.keyboard.type('ibuprofen', { delay: 200 });
  await sleep(1600);

  // ── t=58–68s: Kategori-knapper ────────────────────────────────────────────
  console.log('  [58-68s] Categories');
  await sleep(10000);

  // ── t=68s: Naviger til ibuprofen ──────────────────────────────────────────
  console.log('  [68s] Click ibuprofen → navigate');
  await page.click('a[href*="ibuprofen"]');
  await page.waitForLoadState('networkidle');
  await removeDev(page);
  await sleep(2000); // hold øverst 68-70s

  // ── t=70–75s: VIS LYDAFSPILLER ────────────────────────────────────────────
  // Scroll forbi hero-sektionen for at vise lydknappen øverst på siden
  console.log('  [70-75s] Show audio player button on ibuprofen page');
  await smoothScroll(page, 0, 320, 800);
  await sleep(500);
  // Klik på den arabiske lydknap: "استمع إلى التسجيل"
  await page.click('button:has-text("استمع إلى التسجيل")').catch(() => {
    console.log('  (Lydknap ikke fundet — springer over)');
  });
  await sleep(3700); // vis afspilleren i ~4s

  // ── t=75–77s: Scroll lidt videre ned i ibuprofen ─────────────────────────
  console.log('  [75-77s] Brief ibuprofen scroll');
  await smoothScroll(page, 320, 900, 2000);

  // ── t=77s: TILBAGE TIL FORSIDEN (3s tidligt for at nå at loade) ──────────
  // Narrator ved 80.1s: "في أعلى الصفحة في القائمة ستجدون أزرار..."
  console.log('  [77s] Navigate back to homepage for modals');
  await page.goto('http://localhost:3000/?lang=ar', { waitUntil: 'domcontentloaded' });
  await removeDev(page);
  await page.waitForFunction(() => document.body.innerText.includes('نبذة عني'), { timeout: 8000 }).catch(() => {});
  await sleep(300); // klar ved ~80s

  // ── t=80–83s: ABOUT ME ────────────────────────────────────────────────────
  // Narrator 80.1s: "ستجدون أزرار نبذة عني"
  console.log('  [80-83s] About me modal');
  await showModal(page, 'نبذة عني', 2500);

  // ── t=83–86s: ABOUT SOMALIMED ─────────────────────────────────────────────
  // Narrator ~83s: "وحول Somalimed"
  console.log('  [83-86s] About Somalimed modal');
  await showModal(page, 'حول Somalimed', 2500);

  // ── t=86–89s: FAQ ─────────────────────────────────────────────────────────
  // Narrator 86.6s: "والأسئلة الشائعة"
  console.log('  [86-89s] FAQ modal');
  await showModal(page, 'الأسئلة الشائعة', 2500);

  // ── t=89–92s: CONTACT ─────────────────────────────────────────────────────
  // Narrator ~87-88s: "وزر التواصل للتواصل مع إبراهيم مباشرة"
  console.log('  [89-92s] Contact modal');
  await showModal(page, 'تواصل', 2500);

  // ── t=92–99.10s: Ibuprofen-kildesektion ──────────────────────────────────
  // Narrator: "سوماليميد مجاني تماماً... شكراً لزيارتكم"
  console.log('  [92-99s] Ibuprofen → sources at bottom');
  await page.goto('http://localhost:3000/ibuprofen?lang=ar', { waitUntil: 'domcontentloaded' });
  await removeDev(page);
  const srcH = await page.evaluate(() => document.body.scrollHeight);
  const nearSrc = Math.max(0, srcH - H - 450);
  await page.evaluate(y => window.scrollTo(0, y), nearSrc);
  await sleep(300);
  await smoothScroll(page, nearSrc, srcH - H, 4000);
  await sleep(2300);

  console.log('  Afslutter optagelse...');
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VID_DIR).filter(f => f.endsWith('.webm'));
  if (!files.length) { console.error('❌ Ingen .webm!'); process.exit(1); }
  const webm = path.join(VID_DIR, files[0]);
  console.log(`  Rå: ${(fs.statSync(webm).size/1024/1024).toFixed(1)} MB`);

  console.log('\n🎞️  ffmpeg + arabisk lyd...');
  const r = spawnSync(FFMPEG, [
    '-y', '-ss', String(TRIM), '-i', webm, '-i', AUDIO,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(DUR), '-shortest', OUTPUT
  ], { encoding: 'utf8', stdio: ['ignore','inherit','pipe'] });

  if (r.status !== 0) { console.error('❌ ffmpeg:', r.stderr.slice(-400)); process.exit(1); }
  console.log(`\n✅ guide-ar.mp4: ${(fs.statSync(OUTPUT).size/1024/1024).toFixed(1)} MB`);
})();
