import DK from "country-flag-icons/react/3x2/DK";
import GB from "country-flag-icons/react/3x2/GB";
import SO from "country-flag-icons/react/3x2/SO";
import SY from "country-flag-icons/react/3x2/SY";

// Emoji-flag (🇩🇰 osv.) rendres som bogstavkoder ("DK") på Windows, fordi
// Windows' emoji-skrifttype mangler flag-glyferne. Rigtige SVG'er undgår det.
//
// Arabisk-flaget er Syrien, ikke Saudi-Arabien — Fusha (standard-arabisk) er
// ikke noget enkelt land taler som hverdagssprog, så et hvilket som helst
// flag er i sagens natur symbolsk. Syrien er valgt fordi det er den klart
// største arabisktalende flygtninge-/indvandrergruppe i Danmark, hvilket
// giver mere mening for sitets faktiske brugere end Saudi-Arabien.
const FLAG_BY_LANGUAGE = { so: SO, da: DK, en: GB, ar: SY };

// Flagene klippes til en cirkel (i stedet for det rå 3:2-rektangel) så de
// matcher de runde knapper de altid sidder i — selve flaget renderes bredere
// end højt og centreres, så det fylder cirklen helt ud i stedet for at have
// luft i siderne. En tynd, neutral ring + let skygge giver hver cirkel en
// skarp, defineret kant uanset om baggrunden bag er hvid eller teal.
export function FlagIcon({ language, size = 16, style, ...rest }) {
  const Flag = FLAG_BY_LANGUAGE[language];
  if (!Flag) return null;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
        border: "1px solid rgba(15,23,42,0.14)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.20)",
        ...style,
      }}
    >
      <Flag aria-hidden="true" style={{ width: size * 1.5, height: size, display: "block" }} {...rest} />
    </span>
  );
}
