"use client";

import React from "react";
import { PackageOpen, Sparkles } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  filtered?: boolean;
}

export function EmptyState({
  title = "No packages tracked yet",
  description = "Enter any tracking number from Delhivery, Blue Dart, DTDC, India Post, Amazon, or international couriers to start tracking in one place.",
  actionText = "Track Your First Package",
  onAction,
  filtered = false,
}: EmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4 shadow-xs">
        <PackageOpen className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {filtered ? "No shipments found matching filters" : title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm">
        {filtered
          ? "Try resetting your search query or selecting a different status filter."
          : description}
      </p>

      {onAction && !filtered && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-5">
          <Sparkles className="w-4 h-4" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
}
