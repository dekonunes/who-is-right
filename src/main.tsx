import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import i18n from "./i18n";

// Language detection priority: URL param > Browser language > localStorage > Default (en)
const params = new URLSearchParams(window.location.search);
const lg = params.get("lg");
let langToSet: string | null = null;

if (lg) {
  // URL parameter has highest priority
  if (lg === "pt") langToSet = "pt-BR";
  else if (lg === "en") langToSet = "en";
  else if (lg === "es") langToSet = "es";
  else if (lg === "tr") langToSet = "tr";
  else if (lg === "de") langToSet = "de";
  else langToSet = lg;
  i18n.changeLanguage(langToSet);
  localStorage.setItem("appLang", langToSet);
} else {
  // Check localStorage for cached language preference
  const cachedLang = localStorage.getItem("appLang");
  if (cachedLang) {
    i18n.changeLanguage(cachedLang);
  } else {
    // Auto-detect browser language if no preference is set
    const browserLang = navigator.language || (navigator as any).userLanguage;
    const supportedLanguages = ["en", "pt-BR", "es", "tr", "de"];

    // Normalize browser language code
    let detectedLang: string | null = null;
    if (browserLang.startsWith("pt")) {
      detectedLang = "pt-BR";
    } else if (browserLang.startsWith("es")) {
      detectedLang = "es";
    } else if (browserLang.startsWith("tr")) {
      detectedLang = "tr";
    } else if (browserLang.startsWith("de")) {
      detectedLang = "de";
    } else if (browserLang.startsWith("en")) {
      detectedLang = "en";
    }

    // Use detected language if supported, otherwise fall back to default
    if (detectedLang && supportedLanguages.includes(detectedLang)) {
      i18n.changeLanguage(detectedLang);
      localStorage.setItem("appLang", detectedLang);
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
