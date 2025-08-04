import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";
import iconHappy from "../assets/optimized/icon-happy.webp";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const lang =
    i18n.language === "pt-BR" ? "pt-BR" : i18n.language === "es" ? "es" : "en";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t("howItWorks"), href: "/how-it-works" },
    {
      label: t("contact"),
      href: "mailto:dekonunesss@gmail.com?subject=I want to build AI website",
    },
  ];

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#131c20] overflow-x-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <div className="layout-container flex flex-col h-full w-full">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#293a42] px-4 md:px-10 py-3 bg-[#131c20]">
          <div className="flex items-center gap-4 text-white">
            <img
              src={iconHappy}
              alt="Who is Right logo"
              className="h-12 w-auto mr-2"
            />
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Who Is Right?
            </h2>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-end gap-8 items-center">
            <div className="flex items-center gap-9">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-white text-sm font-medium leading-normal whitespace-nowrap hover:underline"
                  onClick={() => {
                    // Track navigation link clicks
                    logEvent(analytics, "navigation_clicked", {
                      link_text: link.label,
                      link_href: link.href,
                      language: i18n.language,
                      device: "desktop",
                    });
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <select
              value={lang}
              onChange={(e) => {
                const newLanguage = e.target.value;
                i18n.changeLanguage(newLanguage);
                localStorage.setItem("appLang", newLanguage);

                // Track language change
                logEvent(analytics, "language_changed", {
                  previous_language: i18n.language,
                  new_language: newLanguage,
                  page_location: window.location.href,
                });
              }}
              aria-label="Select language"
              className="ml-4 bg-[#293a42] text-white rounded-full px-4 py-2 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-[#add6ea] whitespace-nowrap"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-4">
            <select
              value={lang}
              onChange={(e) => {
                const newLanguage = e.target.value;
                i18n.changeLanguage(newLanguage);
                localStorage.setItem("appLang", newLanguage);

                // Track language change
                logEvent(analytics, "language_changed", {
                  previous_language: i18n.language,
                  new_language: newLanguage,
                  page_location: window.location.href,
                  device: "mobile",
                });
              }}
              aria-label="Select language"
              className="bg-[#293a42] text-white rounded-full px-3 py-1 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-[#add6ea] whitespace-nowrap"
            >
              <option value="en">EN</option>
              <option value="pt-BR">PT</option>
              <option value="es">ES</option>
            </select>
            <button
              onClick={() => {
                const newState = !isMobileMenuOpen;
                setIsMobileMenuOpen(newState);
                // Track mobile menu toggle
                logEvent(analytics, "mobile_menu_toggled", {
                  menu_state: newState ? "opened" : "closed",
                  language: i18n.language,
                });
              }}
              className="text-white p-2 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-1"
                      : "-translate-y-1"
                  }`}
                ></span>
                <span
                  className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-1"
                      : "translate-y-1"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#293a42] border-b border-[#1e2a30]">
            <div className="px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-white text-base font-medium py-2 hover:text-[#add6ea] transition-colors"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // Track mobile navigation link clicks
                    logEvent(analytics, "navigation_clicked", {
                      link_text: link.label,
                      link_href: link.href,
                      language: i18n.language,
                      device: "mobile",
                    });
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Improved responsive main content wrapper for mobile and desktop */}
        <main className="w-full min-h-screen bg-[#131c20] px-4 py-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
