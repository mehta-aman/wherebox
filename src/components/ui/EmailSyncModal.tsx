"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { 
  X, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  RotateCw,
  LogOut,
  ExternalLink,
  Key,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { parseOrderEmail } from "@/lib/email/parser";

interface EmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipmentDiscovered?: () => void;
  onAddDemoShipment?: (payload: {
    trackingNumber: string;
    storeName: string;
    itemLabel: string;
    carrierCode?: string;
  }) => void;
  isDemo?: boolean;
}

export function EmailSyncModal({
  isOpen,
  onClose,
  onShipmentDiscovered,
  onAddDemoShipment,
  isDemo,
}: EmailSyncModalProps) {
  const [emailText, setEmailText] = useState("");
  const [senderEmail, setSenderEmail] = useState("auto-confirm@amazon.in");
  const [subject, setSubject] = useState("Dispatched: Apple AirPods Pro (2nd Gen)");
  const [isLoading, setIsLoading] = useState(false);
  const [isGmailSyncing, setIsGmailSyncing] = useState(false);
  const [googleAccount, setGoogleAccount] = useState<{
    connected: boolean;
    configured?: boolean;
    email?: string;
    lastSyncedAt?: string;
  }>({ connected: false, configured: false });
  const [showCredsForm, setShowCredsForm] = useState(false);
  const [inputClientId, setInputClientId] = useState("");
  const [inputClientSecret, setInputClientSecret] = useState("");
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
    details?: string;
  } | null>(null);

  // Check Google connected status when modal opens
  const checkGoogleStatus = useCallback(async () => {
    if (isDemo) return;
    try {
      const res = await fetch("/api/auth/google/status");
      if (res.ok) {
        const data = await res.json();
        setGoogleAccount(data);
      }
    } catch {
      // ignore
    }
  }, [isDemo]);

  useEffect(() => {
    if (isOpen) {
      checkGoogleStatus();
    }
  }, [isOpen, checkGoogleStatus]);

  if (!isOpen) return null;

  const handleConnectGmail = () => {
    if (!googleAccount.configured) {
      setShowCredsForm((prev) => !prev);
      return;
    }
    window.location.href = "/api/auth/google/connect";
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientId.trim() || !inputClientSecret.trim()) return;

    setIsSavingCreds(true);
    setResultMessage(null);

    try {
      const res = await fetch("/api/settings/google-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: inputClientId.trim(),
          clientSecret: inputClientSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResultMessage({
          type: "error",
          text: data.error || "Failed to save Google credentials",
        });
      } else {
        setResultMessage({
          type: "success",
          text: "Google OAuth credentials configured! Redirecting to Google authorization...",
        });
        setGoogleAccount((prev) => ({ ...prev, configured: true }));
        setShowCredsForm(false);
        setTimeout(() => {
          window.location.href = "/api/auth/google/connect";
        }, 1000);
      }
    } catch (err) {
      setResultMessage({
        type: "error",
        text: (err as Error).message || "Failed to save credentials",
      });
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleSimulateConnected = () => {
    setGoogleAccount({
      connected: true,
      configured: true,
      email: "amanmehta519@gmail.com",
      lastSyncedAt: new Date().toISOString(),
    });
    setShowCredsForm(false);
    setResultMessage({
      type: "success",
      text: "Simulated Gmail connected as amanmehta519@gmail.com!",
      details: "You can now test syncing or use the sample presets below.",
    });
  };

  const handleSyncGmailLive = async () => {
    setIsGmailSyncing(true);
    setResultMessage(null);
    try {
      const res = await fetch("/api/sync/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysBack: 14 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResultMessage({
          type: "error",
          text: data.error || "Gmail synchronization failed",
          details: data.instruction,
        });
      } else {
        setResultMessage({
          type: "success",
          text: data.message || "Gmail sync completed!",
          details: `Scanned ${data.scannedCount || 0} order emails.`,
        });
        if (onShipmentDiscovered) {
          onShipmentDiscovered();
        }
        checkGoogleStatus();
      }
    } catch (err) {
      setResultMessage({
        type: "error",
        text: (err as Error).message || "Failed to sync Gmail",
      });
    } finally {
      setIsGmailSyncing(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm("Are you sure you want to disconnect Gmail and revoke tokens?")) return;
    try {
      await fetch("/api/auth/google/disconnect", { method: "POST" });
      setGoogleAccount({ connected: false });
      setResultMessage({
        type: "success",
        text: "Gmail account disconnected successfully.",
      });
    } catch {
      // ignore
    }
  };

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
      if (isDemo) {
        const clientParsed = parseOrderEmail({
          from: senderEmail,
          subject,
          bodyText: emailText,
        });

        if (clientParsed && clientParsed.trackingNumber) {
          if (onAddDemoShipment) {
            onAddDemoShipment({
              trackingNumber: clientParsed.trackingNumber,
              storeName: clientParsed.storeName,
              itemLabel: clientParsed.itemTitle || "Discovered Order Item",
              carrierCode: clientParsed.carrierCode,
            });
          }
          setResultMessage({
            type: "success",
            text: `Discovered "${clientParsed.itemTitle}" from ${clientParsed.storeName}!`,
            details: `Waybill #${clientParsed.trackingNumber} added to demo dashboard.`,
          });
          setIsLoading(false);
          return;
        }
      }

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
        if (res.status === 401) {
          // Graceful fallback for unauthenticated preview mode
          const clientParsed = parseOrderEmail({
            from: senderEmail,
            subject,
            bodyText: emailText,
          });

          if (clientParsed && clientParsed.trackingNumber) {
            if (onAddDemoShipment) {
              onAddDemoShipment({
                trackingNumber: clientParsed.trackingNumber,
                storeName: clientParsed.storeName,
                itemLabel: clientParsed.itemTitle || "Discovered Order Item",
                carrierCode: clientParsed.carrierCode,
              });
            }
            setResultMessage({
              type: "success",
              text: `Discovered "${clientParsed.itemTitle}" from ${clientParsed.storeName}!`,
              details: `Added in preview mode. Sign in to sync permanently to your private database vault.`,
            });
            setIsLoading(false);
            return;
          }
        }

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

          {/* Google Account Live Integration Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Google Workspace & Gmail</span>
                    {googleAccount.connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        Not Connected
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {googleAccount.connected
                      ? `Syncing orders from ${googleAccount.email} (Last synced: ${googleAccount.lastSyncedAt ? new Date(googleAccount.lastSyncedAt).toLocaleTimeString() : "Just now"})`
                      : "Connect your Gmail to automatically detect packages from Amazon, Myntra & Flipkart."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {googleAccount.connected ? (
                  <>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={isGmailSyncing}
                      onClick={handleSyncGmailLive}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </Button>
                    <button
                      type="button"
                      onClick={handleDisconnectGmail}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Disconnect Gmail"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleConnectGmail}
                  >
                    <span>{googleAccount.configured ? "Connect Gmail" : "Setup Google OAuth"}</span>
                    {googleAccount.configured ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : showCredsForm ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Google OAuth Credentials Configuration Accordion */}
            {showCredsForm && !googleAccount.connected && (
              <form onSubmit={handleSaveCredentials} className="mt-4 pt-4 border-t border-slate-200/80 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    Google Cloud Credentials Setup
                  </span>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Get Free Keys on Google Cloud</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  In Google Cloud Console, create an <strong>OAuth 2.0 Client ID</strong> (Web App). Add authorized redirect URI:{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                    http://localhost:3000/api/auth/google/callback
                  </code>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Google Client ID
                    </label>
                    <input
                      type="text"
                      value={inputClientId}
                      onChange={(e) => setInputClientId(e.target.value)}
                      placeholder="123456789-xxx.apps.googleusercontent.com"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Google Client Secret
                    </label>
                    <input
                      type="password"
                      value={inputClientSecret}
                      onChange={(e) => setInputClientSecret(e.target.value)}
                      placeholder="GOCSPX-xxxxxxxxx"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulateConnected}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
                  >
                    Simulate Connect (No Cloud Keys Required)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCredsForm(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSavingCreds}
                    >
                      <span>Save & Connect</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}
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
