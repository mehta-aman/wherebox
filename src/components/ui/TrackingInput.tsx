"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowRight, Sparkles, Check, AlertCircle, Plus } from "lucide-react";
import { Button } from "./Button";
import { detectCarrierHeuristic } from "@/lib/carriers";
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
  const [customNote, setCustomNote] = useState("");
  const [showCustomNote, setShowCustomNote] = useState(false);
  const [detectedCarrier, setDetectedCarrier] = useState<CarrierInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (trackingNumber.trim().length >= 4) {
      const carrier = detectCarrierHeuristic(trackingNumber);
      setDetectedCarrier(carrier);
    } else {
      setDetectedCarrier(null);
    }
  }, [trackingNumber]);

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
        itemLabel: customNote.trim() || undefined,
        carrier: detectedCarrier || undefined,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message || `Package #${cleanNumber} tracked successfully!` });
        setTrackingNumber("");
        setCustomNote("");
        setShowCustomNote(false);
        setDetectedCarrier(null);
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
        className="p-3 sm:p-4 rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_-6px_rgba(99,102,241,0.12)] transition-all"
      >
        <div className="flex flex-col sm:flex-row gap-2.5 items-center">
          {/* Single Primary Tracking Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="Paste or type tracking number (Delhivery, Blue Dart, DTDC, India Post, Ekart...)"
              className="w-full h-13 pl-11 pr-32 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
            />
            {/* Auto-detected Carrier Badge */}
            {detectedCarrier && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold shadow-xs animate-in fade-in zoom-in-95 duration-150">
                <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>{detectedCarrier.name}</span>
              </div>
            )}
          </div>

          {/* Single Action Button */}
          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            className="w-full sm:w-auto h-13 px-7 rounded-2xl shrink-0 font-bold text-sm shadow-md shadow-indigo-500/25"
          >
            <span>Track Package</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Optional Custom Note Expander */}
        <div className="mt-2.5 px-1 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Carrier, platform, destination, status, and timeline are resolved automatically.</span>
          </div>
          {!showCustomNote ? (
            <button
              type="button"
              onClick={() => setShowCustomNote(true)}
              className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add custom label</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowCustomNote(false);
                setCustomNote("");
              }}
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {showCustomNote && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Optional custom label (e.g. Birthday Gift, Work Laptop, Sneakers)"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Real-time Validation / Feedback Banner */}
        {feedback && (
          <div
            className={cn(
              "mt-3 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150",
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
            <span className="font-semibold">{feedback.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}
