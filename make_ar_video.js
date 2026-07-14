/**
 * guide-ar.mp4 — spejler guide-en.mp4 PRÆCIS, arabisk sprog
 *
 * Lydspor: gen_ar_audio.py → ar-QA-MoazNeural (Qatar fusha-arabisk)
 * Alle 4 modaler TIDLIGT i starten (12-32s) — derefter søgning og ibuprofen
 *
 *  0-12s:  Homepage hero
 * 12-17s:  About me modal       ← "إبراهيم ضاهر حنف، صيدلاني من الدنمارك"
 * 17-22s:  About Somalimed modal ← "مساعدة المرضى الصوماليين"
 * 22-27s:  FAQ modal             ← "الأسئلة الشائعة"
 * 27-32s:  Contact modal         ← "زر التواصل"
 * 32-36s:  Sprogvælger synlig
 * 36-40s:  Scroll til søgefelt
 * 40-44s:  Skriv ibuprofen
 * 44-58s:  Resultater + kategorier
 * 58-72s:  Ibuprofen-side: hold + lydknap-demo + scroll
 * 72-75s:  Navigate til forsiden (stilhed)
 * 75-99s:  Forside scrolles ned + afslutningsord
 */
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG  = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO   = '/tmp/ar_audio_new.m4a';
const OUTPUT  = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-ar.mp4';
const VID_DIR = '/tmp/pw_video_ar/';

const W = 1280, H = 720;
const DUR  = 99.19;
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
  // Tidsbaseret (ikke step-baseret): page.evaluate() har selv rundturs-
  // overhead, så en fast sleep(16) pr. step lader det akkumulere til
  // sekunders drift over en hel video. Vi måler forløbet realtid i stedet.
  const start = Date.now();
  while (true) {
    const elapsed = Date.now() - start;
    const t = Math.min(1, elapsed / ms);
    const e = t < 0.5 ? 2*t*t : 1-(-2*t+2)**2/2;
    await page.evaluate(y => window.scrollTo(0, y), Math.round(fromY + (toY-fromY)*e));
    if (t >= 1) break;
    await sleep(16);
  }
}

async function showModal(page, btnText, durationMs) {
  await page.click(`button:has-text("${btnText}")`);
  await sleep(600);
  await page.mouse.move(640, 380);
  const wheelStart = Date.now();
  while (Date.now() - wheelStart < durationMs) {
    await page.mouse.wheel(0, 55);
    const remaining = durationMs - (Date.now() - wheelStart);
    await sleep(Math.min(700, Math.max(0, remaining)));
  }
  await page.keyboard.press('Escape');
  await sleep(400);
}

