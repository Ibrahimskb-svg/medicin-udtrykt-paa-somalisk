"""
Genererer nyt engelsk lydspor til guide-en.mp4
Stemme: en-US-ChristopherNeural, +3% TTS-rate + 8% ffmpeg atempo på
taledelen (ikke pauserne). Se gen_da_audio.py for arkitektur-forklaring.
"""
import asyncio, subprocess, os, tempfile, sys, json, ssl

FFMPEG   = '/usr/bin/ffmpeg'
VOICE    = 'en-US-ChristopherNeural'
RATE     = '+3%'
ATEMPO   = '1.08'
OUTPUT   = '/tmp/en_audio_new.m4a'
MANIFEST = '/tmp/en_timing.json'
CA_BUNDLE = '/root/.ccr/ca-bundle.crt'

SEGMENTS = [
    ("speech",  "Welcome to Somalimed — here's how to use the site step by step.", "hero"),
    ("silence", 0.3, "hero_pause"),
    ("speech",  "At the top: 'About me' — Ibrahim Daahir Hanaf, pharmaconomist from Denmark.", "nav_me"),
    ("silence", 0.3, "nav_me_pause"),
    ("speech",  "'About Somalimed' explains the purpose: helping Somalis understand their medicine.", "nav_site"),
    ("silence", 0.3, "nav_site_pause"),
    ("speech",  "'FAQ' answers the questions you're wondering about.", "nav_faq"),
    ("silence", 0.25, "nav_faq_pause"),
    ("speech",  "'Contact' lets you write directly to Ibrahim.", "nav_contact"),
    ("silence", 0.25, "nav_contact_pause"),
    ("speech",  "'My medicine' opens your own list — more on that shortly.", "nav_mylist"),
    ("silence", 0.3, "nav_mylist_pause"),
    ("speech",  "'Find a pharmacy' shows pharmacies where staff speak your language.", "nav_findpharmacy"),
    ("silence", 0.3, "nav_findpharmacy_pause"),
    ("speech",  "Contact, Find a pharmacy and the new 'Counter cards' are now grouped in one dropdown.", "nav_countercards"),
    ("silence", 0.4, "nav_countercards_pause"),
    ("speech",  "The language selector is now text in a dropdown, not flags — pick your language there.", "langsel"),
    ("silence", 0.4, "langsel_pause"),
    ("speech",  "Below that is the search bar.", "search_intro"),
    ("silence", 0.6, "search_scroll"),
    ("speech",  "Type the name of your medicine, for example ibuprofen.", "search_type_text"),
    ("silence", 0.8, "search_type_action"),
    ("speech",  "The microphone icon lets you search with your voice.", "voice_search"),
    ("silence", 0.6, "voice_search_action"),
    ("speech",  "You can also photograph the medicine box — Somalimed finds the page automatically.", "photo_search"),
    ("silence", 0.6, "photo_search_action"),
    ("speech",  "Or browse categories like blood pressure, diabetes, or heart disease.", "categories"),
    ("silence", 0.6, "categories_pause"),
    ("speech",  "Tap a medicine to open its page. The language selector still works here.", "click_med"),
    ("silence", 0.7, "click_med_load"),
    ("speech",  "First button: share the page via WhatsApp.", "btn_whatsapp"),
    ("silence", 0.4, "btn_whatsapp_pause"),
    ("speech",  "Second: print the page — handy at the doctor's.", "btn_print"),
    ("silence", 0.4, "btn_print_pause"),
    ("speech",  "Third: a QR code for the page — print, copy, or send it.", "btn_qr"),
    ("silence", 1.0, "btn_qr_demo"),
    ("speech",  "Fourth button: add the medicine to your list.", "btn_addlist"),
    ("silence", 0.5, "btn_addlist_action"),
    ("speech",  "'Remind me' sets up a daily calendar reminder.", "btn_remind"),
    ("silence", 0.5, "btn_remind_action"),
    ("speech",  "For medicine taken with food: a reminder aligned with Suhoor and Iftar.", "btn_prayer"),
    ("silence", 0.5, "btn_prayer_action"),
    ("speech",  "'Counter cards' are big cards you can show at the pharmacy without speaking the language.", "btn_countercards"),
    ("silence", 0.6, "btn_countercards_action"),
    ("speech",  "You can also have the page read aloud.", "audio_readout"),
    ("silence", 0.4, "audio_readout_action"),
    ("speech",  "Audio can now play faster: Normal, Faster, or Fastest.", "playback_speed"),
    ("silence", 0.5, "playback_speed_action"),
    ("speech",  "Below: an overview and Ibrahim's own advice.", "overview"),
    ("silence", 0.8, "overview_scroll"),
    ("speech",  "Further down: dosage, side effects, interactions, and storage.", "sections"),
    ("silence", 1.0, "sections_scroll"),
    ("speech",  "At the bottom: sources, the Poison Helpline, 112, and the last update.", "sources"),
    ("silence", 1.0, "sources_scroll"),
    ("speech",  "Open 'My medicine list' — search, check, and remove your medicine here.", "mylist_modal"),
    ("silence", 1.0, "mylist_modal_demo"),
    ("speech",  "Two or more medicines on the list? Somalimed shows interactions automatically — red for warnings, green for info.", "mylist_interact"),
    ("silence", 0.8, "mylist_interact_scroll"),
    ("speech",  "Selected combinations get an official assessment from the Danish Medicines Agency.", "mylist_paircheck"),
    ("silence", 1.0, "mylist_paircheck_scroll"),
    ("speech",  "Type a symptom, like dizziness, and check if it's a known side effect.", "symptom_check"),
    ("silence", 1.0, "symptom_check_action"),
    ("speech",  "'Is this serious?' helps you judge whether it needs urgent help.", "severity_check"),
    ("silence", 0.8, "severity_check_action"),
    ("speech",  "The homepage also has flashcards for key pharmacy words.", "glossary"),
    ("silence", 0.6, "glossary_pause"),
    ("speech",  "Print the list — now including dosage for each medicine.", "mylist_print"),
    ("silence", 0.6, "mylist_print_action"),
    ("speech",  "Back to the homepage.", "back_home"),
    ("silence", 0.4, "back_home_nav"),
    ("speech",  "Somalimed provides reliable medicine information — free, with no sign-up.", "closing1"),
    ("silence", 0.3, "closing1_pause"),
    ("speech",  "We hope it helps you and your family. Thank you for watching.", "closing2"),
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
    import edge_tts.communicate as _ec
    _ec._SSL_CTX = ssl.create_default_context(cafile=CA_BUNDLE)
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
    ffmpeg_run('-y', '-i', mp3, '-filter:a', f'atempo={ATEMPO}', '-ar', '44100', '-ac', '1', out)
    return out, get_dur(out)

async def main():
    try:
        import edge_tts
    except ImportError:
        print('❌  pip3 install edge-tts'); sys.exit(1)

    tmpdir = tempfile.mkdtemp(prefix='en_tts_')
    print(f'Stemme: {VOICE}  rate: {RATE}  atempo: {ATEMPO}')

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
