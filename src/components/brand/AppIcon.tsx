import React from "react";

export type AppIconVariant = "default" | "light" | "dark-monochrome" | "glyph";

interface AppIconProps {
  variant?: AppIconVariant;
  size?: number;
  className?: string;
  rounded?: boolean;
}

export function WhereBoxAppIcon({
  variant = "default",
  size = 64,
  className = "",
  rounded = true,
}: AppIconProps) {
  const borderRadius = rounded ? `${Math.round(size * 0.22)}px` : "0px";

  if (variant === "glyph") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Isometric Box Outline */}
        <path d="M24 19L38 25V35L24 42L10 35V25L24 19Z" />
        <path d="M24 19V42" />
        <path d="M38 25L24 32L10 25" />
        {/* Location Pin */}
        <path d="M24 6C20 6 17 9 17 13C17 18 24 25 24 25C24 25 31 18 31 13C31 9 28 6 24 6Z" fill="currentColor" fillOpacity="0.2" />
        <circle cx="24" cy="13" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  if (variant === "light") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          background: "linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          boxShadow: "0 8px 24px -4px rgba(99, 102, 241, 0.15)",
        }}
        className={`flex items-center justify-center p-2.5 overflow-hidden ${className}`}
      >
        <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="wb-light-grad" x1="10" y1="10" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="wb-light-pin" x1="24" y1="4" x2="36" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <path d="M24 19L39 26V36L24 43L9 36V26L24 19Z" fill="url(#wb-light-grad)" />
          <path d="M9 26L24 33.5V43L9 36V26Z" fill="#4F46E5" fillOpacity="0.3" />
          <path d="M39 26L24 33.5V43L39 36V26Z" fill="#312E81" fillOpacity="0.25" />
          <path d="M24 19L39 26L24 33.5L9 26L24 19Z" fill="#A5B4FC" fillOpacity="0.7" />
          <path d="M24 5C19.5 5 16 8.5 16 13C16 18 24 27 24 27C24 27 32 18 32 13C32 8.5 28.5 5 24 5Z" fill="url(#wb-light-pin)" />
          <circle cx="24" cy="13" r="3.5" fill="#FFFFFF" />
          <circle cx="24" cy="13" r="1.5" fill="#14B8A6" />
        </svg>
      </div>
    );
  }

  if (variant === "dark-monochrome") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          background: "#080F25",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
        className={`flex items-center justify-center p-2.5 overflow-hidden ${className}`}
      >
        <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
          <path d="M24 19L39 26V36L24 43L9 36V26L24 19Z" stroke="#FFFFFF" strokeWidth="2.5" fill="#1E293B" />
          <path d="M24 19V43" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M9 26L24 33.5L39 26" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M24 5C19.5 5 16 8.5 16 13C16 18 24 27 24 27C24 27 32 18 32 13C32 8.5 28.5 5 24 5Z" fill="#FFFFFF" />
          <circle cx="24" cy="13" r="3.5" fill="#080F25" />
        </svg>
      </div>
    );
  }

  // Variation A — Default
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: "radial-gradient(120% 120% at 50% 10%, #1E1B4B 0%, #080F25 75%, #050714 100%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 10px 30px -4px rgba(99, 102, 241, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
      }}
      className={`flex items-center justify-center p-2.5 overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/10 via-transparent to-[#14B8A6]/10 pointer-events-none" />
      <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" className="relative z-10">
        <defs>
          <linearGradient id="wb-app-box" x1="10" y1="14" x2="38" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="wb-app-pin" x1="24" y1="4" x2="36" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="wb-app-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.5" />
          </filter>
        </defs>

        <g filter="url(#wb-app-glow)">
          <path d="M24 19L39 26V36L24 43L9 36V26L24 19Z" fill="url(#wb-app-box)" />
          <path d="M9 26L24 33.5V43L9 36V26Z" fill="#312E81" fillOpacity="0.5" />
          <path d="M39 26L24 33.5V43L39 36V26Z" fill="#1E1B4B" fillOpacity="0.6" />
          <path d="M24 19L39 26L24 33.5L9 26L24 19Z" fill="#A5B4FC" fillOpacity="0.7" />
        </g>

        <g filter="url(#wb-app-glow)">
          <path d="M24 5C19.5 5 16 8.5 16 13C16 18 24 27 24 27C24 27 32 18 32 13C32 8.5 28.5 5 24 5Z" fill="url(#wb-app-pin)" />
          <circle cx="24" cy="13" r="3.5" fill="#FFFFFF" />
          <circle cx="24" cy="13" r="1.5" fill="#14B8A6" />
        </g>
      </svg>
    </div>
  );
}
