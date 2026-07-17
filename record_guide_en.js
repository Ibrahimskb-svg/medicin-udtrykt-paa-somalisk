/**
 * Takes screenshots of the real somalimed.dk website (English, ibuprofen page)
 * and stitches them into a video with the English audio narration.
 */

const { chromium } = require('playwright');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const AUDIO = '/Users/ibrahimdahirhanaf/Desktop/Engelsk version.mp3';
const OUTPUT = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4';
const FRAMES_DIR = '/tmp/guide_en_frames';
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 25;
const AUDIO_DURATION = 99.19; // seconds

// Clean frames dir
if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true });
}
fs.mkdirSync(FRAMES_DIR);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function captureFrames(page, durationSec, label) {
  const totalFrames = Math.round(durationSec * FPS);
  const interval = 1000 / FPS;
  console.log(`  Capturing ${totalFrames} frames over ${durationSec}s (${label})...`);
  for (let i = 0; i < totalFrames; i++) {
    const frameNum = String(global.frameCounter++).padStart(6, '0');
    await page.screenshot({
      path: `${FRAMES_DIR}/frame_${frameNum}.png`,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    });
    await sleep(interval);
  }
}

(async () => {
  global.frameCounter = 0;

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // ---- PHASE 1: Homepage in English (3 sec) ----
  console.log('Phase 1: Homepage...');
  await page.goto('http://localhost:3000/?lang=en', { waitUntil: 'networkidle' });
  await sleep(1000);
  await captureFrames(page, 2, 'homepage top');

  // ---- PHASE 2: Scroll down homepage slowly (4 sec) ----
  console.log('Phase 2: Scroll homepage...');
  const homeTotalScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const homeScrollStep = Math.min(homeTotalScroll, 600); // scroll partway
  const homeDuration = 4;
  const homeSteps = homeDuration * FPS;
  for (let i = 0; i < homeSteps; i++) {
    const pos = Math.round((i / homeSteps) * homeScrollStep);
    await page.evaluate(y => window.scrollTo(0, y), pos);
    const frameNum = String(global.frameCounter++).padStart(6, '0');
    await page.screenshot({
      path: `${FRAMES_DIR}/frame_${frameNum}.png`,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    });
    await sleep(1000 / FPS);
  }

  // ---- PHASE 3: Navigate to ibuprofen in English ----
  console.log('Phase 3: Navigating to ibuprofen...');
  await page.goto('http://localhost:3000/ibuprofen?lang=en', { waitUntil: 'networkidle' });
  await sleep(1500);
  // Trigger reveal-on-scroll by scrolling slightly
  await page.evaluate(() => window.scrollTo(0, 1));
  await sleep(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);

  // ---- PHASE 4: Hold on top of ibuprofen page (2 sec) ----
  console.log('Phase 4: Ibuprofen top...');
  await captureFrames(page, 2, 'ibuprofen top');

  // ---- PHASE 5: Scroll through ibuprofen page (rest of video) ----
  console.log('Phase 5: Scrolling ibuprofen page...');
  const elapsedSec = 2 + 4 + 2; // phases 1+2+4
  const remainingSec = AUDIO_DURATION - elapsedSec - 2; // leave 2 sec at bottom

  const totalPageHeight = await page.evaluate(() => document.body.scrollHeight);
  const maxScroll = totalPageHeight - HEIGHT;

  console.log(`  Page height: ${totalPageHeight}px, max scroll: ${maxScroll}px`);
  console.log(`  Scrolling over ${remainingSec}s...`);

  const scrollSteps = Math.round(remainingSec * FPS);
  for (let i = 0; i < scrollSteps; i++) {
    const progress = i / scrollSteps;
    // Ease in-out scroll
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const scrollPos = Math.round(eased * maxScroll);
    await page.evaluate(y => window.scrollTo(0, y), scrollPos);
    const frameNum = String(global.frameCounter++).padStart(6, '0');
    await page.screenshot({
      path: `${FRAMES_DIR}/frame_${frameNum}.png`,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    });
    await sleep(1000 / FPS);
  }

  // ---- PHASE 6: Hold at bottom (2 sec) ----
  console.log('Phase 6: Hold at bottom...');
  await captureFrames(page, 2, 'bottom');

  await browser.close();

  const totalFrames = global.frameCounter;
  console.log(`\nTotal frames captured: ${totalFrames}`);
  console.log(`Expected for ${AUDIO_DURATION}s at ${FPS}fps: ${Math.round(AUDIO_DURATION * FPS)}`);

  // ---- COMBINE FRAMES INTO VIDEO + ADD AUDIO ----
  console.log('\nCreating video with ffmpeg...');
  const cmd = [
    FFMPEG, '-y',
    '-framerate', String(FPS),
    '-pattern_type', 'glob',
    '-i', `${FRAMES_DIR}/frame_*.png`,
    '-i', AUDIO,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(AUDIO_DURATION),
    '-shortest',
    OUTPUT
  ];

  console.log(cmd.join(' '));
  const result = spawnSync(cmd[0], cmd.slice(1), { stdio: 'pipe', encoding: 'utf8' });

  if (result.status === 0) {
    const size = fs.statSync(OUTPUT).size;
    console.log(`\nSuccess! guide-en.mp4: ${(size/1024/1024).toFixed(1)} MB`);
  } else {
    console.error('ffmpeg error:');
    console.error(result.stderr.slice(-2000));
    process.exit(1);
  }
})();
