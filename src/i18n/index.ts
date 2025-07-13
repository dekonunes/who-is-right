import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en/translation.json";
import ptBR from "../locales/pt-BR/translation.json";
import es from "../locales/es/translation.json";
import enTooltip from "../locales/en/tooltip.json";
import ptBRTooltip from "../locales/pt-BR/tooltip.json";
import esTooltip from "../locales/es/tooltip.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, tooltip: enTooltip },
    "pt-BR": { translation: ptBR, tooltip: ptBRTooltip },
    es: { translation: es, tooltip: esTooltip },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  supportedLngs: ["en", "pt-BR", "es"],
});

export default i18n;
