import React from "react";

interface LogoProps {
  variant?: "full" | "with-tagline" | "compact";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isDarkTheme?: boolean;
}

export function LogoSymbol({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="wb-symbol-box-grad" x1="6" y1="12" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="wb-symbol-pin-grad" x1="24" y1="4" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="wb-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Parcel Box Base (Iso-perspective) */}
      <path
        d="M24 18L40 25.5V36L24 43.5L8 36V25.5L24 18Z"
        fill="url(#wb-symbol-box-grad)"
        filter="url(#wb-glow)"
      />
      {/* Box flap left */}
      <path
        d="M8 25.5L24 33V43.5L8 36V25.5Z"
        fill="#4F46E5"
        fillOpacity="0.45"
      />
      {/* Box flap right */}
      <path
        d="M40 25.5L24 33V43.5L40 36V25.5Z"
        fill="#312E81"
        fillOpacity="0.2"
      />
      {/* Box top face */}
      <path
        d="M24 18L40 25.5L24 33L8 25.5L24 18Z"
        fill="#818CF8"
        fillOpacity="0.6"
      />

      {/* Location Pin Emerging from Box */}
      <g filter="url(#wb-glow)">
        <path
          d="M24 4C19.0294 4 15 8.02944 15 13C15 18.5 24 28 24 28C24 28 33 18.5 33 13C33 8.02944 28.9706 4 24 4Z"
          fill="url(#wb-symbol-pin-grad)"
        />
        {/* Inner Pin Eye */}
        <circle cx="24" cy="13" r="3.75" fill="#FFFFFF" />
        {/* Teal Accent Pulse dot */}
        <circle cx="24" cy="13" r="1.75" fill="#14B8A6" />
      </g>
    </svg>
  );
}

export function WhereBoxLogo({
  variant = "full",
  size = "md",
  className = "",
  isDarkTheme = false,
}: LogoProps) {
  const symbolSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 52,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const pixelSize = symbolSizes[size];

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <LogoSymbol size={pixelSize} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoSymbol size={pixelSize} />
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textSizes[size]}`}>
          <span className={isDarkTheme ? "text-white" : "text-[#0F172A]"}>Where</span>
          <span className="text-gradient-primary">Box</span>
        </div>
        {variant === "with-tagline" && (
          <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase mt-0.5">
            Every package. One place.
          </span>
        )}
      </div>
    </div>
  );
}
