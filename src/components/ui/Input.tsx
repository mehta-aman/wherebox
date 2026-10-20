"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, endAdornment, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-11 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/80 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200",
            "focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-10",
            endAdornment && "pr-10",
            className
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3.5 flex items-center text-slate-400">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
