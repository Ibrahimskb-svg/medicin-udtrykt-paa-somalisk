"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Radio, Headphones, BookOpenText, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const DESIGN_OPTIONS = [
  {
    id: "ocean",
    label: "Design 1",
    name: "Klassisk SomaliMed",
    mood: "Tydelig, tillidsfuld og tæt på din nuværende stil",
    palette: "from-[#0f766e] via-[#12908a] to-[#2087c8]",
    surface: "bg-white",
    border: "border-white/15",
    text: "text-slate-950",
    muted: "text-slate-600",
    pill: "bg-white/14 text-white border-white/18",
    heroCard: "bg-white/10 border-white/16 text-white",
    ctaPrimary: "bg-white text-[#0f766e]",
    ctaSecondary: "border border-white/20 text-white",
    spotlight: "bg-gradient-to-br from-white to-[#ecfeff]",
    sectionTone: "bg-[#f4fbfc]",
    accent: "#12908a",
  },
  {
    id: "sand",
    label: "Design 2",
    name: "Ro og varme",
    mood: "Blødere, mere redaktionel og velegnet til foredrag",
    palette: "from-[#f0dfc5] via-[#f7efe0] to-[#d9ebe6]",
    surface: "bg-[#fffdf9]",
    border: "border-[#d9ccb8]",
    text: "text-[#33261d]",
    muted: "text-[#6f5a4a]",
    pill: "bg-white/75 text-[#5f4a3b] border-[#dccfbf]",
    heroCard: "bg-[#fffaf2]/78 border-[#dac8b2] text-[#33261d]",
    ctaPrimary: "bg-[#1b6f67] text-white",
    ctaSecondary: "border border-[#bca993] text-[#4e3d31]",
    spotlight: "bg-gradient-to-br from-[#fff8ed] to-[#edf7f5]",
    sectionTone: "bg-[#fbf7ef]",
    accent: "#1b6f67",
  },
  {
    id: "library",
    label: "Design 3",
    name: "Digital Maktabad",
    mood: "Mere markant og moderne til video, lyd og arkiv",
    palette: "from-[#10352d] via-[#0f5b52] to-[#113f70]",
    surface: "bg-[#081b19]",
    border: "border-white/10",
    text: "text-white",
    muted: "text-white/70",
    pill: "bg-white/8 text-white border-white/12",
    heroCard: "bg-white/6 border-white/10 text-white",
    ctaPrimary: "bg-[#f5c96b] text-[#1f2d2a]",
    ctaSecondary: "border border-white/14 text-white",
    spotlight: "bg-gradient-to-br from-[#0d2421] to-[#102d4f]",
    sectionTone: "bg-[#0a1716]",
    accent: "#f5c96b",
  },
];

const FUTURE_FORMATS = [
  {
    title: "Koran-videoer",
    meta: "Video",
    icon: Play,
  },
  {
    title: "Foredrag",
    meta: "Serie",
    icon: Radio,
  },
  {
    title: "Lydoptagelser",
    meta: "Audio",
    icon: Headphones,
  },
];

const CATEGORY_BLOCKS = [
  "Quran",
  "Tafsir",
  "Duco",
  "Foredrag",
  "Lydserier",
  "Nye udgivelser",
];

