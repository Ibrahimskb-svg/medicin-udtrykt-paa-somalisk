"""
Genererer nyt arabisk lydspor til guide-ar.mp4
Stemme: ar-QA-MoazNeural (Qatar fusha-arabisk, rolig mandsstemme)
Varighed: ~99s

Alle 4 modaler TIDLIGT i starten (12-32s), derefter søgning og ibuprofen.
Teksten er KORT per segment så atempo aldrig behøver komprimere mere end 1.15x.
"""
import asyncio, subprocess, os, tempfile, sys

FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
VOICE  = 'ar-QA-MoazNeural'    # Qatar — fusha/ris-arabisk, rolig mandsstemme
RATE   = '+0%'                  # Normal tempo (ingen kunstig acceleration)
OUTPUT = '/tmp/ar_audio_new.m4a'

# Hvert segment: (start_s, slut_s, tekst)
# Tekst er tilpasset så naturlig TTS-varighed ≤ mål-varighed (ingen komprimering)
# Tom tekst = stilhed (f.eks. under navigation)
SEGMENTS = [
    # HERO
    (0,     12,    "مرحباً بكم في سوماليميد. في هذا الفيديو سنريكم كيفية استخدام الموقع خطوة بخطوة، حتى تتمكنوا من العثور على معلومات دوائية موثوقة بسهولة وسرعة."),

    # ALLE 4 MODALER I STARTEN (4s hver — kortere tekst)
    (12,    16,    "أنشأه إبراهيم ضاهر حنف، صيدلاني من الدنمارك."),
    (16,    20,    "هدفه مساعدة الصوماليين وعائلاتهم على فهم الأدوية."),
    (20,    24,    "يمكنكم الاطلاع على الأسئلة الشائعة هنا."),
    (24,    28,    "وللتواصل مع إبراهيم استخدموا زر التواصل."),

    # SPROGVÆLGER 8s — nok plads til alle fire sprognavne
    (28,    36,    "الموقع بأربع لغات: الصومالية والدنماركية والإنجليزية والعربية. اضغطوا على لغتكم."),

    # SØGEFELT
    (36,    40,    "أسفل اللغة ستجدون شريط البحث."),

    # SKRIV IBUPROFEN
    (40,    44,    "اكتبوا اسم أي دواء وستظهر النتائج فوراً."),

    # KATEGORIER
    (44,    58,    "يمكنكم أيضاً تصفح الأدوية حسب الفئة. ستجدون فئات مثل ضغط الدم والسكري والمضادات الحيوية وأمراض القلب. اضغطوا على فئة لتصفية الأدوية."),

    # IBUPROFEN-SIDE + LYDKNAP (AI-mand læser op)
    (58,    72,    "لقراءة معلومات دواء اضغطوا عليه. ستجدون معلومات عن الجرعة والآثار الجانبية. وإذا لم تستطيعوا القراءة يمكنكم الاستماع إلى تسجيل صوتي يقرأه رجل لكل الأدوية."),

    # NAVIGATION TIL FORSIDEN — ingen stilhed, mand taler videre
    (72,    75,    "والآن دعونا نعود إلى الصفحة الرئيسية."),

    # AFSLUTNING PÅ FORSIDEN
    (75,    88,    "سوماليميد يقدم معلومات طبية موثوقة مبنية على معرفة علمية متخصصة. يضم الموقع خمسة وعشرين دواءً شائعاً باللغات الأربع، مع شرح واضح وسهل لكل دواء."),
    (88,    99.19, "سوماليميد مجاني تماماً ولا يتطلب أي تسجيل. نأمل أن يكون مفيداً لكم ولعائلاتكم. شكراً جزيلاً لمشاهدتكم."),
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

async def make_segment(idx, start, end, text, tmpdir):
    target = end - start
    out    = os.path.join(tmpdir, f's{idx:02d}.wav')

    if not text.strip():
        ffmpeg_run('-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
                   '-t', f'{target:.4f}', out)
        print(f'  [{idx:02d}] {start:.0f}-{end:.1f}s  STILHED {target:.2f}s')
        return out

    mp3 = os.path.join(tmpdir, f's{idx:02d}_raw.mp3')
    await tts(text, mp3)
    actual = get_dur(mp3)
    ratio  = actual / target

    print(f'  [{idx:02d}] {start:.0f}-{end:.1f}s  TTS={actual:.2f}s  mål={target:.2f}s  ratio={ratio:.3f}')

    if ratio <= 1.0:
        # TTS kortere end mål → pad med stilhed bagpå
        wav_raw = out.replace('.wav', '_raw.wav')
        ffmpeg_run('-y', '-i', mp3, '-ar', '44100', '-ac', '1', wav_raw)
        pad = target - get_dur(wav_raw)
        if pad > 0.05:
            sil = out.replace('.wav', '_sil.wav')
            ffmpeg_run('-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
                       '-t', f'{pad:.4f}', sil)
            lst = out.replace('.wav', '_lst.txt')
            with open(lst, 'w') as f:
                f.write(f"file '{wav_raw}'\nfile '{sil}'\n")
            ffmpeg_run('-y', '-f', 'concat', '-safe', '0', '-i', lst, out)
        else:
            os.rename(wav_raw, out)
    elif ratio <= 1.20:
        # Let komprimering — acceptabelt (≤1.20x)
        ffmpeg_run('-y', '-i', mp3, '-ar', '44100', '-ac', '1',
                   '-af', f'atempo={ratio:.6f}', out)
    else:
        # For meget tekst — speed up men bevar forståelighed (maks 1.5x)
        clamped = min(ratio, 1.50)
        print(f'       ⚠ ratio {ratio:.3f} > 1.20 — klemmer til {clamped:.3f}x')
        ffmpeg_run('-y', '-i', mp3, '-ar', '44100', '-ac', '1',
                   '-af', f'atempo={clamped:.6f}', out)

    actual_out = get_dur(out)
    print(f'       → output: {actual_out:.3f}s')
    return out

async def main():
    try:
        import edge_tts
    except ImportError:
        print('❌  pip3 install edge-tts'); sys.exit(1)

    tmpdir = tempfile.mkdtemp(prefix='ar_tts_')
    print(f'Stemme: {VOICE}  rate: {RATE}')
    print(f'Temp:   {tmpdir}')
    print()

    wav_files = []
    for i, (start, end, text) in enumerate(SEGMENTS):
        f = await make_segment(i, start, end, text, tmpdir)
        wav_files.append(f)

    concat_lst = os.path.join(tmpdir, 'concat.txt')
    with open(concat_lst, 'w') as f:
        for wf in wav_files:
            f.write(f"file '{wf}'\n")

    combined = os.path.join(tmpdir, 'combined.wav')
    ffmpeg_run('-y', '-f', 'concat', '-safe', '0', '-i', concat_lst, combined)

    total = get_dur(combined)
    print(f'\nSamlet WAV: {total:.3f}s  (mål: 99.19s)')

    # M4A-container giver korrekte duration-tags
    ffmpeg_run('-y', '-i', combined, '-acodec', 'aac', '-b:a', '128k', OUTPUT)
    final = get_dur(OUTPUT)
    print(f'✅  Gemt: {OUTPUT}  ({final:.2f}s)')

asyncio.run(main())
