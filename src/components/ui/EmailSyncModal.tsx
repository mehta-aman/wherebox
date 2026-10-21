"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { 
  X, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Building2, 
  ShieldCheck 
} from "lucide-react";

interface EmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipmentDiscovered?: () => void;
}

export function EmailSyncModal({
  isOpen,
  onClose,
  onShipmentDiscovered,
}: EmailSyncModalProps) {
  const [emailText, setEmailText] = useState("");
  const [senderEmail, setSenderEmail] = useState("auto-confirm@amazon.in");
  const [subject, setSubject] = useState("Dispatched: Apple AirPods Pro (2nd Gen)");
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
    details?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleQuickPreset = (preset: "amazon" | "myntra" | "flipkart") => {
    if (preset === "amazon") {
      setSenderEmail("auto-confirm@amazon.in");
      setSubject("Dispatched: Apple AirPods Pro (2nd Gen)");
      setEmailText(
        "Hi Aman,\nYour order 402-8291024-9182312 has been dispatched!\nItem: Apple AirPods Pro (2nd Gen) with MagSafe Case\nTracking Number: TBA304918239012\nShipped via Amazon Logistics. Order total: ₹18,990."
      );
    } else if (preset === "myntra") {
      setSenderEmail("updates@myntra.com");
      setSubject("Your Myntra package is on its way!");
      setEmailText(
        "Order #544099 has been dispatched via Delhivery.\nAWB: 43688113129125\nItem: Puma RS-X Men Sneakers (White/Navy)\nPayment: Cash on Delivery (COD) - ₹4,299."
      );
    } else if (preset === "flipkart") {
      setSenderEmail("order-update@flipkart.com");
      setSubject("Your order for Sony Headphones has shipped!");
      setEmailText(
        "Order ID: OD428192019283120192\nProduct: Sony WH-1000XM5 Wireless Noise Cancelling Headphones\nEkart Tracking ID: FMPC092182912\nTotal Amount: ₹26,990."
      );
    }
  };

  const handleParseAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim() && !subject.trim()) return;

    setIsLoading(true);
    setResultMessage(null);

    try {
      const res = await fetch("/api/sync/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: senderEmail,
          subject,
          bodyText: emailText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResultMessage({
          type: "error",
          text: data.error || "Failed to parse email",
          details: data.suggestion,
        });
      } else {
        setResultMessage({
          type: "success",
          text: data.message || "Package successfully discovered!",
          details: `Item: ${data.parsed?.itemTitle} • Store: ${data.parsed?.storeName} • Waybill: ${data.parsed?.trackingNumber}`,
        });
        if (onShipmentDiscovered) {
          onShipmentDiscovered();
        }
      }
    } catch (err) {
      setResultMessage({
        type: "error",
        text: (err as Error).message || "Network error syncing email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Gmail & Email Order Discovery
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Milestone 5
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Automatically extracts exact product names, store brands, and tracking waybills.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Privacy & Zero-Knowledge Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Zero-Storage Privacy Architecture</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                WhereBox only extracts package metadata (product name, tracking number). Raw email bodies are processed in-memory and immediately destroyed. We never read or store personal communications.
              </p>
            </div>
          </div>

          {/* Preset Buttons for Quick Demo Testing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Try Sample Order Emails (1-Click Test)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset("amazon")}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">Amazon India</p>
                  <p className="text-[10px] text-slate-400 truncate">AirPods Pro</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset("myntra")}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0">
                  M
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">Myntra Fashion</p>
                  <p className="text-[10px] text-slate-400 truncate">Puma RS-X</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset("flipkart")}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  F
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">Flipkart</p>
                  <p className="text-[10px] text-slate-400 truncate">Sony Headphones</p>
                </div>
              </button>
            </div>
          </div>

          {/* Test Form */}
          <form onSubmit={handleParseAndSync} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. auto-confirm@amazon.in"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Dispatched: Sony WH-1000XM5"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Content / Dispatch Text
              </label>
              <textarea
                rows={4}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste the dispatch email body text containing the tracking number and product name..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Results / Feedback */}
            {resultMessage && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2 animate-in fade-in ${
                  resultMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {resultMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{resultMessage.text}</p>
                  {resultMessage.details && (
                    <p className="text-[11px] opacity-90 mt-0.5">{resultMessage.details}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Supports Amazon, Flipkart, Myntra, Meesho, Ajio & Couriers
              </span>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
              >
                <span>Auto-Discover Package</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Google OAuth (<code className="font-mono text-[10px] bg-slate-200/80 px-1 py-0.5 rounded">gmail.readonly</code>) can be connected in Cloud Console.
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
