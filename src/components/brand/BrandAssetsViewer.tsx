"use client";

import React from "react";
import { WhereBoxLogo } from "./Logo";
import { WhereBoxAppIcon, AppIconVariant } from "./AppIcon";
import { GlassCard } from "../ui/GlassCard";
import { Copy, Check, Sparkles, Palette } from "lucide-react";

export function BrandAssetsViewer() {
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null);

  const colors = [
    { token: "Primary Blue", hex: "#6366F1", use: "Primary buttons, active states, links" },
    { token: "Secondary Violet", hex: "#8B5CF6", use: "Gradients, decorative highlights" },
    { token: "Accent Teal", hex: "#14B8A6", use: "Delivery success, active progress" },
    { token: "Deep Navy", hex: "#0F172A", use: "Headings & primary typography" },
    { token: "Surface Light", hex: "#E5E7EB", use: "Borders, neutral surfaces" },
    { token: "Soft Background", hex: "#F8FAFC", use: "Canvas background" },
    { token: "Dark Background", hex: "#080F25", use: "PWA icon, dark hero canvas" },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2 border border-indigo-200/80">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Official Design System
            </span>
            <h2 className="text-xl font-bold text-slate-900">WhereBox Brand & Design Language</h2>
            <p className="text-xs text-slate-500 mt-1">
              Apple-polished glassmorphism with restrained gradients and precision typography.
            </p>
          </div>
          <WhereBoxLogo variant="with-tagline" size="lg" />
        </div>
      </GlassCard>

      {/* App Icon Variations */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-600" />
          App Icon System (4 Variations)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: "default" as AppIconVariant, label: "Variation A — Default", desc: "Navy background, luminous parcel & pin (PWA)" },
            { id: "light" as AppIconVariant, label: "Variation B — Light", desc: "Clean white surface with vibrant gradients" },
            { id: "dark-monochrome" as AppIconVariant, label: "Variation C — Monochrome", desc: "High contrast dark theme silhouette" },
            { id: "glyph" as AppIconVariant, label: "Variation D — Glyph", desc: "Minimal stroke outline for navigation & favicon" },
          ].map((v) => (
            <div key={v.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center flex flex-col items-center">
              <div className="p-2 mb-3">
                <WhereBoxAppIcon variant={v.id} size={56} />
              </div>
              <span className="text-xs font-bold text-slate-800">{v.label}</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{v.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Official Color Tokens */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Official Brand Color Palette</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {colors.map((c) => (
            <div
              key={c.hex}
              onClick={() => handleCopy(c.hex)}
              className="p-3 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{c.token}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.hex}</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-600">
                {copiedHex === c.hex ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
