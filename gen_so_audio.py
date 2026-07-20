"""
Genererer nyt somalisk lydspor til guide-so.mp4
Stemme: so-SO-MuuseNeural (mandsstemme), -10% tempo
Se gen_da_audio.py for arkitektur-forklaring. Inkluderer ekstra segment om
lydoplæsningsfunktionen, som kun findes på arabisk og somalisk.

VENTER PÅ BRUGER-GODKENDELSE AF SOMALISK TEKST FØR KØRSEL.
"""
import asyncio, subprocess, os, tempfile, sys, json

FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
VOICE  = 'so-SO-MuuseNeural'
RATE   = '-10%'
OUTPUT = '/tmp/so_audio_new.m4a'
MANIFEST = '/tmp/so_timing.json'

SEGMENTS = [
    ("speech",  "Ku soo dhawoow Somalimed. Muuqaalkan wuxuu ku tusayaa sida aad u isticmaasho boggan tallaabo tallaabo, si aad si degdeg ah macluumaad daawo oo la isku halayn karo u hesho.", "hero"),
    ("silence", 0.6, "hero_pause"),
    ("speech",  "Sare bogga: 'Ku saabsan aniga' — Ibraahim Dahir Hanaf, oo ah farmakoonoomi qalin ah oo ka soo baxay Denmark.", "nav_me"),
    ("silence", 0.8, "nav_me_pause"),
    ("speech",  "'Ku saabsan Somalimed' wuxuu sharaxayaa ujeeddada — caawinta dadka ku hadla Soomaaliga iyo qoysaskooda si ay u fahmaan daawooyinkooda.", "nav_site"),
    ("silence", 0.7, "nav_site_pause"),
    ("speech",  "'Su'aalaha' waxeey ka turjumaan su'aalaha inta badan la isweydiiyo.", "nav_faq"),
    ("silence", 0.6, "nav_faq_pause"),
    ("speech",  "'Xiriir' wuxuu kuu ogolaanayaa inaad si toos ah ula soo xiriirto Ibraahim.", "nav_contact"),
    ("silence", 0.6, "nav_contact_pause"),
    ("speech",  "'Daawooyinkayga' waxay kuu furaysaa liiskaaga daawooyinka gaarka ah — waan ku soo noqon doonaa tan hadhow.", "nav_mylist"),
    ("silence", 0.8, "nav_mylist_pause"),
    ("speech",  "Hoosta menu-ga waxaad ka heli doontaa badalaha luqadda, oo leh afar luqadood — Soomaali, Deenish, Ingiriis iyo Caraabi.", "langsel"),
    ("silence", 0.8, "langsel_pause"),
    ("speech",  "Hoosta taas waxaad ka heli doontaa sanduuqa raadinta.", "search_intro"),
    ("silence", 1.5, "search_scroll"),
    ("speech",  "Qor magaca daawadaada — tusaale ahaan ibuprofen.", "search_type_text"),
    ("silence", 3.2, "search_type_action"),
    ("speech",  "Ama u kala eeg qaybaha, sida cadaadiska dhiigga, sonkorowga, antibiyootikada, ama xanuunnada wadnaha — riix qayb si aad liiska u shaandheyso.", "categories"),
    ("silence", 1.8, "categories_pause"),
    ("speech",  "Riix daawo si aad u furto boggeeda. Halkan ayaad mar kale ka heli doontaa badalaha luqadda, si aad wakhti kasta luqadda u bedesho.", "click_med"),
    ("silence", 1.8, "click_med_load"),
    ("speech",  "Hoos badalaha luqadda si toos ah waxaad ka heli doontaa afar badhan. Kii ugu horreeyay wuxuu si toos ah ugu wadaagaa bogga WhatsApp.", "btn_whatsapp"),
    ("silence", 1.2, "btn_whatsapp_pause"),
    ("speech",  "Kii labaad wuxuu daabacaa bogga daawada — waxtar leh markaad joogto dhakhtarka ama farmashiga.", "btn_print"),
    ("silence", 1.2, "btn_print_pause"),
    ("speech",  "Kii saddexaad wuxuu tusayaa koodh QR oo si toos ah ugu xiran bogga. Waxaad u daabici kartaa summad loogu talagalay sanduuqa daawada, u koobiyeyn kartaa sawirka nidaam kale, ama u diri kartaa fariin qoraal ah.", "btn_qr"),
    ("silence", 3.5, "btn_qr_demo"),
    ("speech",  "Badhanka afaraad wuxuu daawada ku daraa liiskaaga gaarka ah.", "btn_addlist"),
    ("silence", 1.5, "btn_addlist_action"),
    ("speech",  "Halkan waxaad sidoo kale dhageysan kartaa duub cod ah, oo nin ku akhriyo qoraalka si cad kuugu.", "audio_readout"),
    ("silence", 1.5, "audio_readout_action"),
    ("speech",  "Hoosta waxaad ka heli doontaa guudmar, iyo sidoo kale talooyinka gaarka ah iyo faallooyinka Ibraahim ee ku saabsan daawada.", "overview"),
    ("silence", 1.5, "overview_scroll"),
    ("speech",  "Hoos ka bax waxaa ku yaal qaybo faahfaahsan oo ku saabsan qaadashada, waxyeelaha dhinaca, isdhexgalka, digniinaha, iyo sida daawada loo kaydiyo.", "sections"),
    ("silence", 2.0, "sections_scroll"),
    ("speech",  "Bogga meesha ugu hoosaysa waxaad ka heli doontaa ilaha macluumaadka, lambarrada muhiimka ah sida Khadka Sunta iyo 112, iyo taariikhda cusbooneysiinta ugu dambeysay.", "sources"),
    ("silence", 2.0, "sources_scroll"),
    ("speech",  "Aan hadda ka furno 'Daawooyinkayga' menu-ga. Halkan waxaad ka raadin kartaa daawadaada, calaamadin kartaa kuwa aad qaadanayso, oo mar kale ka saari kartaa.", "mylist_modal"),
    ("silence", 4.0, "mylist_modal_demo"),
    ("speech",  "Ugu hoosaysa liiska waxaad daabici kartaa, si aad si fudud ugu tusto shaqaalaha farmashiga ama dhakhtarka.", "mylist_print"),
    ("silence", 2.0, "mylist_print_action"),
    ("speech",  "Aynu hadda ku noqonno bogga hore.", "back_home"),
    ("silence", 1.5, "back_home_nav"),
    ("speech",  "Somalimed wuxuu bixiyaa macluumaad daawo oo la isku halayn karo, oo ku salaysan aqoon xirfadeed — bilaash ah oo aan qoraal loo baahnayn.", "closing1"),
    ("silence", 0.8, "closing1_pause"),
    ("speech",  "Waxaan rajeyneynaa inuu waxtar kuu leeyahay adiga iyo qoyskaaga. Aad baad ugu mahadsan tahay daawashada.", "closing2"),
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

    tmpdir = tempfile.mkdtemp(prefix='so_tts_')
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
