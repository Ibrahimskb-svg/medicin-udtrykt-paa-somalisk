/**
 * Genererer guide-{lang}.mp4 — Playwright-skærmoptagelse synkroniseret med
 * lydspor genereret af gen_{lang}_audio.py. Kør: node make_guide_video.js da
 *
 * Bruger den PRÆCISE tidsplan fra /tmp/{lang}_timing.json (faktiske TTS-
 * varigheder, ikke gættede budgetter), så video og lyd stemmer 100% overens.
 */
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LANG = process.argv[2];
if (!['da', 'en', 'ar', 'so'].includes(LANG)) {
  console.error('Brug: node make_guide_video.js <da|en|ar|so>');
  process.exit(1);
}

const NAV_LABELS = {
  da: { aboutMe: "Om mig", aboutSite: "Om Somalimed", faq: "Ofte stillede spørgsmål", contact: "Kontakt", mylist: "Min medicin" },
  en: { aboutMe: "About me", aboutSite: "About Somalimed", faq: "FAQ", contact: "Contact", mylist: "My medicine" },
  so: { aboutMe: "Ku saabsan aniga", aboutSite: "Ku saabsan Somalimed", faq: "Su'aalaha", contact: "Xiriir", mylist: "Daawooyinkayga" },
  ar: { aboutMe: "نبذة عني", aboutSite: "حول Somalimed", faq: "الأسئلة الشائعة", contact: "تواصل", mylist: "أدويتي" },
}[LANG];

const SHARE_LABELS = {
  da: { whatsapp: "Del på WhatsApp", print: "Udskriv siden", qr: "QR-kode", addToList: "Tilføj til min liste" },
  en: { whatsapp: "Share on WhatsApp", print: "Print page", qr: "QR code", addToList: "Add to my list" },
  so: { whatsapp: "La wadaag WhatsApp", print: "Daabac bogga", qr: "Koodhka QR", addToList: "Ku dar liiskaaga" },
  ar: { whatsapp: "مشاركة عبر واتساب", print: "طباعة الصفحة", qr: "رمز QR", addToList: "أضف إلى قائمتي" },
}[LANG];

const QR_LABELS = {
  da: { copy: "Kopiér billede", close: "Luk" },
  en: { copy: "Copy image", close: "Close" },
  so: { copy: "Koobiyee sawirka", close: "Xir" },
  ar: { copy: "نسخ الصورة", close: "إغلاق" },
}[LANG];

const MYLIST_LABELS = {
  da: { search: "Søg medicin…", print: "Print / vis til personalet" },
  en: { search: "Search medicine…", print: "Print / show to staff" },
  so: { search: "Raadi daawo…", print: "Daabac / tus shaqaalaha" },
  ar: { search: "البحث عن دواء…", print: "طباعة / إظهار للموظفين" },
}[LANG];

const FFMPEG   = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO    = `/tmp/${LANG}_audio_new.m4a`;
const MANIFEST = `/tmp/${LANG}_timing.json`;
const OUTPUT   = `/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-${LANG}.mp4`;
const VID_DIR  = `/tmp/pw_video_${LANG}/`;

const W = 1280, H = 720;
const TRIM = 6; // buffersekunder klippet fra start af rå optagelse

function sleep(ms) { return new Promise(r => setTimeout(r, Math.max(0, ms))); }

// Selv-korrigerende timing: reelle handlinger (klik, sideindlæsning, netværk)
// tager variabel realtid, som IKKE er budgetteret i lydsporets nominelle
// segment-varigheder. Uden korrektion ophobes den forskel gennem hele
// videoen, så skærmhandlinger gradvist kommer bagud i forhold til lyden.
// sleepToTarget sover kun til det ABSOLUTTE tidspunkt et segment skal
// slutte (fra tidsplanen), uanset hvor meget tid der reelt er brugt på
// handlinger forinden — så driften nulstilles ved hver eneste segmentgrænse.
let timelineStart = 0;
function sleepToTarget(seg, label) {
  const targetMs = seg[label].end * 1000;
  const elapsed = Date.now() - timelineStart;
  return sleep(targetMs - elapsed);
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`❌ Mangler tidsplan: ${MANIFEST} — kør gen_${LANG}_audio.py først`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const byLabel = {};
  for (const seg of data.timeline) byLabel[seg.label] = seg;
  return { total: data.total, seg: byLabel };
}

async function removeDev(page) {
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach(e => e.remove());
    const s = document.createElement('style');
    s.textContent = `
      nextjs-portal,[data-nextjs-dialog]{display:none!important}
      .reveal-on-scroll{opacity:1!important;transform:none!important;transition:none!important}
      #sm-bubble{display:none!important}
      div[role="dialog"][style*="99999"]{display:none!important}
    `;
    document.head.appendChild(s);
  });
}

