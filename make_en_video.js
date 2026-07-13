/**
 * guide-en.mp4 — 100% synkroniseret med lydspor (99.19s)
 *
 * Whisper-transskription timing:
 *  0-12s:  Homepage hero ("Welcome... how to use")
 * 12-19s:  About me modal  ("created by Ibrahim Dahir Hanaf")
 * 19-24s:  About Somalimed modal  ("to help Somali patients")
 * 24-36s:  Sprog-vælger synlig  ("language selector... tap language")
 * 36-40s:  Scroll til søgefelt  ("search bar")
 * 40-44s:  Skriv ibuprofen  ("type the name")
 * 44-58s:  Resultater + kategorier  ("category buttons")
 * 58-72s:  Klik ibuprofen → ibuprofen-side scrolles  ("simply tap on it... clear info")
 * 72s:     Naviger TILBAGE til forsiden
 * 72-79s:  FAQ modal  ("frequently asked questions")
 * 80-85s:  Contact modal  ("contact button")
 * 85-99s:  Forside scrolles ned (kvalitet, gratis, tak)
 *
 * NOTE: FAQ og Contact-modaler kræver forsiden (SiteIndex-komponent).
 * Vi navigerer derfor TILBAGE til forsiden ved t=72s og åbner dem dér.
 */
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG  = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const EXISTING = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4';
const OUTPUT  = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4';
const AUDIO_TMP = '/tmp/en_guide_audio.aac';
const VID_DIR = '/tmp/pw_video_en/';

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
  const steps = Math.max(1, Math.round(ms / 16));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2*t*t : 1-(-2*t+2)**2/2;
    await page.evaluate(y => window.scrollTo(0, y), Math.round(fromY + (toY-fromY)*e));
    await sleep(16);
  }
}

