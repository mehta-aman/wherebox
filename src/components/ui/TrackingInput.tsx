"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Sparkles, Building2, Package, Check, AlertCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "./Button";
import { detectCarrierHeuristic, POPULAR_STORES, SUPPORTED_CARRIERS } from "@/lib/carriers";
import { CarrierInfo } from "@/types/shipment";
import { cn } from "@/lib/utils";

interface TrackingInputProps {
  onAddShipment: (payload: {
    trackingNumber: string;
    storeName?: string;
    itemLabel?: string;
    carrier?: CarrierInfo;
  }) => Promise<{ success: boolean; message?: string }>;
  existingTrackingNumbers?: string[];
}

export function TrackingInput({ onAddShipment, existingTrackingNumbers = [] }: TrackingInputProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [itemLabel, setItemLabel] = useState("");
  const [storeName, setStoreName] = useState("");
  const [selectedCarrierCode, setSelectedCarrierCode] = useState<string>("");
  const [detectedCarrier, setDetectedCarrier] = useState<CarrierInfo | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (trackingNumber.trim().length >= 4) {
      const carrier = detectCarrierHeuristic(trackingNumber);
      setDetectedCarrier(carrier);
      if (carrier && !selectedCarrierCode) {
        setSelectedCarrierCode(carrier.code);
      }
    } else {
      setDetectedCarrier(null);
    }
  }, [trackingNumber, selectedCarrierCode]);

  const activeCarrier = selectedCarrierCode
    ? SUPPORTED_CARRIERS.find((c) => c.code === selectedCarrierCode) || detectedCarrier
    : detectedCarrier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = trackingNumber.trim().toUpperCase();

    if (!cleanNumber) {
      setFeedback({ type: "error", text: "Please enter a tracking number." });
      return;
    }

    if (existingTrackingNumbers.some((n) => n.toUpperCase() === cleanNumber)) {
      setFeedback({ type: "error", text: `Package with tracking #${cleanNumber} is already in your dashboard.` });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await onAddShipment({
        trackingNumber: cleanNumber,
        storeName: storeName.trim() || undefined,
        itemLabel: itemLabel.trim() || undefined,
        carrier: activeCarrier || undefined,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message || `Package #${cleanNumber} added successfully!` });
        setTrackingNumber("");
        setItemLabel("");
        setStoreName("");
        setSelectedCarrierCode("");
        setDetectedCarrier(null);
        setShowMoreOptions(false);
      } else {
        setFeedback({ type: "error", text: res.message || "Failed to add tracking number." });
      }
    } catch {
      setFeedback({ type: "error", text: "An unexpected error occurred while adding the package." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_10px_35px_-4px_rgba(99,102,241,0.12)] transition-all"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Tracking Number Input (col 12 or 5) */}
          <div className="relative md:col-span-5 w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="Tracking # (Delhivery, Blue Dart, DTDC, India Post...)"
              className="w-full h-12 pl-10 pr-28 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
            />
            {/* Auto-detected Carrier Badge */}
            {activeCarrier && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] sm:text-[11px] font-semibold animate-in fade-in zoom-in-95 duration-150">
                <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate max-w-[90px]">{activeCarrier.name}</span>
              </div>
            )}
          </div>

          {/* Product / Item Name (col 12 or 3) */}
          <div className="relative md:col-span-3 w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Package className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={itemLabel}
              onChange={(e) => setItemLabel(e.target.value)}
              placeholder="Item name (e.g. Headphones)"
              className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
            />
          </div>

          {/* Store Selector (col 12 or 2) */}
          <div className="relative md:col-span-2 w-full">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onFocus={() => setIsStoreOpen(true)}
                placeholder="Store (Amazon)"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
              />
            </div>

            {/* Store suggestions dropdown */}
            {isStoreOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsStoreOpen(false)} />
                <div className="absolute left-0 right-0 top-14 z-30 max-h-48 overflow-y-auto rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Popular Stores
                  </div>
                  {POPULAR_STORES.map((store) => (
                    <button
                      key={store}
                      type="button"
                      onClick={() => {
                        setStoreName(store);
                        setIsStoreOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between transition-colors",
                        storeName === store && "bg-indigo-50/80 text-indigo-600 font-semibold"
                      )}
                    >
                      <span>{store}</span>
                      {storeName === store && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Submit Action (col 12 or 2) */}
          <div className="md:col-span-2 w-full flex items-center gap-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-12 px-4 shrink-0 font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Track</span>
            </Button>

            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className={cn(
                "p-3 h-12 rounded-xl border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0",
                showMoreOptions && "bg-indigo-50 text-indigo-600 border-indigo-200"
              )}
              title="Courier Selection & Options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Manual Courier Override */}
        {showMoreOptions && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="text-xs font-semibold text-slate-600">Carrier Override:</span>
            <select
              value={selectedCarrierCode}
              onChange={(e) => setSelectedCarrierCode(e.target.value)}
              className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Auto-Detect Courier</option>
              {SUPPORTED_CARRIERS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">
              Select if the tracking format matches multiple courier formats.
            </span>
          </div>
        )}

        {/* Real-time Validation Feedback */}
        {feedback && (
          <div
            className={cn(
              "mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150",
              feedback.type === "success"
                ? "bg-teal-50 text-teal-800 border border-teal-200/80"
                : "bg-red-50 text-red-700 border border-red-200/80"
            )}
          >
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}
