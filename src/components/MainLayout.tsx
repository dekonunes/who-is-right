import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Tooltip from "./Tooltip";
import iconHappy from "../assets/icon-happy.png";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const lang =
    i18n.language === "pt-BR" ? "pt-BR" : i18n.language === "es" ? "es" : "en";
  const [showTooltip, setShowTooltip] = useState(false);
  const howItWorksRef = useRef<HTMLButtonElement>(null);
  const tooltipText = t("tooltip", { ns: "tooltip" });

  // Close tooltip on outside click or Escape
  useEffect(() => {
    if (!showTooltip) return;
    function handleClick(e: MouseEvent) {
      if (
        howItWorksRef.current &&
        !howItWorksRef.current.contains(e.target as Node)
      ) {
        setShowTooltip(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowTooltip(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showTooltip]);

  const navLinks = [
    { label: t("howItWorks"), href: "#" },
    { label: t("contact"), href: "#" },
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
          <div className="flex justify-end gap-8 items-center">
            <div className="flex items-center gap-9">
              {navLinks.map((link) =>
                link.label === t("howItWorks") ? (
                  <div key={link.label} className="relative flex items-center">
                    <button
                      ref={howItWorksRef}
                      type="button"
                      className="text-white text-sm font-medium leading-normal whitespace-nowrap hover:underline focus:outline-none"
                      onClick={() => setShowTooltip((v) => !v)}
                      aria-expanded={showTooltip}
                      aria-controls="how-it-works-tooltip"
                    >
                      {link.label}
                    </button>
                    <Tooltip
                      anchorRef={howItWorksRef as React.RefObject<HTMLElement>}
                      open={showTooltip}
                      position="bottom"
                      className=""
                    >
                      {tooltipText.split("\n").map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </Tooltip>
                  </div>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white text-sm font-medium leading-normal whitespace-nowrap hover:underline"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
            <select
              value={lang}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                localStorage.setItem("appLang", e.target.value);
              }}
              aria-label="Select language"
              className="ml-4 bg-[#293a42] text-white rounded-full px-4 py-2 text-sm font-semibold border-none focus:outline-none focus:ring-2 focus:ring-[#add6ea] whitespace-nowrap"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português</option>
              <option value="es">Español</option>
            </select>
          </div>
        </header>
        {/* Improved responsive main content wrapper for mobile and desktop */}
        <main className="w-full min-h-screen bg-[#131c20] px-4 py-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
