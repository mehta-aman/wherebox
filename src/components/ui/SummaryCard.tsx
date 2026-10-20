"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Package, Truck, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";

export type SummaryFilterType = "all" | "in_transit" | "out_for_delivery" | "delivered" | "exceptions";

interface SummaryCardProps {
  type: SummaryFilterType;
  count: number;
  label: string;
  sublabel?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SummaryCard({
  type,
  count,
  label,
  sublabel,
  isActive = false,
  onClick,
}: SummaryCardProps) {
  const configs = {
    all: {
      icon: Package,
      gradient: "from-indigo-500 to-purple-600",
      accentBg: "bg-indigo-50 text-indigo-600",
      borderActive: "border-indigo-500 ring-2 ring-indigo-500/20",
    },
    in_transit: {
      icon: Truck,
      gradient: "from-blue-500 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600",
      borderActive: "border-blue-500 ring-2 ring-blue-500/20",
    },
    out_for_delivery: {
      icon: MapPin,
      gradient: "from-purple-500 to-pink-500",
      accentBg: "bg-purple-50 text-purple-600",
      borderActive: "border-purple-500 ring-2 ring-purple-500/20",
    },
    delivered: {
      icon: CheckCircle2,
      gradient: "from-teal-500 to-emerald-600",
      accentBg: "bg-teal-50 text-teal-600",
      borderActive: "border-teal-500 ring-2 ring-teal-500/20",
    },
    exceptions: {
      icon: AlertTriangle,
      gradient: "from-amber-500 to-red-500",
      accentBg: "bg-amber-50 text-amber-600",
      borderActive: "border-amber-500 ring-2 ring-amber-500/20",
    },
  };

  const current = configs[type];
  const IconComponent = current.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left w-full p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xs transition-all duration-200 select-none",
        "hover:bg-white/95 hover:shadow-md hover:-translate-y-0.5",
        isActive ? current.borderActive : "hover:border-slate-300/80"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", current.accentBg)}>
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {count}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-700 tracking-tight">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}
