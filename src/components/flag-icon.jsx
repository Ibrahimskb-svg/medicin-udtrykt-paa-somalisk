import DK from "country-flag-icons/react/3x2/DK";
import GB from "country-flag-icons/react/3x2/GB";
import SO from "country-flag-icons/react/3x2/SO";
import SA from "country-flag-icons/react/3x2/SA";

// Emoji-flag (🇩🇰 osv.) rendres som bogstavkoder ("DK") på Windows, fordi
// Windows' emoji-skrifttype mangler flag-glyferne. Rigtige SVG'er undgår det.
const FLAG_BY_LANGUAGE = { so: SO, da: DK, en: GB, ar: SA };

export function FlagIcon({ language, size = 16, style, ...rest }) {
  const Flag = FLAG_BY_LANGUAGE[language];
  if (!Flag) return null;
  return (
    <Flag
      aria-hidden="true"
      style={{ width: size, height: size * (2 / 3), borderRadius: 2, display: "block", ...style }}
      {...rest}
    />
  );
}