(async () => {
  if (!fs.existsSync(AUDIO)) {
    console.error(`❌ Lydspor mangler: ${AUDIO}`);
    console.error('   Kør: python3 gen_ar_audio.py');
    process.exit(1);
  }
  if (fs.existsSync(VID_DIR)) fs.rmSync(VID_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR);

  console.log('🎬 Arabisk video — starter...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: VID_DIR, size: { width: W, height: H } }
  });
  // Optagelse starter præcis her — mål tid fra dette punkt
  const recordStart = Date.now();
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('selectedLanguage', 'ar');
    localStorage.setItem('cookieConsent', 'accepted');
    const obs = new MutationObserver(() => {
      const bubble = document.getElementById('sm-bubble');
      if (bubble) bubble.style.setProperty('display', 'none', 'important');
      document.querySelectorAll('div[role="dialog"], div[style*="z-index: 99999"], div[style*="z-index:99999"]').forEach(el => {
        if (el.style && (el.style.zIndex === '99999' || el.style.bottom === '0px')) {
          el.style.setProperty('display', 'none', 'important');
        }
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
  await page.route(/crisp\.chat/, r => r.abort());

  // ── Buffer (klippes med -ss 8) ────────────────────────────────────────────
  // recordStart sættes PRÆCIS efter newContext (= optagelsens t=0).
  // Måler alt setup inkl. newPage + addInitScript + route + goto + scrollReveal.
  await page.goto('http://localhost:3000/?lang=ar', { waitUntil: 'networkidle' });
  await removeDev(page);
  await scrollReveal(page);
  await page.waitForFunction(() => document.body.innerText.includes('نبذة عني'), { timeout: 15000 }).catch(() => {});
  const elapsed = Date.now() - recordStart;
  const bufferLeft = Math.max(0, TRIM * 1000 - elapsed);
  console.log(`  Buffer: total prep=${elapsed}ms, sleep=${bufferLeft}ms (target=${TRIM*1000}ms)`);
  if (bufferLeft > 0) await sleep(bufferLeft);

  // ── t=0–12s: Hero — blød scroll så videoen ikke fryser ──────────────────
  // "مرحباً بكم في سوماليميد..."
  console.log('  [0-12s] Hero — gentle scroll');
  await smoothScroll(page, 0, 130, 8000);   // drift langsomt ned
  await smoothScroll(page, 130, 0, 4000);   // drift langsomt op igen

  // ── t=12–16s: ABOUT ME ────────────────────────────────────────────────────
  // "أنشأه إبراهيم ضاهر حنف، صيدلاني من الدنمارك"
  console.log('  [12-16s] About me modal');
  await showModal(page, 'نبذة عني', 3000);

  // ── t=16–20s: ABOUT SOMALIMED ─────────────────────────────────────────────
  // "هدفه مساعدة الصوماليين وعائلاتهم على فهم الأدوية"
  console.log('  [16-20s] About Somalimed modal');
  await showModal(page, 'حول Somalimed', 3000);

  // ── t=20–24s: FAQ ─────────────────────────────────────────────────────────
  // "يمكنكم الاطلاع على الأسئلة الشائعة هنا"
  console.log('  [20-24s] FAQ modal');
  await showModal(page, 'الأسئلة الشائعة', 3000);

  // ── t=24–28s: CONTACT ─────────────────────────────────────────────────────
  // "وللتواصل مع إبراهيم استخدموا زر التواصل"
  console.log('  [24-28s] Contact modal');
  await showModal(page, 'تواصل', 3000);

  // ── t=28–36s: Sprogvælger (8s) — alle fire sprog nævnes ─────────────────
  // "الموقع بأربع لغات: الصومالية والدنماركية والإنجليزية والعربية"
  console.log('  [28-36s] Language selector — 8s');
  await smoothScroll(page, 0, 60, 4000);   // drift ned for at vise sprogknapper
  await smoothScroll(page, 60, 0, 4000);   // drift op igen

  // ── t=36–40s: Scroll til søgefelt ────────────────────────────────────────
  // "أسفل اللغة ستجدون شريط البحث"
  console.log('  [36-40s] Scroll to search bar');
  await smoothScroll(page, 0, 1054, 4000);

  // ── t=40–44s: Skriv ibuprofen ─────────────────────────────────────────────
  // "اكتبوا اسم أي دواء وستظهر النتائج فوراً"
  console.log('  [40-44s] Type ibuprofen');
  await page.click('#medSearch');
  await sleep(200);
  await page.keyboard.type('ibuprofen', { delay: 190 });
  await sleep(1700);

  // ── t=44–58s: Resultater + kategorier ────────────────────────────────────
  // "تصفح الأدوية حسب الفئة... ضغط الدم، السكري، المضادات الحيوية..."
  console.log('  [44-58s] Results + categories — smooth pan');
  await smoothScroll(page, 1054, 1054 + 420, 7000);   // langsom drift ned (viser resultater+kategorier)
  await smoothScroll(page, 1054 + 420, 1054, 7000);   // drift op igen

  // ── t=58s: Klik ibuprofen, naviger ────────────────────────────────────────
  // "لقراءة معلومات دواء معين اضغطوا عليه"
  console.log('  [58s] Click ibuprofen');
  await page.click('a[href*="ibuprofen"]');
  await page.waitForLoadState('networkidle');
  await removeDev(page);

  // ── t=58–65s: Drift ned fra toppen mod lydknap ───────────────────────────
  // Ingen sleep — konstant bevægelse hele vejen
  console.log('  [58-64s] Ibuprofen — smooth drift to audio button');
  await smoothScroll(page, 0, 310, 5500);  // drift til lydknap

  // ── t=64s: KLIK LYDKNAP ───────────────────────────────────────────────────
  console.log('  [64s] Click audio button ← synced with narrator');
  await page.click('button:has-text("استمع إلى التسجيل")').catch(() => {
    console.log('  (Lydknap ikke fundet — springer over)');
  });
  await sleep(200);

  // Mål højden EFTER lydafspilleren er foldet ud, ellers scroller vi ikke
  // langt nok ned til at vise resten af siden (afspilleren tilføjer højde).
  const ibupH = await page.evaluate(() => document.body.scrollHeight);

  // ── t=64–68s: Vis afspiller — blød drift ─────────────────────────────────
  console.log('  [64-68s] Audio player — gentle drift');
  await smoothScroll(page, 310, 420, 3500);  // blød drift, afspiller synlig

  // ── t=68–72s: Scroll resten af siden ned til bunden ──────────────────────
  console.log('  [68-72s] Scroll to bottom of full Ibuprofen page');
  await smoothScroll(page, 420, ibupH - H, 4000);

  // ── t=72s: TILBAGE TIL FORSIDEN (stilhed i lydsporet 72-75s) ─────────────
  console.log('  [72s] Navigate back to homepage');
  await page.goto('http://localhost:3000/?lang=ar', { waitUntil: 'networkidle' });
  await removeDev(page);
  await sleep(500);

  // ── t=75–99.19s: Scroll forside ned + afslutningsord ─────────────────────
  // Dynamisk resttid: uanset evt. akkumuleret drift ovenfor bruges den
  // faktiske resterende tid til slutsekvensen, så videoen altid fylder
  // hele lydsporets varighed og "tak for at se med" ikke bliver klippet af.
  // "سوماليميد يقدم معلومات طبية موثوقة... شكراً جزيلاً لمشاهدتكم"
  const elapsedPostTrim = Date.now() - recordStart - TRIM * 1000;
  const remaining = Math.max(4000, DUR * 1000 - elapsedPostTrim - 300);
  console.log(`  [75-99s] Homepage scroll — resterende tid: ${(remaining/1000).toFixed(2)}s`);
  const homeH = await page.evaluate(() => document.body.scrollHeight);
  const scrollPhase = Math.round(remaining * 0.85);
  const freeze = remaining - scrollPhase;
  await smoothScroll(page, 0, homeH - H, scrollPhase);
  await sleep(Math.max(0, freeze));

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
