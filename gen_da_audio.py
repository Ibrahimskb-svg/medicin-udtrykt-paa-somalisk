"""
Genererer nyt dansk lydspor til guide-da.mp4
Stemme: da-DK-JeppeNeural (mandsstemme), +3% TTS-rate + 8% ffmpeg atempo
på taledelen (ikke pauserne) for et hurtigere, mere kompakt gennemsyn.

Naturlig TTS-varighed pr. segment + eksplicitte stilheds-pauser ved
skærm-handlinger (klik, scroll, modal, QR-generering osv.), i stedet for
at tvinge tale ind i forudbestemte tidsvinduer. Output er en JSON-tidsplan
(manifest) med de FAKTISKE start/slut-tidspunkter, som bruges direkte af
Playwright-optagelsesscriptet.
"""
import asyncio, subprocess, os, tempfile, sys, json, ssl

FFMPEG   = '/usr/bin/ffmpeg'
VOICE    = 'da-DK-JeppeNeural'
RATE     = '+3%'
ATEMPO   = '1.08'
OUTPUT   = '/tmp/da_audio_new.m4a'
MANIFEST = '/tmp/da_timing.json'
CA_BUNDLE = '/root/.ccr/ca-bundle.crt'

# ("speech", tekst, label) eller ("silence", sekunder, label)
SEGMENTS = [
    ("speech",  "Velkommen til SomaliMed — sådan bruger du siden trin for trin.", "hero"),
    ("silence", 0.3, "hero_pause"),
    ("speech",  "Øverst: 'Om mig' — Ibrahim Daahir Hanaf, farmakonom fra Danmark.", "nav_me"),
    ("silence", 0.3, "nav_me_pause"),
    ("speech",  "'Om SomaliMed' forklarer formålet: at hjælpe somaliere forstå deres medicin.", "nav_site"),
    ("silence", 0.3, "nav_site_pause"),
    ("speech",  "'Ofte stillede spørgsmål' svarer på det, du undrer dig over.", "nav_faq"),
    ("silence", 0.25, "nav_faq_pause"),
    ("speech",  "'Kontakt' lader dig skrive direkte til Ibrahim.", "nav_contact"),
    ("silence", 0.25, "nav_contact_pause"),
    ("speech",  "'Min medicin' åbner din egen liste — mere om det senere.", "nav_mylist"),
    ("silence", 0.3, "nav_mylist_pause"),
    ("speech",  "'Find apotek' viser apoteker, hvor personalet taler dit sprog.", "nav_findpharmacy"),
    ("silence", 0.3, "nav_findpharmacy_pause"),
    ("speech",  "Kontakt, Find apotek og nye 'Skranke-kort' er nu samlet i én dropdown.", "nav_countercards"),
    ("silence", 0.4, "nav_countercards_pause"),
    ("speech",  "Sprogvælgeren er nu tekst i en dropdown, ikke flag — vælg dit sprog der.", "langsel"),
    ("silence", 0.4, "langsel_pause"),
    ("speech",  "Herunder finder du søgefeltet.", "search_intro"),
    ("silence", 0.6, "search_scroll"),
    ("speech",  "Skriv navnet på din medicin, for eksempel ibu-pro-fen.", "search_type_text"),
    ("silence", 0.8, "search_type_action"),
    ("speech",  "Mikrofon-ikonet lader dig søge med din stemme.", "voice_search"),
    ("silence", 0.6, "voice_search_action"),
    ("speech",  "Du kan også fotografere medicinæsken — SomaliMed finder siden automatisk.", "photo_search"),
    ("silence", 0.6, "photo_search_action"),
    ("speech",  "Eller browse kategorier som blodtryk, diabetes eller hjertesygdomme.", "categories"),
    ("silence", 0.6, "categories_pause"),
    ("speech",  "Tryk på en medicin for at åbne siden. Sprogvælgeren virker stadig her.", "click_med"),
    ("silence", 0.7, "click_med_load"),
    ("speech",  "Første knap: del siden via WhatsApp.", "btn_whatsapp"),
    ("silence", 0.4, "btn_whatsapp_pause"),
    ("speech",  "Anden: udskriv siden — praktisk hos lægen.", "btn_print"),
    ("silence", 0.4, "btn_print_pause"),
    ("speech",  "Tredje: en QR-kode til siden — print, kopiér eller send den.", "btn_qr"),
    ("silence", 1.0, "btn_qr_demo"),
    ("speech",  "Fjerde knap: tilføj medicinen til din liste.", "btn_addlist"),
    ("silence", 0.5, "btn_addlist_action"),
    ("speech",  "'Påmind mig' sætter en daglig kalenderpåmindelse op.", "btn_remind"),
    ("silence", 0.5, "btn_remind_action"),
    ("speech",  "Til medicin med mad: en påmindelse tilpasset Suhoor og Iftar.", "btn_prayer"),
    ("silence", 0.5, "btn_prayer_action"),
    ("speech",  "'Skranke-kort' er store kort, du kan vise frem i apoteket uden at tale sproget.", "btn_countercards"),
    ("silence", 0.6, "btn_countercards_action"),
    ("speech",  "Herunder: et overblik og Ibrahims egne råd.", "overview"),
    ("silence", 0.8, "overview_scroll"),
    ("speech",  "Længere nede: dosering, bivirkninger, interaktioner og opbevaring.", "sections"),
    ("silence", 1.0, "sections_scroll"),
    ("speech",  "Nederst: kilder, Giftlinjen, 112 og seneste opdatering.", "sources"),
    ("silence", 1.0, "sources_scroll"),
    ("speech",  "Åbn 'Min medicinliste' — søg, afkryds og fjern din medicin her.", "mylist_modal"),
    ("silence", 1.0, "mylist_modal_demo"),
    ("speech",  "Flere medicin på listen? SomaliMed viser automatisk interaktioner — rødt for advarsler, grønt for info.", "mylist_interact"),
    ("silence", 0.8, "mylist_interact_scroll"),
    ("speech",  "Udvalgte kombinationer får en officiel vurdering fra Lægemiddelstyrelsen.", "mylist_paircheck"),
    ("silence", 1.0, "mylist_paircheck_scroll"),
    ("speech",  "Skriv et symptom, som svimmelhed, og tjek om det er en kendt bivirkning.", "symptom_check"),
    ("silence", 1.0, "symptom_check_action"),
    ("speech",  "'Er dette alvorligt?' hjælper dig vurdere, om det kræver akut hjælp.", "severity_check"),
    ("silence", 0.8, "severity_check_action"),
    ("speech",  "Forsiden har også flashcards med vigtige apoteksord.", "glossary"),
    ("silence", 0.6, "glossary_pause"),
    ("speech",  "Print listen — nu med dosering på hver medicin.", "mylist_print"),
    ("silence", 0.6, "mylist_print_action"),
    ("speech",  "Tilbage til forsiden.", "back_home"),
    ("silence", 0.4, "back_home_nav"),
    ("speech",  "SomaliMed giver pålidelig medicininformation — gratis, uden oprettelse.", "closing1"),
    ("silence", 0.3, "closing1_pause"),
    ("speech",  "Vi håber, det hjælper dig og din familie. Tak, fordi du så med.", "closing2"),
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

    tmpdir = tempfile.mkdtemp(prefix='da_tts_')
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
