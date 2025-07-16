import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import i18n from "./i18n";

// Set language from URL query param 'lg', e.g. /?lg=pt
const params = new URLSearchParams(window.location.search);
const lg = params.get("lg");
let langToSet: string | null = null;
if (lg) {
  if (lg === "pt") langToSet = "pt-BR";
  else if (lg === "en") langToSet = "en";
  else if (lg === "es") langToSet = "es";
  else langToSet = lg;
  i18n.changeLanguage(langToSet);
  localStorage.setItem("appLang", langToSet);
} else {
  // If no URL param, check localStorage
  const cachedLang = localStorage.getItem("appLang");
  if (cachedLang) {
    i18n.changeLanguage(cachedLang);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
