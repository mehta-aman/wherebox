"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "subtle";
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
      elevated:
        "bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgb(99,102,241,0.08)]",
      flat:
        "bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-none",
      subtle:
        "bg-slate-50/70 backdrop-blur-sm border border-slate-200/50",
    };

    const interactiveStyles = interactive
      ? "cursor-pointer transition-all duration-200 hover:bg-white/90 hover:border-indigo-300 hover:shadow-[0_12px_32px_rgb(99,102,241,0.12)] hover:-translate-y-0.5 active:translate-y-0"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-5 relative overflow-hidden",
          variantStyles[variant],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
