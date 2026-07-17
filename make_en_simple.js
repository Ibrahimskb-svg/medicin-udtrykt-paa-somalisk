/**
 * Creates guide-en.mp4
 * Phase 1: Homepage (nav, features, medicine list) — ~15s
 * Phase 2: Ibuprofen page full scroll — ~84s
 * Total: 99.19s matching "Engelsk version.mp3"
 */
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');

const FFMPEG  = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO   = '/Users/ibrahimdahirhanaf/Desktop/Engelsk version.mp3';
const OUTPUT  = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4';
const IMG_HOME = '/tmp/guide_en_home.png';
const IMG_IBUP = '/tmp/guide_en_ibup.png';

const W = 1280, H = 720, FPS = 25, DUR = 99.19;

function spawnFfmpeg(args) {
  return spawnSync(FFMPEG, args, { encoding: 'utf8', stdio: ['ignore','inherit','pipe'] });
}

async function cleanPage(page) {
  // Accepter cookies
  try { await page.click('button:has-text("Essential only")', { timeout: 2000 }); } catch(e){}
  await new Promise(r => setTimeout(r, 300));

  // Scroll igennem HELE siden for at udløse reveal-on-scroll animationer
  const totalH = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < totalH; y += 400) {
    await page.evaluate(pos => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 60));
  }
  await new Promise(r => setTimeout(r, 500));
  // Gå tilbage til top
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));

  // Fjern Next.js N-indikator og sæt alle reveal-elementer synlige
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach(e => e.remove());
    const s = document.createElement('style');
    s.textContent = `
      nextjs-portal,[data-nextjs-dialog],body>div[style*="z-index: 9999"]{display:none!important}
      .reveal-on-scroll{opacity:1!important;transform:none!important;transition:none!important}
    `;
    document.head.appendChild(s);
  });
  await new Promise(r => setTimeout(r, 200));
}

(async () => {
  console.log('📸 Tager screenshots...');
  const browser = await chromium.launch({ headless: true });

  // ── HOMEPAGE ─────────────────────────────────────────────────
  const p1 = await browser.newPage({ viewport: { width: W, height: H } });
  await p1.goto('http://localhost:3000/?lang=en', { waitUntil: 'networkidle' });
  await cleanPage(p1);
  // Scroll lidt for at udløse reveal-animationer, gå tilbage til top
  await p1.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 600));
  await p1.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await p1.screenshot({ path: IMG_HOME, fullPage: true });
  const homeMeta = spawnSync(FFMPEG, ['-i', IMG_HOME], { encoding:'utf8' });
  const mh = homeMeta.stderr.match(/(\d+)x(\d+)/);
  const homeH = mh ? parseInt(mh[2]) : 2000;
  console.log(`   Homepage: ${W}×${homeH}px`);
  await p1.close();

  // ── IBUPROFEN PAGE ───────────────────────────────────────────
  const p2 = await browser.newPage({ viewport: { width: W, height: H } });
  await p2.goto('http://localhost:3000/ibuprofen?lang=en', { waitUntil: 'networkidle' });
  await cleanPage(p2);
  await p2.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 700));
  await p2.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 700));
  await p2.screenshot({ path: IMG_IBUP, fullPage: true });
  const ibupMeta = spawnSync(FFMPEG, ['-i', IMG_IBUP], { encoding:'utf8' });
  const mi = ibupMeta.stderr.match(/(\d+)x(\d+)/);
  const ibupH = mi ? parseInt(mi[2]) : 2591;
  console.log(`   Ibuprofen: ${W}×${ibupH}px`);
  await p2.close();
  await browser.close();

  // ── VIDEO TIMING ─────────────────────────────────────────────
  // Phase 1: Homepage — hold 2s + scroll 11s + hold 2s = 15s
  const HOME_HOLD_TOP = 2;
  const HOME_SCROLL   = 11;
  const HOME_HOLD_BOT = 2;
  const HOME_TOTAL    = HOME_HOLD_TOP + HOME_SCROLL + HOME_HOLD_BOT; // 15s

  // Phase 2: Ibuprofen — hold 1s + scroll + hold 2s
  const IBUP_HOLD_TOP = 1;
  const IBUP_HOLD_BOT = 2;
  const IBUP_TOTAL    = DUR - HOME_TOTAL;                            // 84.19s
  const IBUP_SCROLL   = IBUP_TOTAL - IBUP_HOLD_TOP - IBUP_HOLD_BOT; // 81.19s

  const homeMaxScroll = Math.max(0, homeH - H);
  const ibupMaxScroll = Math.max(0, ibupH - H);

  // Scroll speed (px/s) — linear for homepage, eased for ibuprofen
  const homeSpeed = homeMaxScroll / HOME_SCROLL;
  const ibupSpeed = ibupMaxScroll / IBUP_SCROLL;
  const homeScrollExpr =
    `max(0\\,min(${homeMaxScroll}\\,${homeSpeed.toFixed(3)}*(t-${HOME_HOLD_TOP})))`;
  const ibupScrollExpr =
    `max(0\\,min(${ibupMaxScroll}\\,${ibupSpeed.toFixed(3)}*(t-${IBUP_HOLD_TOP})))`;

  console.log(`\n🎬 Laver homepage video (${HOME_TOTAL}s)...`);
  let r = spawnFfmpeg([
    '-y',
    '-loop', '1', '-i', IMG_HOME,
    '-filter_complex', `[0:v]crop=${W}:${H}:0:${homeScrollExpr}[v]`,
    '-map', '[v]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-t', String(HOME_TOTAL),
    '/tmp/part1_home.mp4'
  ]);
  if (r.status !== 0) { console.error(r.stderr.slice(-500)); process.exit(1); }

  console.log(`🎬 Laver ibuprofen video (${IBUP_TOTAL.toFixed(2)}s)...`);
  r = spawnFfmpeg([
    '-y',
    '-loop', '1', '-i', IMG_IBUP,
    '-filter_complex', `[0:v]crop=${W}:${H}:0:${ibupScrollExpr}[v]`,
    '-map', '[v]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-t', String(IBUP_TOTAL),
    '/tmp/part2_ibup.mp4'
  ]);
  if (r.status !== 0) { console.error(r.stderr.slice(-500)); process.exit(1); }

  console.log(`🔗 Sammensætter + tilføjer lyd...`);
  fs.writeFileSync('/tmp/concat_list.txt', "file '/tmp/part1_home.mp4'\nfile '/tmp/part2_ibup.mp4'\n");
  r = spawnFfmpeg([
    '-y',
    '-f', 'concat', '-safe', '0', '-i', '/tmp/concat_list.txt',
    '-i', AUDIO,
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(DUR), '-shortest',
    OUTPUT
  ]);
  if (r.status !== 0) { console.error(r.stderr.slice(-500)); process.exit(1); }

  const mb = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ guide-en.mp4 klar: ${mb} MB, ${DUR}s`);
})();
