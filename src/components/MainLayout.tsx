import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";
import iconHappy from "../assets/optimized/icon-happy.webp";
import gsap from "gsap";

const SUPPORTED_LANGUAGES = ["en", "pt-BR", "es", "tr", "de"];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const lang = SUPPORTED_LANGUAGES.includes(i18n.language)
    ? i18n.language
    : "en";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t("howItWorks"), to: `/${lang}/how-it-works`, isExternal: false },
    {
      label: t("contact"),
      href: "mailto:dekonunesss@gmail.com?subject=I want to build AI website",
      isExternal: true,
    },
  ];

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Header slides down from top
      tl.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
      })
        // Logo and title fade in
        .from(
          logoRef.current,
          {
            opacity: 0,
            x: -12,
            duration: 0.3,
          },
          "-=0.2"
        )
        // Navigation links stagger in
        .from(
          navRef.current?.children || [],
          {
            opacity: 0,
            y: 8,
            stagger: 0.08,
            duration: 0.25,
          },
          "-=0.1"
        );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#131c20] overflow-x-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <div className="layout-container flex flex-col h-full w-full">
        <header
          ref={headerRef}
          className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#293a42] px-4 md:px-10 py-3 bg-[#131c20]"
        >
          <div ref={logoRef} className="flex items-center gap-4 text-white">
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
          <div
            ref={navRef}
            className="hidden md:flex justify-end gap-8 items-center"
          >
            <div className="flex items-center gap-9">
              {navLinks.map((link) =>
                link.isExternal ? (
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
                ) : (
                  <Link
                    key={link.label}
                    to={link.to!}
                    className="text-white text-sm font-medium leading-normal whitespace-nowrap hover:underline"
                    onClick={() => {
                      // Track navigation link clicks
                      logEvent(analytics, "navigation_clicked", {
                        link_text: link.label,
                        link_href: link.to,
                        language: i18n.language,
                        device: "desktop",
                      });
                    }}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
            <select
              value={lang}
              onChange={(e) => {
                const newLanguage = e.target.value;
                // i18n.changeLanguage(newLanguage); // Handled by LanguageWrapper
                localStorage.setItem("appLang", newLanguage);

                // Track language change
                logEvent(analytics, "language_changed", {
                  previous_language: i18n.language,
                  new_language: newLanguage,
                  page_location: window.location.href,
                });

                // Navigate to new language path
                const currentPath = location.pathname;
                const parts = currentPath.split("/");
                // parts[0] is "", parts[1] is lang
                if (SUPPORTED_LANGUAGES.includes(parts[1])) {
                  parts[1] = newLanguage;
                } else {
                  parts.splice(1, 0, newLanguage);
                }
                const newPath = parts.join("/") || `/${newLanguage}`;
                navigate(newPath);
              }}
              aria-label="Select language"
              className="ml-4 bg-[#293a42] text-white rounded-full px-4 py-2 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-[#add6ea] whitespace-nowrap"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português</option>
              <option value="es">Español</option>
              <option value="tr">Türkçe</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-4">
            <select
              value={lang}
              onChange={(e) => {
                const newLanguage = e.target.value;
                // i18n.changeLanguage(newLanguage); // Handled by LanguageWrapper
                localStorage.setItem("appLang", newLanguage);

                // Track language change
                logEvent(analytics, "language_changed", {
                  previous_language: i18n.language,
                  new_language: newLanguage,
                  page_location: window.location.href,
                  device: "mobile",
                });

                // Navigate to new language path
                const currentPath = location.pathname;
                const parts = currentPath.split("/");
                // parts[0] is "", parts[1] is lang
                if (SUPPORTED_LANGUAGES.includes(parts[1])) {
                  parts[1] = newLanguage;
                } else {
                  parts.splice(1, 0, newLanguage);
                }
                const newPath = parts.join("/") || `/${newLanguage}`;
                navigate(newPath);
              }}
              aria-label="Select language"
              className="bg-[#293a42] text-white rounded-full px-3 py-1 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-[#add6ea] whitespace-nowrap"
            >
              <option value="en">EN</option>
              <option value="pt-BR">PT</option>
              <option value="es">ES</option>
              <option value="tr">TR</option>
              <option value="de">DE</option>
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
              {navLinks.map((link) =>
                link.isExternal ? (
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
                ) : (
                  <Link
                    key={link.label}
                    to={link.to!}
                    className="block text-white text-base font-medium py-2 hover:text-[#add6ea] transition-colors"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      // Track mobile navigation link clicks
                      logEvent(analytics, "navigation_clicked", {
                        link_text: link.label,
                        link_href: link.to,
                        language: i18n.language,
                        device: "mobile",
                      });
                    }}
                  >
                    {link.label}
                  </Link>
                )
              )}
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