// Klik nav-knap, vis modal, scroll i den, luk
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
  // Udtræk lyd fra eksisterende video
  console.log('🔊 Udtrækker lyd fra guide-en.mp4...');
  const audioExt = spawnSync(FFMPEG, [
    '-y', '-i', EXISTING, '-vn', '-acodec', 'copy', AUDIO_TMP
  ], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
  if (audioExt.status !== 0) { console.error('Lydfejl:', audioExt.stderr.slice(-300)); process.exit(1); }

  if (fs.existsSync(VID_DIR)) fs.rmSync(VID_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR);

  console.log('🎬 Starter Playwright optagelse (engelsk)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: VID_DIR, size: { width: W, height: H } }
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('selectedLanguage', 'en');
    localStorage.setItem('cookieConsent', 'accepted');
    const obs = new MutationObserver(() => {
      const el = document.getElementById('sm-bubble');
      if (el) el.style.setProperty('display', 'none', 'important');
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
  await page.route(/crisp\.chat/, r => r.abort());

  // ── Buffer (klippes med -ss 8) ────────────────────────────────────────────
  await page.goto('http://localhost:3000/?lang=en', { waitUntil: 'networkidle' });
  await removeDev(page);
  await scrollReveal(page);
  await page.waitForFunction(() => document.body.innerText.includes('About me'), { timeout: 15000 }).catch(() => {});
  await sleep(TRIM * 1000);

  // ── t=0–4s: Hero ─────────────────────────────────────────────────────────
  console.log('  [0-4s] Hero');
  await sleep(4000);

  // ── t=4–12s: Hero ────────────────────────────────────────────────────────
  console.log('  [4-12s] Hero');
  await sleep(8000);

  // ── t=12–19s: ABOUT ME ────────────────────────────────────────────────────
  // "Somalimedi was created by Ibrahim Dahir Hanaf, a trained farm economist"
  console.log('  [12-19s] About me modal');
  await showModal(page, 'About me', 6500);

  // ── t=19–24s: ABOUT SOMALIMED ─────────────────────────────────────────────
  // "to help Somalis speaking patients and their families understand medicines"
  console.log('  [19-24s] About Somalimed modal');
  await showModal(page, 'About Somalimed', 4500);

  // ── t=24–36s: Sprog-vælger ────────────────────────────────────────────────
  // "The first thing you will notice is the language selector... tap the language"
  console.log('  [24-36s] Language selector');
  await sleep(12000);

  // ── t=36–40s: Scroll til søgefelt ────────────────────────────────────────
  // "Below the language selector, you will find a search bar"
  console.log('  [36-40s] Scroll to search bar');
  await smoothScroll(page, 0, 1054, 4000);

  // ── t=40–44s: Skriv ibuprofen ─────────────────────────────────────────────
  // "Type the name of any medicine and it will appear immediately"
  console.log('  [40-44s] Type ibuprofen');
  await page.click('#medSearch');
  await sleep(200);
  await page.keyboard.type('ibuprofen', { delay: 190 });
  await sleep(1700);

  // ── t=44–58s: Resultater + kategorier ────────────────────────────────────
  // "category buttons... blood pressure, diabetes... Tap a category to filter"
  console.log('  [44-58s] Results + categories');
  await sleep(14000);

  // ── t=58s: Klik ibuprofen, naviger ────────────────────────────────────────
  // "To read about a specific medicine, simply tap on it"
  console.log('  [58s] Click ibuprofen');
  await page.click('a[href*="ibuprofen"]');
  await page.waitForLoadState('networkidle');
  await removeDev(page);

  // ── t=58–62s: Hold øverst på ibuprofen ───────────────────────────────────
  // "You will find clear and reliable information about what the medicine is used for"
  console.log('  [58-62s] Ibuprofen top');
  await sleep(4000);

  // ── t=62–72s: Scroll ibuprofen ────────────────────────────────────────────
  // "How and when to take it, important things to be aware of..."
  console.log('  [62-72s] Scroll ibuprofen page');
  const ibupH = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, 0, Math.round((ibupH - H) * 0.5), 10000);

  // ── t=72s: TILBAGE TIL FORSIDEN ───────────────────────────────────────────
  // "At the bottom of the page, you will also find a section for frequently asked questions"
  // Modaler er kun tilgængelige via SiteIndex-komponenten på forsiden
  console.log('  [72s] Navigate back to homepage for FAQ + Contact modals');
  await page.goto('http://localhost:3000/?lang=en', { waitUntil: 'networkidle' });
  await removeDev(page);
  await page.waitForFunction(() => document.body.innerText.includes('About me'), { timeout: 10000 }).catch(() => {});
  await sleep(500);

  // ── t=72–79s: FAQ MODAL ───────────────────────────────────────────────────
  // "a section for frequently asked questions"
  console.log('  [72-79s] FAQ modal');
  await showModal(page, 'FAQ', 6500);

  // ── t=79–80s: Overgang ────────────────────────────────────────────────────
  await sleep(1000);

  // ── t=80–85s: CONTACT MODAL ───────────────────────────────────────────────
  // "a contact button if you want to reach Ibrahim directly"
  console.log('  [80-85s] Contact modal');
  await showModal(page, 'Contact', 4500);

  // ── t=85–99s: Scroll forside ned ──────────────────────────────────────────
  // "professional knowledge... free to use... Thank you for watching"
  console.log('  [85-99s] Homepage scroll to bottom');
  const homeH = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, 0, homeH - H, 11000);
  await sleep(3190);

  console.log('  Afslutter optagelse...');
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VID_DIR).filter(f => f.endsWith('.webm'));
  if (!files.length) { console.error('❌ Ingen .webm!'); process.exit(1); }
  const webm = path.join(VID_DIR, files[0]);
  console.log(`  Rå video: ${(fs.statSync(webm).size/1024/1024).toFixed(1)} MB`);

  console.log('\n🎞️  Konverterer + lyd...');
  const r = spawnSync(FFMPEG, [
    '-y',
    '-ss', String(TRIM),
    '-i', webm,
    '-i', AUDIO_TMP,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(DUR),
    '-shortest',
    OUTPUT
  ], { encoding: 'utf8', stdio: ['ignore','inherit','pipe'] });

  if (r.status !== 0) { console.error('❌ ffmpeg fejl:', r.stderr.slice(-500)); process.exit(1); }
  console.log(`\n✅ guide-en.mp4 klar: ${(fs.statSync(OUTPUT).size/1024/1024).toFixed(1)} MB`);
})();
