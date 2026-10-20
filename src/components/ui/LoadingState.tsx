"use client";

import React from "react";

export function LoadingSkeletonCard() {
  return (
    <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200/80" />
          <div className="space-y-1.5">
            <div className="w-24 h-4 rounded bg-slate-200/80" />
            <div className="w-36 h-3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="w-24 h-6 rounded-lg bg-slate-200/70" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="w-32 h-4 rounded bg-slate-200/70" />
        <div className="w-20 h-4 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function LoadingSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80" />
            <div className="w-8 h-6 rounded bg-slate-200/80" />
          </div>
          <div className="mt-3 w-16 h-3 rounded bg-slate-200/70" />
        </div>
      ))}
    </div>
  );
}
