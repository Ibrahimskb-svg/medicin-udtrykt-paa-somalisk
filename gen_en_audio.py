"""
Genererer nyt engelsk lydspor til guide-en.mp4
Stemme: en-US-ChristopherNeural (rolig, professionel mandsstemme), -10% tempo
Se gen_da_audio.py for arkitektur-forklaring.
"""
import asyncio, subprocess, os, tempfile, sys, json

FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
VOICE  = 'en-US-ChristopherNeural'
RATE   = '+3%'
OUTPUT = '/tmp/en_audio_new.m4a'
MANIFEST = '/tmp/en_timing.json'

SEGMENTS = [
    ("speech",  "Welcome to Somalimed. Here's how to use the site step by step, so you can quickly find reliable information about your medicine.", "hero"),
    ("silence", 0.6, "hero_pause"),
    ("speech",  "At the top of the menu: 'About me' — Ibrahim Daahir Hanaf, Pharmaconomist and chemist from Denmark.", "nav_me"),
    ("silence", 0.8, "nav_me_pause"),
    ("speech",  "'About Somalimed' explains the purpose — helping Somali speakers and their families understand their medicine.", "nav_site"),
    ("silence", 0.7, "nav_site_pause"),
    ("speech",  "'FAQ' answers frequently asked questions.", "nav_faq"),
    ("silence", 0.6, "nav_faq_pause"),
    ("speech",  "'Contact' lets you write directly to Ibrahim.", "nav_contact"),
    ("silence", 0.6, "nav_contact_pause"),
    ("speech",  "And 'My medicine' opens your own medicine list — we'll come back to that shortly.", "nav_mylist"),
    ("silence", 0.8, "nav_mylist_pause"),
    ("speech",  "Below the menu is the language selector, with four languages — Somali, Danish, English, and Arabic.", "langsel"),
    ("silence", 0.8, "langsel_pause"),
    ("speech",  "Below that, you'll find the search bar.", "search_intro"),
    ("silence", 1.5, "search_scroll"),
    ("speech",  "Type the name of your medicine — for example eye-byoo-pro-fen.", "search_type_text"),
    ("silence", 3.2, "search_type_action"),
    ("speech",  "Or browse by category, such as blood pressure, diabetes, antibiotics, or heart disease — tap a category to filter the list.", "categories"),
    ("silence", 1.8, "categories_pause"),
    ("speech",  "Tap a medicine to open its page. Here you'll find the language selector again, so you can switch language anytime.", "click_med"),
    ("silence", 1.8, "click_med_load"),
    ("speech",  "Right below the language selector are four buttons. The first shares the page directly via WhatsApp.", "btn_whatsapp"),
    ("silence", 1.2, "btn_whatsapp_pause"),
    ("speech",  "The second prints the medicine page — handy to have at the doctor's or the pharmacy.", "btn_print"),
    ("silence", 1.2, "btn_print_pause"),
    ("speech",  "The third shows a QR code with a direct link to the page. You can print the code as a label for the medicine box, copy the image into another system, or send it via SMS.", "btn_qr"),
    ("silence", 3.5, "btn_qr_demo"),
    ("speech",  "And the fourth button adds the medicine to your own list.", "btn_addlist"),
    ("silence", 1.5, "btn_addlist_action"),
    ("speech",  "Below that, you'll find an overview along with Ibrahim's own advice and remarks about the medicine.", "overview"),
    ("silence", 1.5, "overview_scroll"),
    ("speech",  "Further down are detailed sections on dosage, side effects, interactions, warnings, and how to store the medicine.", "sections"),
    ("silence", 2.0, "sections_scroll"),
    ("speech",  "At the bottom, you'll find the sources behind the information, important numbers like the Poison Helpline and 112, and the date it was last updated.", "sources"),
    ("silence", 2.0, "sources_scroll"),
    ("speech",  "Now let's open 'My medicine list' from the menu. Here you can search for your medicine, check off the ones you take, and remove them again.", "mylist_modal"),
    ("silence", 4.0, "mylist_modal_demo"),
    ("speech",  "At the bottom of the list you can print it, so you can easily show it to staff at the pharmacy or the doctor's.", "mylist_print"),
    ("silence", 2.0, "mylist_print_action"),
    ("speech",  "Let's go back to the homepage.", "back_home"),
    ("silence", 1.5, "back_home_nav"),
    ("speech",  "Somalimed provides reliable medicine information based on professional knowledge — completely free and with no sign-up required.", "closing1"),
    ("silence", 0.8, "closing1_pause"),
    ("speech",  "We hope it's helpful to you and your family. Thank you very much for watching.", "closing2"),
]

def ffmpeg_run(*args):
    return subprocess.run([FFMPEG, *args], capture_output=True, text=True)

def get_dur(path):
    r = ffmpeg_run('-i', path)
    for line in r.stderr.split('\n'):
        if 'Duration:' in line:
            t = line.split('Duration:')[1].split(',')[0].strip()
            h, m, s = t.split(':')
            return float(h)*3600 + float(m)*60 + float(s)
    return 0.0

async def tts(text, path):
    import edge_tts
    comm = edge_tts.Communicate(text, VOICE, rate=RATE)
    await comm.save(path)

async def make_piece(idx, kind, val, tmpdir):
    out = os.path.join(tmpdir, f's{idx:03d}.wav')
    if kind == "silence":
        ffmpeg_run('-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
                   '-t', f'{val:.4f}', out)
        return out, val
    mp3 = os.path.join(tmpdir, f's{idx:03d}.mp3')
    await tts(val, mp3)
    ffmpeg_run('-y', '-i', mp3, '-ar', '44100', '-ac', '1', out)
    return out, get_dur(out)

async def main():
    try:
        import edge_tts
    except ImportError:
        print('❌  pip3 install edge-tts'); sys.exit(1)

    tmpdir = tempfile.mkdtemp(prefix='en_tts_')
    print(f'Stemme: {VOICE}  rate: {RATE}')

    wav_files = []
    timeline = []
    cursor = 0.0
    for i, (kind, val, label) in enumerate(SEGMENTS):
        path, dur = await make_piece(i, kind, val, tmpdir)
        wav_files.append(path)
        start = cursor
        end = cursor + dur
        timeline.append({"label": label, "kind": kind, "start": round(start, 3), "end": round(end, 3)})
        tag = f'"{val[:40]}..."' if kind == "speech" else f'{val}s silence'
        print(f'  [{i:03d}] {start:7.2f}-{end:7.2f}s  {label:22s} {tag}')
        cursor = end

    concat_lst = os.path.join(tmpdir, 'concat.txt')
    with open(concat_lst, 'w') as f:
        for wf in wav_files:
            f.write(f"file '{wf}'\n")

    combined = os.path.join(tmpdir, 'combined.wav')
    ffmpeg_run('-y', '-f', 'concat', '-safe', '0', '-i', concat_lst, combined)

    total = get_dur(combined)
    print(f'\nSamlet varighed: {total:.3f}s ({total/60:.2f} min)')

    ffmpeg_run('-y', '-i', combined, '-acodec', 'aac', '-b:a', '128k', OUTPUT)
    final = get_dur(OUTPUT)
    print(f'✅  Lyd gemt: {OUTPUT}  ({final:.2f}s)')

    with open(MANIFEST, 'w') as f:
        json.dump({"total": final, "timeline": timeline}, f, indent=2, ensure_ascii=False)
    print(f'✅  Tidsplan gemt: {MANIFEST}')

asyncio.run(main())
