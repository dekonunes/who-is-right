import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  children: React.ReactNode;
  position?: "bottom" | "top" | "left" | "right";
  className?: string;
};

const Tooltip: React.FC<TooltipProps> = ({
  anchorRef,
  open,
  children,
  position = "bottom",
  className,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const [measured, setMeasured] = useState(false);

  // First render: invisible, just to measure
  useLayoutEffect(() => {
    if (open && anchorRef.current && tooltipRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let top = 0,
        left = 0;
      if (position === "bottom") {
        top = anchorRect.bottom + window.scrollY + 8;
        // Offset 2rem (32px) to the left, and increase width
        left =
          anchorRect.left +
          window.scrollX +
          anchorRect.width / 2 -
          tooltipRect.width / 2 -
          32;
      } else if (position === "top") {
        top = anchorRect.top + window.scrollY - tooltipRect.height - 8;
        left =
          anchorRect.left +
          window.scrollX +
          anchorRect.width / 2 -
          tooltipRect.width / 2 -
          32;
      } else if (position === "left") {
        top =
          anchorRect.top +
          window.scrollY +
          anchorRect.height / 2 -
          tooltipRect.height / 2;
        left = anchorRect.left + window.scrollX - tooltipRect.width - 8 - 32;
      } else if (position === "right") {
        top =
          anchorRect.top +
          window.scrollY +
          anchorRect.height / 2 -
          tooltipRect.height / 2;
        left = anchorRect.right + window.scrollX + 8 - 32;
      }
      setCoords({ top, left });
      setMeasured(true);
    } else {
      setCoords(null);
      setMeasured(false);
    }
  }, [open, anchorRef, position, children]);

  if (!open) return null;

  // First pass: invisible for measurement
  if (!coords || !measured) {
    return createPortal(
      <div
        ref={tooltipRef}
        className="fixed opacity-0 pointer-events-none z-50 px-4 py-3 bg-[#293a42] text-white text-sm rounded-xl shadow-lg flex flex-col items-center max-w-[29rem]"
        style={{ top: 0, left: 0 }}
      >
        <span>{children}</span>
      </div>,
      document.body
    );
  }

  // Second pass: visible and positioned
  return createPortal(
    <div
      ref={tooltipRef}
      className={`z-50 pointer-events-auto fixed px-4 py-3 bg-[#293a42] text-white text-sm rounded-xl shadow-lg flex flex-col items-center transition-opacity duration-150 max-w-[29rem] ${
        className || ""
      }`}
      style={{ top: coords.top, left: coords.left }}
      role="tooltip"
    >
      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: position === "bottom" ? -8 : undefined,
          bottom: position === "top" ? -8 : undefined,
        }}
      >
        <div
          className={`w-0 h-0 border-l-8 border-r-8 ${
            position === "bottom"
              ? "border-b-8 border-l-transparent border-r-transparent border-b-[#293a42]"
              : "border-t-8 border-l-transparent border-r-transparent border-t-[#293a42]"
          }`}
        />
      </div>
      <span>{children}</span>
    </div>,
    document.body
  );
};

export default Tooltip;