export function QuranHomepage() {
  const [activeDesign, setActiveDesign] = useState(DESIGN_OPTIONS[0]);

  return (
    <main className={`${activeDesign.sectionTone} min-h-screen`}>
      <section className={`relative overflow-hidden bg-gradient-to-br ${activeDesign.palette}`}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[-8rem] top-12 h-64 w-64 rounded-full bg-white/12 blur-3xl" />
          <div className="absolute right-[-4rem] top-24 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-1/3 h-80 w-80 rounded-full bg-emerald-200/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
          <header className="flex flex-col gap-5 rounded-[28px] border border-white/14 bg-white/8 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/somalimed-icon.svg"
                alt="Somalimed"
                width={52}
                height={52}
                className="rounded-2xl"
                priority
              />
              <div className="text-white">
                <div className="font-['Avenir_Next','Segoe_UI_Variable',sans-serif] text-3xl font-extrabold tracking-tight">
                  somalimed
                </div>
                <div className="text-sm text-white/72">Ny forside til koran, foredrag og lyd</div>
              </div>
            </Link>

            <nav className="flex flex-wrap gap-2 text-sm text-white/88">
              {["Forside", "Videoer", "Foredrag", "Lyd", "Arkiv"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/14 bg-white/8 px-4 py-2 font-medium"
                >
                  {item}
                </span>
              ))}
            </nav>
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl text-white">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${activeDesign.pill}`}>
                <BookOpenText size={16} />
                Designforslag til ny hjemmeside
              </div>

              <h1 className="mt-6 max-w-4xl font-['Avenir_Next','Segoe_UI_Variable',sans-serif] text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                En moderne platform til koran-videoer, foredrag og lydoptagelser.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
                Jeg har bygget forsiden som tre forskellige visuelle retninger, alle inspireret af dit nuværende udtryk:
                tydelig navigation, stærk hero-sektion og plads til kommende medieindhold.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className={`rounded-full px-5 py-3 text-sm font-semibold shadow-lg shadow-black/10 ${activeDesign.ctaPrimary}`}>
                  Vælg denne retning
                </button>
                <button className={`rounded-full px-5 py-3 text-sm font-semibold ${activeDesign.ctaSecondary}`}>
                  Vi lægger tekst ind bagefter
                </button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["3", "Designretninger"],
                  ["Video + lyd", "Fremtidigt fokus"],
                  ["SomaliMed DNA", "Bevaret visuelt"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-white/14 bg-white/8 px-5 py-4 backdrop-blur">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="mt-1 text-sm text-white/72">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[32px] border p-5 shadow-2xl shadow-slate-900/15 backdrop-blur ${activeDesign.heroCard}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-70">Udvalgt oplevelse</div>
                  <div className="mt-1 text-2xl font-bold">{activeDesign.name}</div>
                </div>
                <div
                  className="h-12 w-12 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at top, ${activeDesign.accent}, transparent 70%)`,
                  }}
                />
              </div>

              <div className="mt-6 rounded-[26px] border border-current/10 bg-black/10 p-4">
                <div className="flex items-center justify-between text-sm opacity-75">
                  <span>Forside-preview</span>
                  <span>Kun design, tekst kan skiftes senere</span>
                </div>

                <div className="mt-4 grid gap-3">
                  {FUTURE_FORMATS.map(({ title, meta, icon: Icon }, index) => (
                    <div
                      key={title}
                      className="flex items-center gap-4 rounded-[22px] border border-current/10 bg-white/8 px-4 py-4"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: index === 0 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm opacity-65">{meta}</div>
                        <div className="mt-1 text-base font-semibold">{title}</div>
                      </div>
                      <ArrowRight size={18} className="opacity-60" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700/80">
              Designvalg
            </div>
            <h2 className={`mt-3 font-['Avenir_Next','Segoe_UI_Variable',sans-serif] text-3xl font-bold tracking-tight ${activeDesign.text}`}>
              Vælg den stil, hjemmesiden skal bygges videre på
            </h2>
          </div>
          <p className={`max-w-2xl text-sm leading-7 ${activeDesign.muted}`}>
            Alle tre retninger er bygget til samme formål: en ren indgang til medieindhold med tydelig plads til hero,
            kategorier, udvalgte serier og seneste udgivelser.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {DESIGN_OPTIONS.map((option) => {
            const isActive = option.id === activeDesign.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveDesign(option)}
                className={`rounded-[28px] border p-5 text-left transition duration-200 ${
                  isActive
                    ? "border-transparent shadow-xl shadow-slate-900/10"
                    : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-slate-300"
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(140deg, ${option.accent}16, white 22%, white 100%)`,
                      }
                    : undefined
                }
              >
                <div className={`rounded-[22px] bg-gradient-to-br ${option.palette} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                      {option.label}
                    </span>
                    {isActive ? <CheckCircle2 size={18} /> : null}
                  </div>
                  <div className="mt-10 text-2xl font-bold">{option.name}</div>
                  <div className="mt-2 max-w-xs text-sm text-white/76">{option.mood}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        <div className={`overflow-hidden rounded-[36px] border shadow-xl shadow-slate-900/8 ${activeDesign.surface} ${activeDesign.border}`}>
          <div className={`grid gap-0 lg:grid-cols-[1.05fr_0.95fr]`}>
            <div className={`bg-gradient-to-br ${activeDesign.palette} px-6 py-8 text-white sm:px-8 sm:py-10`}>
              <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${activeDesign.pill}`}>
                Live preview
              </div>
              <h3 className="mt-6 max-w-xl font-['Avenir_Next','Segoe_UI_Variable',sans-serif] text-4xl font-black leading-tight">
                {activeDesign.id === "ocean" && "Klar og rolig landing page med høj genkendelighed fra SomaliMed."}
                {activeDesign.id === "sand" && "En varm og troværdig forside, der føles mere som et digitalt mediehus."}
                {activeDesign.id === "library" && "Et stærkt digitalt bibliotek med mere tyngde til video, lyd og serier."}
              </h3>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
                {activeDesign.id === "ocean" &&
                  "Denne retning ligger tættest på dit nuværende site og vil gøre overgangen nem for dine brugere."}
                {activeDesign.id === "sand" &&
                  "Her bliver hjemmesiden blødere og mere menneskelig, hvilket passer godt til foredrag, refleksion og lyd."}
                {activeDesign.id === "library" &&
                  "Denne retning gør platformen mere markant og giver indtryk af et større arkiv med meget medieindhold."}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Hero", "Kategorier", "Udvalgte serier"].map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/14 bg-white/8 px-4 py-4 backdrop-blur">
                    <div className="text-sm font-semibold">{item}</div>
                    <div className="mt-2 text-sm text-white/68">Klar plads i layoutet</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`px-6 py-8 sm:px-8 sm:py-10 ${activeDesign.text}`}>
              <div className="grid gap-6">
                <div className={`rounded-[28px] border p-5 ${activeDesign.spotlight} ${activeDesign.border}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-medium ${activeDesign.muted}`}>Fremhævet område</div>
                      <div className="mt-2 text-2xl font-bold">Seneste udgivelser</div>
                    </div>
                    <div
                      className="h-14 w-14 rounded-3xl"
                      style={{
                        background: `linear-gradient(145deg, ${activeDesign.accent}, transparent)`,
                      }}
                    />
                  </div>

                  <div className="mt-6 grid gap-3">
                    {FUTURE_FORMATS.map(({ title, meta, icon: Icon }) => (
                      <div key={title} className="flex items-center gap-4 rounded-[22px] bg-white/70 px-4 py-4 shadow-sm ring-1 ring-black/4">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                          style={{ backgroundColor: activeDesign.accent }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm ${activeDesign.muted}`}>{meta}</div>
                          <div className="mt-1 font-semibold">{title}</div>
                        </div>
                        <span className={`text-sm font-medium ${activeDesign.muted}`}>Snart</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className={`rounded-[28px] border p-5 ${activeDesign.border}`}>
                    <div className={`text-sm font-medium ${activeDesign.muted}`}>Kategorier</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {CATEGORY_BLOCKS.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/8 bg-black/[0.03] px-4 py-2 text-sm font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[28px] border p-5 ${activeDesign.border}`}>
                    <div className={`text-sm font-medium ${activeDesign.muted}`}>Layoutfokus</div>
                    <ul className="mt-4 space-y-3">
                      {[
                        "Stor hero med video eller featured foredrag",
                        "Karrusel eller grid til seneste indhold",
                        "Audioafspiller som tydeligt element",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-6">
                          <CheckCircle2 size={18} style={{ color: activeDesign.accent }} className="mt-1 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
