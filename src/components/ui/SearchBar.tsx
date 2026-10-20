"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search tracking #, store, carrier, product...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-md border border-slate-200/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
