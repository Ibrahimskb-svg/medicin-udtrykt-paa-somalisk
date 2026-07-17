#!/usr/bin/env python3
"""
Creates guide-en.mp4 - looks exactly like the Somalisk screen recording:
Chrome browser with tab/address bar, macOS dock, cursor moving, page scrolling.
"""

import asyncio, io, os, subprocess, struct, math, zlib
from PIL import Image, ImageDraw, ImageFont

FFMPEG   = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
AUDIO    = '/Users/ibrahimdahirhanaf/Desktop/Engelsk version.mp3'
OUTPUT   = '/Users/ibrahimdahirhanaf/medicin-udtrykt-paa-somalisk/public/guide-en.mp4'

TOTAL_W  = 2560
TOTAL_H  = 1500
CHROME_H = 88    # Tab bar + address bar
DOCK_H   = 82    # Bottom dock
PAGE_H   = TOTAL_H - CHROME_H - DOCK_H   # = 1330

AUDIO_DURATION = 99.19
FPS = 25

# ── Fonts ──────────────────────────────────────────────────────────────────
def load_font(size, bold=False):
    idx = 1 if bold else 0
    try:
        return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size, index=idx)
    except:
        return ImageFont.load_default()

fn_tab   = load_font(14)
fn_addr  = load_font(16)
fn_dock  = load_font(11)

# ── Chrome browser chrome ──────────────────────────────────────────────────
def draw_browser_chrome(draw):
    # Window background
    draw.rectangle([0, 0, TOTAL_W, CHROME_H], fill='#DEE1E6')

    # ── Tab bar (top 34px) ──
    TAB_Y = 0
    TAB_H = 34

    # Traffic lights
    for i, col in enumerate(['#FF5F57','#FFBD2E','#28C840']):
        cx = 14 + i*22
        cy = TAB_Y + 17
        r  = 7
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)

    # Active tab (white rounded rectangle)
    tx, tw = 80, 310
    draw.rounded_rectangle([tx, TAB_Y+4, tx+tw, TAB_Y+TAB_H+2], radius=6, fill='#FFFFFF')
    # Green favicon dot
    draw.rounded_rectangle([tx+10, TAB_Y+11, tx+22, TAB_Y+23], radius=3, fill='#16a34a')
    # Tab title
    draw.text((tx+28, TAB_Y+10), "Ibuprofen – pain, inflammation…", font=fn_tab, fill='#202020')
    # Close x
    draw.text((tx+tw-18, TAB_Y+10), "×", font=fn_tab, fill='#888888')

    # New tab +
    draw.text((tx+tw+10, TAB_Y+10), "+", font=fn_tab, fill='#666666')

    # ── Address bar (below tabs) ──
    AY  = TAB_H + 4
    AH  = CHROME_H - TAB_H - 10
    # Back / forward / reload icons (simplified)
    draw.text((14,  AY+6), "‹",  font=load_font(22), fill='#555555')
    draw.text((40,  AY+6), "›",  font=load_font(22), fill='#BBBBBB')
    draw.text((62,  AY+8), "↺",  font=load_font(18), fill='#555555')

    # Address pill
    AX1, AX2 = 100, TOTAL_W-180
    draw.rounded_rectangle([AX1, AY+3, AX2, AY+AH-3], radius=20,
                           fill='#FFFFFF', outline='#CCCCCC', width=1)
    draw.text((AX1+14, AY+8), "🔒  somalimed.dk/ibuprofen?lang=en",
              font=fn_addr, fill='#333333')

    # Right icons (bookmark star etc)
    draw.text((TOTAL_W-160, AY+7), "☆", font=load_font(18), fill='#666666')
    draw.text((TOTAL_W-120, AY+7), "⋮", font=load_font(18), fill='#666666')

# ── macOS Dock ─────────────────────────────────────────────────────────────
DOCK_ICONS = ['🔍','📁','🌐','📧','📅','🎵','⚙','📝','💻']

def draw_dock(draw):
    DY = TOTAL_H - DOCK_H
    # Dark dock background
    draw.rectangle([0, DY, TOTAL_W, TOTAL_H], fill='#1E1E1E')
    # Dock bar
    bar_w = len(DOCK_ICONS)*68 + 20
    bx = (TOTAL_W - bar_w)//2
    draw.rounded_rectangle([bx, DY+6, bx+bar_w, TOTAL_H-6],
                           radius=18, fill='#3A3A3A', outline='#555555', width=1)
    fn_emoji = load_font(32)
    for i, icon in enumerate(DOCK_ICONS):
        ix = bx + 14 + i*68
        draw.text((ix, DY+14), icon, font=fn_emoji)

    # Recording indicator (bottom center, like "Optager..." in Somalisk)
    rec_text = "● Recording"
    try:
        fn_rec = load_font(13)
        bbox = draw.textbbox((0,0), rec_text, font=fn_rec)
        rx = (TOTAL_W - (bbox[2]-bbox[0]))//2
        draw.text((rx, TOTAL_H-20), rec_text, font=fn_rec, fill='#FF5F57')
    except:
        pass

