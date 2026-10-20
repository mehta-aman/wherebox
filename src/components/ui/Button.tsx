"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:brightness-105 border border-white/20",
      secondary:
        "bg-white/80 hover:bg-white text-slate-800 shadow-sm border border-slate-200/80 hover:border-slate-300",
      glass:
        "bg-white/70 hover:bg-white/90 text-slate-800 backdrop-blur-md border border-white/60 shadow-sm hover:shadow hover:border-indigo-200",
      outline:
        "border border-slate-300/80 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 bg-transparent hover:bg-indigo-50/50",
      ghost:
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 bg-transparent",
      danger:
        "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-5 py-2.5 h-12 gap-2.5 rounded-2xl",
      icon: "h-10 w-10 p-0 flex items-center justify-center rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
