import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en/translation.json";
import ptBR from "../locales/pt-BR/translation.json";
import es from "../locales/es/translation.json";
import tr from "../locales/tr/translation.json";
import de from "../locales/de/translation.json";
import enTooltip from "../locales/en/tooltip.json";
import ptBRTooltip from "../locales/pt-BR/tooltip.json";
import esTooltip from "../locales/es/tooltip.json";
import trTooltip from "../locales/tr/tooltip.json";
import deTooltip from "../locales/de/tooltip.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, tooltip: enTooltip },
    "pt-BR": { translation: ptBR, tooltip: ptBRTooltip },
    es: { translation: es, tooltip: esTooltip },
    tr: { translation: tr, tooltip: trTooltip },
    de: { translation: de, tooltip: deTooltip },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  supportedLngs: ["en", "pt-BR", "es", "tr", "de"],
});

export default i18n;