# ── Arrow cursor ──────────────────────────────────────────────────────────
def draw_cursor(draw, x, y):
    """Draw macOS-style white arrow cursor with black outline."""
    S = 1.8  # scale
    pts = [(0,0),(0,22),(6,17),(10,26),(13,24),(9,15),(17,15)]
    pts = [(int(x+px*S), int(y+py*S)) for px,py in pts]
    draw.polygon(pts, fill='white')
    draw.line(pts + [pts[0]], fill='black', width=2)

# ── Playwright full-page screenshot ───────────────────────────────────────
async def get_full_page():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': TOTAL_W,
                                                'height': PAGE_H})
        # Use live site for authentic look, fallback to local
        for url in ['http://localhost:3000/ibuprofen?lang=en']:
            try:
                await page.goto(url, wait_until='networkidle', timeout=15000)
                break
            except:
                continue
        # Trigger reveal animations
        await page.evaluate("window.scrollTo(0,200)")
        await asyncio.sleep(0.6)
        await page.evaluate("window.scrollTo(0,0)")
        await asyncio.sleep(0.8)
        data = await page.screenshot(full_page=True)
        await browser.close()
        return data

# ── Scroll easing ─────────────────────────────────────────────────────────
def ease(t):
    """Ease-in-out cubic."""
    if t < 0.5:
        return 4*t*t*t
    return 1 - (-2*t+2)**3/2

# ── Main ──────────────────────────────────────────────────────────────────
def main():
    print("📸 Taking full-page screenshot...")
    loop = asyncio.get_event_loop()
    page_bytes = loop.run_until_complete(get_full_page())
    page_img = Image.open(io.BytesIO(page_bytes)).convert('RGB')
    # Scale to exact width
    if page_img.width != TOTAL_W:
        scale = TOTAL_W / page_img.width
        page_img = page_img.resize((TOTAL_W, int(page_img.height*scale)),
                                   Image.LANCZOS)
    print(f"   Page: {page_img.width}×{page_img.height}px")

    max_scroll = max(0, page_img.height - PAGE_H)
    total_frames = int(AUDIO_DURATION * FPS)

    # Scroll timeline (in seconds):
    # 0-2   : top of page (hold)
    # 2-97  : scroll down
    # 97-99 : bottom (hold)
    HOLD_TOP  = 2.0
    HOLD_BOT  = 2.0
    SCROLL_T  = AUDIO_DURATION - HOLD_TOP - HOLD_BOT

    # Cursor: drifts gently, mostly center-right
    # Starts at (1400, 600), slowly moves down with scroll
    def cursor_pos(t):
        # Gentle drift
        phase = t / AUDIO_DURATION
        cx = 1380 + 80*math.sin(t*0.3)
        # Follow scroll progress
        scroll_frac = max(0, min(1, (t-HOLD_TOP)/SCROLL_T)) if t > HOLD_TOP else 0
        cy_base = CHROME_H + 300 + scroll_frac * (PAGE_H - 400)
        cy = cy_base + 30*math.sin(t*0.7)
        return int(cx), int(cy)

    print(f"🎬 Generating {total_frames} frames → ffmpeg...")

    # Pipe raw RGB24 frames to ffmpeg
    cmd = [
        FFMPEG, '-y',
        '-f', 'rawvideo',
        '-pixel_format', 'rgb24',
        '-video_size', f'{TOTAL_W}x{TOTAL_H}',
        '-framerate', str(FPS),
        '-i', 'pipe:0',
        '-i', AUDIO,
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k',
        '-t', str(AUDIO_DURATION),
        '-shortest',
        OUTPUT
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    try:
        for fn in range(total_frames):
            t = fn / FPS

            # Compute scroll position
            if t <= HOLD_TOP:
                scroll_frac = 0.0
            elif t >= AUDIO_DURATION - HOLD_BOT:
                scroll_frac = 1.0
            else:
                scroll_frac = ease((t - HOLD_TOP) / SCROLL_T)
            scroll_y = int(scroll_frac * max_scroll)

            # Crop page viewport
            page_crop = page_img.crop((0, scroll_y, TOTAL_W, scroll_y + PAGE_H))

            # Composite full frame
            frame = Image.new('RGB', (TOTAL_W, TOTAL_H), '#F2F2F7')
            frame.paste(page_crop, (0, CHROME_H))

            draw = ImageDraw.Draw(frame)
            draw_browser_chrome(draw)
            draw_dock(draw)

            cx, cy = cursor_pos(t)
            draw_cursor(draw, cx, cy)

            # Send raw RGB bytes to ffmpeg
            proc.stdin.write(frame.tobytes())

            if fn % 125 == 0:
                pct = fn / total_frames * 100
                print(f"   {pct:.0f}% ({fn}/{total_frames})", end='\r')

        proc.stdin.close()
    except BrokenPipeError:
        pass

    _, stderr = proc.communicate()
    if proc.returncode == 0:
        size = os.path.getsize(OUTPUT)
        print(f"\n✅ guide-en.mp4 klar: {size/1024/1024:.1f} MB")
    else:
        print("\n❌ ffmpeg fejl:")
        print(stderr.decode()[-2000:])

if __name__ == '__main__':
    main()
