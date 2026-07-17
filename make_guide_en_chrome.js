/**
 * Creates guide-en.mp4 - synthetic screen recording identical in concept
 * to the Somalisk version: Chrome browser + macOS dock + cursor + ibuprofen page scrolling.
 */

const { chromium } = require('playwright');
const sharp = require('sharp');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG  = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO   = '/Users/ibrahimdahirhanaf/Desktop/Engelsk version.mp3';
const OUTPUT  = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4';

const TW      = 1280;   // Total width  (matches guide-ar.mp4 style)
const TH      = 750;    // Total height
const CHROME  = 72;     // Browser chrome height at top
const DOCK    = 68;     // Dock height at bottom
const PAGE_H  = TH - CHROME - DOCK;  // = 610 — page viewport height

const FPS     = 25;
const DUR     = 99.19;  // audio duration in seconds
const FRAMES  = Math.round(DUR * FPS); // 2480

// ── SVG for browser chrome ─────────────────────────────────────────────────
function chromeSVG() {
  return `<svg width="${TW}" height="${CHROME}" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Arial, sans-serif">
  <!-- Tab bar bg -->
  <rect width="${TW}" height="${CHROME}" fill="#DEE1E6"/>
  <!-- Traffic lights -->
  <circle cx="14" cy="17" r="7" fill="#FF5F57"/>
  <circle cx="36" cy="17" r="7" fill="#FFBD2E"/>
  <circle cx="58" cy="17" r="7" fill="#28C840"/>
  <!-- Active tab -->
  <rect x="80" y="4" width="310" height="32" rx="6" fill="white"/>
  <!-- Favicon green square -->
  <rect x="92" y="13" width="13" height="13" rx="2.5" fill="#16a34a"/>
  <!-- Tab title -->
  <text x="112" y="25" font-size="13" fill="#202020">Ibuprofen – pain, inflammation and fever</text>
  <!-- Tab close -->
  <text x="374" y="25" font-size="13" fill="#999">✕</text>
  <!-- New tab -->
  <text x="400" y="25" font-size="15" fill="#666">+</text>

  <!-- Address bar row (y=38) -->
  <!-- Back chevron -->
  <text x="12" y="72" font-size="22" fill="#555">‹</text>
  <text x="38" y="72" font-size="22" fill="#CCC">›</text>
  <!-- Reload -->
  <text x="62" y="70" font-size="18" fill="#555">↺</text>
  <!-- Address pill -->
  <rect x="100" y="42" width="${TW-280}" height="36" rx="18" fill="white" stroke="#CCCCCC" stroke-width="1"/>
  <!-- Lock icon -->
  <text x="116" y="66" font-size="16" fill="#555">🔒</text>
  <text x="144" y="66" font-size="16" fill="#333">somalimed.dk/ibuprofen?lang=en</text>
  <!-- Right icons -->
  <text x="${TW-160}" y="66" font-size="17" fill="#666">☆</text>
  <text x="${TW-110}" y="66" font-size="17" fill="#666">⋮</text>
  <!-- "Paused" button like in Somalisk -->
  <rect x="${TW-260}" y="46" width="90" height="28" rx="14" fill="#E8E8E8" stroke="#CCCCCC" stroke-width="1"/>
  <text x="${TW-254}" y="65" font-size="13" fill="#444">⏸ Paused</text>
</svg>`;
}

// ── SVG for macOS dock ──────────────────────────────────────────────────────
function dockSVG() {
  const icons = ['🔍','📁','🌐','📧','📅','🎵','⚙','📝','💻','🛡'];
  const iconW = 64;
  const barW  = icons.length * iconW + 16;
  const bx    = (TW - barW) / 2;
  let iconHtml = icons.map((ic, i) =>
    `<text x="${bx+10+i*iconW}" y="56" font-size="38">${ic}</text>`
  ).join('');
  return `<svg width="${TW}" height="${DOCK}" xmlns="http://www.w3.org/2000/svg" font-family="Apple Color Emoji, Segoe UI Emoji, Arial">
  <rect width="${TW}" height="${DOCK}" fill="#1C1C1E"/>
  <!-- Dock bar -->
  <rect x="${bx}" y="4" width="${barW}" height="${DOCK-8}" rx="18" fill="#3A3A3C" stroke="#55555A" stroke-width="1"/>
  ${iconHtml}
  <!-- Recording indicator -->
  <circle cx="${TW/2-60}" cy="${DOCK-10}" r="5" fill="#FF3B30"/>
  <text x="${TW/2-50}" y="${DOCK-5}" font-size="12" fill="#FF3B30">Optager...</text>
</svg>`;
}

