import React from "react";

type SwitchOption = {
  label: string;
  value: string;
};

type SwitchProps = {
  label?: string;
  options: SwitchOption[];
  value: string;
  onChange: (value: string) => void;
};

const Switch: React.FC<SwitchProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full justify-center">
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-full bg-[#1f2d34] p-1 shadow-inner gap-1"
      >
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-150 focus:outline-none ${
                isActive
                  ? "bg-[#add6ea] text-[#0f1a1f] shadow"
                  : "text-gray-200 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {label ? (
        <span className="text-sm text-gray-200 font-medium text-center">
          {label}
        </span>
      ) : null}
    </div>
  );
};

export default Switch;
