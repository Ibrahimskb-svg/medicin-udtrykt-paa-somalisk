/**
 * Optager en RIGTIG video af hjemmesiden (engelsk) med Playwright video recording.
 * Playwright ruller igennem siden mens den optager — resulterer i en ægte video
 * præcis som de somaliske/danske guide-videoer.
 */
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO  = '/Users/ibrahimdahirhanaf/Desktop/Engelsk version.mp3';
const OUTPUT = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4';
const VID_DIR = '/tmp/pw_video/';

const W = 1280, H = 720;
const DUR = 99.19; // sekunder (lydens varighed)
const TRIM = 8;   // sekunder at klippe fra starten (React hydration buffer)


function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrollReveal(page) {
  // Scroll igennem hele siden for at udløse reveal-on-scroll animationer
  const totalH = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= totalH; y += 300) {
    await page.evaluate(pos => window.scrollTo(0, pos), y);
    await sleep(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
}

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

// Smooth scroll helper: ruller fra startY til endY over durationMs millisekunder
async function smoothScroll(page, fromY, toY, durationMs) {
  const steps = Math.max(1, Math.round(durationMs / 16)); // ~60fps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Ease in-out
    const eased = t < 0.5 ? 2*t*t : 1-((-2*t+2)*(-2*t+2))/2;
    const y = Math.round(fromY + (toY - fromY) * eased);
    await page.evaluate(pos => window.scrollTo(0, pos), y);
    await sleep(16);
  }
}

(async () => {
  // Ryd video-mappe
  if (fs.existsSync(VID_DIR)) fs.rmSync(VID_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR);

  console.log('🎬 Starter Playwright video-optagelse...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: VID_DIR, size: { width: W, height: H } }
  });
  const page = await context.newPage();

  // ── Indlæs ibuprofen siden på engelsk ───────────────────────
  // Ibuprofen siden viser ALTID hele navigationen øverst:
  // somalimed logo + About me, About Somalimed, FAQ, Contact
  // Samt: chat-knap, WhatsApp/Print knapper, sprogvælger
  // Sæt sprog + cookie-samtykke i localStorage FØR siden loader (kører ved hver navigation)
  await page.addInitScript(() => {
    localStorage.setItem('selectedLanguage', 'en');
    localStorage.setItem('cookieConsent', 'accepted');

    // MutationObserver: skjul chat-bubble (#sm-bubble) så snart den dukker op
    const bubbleKiller = new MutationObserver(() => {
      const el = document.getElementById('sm-bubble');
      if (el) el.style.setProperty('display', 'none', 'important');
    });
    bubbleKiller.observe(document.documentElement, { childList: true, subtree: true });
  });

  // Blokér alle netværksanmodninger til crisp.chat CDN
  await page.route(/crisp\.chat/, route => route.abort());

  // ── Fase 0: Forside (hydration buffer) ───────────────────────
  console.log('  Indlæser forside på engelsk...');
  await page.goto('http://localhost:3000/?lang=en', { waitUntil: 'networkidle' });
  await removeDev(page);
  await scrollReveal(page); // trigger animationer (ikke synlig – klippes væk)

  // Vent på engelsk navigation
  await page.waitForFunction(() => {
    return document.body.innerText.includes('About me');
  }, { timeout: 15000 }).catch(() => {
    console.log('  Advarsel: kunne ikke bekræfte engelsk navigation');
  });

  // Buffer klippes væk i ffmpeg med -ss TRIM
  await sleep(TRIM * 1000);

  // ── Fase 1a: Hold øverst – viser nav + hero (5s) ─────────────
  // Nav viser: About me | About Somalimed | FAQ | Contact
  console.log('  Viser forside-hero og navigation...');
  await sleep(5000);

  // ── Fase 1b: Scroll langsomt ned til søgefeltet (8s) ─────────
  // Søgefeltet sidder ved scrollY ≈ 1054
  console.log('  Scroller ned til søgefeltet...');
  await smoothScroll(page, 0, 1054, 8000);

  // ── Fase 1c: Hold ved søgefeltet (2s) ────────────────────────
  await sleep(2000);

  // ── Fase 1d: Skriv "ibuprofen" i søgefeltet (manden siger det)
  console.log('  Skriver "ibuprofen" i søgefeltet...');
  await page.click('#medSearch');
  await sleep(300);
  await page.keyboard.type('ibuprofen', { delay: 180 });

  // ── Fase 1e: Vis søgeresultat – ibuprofen-kortet (3s) ────────
  await sleep(3000);

  // ── Fase 2: Klik på ibuprofen → naviger til siden ────────────
  console.log('  Klikker på ibuprofen-kortet...');
  await page.click('a[href*="ibuprofen"]');
  await page.waitForLoadState('networkidle');
  await removeDev(page);

  // ── Fase 3: Ibuprofen side – scroller igennem alt (≈75s) ─────
  console.log('  Ibuprofen: scroller igennem alt indhold...');
  const ibupH = await page.evaluate(() => document.body.scrollHeight);
  await sleep(2000); // hold øverst
  // Scroll: resten af 99.19s minus forside(15s) + nav(2s) + holds(4s) ≈ 78s
  const ibupScrollMs = (DUR - 5 - 8 - 2 - 2 - 3 - 2 - 2 - 2) * 1000;
  await smoothScroll(page, 0, ibupH - H, ibupScrollMs);
  await sleep(2000); // hold ved bunden

  console.log('  Afslutter optagelse...');
  await context.close();
  await browser.close();

  // Find den optagne .webm fil
  const files = fs.readdirSync(VID_DIR).filter(f => f.endsWith('.webm'));
  if (files.length === 0) { console.error('Ingen .webm fil fundet!'); process.exit(1); }
  const webmPath = path.join(VID_DIR, files[0]);
  console.log(`  Optaget: ${webmPath} (${(fs.statSync(webmPath).size/1024/1024).toFixed(1)} MB)`);

  // ── KONVERTER WEBM → MP4 + tilføj engelsk lyd ────────────────
  console.log('\n🔊 Konverterer til MP4 + tilføjer engelsk lyd...');
  const r = spawnSync(FFMPEG, [
    '-y',
    '-ss', String(TRIM),   // spring React-hydration buffer over
    '-i', webmPath,
    '-i', AUDIO,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(DUR),
    '-shortest',
    OUTPUT
  ], { encoding: 'utf8', stdio: ['ignore', 'inherit', 'pipe'] });

  if (r.status === 0) {
    const mb = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
    console.log(`\n✅ guide-en.mp4 klar: ${mb} MB`);
  } else {
    console.error('❌ ffmpeg fejl:', r.stderr.slice(-1000));
  }
})();
