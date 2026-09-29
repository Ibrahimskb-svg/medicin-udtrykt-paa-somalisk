"""
Genererer de korte lydklip til "Dhegayso maalintaada" / "استمع ليومك"
(den daglige lyd-briefing i Min medicinliste). Samme stemmer/tempo som
sitets øvrige somaliske/arabiske lyd (se gen_so_audio.py / gen_ar_audio.py):
  so: so-SO-MuuseNeural, rate +3%
  ar: ar-QA-MoazNeural, rate +3%

Output: public/audio/briefing/<lang>/<key>.mp3 — normaliseret til 44100Hz
mono, så klippene lyder ens når de afspilles i forlængelse af hinanden
client-side (ingen sammensmeltning/concat her — det sker i browseren).
"""
import asyncio, json, os, subprocess, sys

FFMPEG = "/Users/ibrahimdahirhanaf/bin/ffmpeg"
OUT_ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "briefing")

VOICES = {"so": "so-SO-MuuseNeural", "ar": "ar-QA-MoazNeural"}
RATE = "+3%"

TIME_SLOTS = {
    "so": {"morning": "Subaxdii", "noon": "Duhurkii", "evening": "Fiidkii", "night": "Habeenkii"},
    "ar": {"morning": "الصباح", "noon": "الظهر", "evening": "المساء", "night": "الليل"},
}

PHRASES = {
    "so": {
        "intro": "Waxaad maanta qaadanaysaa:",
        "and": "iyo",
        "outro": "Kaasi waa jadwalkaaga maanta. Had iyo jeer la xiriir farmashiyaha ama dhakhtarka haddii aad shaki qabto.",
        "empty_list": "Wali ma darin daawo liiskaaga.",
        "empty_schedule": "Ugu yaraan calaamadi hal waqti oo daawo sare ah si aad jadwalkaaga u sameyso.",
        "warning_intro": "Fiiro gaar ah: waxaa jira isdhexgal la yaqaan oo ka dhexeeya",
    },
    "ar": {
        "intro": "اليوم عليك تناول:",
        "and": "و",
        "outro": "هذا هو جدولك لهذا اليوم. تواصل دائمًا مع الصيدلية أو الطبيب إذا كان لديك أي شك.",
        "empty_list": "لم تُضِف أي دواء إلى قائمتك بعد.",
        "empty_schedule": "ضع علامة على وقت واحد على الأقل لأحد الأدوية أعلاه لإنشاء جدولك.",
        "warning_intro": "تنبيه: هناك تفاعل معروف بين",
    },
}

with open("/tmp/briefing-names.json", "r", encoding="utf-8") as f:
    MEDICINES = json.load(f)


def ffmpeg_run(*args):
    return subprocess.run([FFMPEG, *args], capture_output=True, text=True)


async def tts_to_file(text, voice, out_path):
    import edge_tts
    tmp_mp3 = out_path + ".raw.mp3"
    comm = edge_tts.Communicate(text, voice, rate=RATE)
    await comm.save(tmp_mp3)
    ffmpeg_run("-y", "-i", tmp_mp3, "-ar", "44100", "-ac", "1", "-b:a", "96k", out_path)
    os.remove(tmp_mp3)


async def main():
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        print("pip3 install edge-tts"); sys.exit(1)

    total = 0
    for lang, voice in VOICES.items():
        out_dir = os.path.join(OUT_ROOT, lang)
        os.makedirs(out_dir, exist_ok=True)

        jobs = []
        for key, text in PHRASES[lang].items():
            jobs.append((key, text))
        for slot, text in TIME_SLOTS[lang].items():
            jobs.append((f"time_{slot}", text))
        for med in MEDICINES:
            jobs.append((f"name_{med['slug']}", med[lang]))

        for key, text in jobs:
            out_path = os.path.join(out_dir, f"{key}.mp3")
            print(f"[{lang}] {key}: {text!r}")
            await tts_to_file(text, voice, out_path)
            total += 1

    print(f"\nFærdig — {total} klip genereret i {OUT_ROOT}")


if __name__ == "__main__":
    asyncio.run(main())
