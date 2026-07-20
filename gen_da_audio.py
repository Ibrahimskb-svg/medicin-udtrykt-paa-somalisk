"""
Genererer nyt dansk lydspor til guide-da.mp4
Stemme: da-DK-JeppeNeural (mandsstemme), roligt tempo (-10%)

Naturlig TTS-varighed pr. segment + eksplicitte stilheds-pauser ved
skærm-handlinger (klik, scroll, modal, QR-generering osv.), i stedet for
at tvinge tale ind i forudbestemte tidsvinduer. Output er en JSON-tidsplan
(manifest) med de FAKTISKE start/slut-tidspunkter, som bruges direkte af
Playwright-optagelsesscriptet.
"""
import asyncio, subprocess, os, tempfile, sys, json

FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
VOICE  = 'da-DK-JeppeNeural'
RATE   = '+3%'
OUTPUT = '/tmp/da_audio_new.m4a'
MANIFEST = '/tmp/da_timing.json'

# ("speech", tekst, label) eller ("silence", sekunder, label)
SEGMENTS = [
    ("speech",  "Velkommen til Somalimed. Sådan bruger du hjemmesiden trin for trin, så du hurtigt finder pålidelig information om din medicin.", "hero"),
    ("silence", 0.6, "hero_pause"),
    ("speech",  "Øverst i menuen: 'Om mig' — Ibrahim Daahir Hanaf, uddannet farmakonom fra Danmark.", "nav_me"),
    ("silence", 0.8, "nav_me_pause"),
    ("speech",  "'Om Somalimed' fortæller om formålet — at hjælpe somaliere og deres familier med at forstå deres medicin.", "nav_site"),
    ("silence", 0.7, "nav_site_pause"),
    ("speech",  "Under 'Ofte stillede spørgsmål' finder du svar på det, du undrer dig over.", "nav_faq"),
    ("silence", 0.6, "nav_faq_pause"),
    ("speech",  "'Kontakt' lader dig skrive direkte til Ibrahim.", "nav_contact"),
    ("silence", 0.6, "nav_contact_pause"),
    ("speech",  "Og 'Min medicin' åbner din egen medicinliste — det vender vi tilbage til om lidt.", "nav_mylist"),
    ("silence", 0.8, "nav_mylist_pause"),
    ("speech",  "Under menuen finder du sprogvælgeren, med fire sprog — somalisk, dansk, engelsk og arabisk.", "langsel"),
    ("silence", 0.8, "langsel_pause"),
    ("speech",  "Herunder finder du søgefeltet.", "search_intro"),
    ("silence", 1.5, "search_scroll"),
    ("speech",  "Skriv navnet på din medicin — for eksempel ibuprofen.", "search_type_text"),
    ("silence", 3.2, "search_type_action"),
    ("speech",  "Eller browse efter kategori, som blodtryk, diabetes, antibiotika eller hjertesygdomme — tryk på en kategori for at filtrere listen.", "categories"),
    ("silence", 1.8, "categories_pause"),
    ("speech",  "Tryk på en medicin for at åbne dens side. Her finder du sprogvælgeren igen, så du kan skifte sprog undervejs.", "click_med"),
    ("silence", 1.8, "click_med_load"),
    ("speech",  "Lige under sprogvælgeren finder du fire knapper. Den første deler siden direkte via WhatsApp.", "btn_whatsapp"),
    ("silence", 1.2, "btn_whatsapp_pause"),
    ("speech",  "Den anden udskriver medicinsiden — praktisk at have med hos lægen eller på apoteket.", "btn_print"),
    ("silence", 1.2, "btn_print_pause"),
    ("speech",  "Den tredje viser en QR-kode med et direkte link til siden. Du kan printe koden som en label til medicinæsken, kopiere billedet ind i et andet system, eller sende den via sms.", "btn_qr"),
    ("silence", 3.5, "btn_qr_demo"),
    ("speech",  "Og den fjerde knap tilføjer medicinen til din egen liste.", "btn_addlist"),
    ("silence", 1.5, "btn_addlist_action"),
    ("speech",  "Herunder finder du et overblik samt Ibrahims egne råd og bemærkninger om medicinen.", "overview"),
    ("silence", 1.5, "overview_scroll"),
    ("speech",  "Længere nede finder du detaljerede afsnit om dosering, bivirkninger, interaktioner, advarsler, og hvordan medicinen skal opbevares.", "sections"),
    ("silence", 2.0, "sections_scroll"),
    ("speech",  "Nederst finder du kilderne bag informationen, vigtige numre som Giftlinjen og 112, samt datoen for seneste opdatering.", "sources"),
    ("silence", 2.0, "sources_scroll"),
    ("speech",  "Lad os nu åbne 'Min medicinliste' fra menuen. Her kan du søge efter din medicin, sætte flueben ved dem du tager, og fjerne dem igen.", "mylist_modal"),
    ("silence", 4.0, "mylist_modal_demo"),
    ("speech",  "Nederst i listen kan du printe den, så du nemt kan vise den til personalet på apoteket eller hos lægen.", "mylist_print"),
    ("silence", 2.0, "mylist_print_action"),
    ("speech",  "Lad os gå tilbage til forsiden.", "back_home"),
    ("silence", 1.5, "back_home_nav"),
    ("speech",  "Somalimed giver pålidelig medicininformation baseret på faglig viden — helt gratis og uden krav om oprettelse.", "closing1"),
    ("silence", 0.8, "closing1_pause"),
    ("speech",  "Vi håber, den er til hjælp for dig og din familie. Mange tak, fordi du så med.", "closing2"),
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

    tmpdir = tempfile.mkdtemp(prefix='da_tts_')
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
