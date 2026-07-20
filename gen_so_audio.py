"""
Genererer nyt somalisk lydspor til guide-so.mp4
Stemme: so-SO-MuuseNeural (eneste somaliske mandsstemme i Microsofts system),
tempo +3% (skarpere/mere naturligt end tidligere -10% opbremsning).

Tekst er brugerens egen (native speaker) korrektur af manuskriptet — ikke
oversat/omskrevet af Claude. Se gen_da_audio.py for arkitektur-forklaring.
"""
import asyncio, subprocess, os, tempfile, sys, json

FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
VOICE  = 'so-SO-MuuseNeural'
RATE   = '+3%'
OUTPUT = '/tmp/so_audio_new.m4a'
MANIFEST = '/tmp/so_timing.json'

SEGMENTS = [
    ("speech",  "Ku soo dhawoow Somalimed. Muuqaalkan wuxuu ku tusayaa, tallaabo tallaabo, sida loo isticmaalo boggan si aad si fudud oo degdeg ah ugu hesho macluumaad daawo oo la isku halayn karo.", "hero"),
    ("silence", 0.4, "hero_pause"),
    ("speech",  "Dusha sare ee bogga waxaad ka heli doontaa \"Ku Saabsan Aniga\", halkaas oo aad ka akhrisan karto xog ku saabsan farmashiiste Ibraahim Dahir Xanaf, oo wax ku bartay kana qalin jabiyay Danmark.", "nav_me"),
    ("silence", 0.5, "nav_me_pause"),
    ("speech",  "Qaybta \"Ku Saabsan Somalimed\" waxay sharxaysaa ujeeddada boggan, oo ah in dadka ku hadla af-Soomaaliga iyo qoysaskoodu ay si fudud u fahmaan daawooyinkooda iyo isticmaalkooda.", "nav_site"),
    ("silence", 0.4, "nav_site_pause"),
    ("speech",  "Qaybta \"Su'aalaha Inta Badan La Isweydiiyo\" waxaad ka heli doontaa jawaabaha su'aalaha ugu badan ee la iska weydiiyo.", "nav_faq"),
    ("silence", 0.4, "nav_faq_pause"),
    ("speech",  "Qaybta \"Xiriir\" waxay kuu oggolaanaysaa inaad si toos ah ula xiriirto Ibraahim.", "nav_contact"),
    ("silence", 0.4, "nav_contact_pause"),
    ("speech",  "Qaybta \"Daawooyinkayga\" waxay kuu furaysaa liiskaaga gaarka ah ee daawooyinka. Qaybtan dib ayaan uga hadli doonnaa.", "nav_mylist"),
    ("silence", 0.5, "nav_mylist_pause"),
    ("speech",  "Hoosta menu-ga waxaad ka heli doontaa badhanka beddelka luqadda, kaas oo kuu oggolaanaya inaad doorato af-Soomaali, Deenish, Ingiriisi ama Carabi.", "langsel"),
    ("silence", 0.5, "langsel_pause"),
    ("speech",  "Wax yar ka hooseeya waxaa ku yaal sanduuqa raadinta.", "search_intro"),
    ("silence", 1.0, "search_scroll"),
    ("speech",  "Waxaad geli kartaa magaca daawadaada, tusaale ahaan Ibuprofen.", "search_type_text"),
    ("silence", 2.6, "search_type_action"),
    ("speech",  "Sidoo kale waxaad ka dhex raadin kartaa qaybaha kala duwan, sida daawooyinka dhiig-karka, sonkorowga, antibiyootigyada ama cudurrada wadnaha. Riix qayb kasta si aad u shaandhayso liiska daawooyinka.", "categories"),
    ("silence", 1.2, "categories_pause"),
    ("speech",  "Markaad gujiso daawo, waxaa kuu furmaya boggeeda. Halkaas waxaad mar kale ka heli doontaa badhanka beddelka luqadda, si aad luqadda ugu beddesho wakhti kasta.", "click_med"),
    ("silence", 1.3, "click_med_load"),
    ("speech",  "Isla hoosta badhanka luqadda waxaa ku yaal afar badhan: badhanka koowaad wuxuu kuu oggolaanayaa inaad bogga si toos ah ula wadaagto WhatsApp.", "btn_whatsapp"),
    ("silence", 0.8, "btn_whatsapp_pause"),
    ("speech",  "Badhanka labaad wuxuu kuu oggolaanayaa inaad daabacdo bogga daawada, taas oo faa'iido leh markaad booqanayso dhakhtarka ama farmashiyaha.", "btn_print"),
    ("silence", 0.8, "btn_print_pause"),
    ("speech",  "Badhanka saddexaad wuxuu soo bandhigayaa koodhka QR ee ku xiran bogga daawada. Waxaad u daabacan kartaa summad aad ku dhejiso sanduuqa daawada, waxaad koobiyayn kartaa sawirka, ama waxaad ugu diri kartaa qof kale fariin ahaan.", "btn_qr"),
    ("silence", 2.5, "btn_qr_demo"),
    ("speech",  "Badhanka afraad wuxuu daawada ku darayaa liiskaaga gaarka ah ee daawooyinka.", "btn_addlist"),
    ("silence", 1.0, "btn_addlist_action"),
    ("speech",  "Waxaad sidoo kale dhageysan kartaa cod duuban oo qoraalka oo dhan si cad kuugu akhrinaya.", "audio_readout"),
    ("silence", 1.0, "audio_readout_action"),
    ("speech",  "Hoosta waxaad ka heli doontaa dulmar guud oo ku saabsan daawada, iyo sidoo kale talooyinka iyo faallooyinka gaarka ah ee Ibraahim.", "overview"),
    ("silence", 1.0, "overview_scroll"),
    ("speech",  "Intaa ka dib waxaa ku xiga qaybo faahfaahsan oo sharxaya sida daawada loo qaato, waxyeellooyinka suurtagalka ah, isdhexgalka daawooyinka kale, digniinaha muhiimka ah iyo habka saxda ah ee loo kaydiyo daawada.", "sections"),
    ("silence", 1.5, "sections_scroll"),
    ("speech",  "Qeybta ugu hooseysa ee bogga waxaad ka heli doontaa ilaha macluumaadka, lambarrada muhiimka ah sida Khadka Sunta iyo 112, iyo taariikhda markii ugu dambeysay ee bogga la cusboonaysiiyay.", "sources"),
    ("silence", 1.5, "sources_scroll"),
    ("speech",  "Hadda aan furno qaybta \"Daawooyinkayga\". Halkaas waxaad ka raadin kartaa daawooyinkaaga, waxaad calaamadin kartaa kuwa aad isticmaasho, isla markaana waad ka saari kartaa marka loo baahdo.", "mylist_modal"),
    ("silence", 3.0, "mylist_modal_demo"),
    ("speech",  "Qeybta ugu hooseysa ee liiska waxaad ka heli doontaa badhanka daabacaadda, si aad si fudud ugu tusi karto liiska daawooyinkaaga farmashiistaha ama dhakhtarka.", "mylist_print"),
    ("silence", 1.5, "mylist_print_action"),
    ("speech",  "Hadda aan ku noqonno bogga hore.", "back_home"),
    ("silence", 1.0, "back_home_nav"),
    ("speech",  "Somalimed wuxuu ku siinayaa macluumaad daawo oo sax ah, la isku halayn karo, kuna salaysan aqoon xirfadeed. Adeeggu waa bilaash, mana jiro wax isdiiwaangelin ama gelitaan loo baahan yahay.", "closing1"),
    ("silence", 0.5, "closing1_pause"),
    ("speech",  "Waxaan rajaynaynaa in Somalimed uu waxtar kuu noqon doono adiga iyo qoyskaagaba. Aad baad ugu mahadsan tahay daawashada.", "closing2"),
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