// ── SVG cursor ─────────────────────────────────────────────────────────────
function cursorSVG(x, y) {
  // macOS arrow cursor (white with black border)
  const S = 28; // cursor size
  return `<svg width="${TW}" height="${TH}" xmlns="http://www.w3.org/2000/svg">
  <polygon points="${x},${y} ${x},${y+S*0.85} ${x+S*0.22},${y+S*0.62} ${x+S*0.38},${y+S*0.95} ${x+S*0.48},${y+S*0.91} ${x+S*0.32},${y+S*0.58} ${x+S*0.62},${y+S*0.58}"
    fill="white" stroke="black" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;
}

// ── Easing ──────────────────────────────────────────────────────────────────
function easeInOut(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

// ── Cursor path ─────────────────────────────────────────────────────────────
function cursorAt(t) {
  const scrollFrac = t < 2 ? 0 : t > DUR-2 ? 1 : easeInOut((t-2)/(DUR-4));
  // Cursor stays roughly center-right, drifts gently, follows scroll loosely
  const cx = 1350 + 90*Math.sin(t*0.28) + 40*Math.sin(t*0.11);
  const cy = CHROME + 280 + scrollFrac*(PAGE_H-380) + 25*Math.sin(t*0.6);
  return { x: Math.round(cx), y: Math.round(cy) };
}

// ── Main ────────────────────────────────────────────────────────────────────
(async () => {
  // Pre-render chrome and dock PNGs once
  console.log('Pre-rendering browser chrome...');
  const chromePng = await sharp(Buffer.from(chromeSVG()))
    .png().toBuffer();
  const dockPng = await sharp(Buffer.from(dockSVG()))
    .png().toBuffer();

  // Take full-page screenshot of ibuprofen page in English
  console.log('Taking full-page screenshot with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: TW, height: PAGE_H } });
  await page.goto('http://localhost:3000/ibuprofen?lang=en', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800));
  const screenshotBuf = await page.screenshot({ fullPage: true });
  await browser.close();

  // Load and size the page screenshot
  let pageMeta = await sharp(screenshotBuf).metadata();
  console.log(`Page screenshot: ${pageMeta.width}×${pageMeta.height}px`);

  // Resize to exact TW if needed
  let pageImg = sharp(screenshotBuf);
  if (pageMeta.width !== TW) {
    pageImg = pageImg.resize(TW, null, { fit: 'fill' });
    pageMeta = await pageImg.metadata();
  }
  const pageRaw = await pageImg.raw().toBuffer({ resolveWithObject: true });
  const pageHeight = pageRaw.info.height;
  const maxScroll  = Math.max(0, pageHeight - PAGE_H);

  console.log(`Max scroll: ${maxScroll}px | Total frames: ${FRAMES}`);

  // Start ffmpeg process consuming raw RGB24 from stdin
  const ffmpegProc = spawn(FFMPEG, [
    '-y',
    '-f', 'rawvideo', '-pixel_format', 'rgb24',
    '-video_size', `${TW}x${TH}`,
    '-framerate', String(FPS),
    '-i', 'pipe:0',
    '-i', AUDIO,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(DUR),
    '-shortest',
    OUTPUT
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  let ffmpegDone = false;
  ffmpegProc.on('close', code => {
    ffmpegDone = true;
    if (code === 0) {
      const size = fs.statSync(OUTPUT).size;
      console.log(`\n✅ guide-en.mp4 klar: ${(size/1024/1024).toFixed(1)} MB`);
    } else {
      console.error(`\n❌ ffmpeg exited with code ${code}`);
    }
  });

  // Generate and pipe each frame
  const HOLD_TOP = 2, HOLD_BOT = 2;

  for (let fn = 0; fn < FRAMES; fn++) {
    const t = fn / FPS;

    // Scroll position
    let scrollFrac;
    if      (t <= HOLD_TOP)        scrollFrac = 0;
    else if (t >= DUR - HOLD_BOT)  scrollFrac = 1;
    else scrollFrac = easeInOut((t - HOLD_TOP) / (DUR - HOLD_TOP - HOLD_BOT));
    const scrollY = Math.round(scrollFrac * maxScroll);

    // Extract page viewport at current scroll
    const pageSlice = await sharp(pageRaw.data, {
      raw: { width: TW, height: pageHeight, channels: 3 }
    })
      .extract({ left: 0, top: scrollY, width: TW, height: PAGE_H })
      .toBuffer();

    // Cursor
    const { x: cx, y: cy } = cursorAt(t);
    const cursorBuf = await sharp(Buffer.from(cursorSVG(cx, cy)))
      .resize(TW, TH).png().toBuffer();

    // Compose full frame: [page in middle] + [chrome on top] + [dock on bottom] + [cursor]
    const frameBuf = await sharp({
      create: { width: TW, height: TH, channels: 3, background: '#F2F2F7' }
    })
    .composite([
      { input: pageSlice,  raw: { width: TW, height: PAGE_H, channels: 3 }, top: CHROME, left: 0 },
      { input: chromePng, top: 0,      left: 0 },
      { input: dockPng,   top: TH-DOCK, left: 0 },
      { input: cursorBuf, top: 0,      left: 0, blend: 'over' },
    ])
    .raw()
    .toBuffer();

    // Write to ffmpeg stdin
    const canWrite = ffmpegProc.stdin.write(frameBuf);
    if (!canWrite) {
      await new Promise(r => ffmpegProc.stdin.once('drain', r));
    }

    if (fn % 125 === 0) {
      process.stdout.write(`   ${Math.round(fn/FRAMES*100)}% (${fn}/${FRAMES})\r`);
    }
  }

  ffmpegProc.stdin.end();
  await new Promise(r => ffmpegProc.on('close', r));
})();
