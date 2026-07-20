"""
Genererer nyt arabisk lydspor til guide-ar.mp4
Stemme: ar-QA-MoazNeural (Qatar fusha-arabisk, rolig mandsstemme), -10% tempo
Se gen_da_audio.py for arkitektur-forklaring. Inkluderer ekstra segment om
lydoplæsningsfunktionen, som kun findes på arabisk og somalisk.
"""
import asyncio, subprocess, os, tempfile, sys, json

FFMPEG = '/Users/ibrahimdahirhanaf/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
VOICE  = 'ar-QA-MoazNeural'
RATE   = '-10%'
OUTPUT = '/tmp/ar_audio_new.m4a'
MANIFEST = '/tmp/ar_timing.json'

SEGMENTS = [
    ("speech",  "مرحبًا بكم في سوماليميد. في هذا الفيديو سنوضح لكم كيفية استخدام الموقع خطوة بخطوة، لتتمكنوا من العثور بسرعة على معلومات دوائية موثوقة.", "hero"),
    ("silence", 0.6, "hero_pause"),
    ("speech",  "أعلى القائمة: 'نبذة عني' — إبراهيم ضاهر حنف، مساعد صيدلي مؤهل من الدنمارك.", "nav_me"),
    ("silence", 0.8, "nav_me_pause"),
    ("speech",  "'حول Somalimed' يوضح الهدف — مساعدة الناطقين بالصومالية وعائلاتهم على فهم أدويتهم.", "nav_site"),
    ("silence", 0.7, "nav_site_pause"),
    ("speech",  "'الأسئلة الشائعة' تجيب على الأسئلة المتكررة.", "nav_faq"),
    ("silence", 0.6, "nav_faq_pause"),
    ("speech",  "'تواصل' يتيح لكم الكتابة مباشرة إلى إبراهيم.", "nav_contact"),
    ("silence", 0.6, "nav_contact_pause"),
    ("speech",  "و'أدويتي' يفتح قائمة أدويتكم الخاصة — سنعود إليها بعد قليل.", "nav_mylist"),
    ("silence", 0.8, "nav_mylist_pause"),
    ("speech",  "أسفل القائمة يوجد مبدّل اللغة، بأربع لغات — الصومالية والدنماركية والإنجليزية والعربية.", "langsel"),
    ("silence", 0.8, "langsel_pause"),
    ("speech",  "أسفله تجدون شريط البحث.", "search_intro"),
    ("silence", 1.5, "search_scroll"),
    ("speech",  "اكتبوا اسم دوائكم — مثلاً إيبوبروفين.", "search_type_text"),
    ("silence", 3.2, "search_type_action"),
    ("speech",  "أو تصفّحوا حسب الفئة، مثل ضغط الدم أو السكري أو المضادات الحيوية أو أمراض القلب — اضغطوا على فئة لتصفية القائمة.", "categories"),
    ("silence", 1.8, "categories_pause"),
    ("speech",  "اضغطوا على دواء لفتح صفحته. هنا تجدون مبدّل اللغة مجددًا، فيمكنكم تغيير اللغة في أي وقت.", "click_med"),
    ("silence", 1.8, "click_med_load"),
    ("speech",  "أسفل مبدّل اللغة مباشرة توجد أربعة أزرار. الأول يشارك الصفحة مباشرة عبر واتساب.", "btn_whatsapp"),
    ("silence", 1.2, "btn_whatsapp_pause"),
    ("speech",  "الثاني يطبع صفحة الدواء — مفيد عند الطبيب أو الصيدلية.", "btn_print"),
    ("silence", 1.2, "btn_print_pause"),
    ("speech",  "الثالث يعرض رمز QR برابط مباشر للصفحة. يمكنكم طباعة الرمز كملصق لعلبة الدواء، أو نسخ الصورة إلى نظام آخر، أو إرساله برسالة نصية.", "btn_qr"),
    ("silence", 3.5, "btn_qr_demo"),
    ("speech",  "والزر الرابع يضيف الدواء إلى قائمتكم الخاصة.", "btn_addlist"),
    ("silence", 1.5, "btn_addlist_action"),
    ("speech",  "وهنا يمكنكم أيضًا الاستماع إلى تسجيل صوتي، حيث يقرأ رجل النص بصوت عالٍ لكم.", "audio_readout"),
    ("silence", 1.5, "audio_readout_action"),
    ("speech",  "أسفله تجدون نظرة عامة، بالإضافة إلى نصائح إبراهيم الخاصة وملاحظاته حول الدواء.", "overview"),
    ("silence", 1.5, "overview_scroll"),
    ("speech",  "أدناه أقسام مفصّلة عن الجرعة، الآثار الجانبية، التفاعلات، التحذيرات، وطريقة حفظ الدواء.", "sections"),
    ("silence", 2.0, "sections_scroll"),
    ("speech",  "في الأسفل تجدون المصادر وراء المعلومات، وأرقامًا مهمة مثل خط السموم و112، وتاريخ آخر تحديث.", "sources"),
    ("silence", 2.0, "sources_scroll"),
    ("speech",  "لنفتح الآن 'أدويتي' من القائمة. هنا يمكنكم البحث عن دوائكم، وتحديد ما تتناولونه، وإزالته مجددًا.", "mylist_modal"),
    ("silence", 4.0, "mylist_modal_demo"),
    ("speech",  "في أسفل القائمة يمكنكم طباعتها، لتتمكنوا بسهولة من عرضها على موظفي الصيدلية أو الطبيب.", "mylist_print"),
    ("silence", 2.0, "mylist_print_action"),
    ("speech",  "لنعد الآن إلى الصفحة الرئيسية.", "back_home"),
    ("silence", 1.5, "back_home_nav"),
    ("speech",  "يقدّم سوماليميد معلومات دوائية موثوقة مبنية على معرفة مهنية — مجانًا تمامًا وبدون الحاجة إلى تسجيل.", "closing1"),
    ("silence", 0.8, "closing1_pause"),
    ("speech",  "نأمل أن يكون مفيدًا لكم ولعائلاتكم. شكرًا جزيلاً لمتابعتكم.", "closing2"),
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

    tmpdir = tempfile.mkdtemp(prefix='ar_tts_')
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
