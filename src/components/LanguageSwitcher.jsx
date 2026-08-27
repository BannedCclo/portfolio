import { useLanguage } from "../lib/i18n/LanguageContext.jsx";
import "./LanguageSwitcher.css";

// Simplified flat flags — good enough at 20x14px, and independent of any
// emoji font support (Segoe UI Emoji's flag coverage varies by Windows
// build), which matters more here than pixel-accurate proportions.
const FlagBR = () => (
  <svg viewBox="0 0 24 16" width="20" height="14" aria-hidden="true">
    <rect width="24" height="16" rx="2" fill="#009739" />
    <polygon points="12,2.4 21.2,8 12,13.6 2.8,8" fill="#FEDD00" />
    <circle cx="12" cy="8" r="3.3" fill="#012169" />
  </svg>
);

const FlagUS = () => (
  <svg viewBox="0 0 24 16" width="20" height="14" aria-hidden="true">
    <rect width="24" height="16" rx="2" fill="#B31942" />
    <g fill="#fff">
      <rect y="1.23" width="24" height="1.23" />
      <rect y="3.69" width="24" height="1.23" />
      <rect y="6.15" width="24" height="1.23" />
      <rect y="8.62" width="24" height="1.23" />
      <rect y="11.08" width="24" height="1.23" />
      <rect y="13.54" width="24" height="1.23" />
    </g>
    <rect width="10.5" height="8.62" fill="#0A3161" />
  </svg>
);

export default function LanguageSwitcher() {
  const { lang, setLang, s } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label={s.langSwitch.groupLabel}>
      <button
        type="button"
        className="lang-switch__btn"
        aria-pressed={lang === "pt"}
        aria-label={s.langSwitch.toPt}
        onClick={() => setLang("pt")}
      >
        <FlagBR />
      </button>
      <button
        type="button"
        className="lang-switch__btn"
        aria-pressed={lang === "en"}
        aria-label={s.langSwitch.toEn}
        onClick={() => setLang("en")}
      >
        <FlagUS />
      </button>
    </div>
  );
}