async function scrollReveal(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 300) {
    await page.evaluate(p => window.scrollTo(0, p), y);
    await sleep(25);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(200);
}

async function smoothScroll(page, fromY, toY, ms) {
  const start = Date.now();
  while (true) {
    const elapsed = Date.now() - start;
    const t = Math.min(1, ms <= 0 ? 1 : elapsed / ms);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    await page.evaluate(y => window.scrollTo(0, y), Math.round(fromY + (toY - fromY) * e));
    if (t >= 1) break;
    await sleep(16);
  }
}

// Klik nav-knap → modal åbner → langsom mouse-wheel scroll i modal → Escape lukker
async function showNavModal(page, btnText, totalMs, closeMs) {
  await page.click(`button:has-text("${btnText}")`);
  await sleep(500);
  await page.mouse.move(640, 380);
  const scrollMs = Math.max(500, totalMs - 500 - closeMs);
  const wStart = Date.now();
  while (Date.now() - wStart < scrollMs) {
    await page.mouse.wheel(0, 45);
    await sleep(Math.min(650, Math.max(0, scrollMs - (Date.now() - wStart))));
  }
  await page.keyboard.press('Escape');
  await sleep(closeMs);
}

(async () => {
  if (!fs.existsSync(AUDIO)) {
    console.error(`❌ Lydspor mangler: ${AUDIO} — kør gen_${LANG}_audio.py først`);
    process.exit(1);
  }
  const { total: DUR, seg } = loadManifest();
  const dur = (label) => seg[label].end - seg[label].start;

  if (fs.existsSync(VID_DIR)) fs.rmSync(VID_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR, { recursive: true });

  console.log(`🎬 guide-${LANG}.mp4 — starter optagelse (mål ${DUR.toFixed(1)}s)...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: VID_DIR, size: { width: W, height: H } },
  });
  const recordStart = Date.now();
  const page = await context.newPage();

  // Luk alle EKSTRA popup-vinduer (WhatsApp/SMS/print-popups) med det samme —
  // vi vil ikke have dem i optagelsen, men klikkene skal stadig fungere
  // naturligt. Hovedsiden selv må aldrig lukkes.
  context.on('page', async (p) => {
    if (p === page) return;
    try { await p.waitForTimeout(50); await p.close(); } catch {}
  });

  await page.addInitScript((lang) => {
    localStorage.setItem('selectedLanguage', lang);
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.removeItem('somalimed_my_list');
    window.print = () => {}; // undgå OS-printdialog under automatiseret klik
    // undgå at print-popup'er (window.open) skaber ekstra optagede sider
    window.open = () => ({ document: { write() {}, close() {} }, print() {}, close() {}, focus() {} });
    const obs = new MutationObserver(() => {
      const bubble = document.getElementById('sm-bubble');
      if (bubble) bubble.style.setProperty('display', 'none', 'important');
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }, LANG);
  await page.route(/crisp\.chat/, r => r.abort());

  await page.goto(`http://localhost:3000/?lang=${LANG}`, { waitUntil: 'networkidle' });
  await removeDev(page);
  await scrollReveal(page);
  await page.waitForFunction((t) => document.body.innerText.includes(t), NAV_LABELS.aboutMe, { timeout: 15000 }).catch(() => {});
  const prepElapsed = Date.now() - recordStart;
  await sleep(TRIM * 1000 - prepElapsed);
  timelineStart = Date.now(); // t=0 på lydsporets tidslinje

  // ── hero ──────────────────────────────────────────────────────────────
  console.log('  [hero] Homepage hero');
  await sleepToTarget(seg, 'hero');
  await sleepToTarget(seg, 'hero_pause');

  // ── navbar modaler ───────────────────────────────────────────────────
  console.log('  [nav_me] About me modal');
  await showNavModal(page, NAV_LABELS.aboutMe, dur('nav_me') * 1000, 500);
  await sleepToTarget(seg, 'nav_me_pause');

  console.log('  [nav_site] About Somalimed modal');
  await showNavModal(page, NAV_LABELS.aboutSite, dur('nav_site') * 1000, 500);
  await sleepToTarget(seg, 'nav_site_pause');

  console.log('  [nav_faq] FAQ modal');
  await showNavModal(page, NAV_LABELS.faq, dur('nav_faq') * 1000, 500);
  await sleepToTarget(seg, 'nav_faq_pause');

  console.log('  [nav_contact] Contact modal');
  await showNavModal(page, NAV_LABELS.contact, dur('nav_contact') * 1000, 500);
  await sleepToTarget(seg, 'nav_contact_pause');

  console.log('  [nav_mylist] My list nav mention (no click yet — demoed later)');
  await sleepToTarget(seg, 'nav_mylist');
  await sleepToTarget(seg, 'nav_mylist_pause');

  // ── sprogvælger ──────────────────────────────────────────────────────
  console.log('  [langsel] Language selector');
  await smoothScroll(page, 0, 40, Math.round(dur('langsel') * 500));
  await smoothScroll(page, 40, 0, Math.round(dur('langsel') * 500));
  await sleepToTarget(seg, 'langsel_pause');

  // ── søgefelt ─────────────────────────────────────────────────────────
  console.log('  [search_intro] Scroll to search bar');
  await smoothScroll(page, 0, 1054, dur('search_intro') * 1000);
  await sleepToTarget(seg, 'search_scroll');

  console.log('  [search_type] Type ibuprofen');
  await sleepToTarget(seg, 'search_type_text');
  await page.click('#medSearch');
  await page.keyboard.type('ibuprofen', { delay: 180 });
  await sleepToTarget(seg, 'search_type_action');

  // ── kategorier ───────────────────────────────────────────────────────
  console.log('  [categories] Results + category buttons');
  await sleepToTarget(seg, 'categories');
  await sleepToTarget(seg, 'categories_pause');

  // ── klik medicin ─────────────────────────────────────────────────────
  console.log('  [click_med] Click ibuprofen');
  await page.click('a[href*="ibuprofen"]');
  await page.waitForLoadState('networkidle');
  await removeDev(page);
  await sleepToTarget(seg, 'click_med');
  await sleepToTarget(seg, 'click_med_load');

  // ── 4-knap-række ─────────────────────────────────────────────────────
  console.log('  [btn_whatsapp] WhatsApp button (hover only)');
  const waBtn = page.locator(`a:has-text("${SHARE_LABELS.whatsapp}")`).first();
  await waBtn.scrollIntoViewIfNeeded().catch(() => {});
  await waBtn.hover().catch(() => {});
  await sleepToTarget(seg, 'btn_whatsapp');
  await sleepToTarget(seg, 'btn_whatsapp_pause');

  console.log('  [btn_print] Print button (safe click, window.print stubbed)');
  await page.click(`button:has-text("${SHARE_LABELS.print}")`).catch(() => {});
  await sleepToTarget(seg, 'btn_print');
  await sleepToTarget(seg, 'btn_print_pause');

  console.log('  [btn_qr] QR code modal');
  await page.click(`button:has-text("${SHARE_LABELS.qr}")`).catch(() => {});
  await sleepToTarget(seg, 'btn_qr');
  // Demo: klik "kopiér billede" midt i stilheden, luk derefter modal
  const qrDemoMs = dur('btn_qr_demo') * 1000;
  await sleep(Math.round(qrDemoMs * 0.5));
  await page.click(`button:has-text("${QR_LABELS.copy}")`).catch(() => {});
  await page.keyboard.press('Escape');
  await sleepToTarget(seg, 'btn_qr_demo');

  console.log('  [btn_addlist] Add to list button');
  await page.click(`button:has-text("${SHARE_LABELS.addToList}")`).catch(() => {});
  await sleepToTarget(seg, 'btn_addlist');
  await sleepToTarget(seg, 'btn_addlist_action');

  // ── lydoplæsning (kun ar/so) ─────────────────────────────────────────
  if (seg.audio_readout) {
    console.log('  [audio_readout] Audio playback button');
    const audioBtnText = LANG === 'so' ? 'Dhageyso codkan' : 'استمع إلى التسجيل';
    await page.click(`button:has-text("${audioBtnText}")`).catch(() => {});
    await sleepToTarget(seg, 'audio_readout');
    await sleepToTarget(seg, 'audio_readout_action');
  }

  // ── overblik + sektioner + kilder ───────────────────────────────────
  console.log('  [overview] Overview + advice section');
  const pageH1 = await page.evaluate(() => document.body.scrollHeight);
  const curY1 = await page.evaluate(() => window.scrollY);
  await smoothScroll(page, curY1, Math.round(pageH1 * 0.35), dur('overview') * 1000);
  await sleepToTarget(seg, 'overview_scroll');

  console.log('  [sections] Dosage/side effects/warnings sections');
  await smoothScroll(page, Math.round(pageH1 * 0.35), Math.round(pageH1 * 0.65), dur('sections') * 1000);
  await sleepToTarget(seg, 'sections_scroll');

  console.log('  [sources] Sources + emergency numbers + revision date');
  await smoothScroll(page, Math.round(pageH1 * 0.65), pageH1 - H, dur('sources') * 1000);
  await sleepToTarget(seg, 'sources_scroll');

  // ── Min medicinliste-modal ──────────────────────────────────────────
  console.log('  [mylist_modal] Open My list modal, search + check items');
  await page.click(`button:has-text("${NAV_LABELS.mylist}")`).catch(() => {});
  const searchInput = page.locator(`input[placeholder="${MYLIST_LABELS.search}"]`).first();
  await searchInput.click().catch(() => {});
  await page.keyboard.type('ibu', { delay: 150 }).catch(() => {});
  // NB: Ctrl+A markerer ikke alt i et tekstfelt på Mac (flytter i stedet
  // markøren til linjestart) — brug .fill('') for pålideligt at rydde feltet.
  await searchInput.fill('').catch(() => {});
  await sleep(400); // lad React nå at gen-rendere den fulde, ufiltrerede liste
  // Checklisten bruger knapper med aria-pressed, IKKE native <input type="checkbox">
  // — det gamle checkbox-selectorsvar matchede intet, så listen fik reelt
  // aldrig sat flueben på noget her.
  const checkboxes = page.locator('button[aria-pressed="false"]');
  const cbCount = await checkboxes.count().catch(() => 0);
  for (let i = 0; i < Math.min(2, cbCount); i++) {
    await checkboxes.nth(i).click({ force: true }).catch(() => {});
  }
  await sleepToTarget(seg, 'mylist_modal');
  await sleepToTarget(seg, 'mylist_modal_demo');

  if (seg.mylist_interact) {
    console.log('  [mylist_interact] Scroll to interactions/warnings section');
    await page.evaluate(() => {
      const scrollable = [...document.querySelectorAll('div')].find(
        (d) => d.scrollHeight > d.clientHeight + 50 && d.getBoundingClientRect().height > 200
      );
      if (scrollable) scrollable.scrollTop = scrollable.scrollHeight * 0.55;
    }).catch(() => {});
    await sleepToTarget(seg, 'mylist_interact');
    await sleepToTarget(seg, 'mylist_interact_scroll');
  }

  console.log('  [mylist_print] Print list button (safe, window.open stubbed elsewhere)');
  await page.click(`button:has-text("${MYLIST_LABELS.print}")`).catch(() => {});
  await sleepToTarget(seg, 'mylist_print');
  await sleepToTarget(seg, 'mylist_print_action');
  await page.keyboard.press('Escape');

  // ── tilbage til forsiden ─────────────────────────────────────────────
  console.log('  [back_home] Navigate back to homepage');
  await page.goto(`http://localhost:3000/?lang=${LANG}`, { waitUntil: 'networkidle' });
  await removeDev(page);
  await sleepToTarget(seg, 'back_home');
  await sleepToTarget(seg, 'back_home_nav');

  // ── afslutning ───────────────────────────────────────────────────────
  console.log('  [closing] Scroll homepage to bottom, closing remarks');
  const homeH = await page.evaluate(() => document.body.scrollHeight);
  const closingRemainingMs = Math.max(2000, seg.closing2.end * 1000 - (Date.now() - timelineStart));
  await smoothScroll(page, 0, homeH - H, Math.round(closingRemainingMs * 0.85));
  await sleep(Math.round(closingRemainingMs * 0.15));

  console.log('  Afslutter optagelse...');
  await context.close();
  await browser.close();

  // Popup-vinduer (fx print-popup'en) optages også som separate .webm-filer i
  // samme mappe — vælg den STØRSTE fil, som altid er hovedsidens optagelse.
  const files = fs.readdirSync(VID_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ f, size: fs.statSync(path.join(VID_DIR, f)).size }))
    .sort((a, b) => b.size - a.size);
  if (!files.length) { console.error('❌ Ingen .webm!'); process.exit(1); }
  if (files.length > 1) {
    console.log(`  (${files.length} .webm-filer fundet — bruger den største, ignorerer popup-optagelser)`);
  }
  const webm = path.join(VID_DIR, files[0].f);
  console.log(`  Rå video: ${(fs.statSync(webm).size / 1024 / 1024).toFixed(1)} MB`);

  console.log('\n🎞️  Konverterer + lyd...');
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
    OUTPUT,
  ], { encoding: 'utf8', stdio: ['ignore', 'inherit', 'pipe'] });

  if (r.status !== 0) { console.error('❌ ffmpeg fejl:', r.stderr.slice(-500)); process.exit(1); }
  console.log(`\n✅ guide-${LANG}.mp4 klar: ${(fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1)} MB`);
})();
