import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { strings } from "./strings.js";

const STORAGE_KEY = "portfolio:lang";

const LanguageContext = createContext(null);

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "pt" ? stored : "pt";
  } catch {
    return "pt";
  }
}

function updateDocumentMeta(lang, meta) {
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  document.title = meta.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", meta.description);

  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute("content", meta.ogLocale);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", meta.description);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage unavailable (private mode, disabled cookies) — the choice
      // just won't persist across reloads, which is a harmless fallback.
    }
    updateDocumentMeta(lang, strings[lang].meta);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, s: strings[lang] }), [lang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
