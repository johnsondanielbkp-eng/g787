import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import common from "./es/common.json";
import pages from "./es/pages.json";

const LocaleContext = createContext(null);
const STORAGE_KEY = "gi-locale";
const translations = { ...common, ...pages };
const isLocale = (value) => value === "pt-BR" || value === "es";

function initialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch { /* Browsers may disable storage; the selector still works. */ }
  return "pt-BR";
}

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(initialLocale);
  const changeLocale = useCallback((value) => {
    if (!isLocale(value)) return;
    setLocale(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Optional persistence. */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    const sync = (event) => {
      if (event.key === STORAGE_KEY && isLocale(event.newValue)) setLocale(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [locale]);

  const tr = useCallback((text) => {
    if (locale !== "es" || typeof text !== "string") return text;
    const key = text.replace(/\s+/g, " ").trim();
    const translated = Object.prototype.hasOwnProperty.call(translations, key) ? translations[key] : undefined;
    if (!translated) return text;
    return text.replace(/\S[\s\S]*\S|\S/, translated);
  }, [locale]);

  const value = useMemo(() => ({ locale, changeLocale, tr }), [locale, changeLocale, tr]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => useContext(LocaleContext);