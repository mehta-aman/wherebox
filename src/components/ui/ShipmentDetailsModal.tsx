"use client";

import React, { useState, useEffect } from "react";
import { Shipment } from "@/types/shipment";
import { StatusBadge } from "./StatusBadge";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { Button } from "./Button";
import { 
  X, 
  Copy, 
  Check, 
  RotateCw, 
  Calendar, 
  Archive, 
  Trash2,
  Package,
  Truck,
  Building2,
  Globe,
  Clock,
  Edit2,
  Save,
  Tag,
  Receipt,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface ShipmentDetailsModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: (shipmentId: string) => Promise<void>;
  onArchive?: (shipmentId: string) => void;
  onDelete?: (shipmentId: string) => void;
  onUpdate?: (
    shipmentId: string,
    updates: { itemLabel?: string; storeName?: string; orderReference?: string }
  ) => Promise<void>;
}

export function ShipmentDetailsModal({
  shipment,
  isOpen,
  onClose,
  onRefresh,
  onArchive,
  onDelete,
  onUpdate,
}: ShipmentDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [editItemLabel, setEditItemLabel] = useState("");
  const [editStoreName, setEditStoreName] = useState("");
  const [editOrderRef, setEditOrderRef] = useState("");

  useEffect(() => {
    if (shipment) {
      setEditItemLabel(shipment.itemLabel || "");
      setEditStoreName(shipment.storeName || "");
      setEditOrderRef(shipment.orderReference || "");
      setIsEditing(false);
      setSaveSuccess(false);
    }
  }, [shipment]);

  if (!isOpen || !shipment) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh(shipment.id);
      setIsRefreshing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(shipment.id, {
        itemLabel: editItemLabel.trim() || undefined,
        storeName: editStoreName.trim() || undefined,
        orderReference: editOrderRef.trim() || undefined,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // handled
    } finally {
      setIsSaving(false);
    }
  };

  const packageName = shipment.itemLabel || shipment.storeName || "Package Shipment";
  const brandName = shipment.storeName || "Direct Consignment";
  const courierName = shipment.carrierName || "Express Courier";
  const sourceName = shipment.providerName || (shipment.sourceType === "email" ? "Gmail Auto-Sync" : "Direct Carrier API");

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
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 shrink-0">
              {brandName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 truncate">
                  {packageName}
                </h3>
                <StatusBadge status={shipment.normalizedStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700">{brandName}</span>
                <span>•</span>
                <span className="text-indigo-600 font-bold">{courierName}</span>
                {shipment.orderReference && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-500 font-semibold">
                      Ref #{shipment.orderReference.replace(/^#/, "")}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onUpdate && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 transition-colors"
                title="Edit item title and order details"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Details</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Success Banner if just saved */}
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Order details updated successfully!</span>
            </div>
          )}

          {/* Edit Form Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Customize Order Information</span>
                </div>
                <span className="text-[11px] text-indigo-600 font-medium">Saved to your private vault</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product / Item Name
                  </label>
                  <input
                    type="text"
                    value={editItemLabel}
                    onChange={(e) => setEditItemLabel(e.target.value)}
                    placeholder="e.g. Nike Air Jordan 1, Apple AirPods Pro, Linen Shirt"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store / Brand / Platform
                    </label>
                    <input
                      type="text"
                      value={editStoreName}
                      onChange={(e) => setEditStoreName(e.target.value)}
                      placeholder="e.g. Amazon, Flipkart, Myntra, Zara"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Order ID / Reference
                    </label>
                    <input
                      type="text"
                      value={editOrderRef}
                      onChange={(e) => setEditOrderRef(e.target.value)}
                      placeholder="e.g. #OD4281928, #544099"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSaving}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Details</span>
                </Button>
              </div>
            </form>
          ) : null}

          {/* 4-Card Full Specification Grid (Package Name, Courier, Brand, Source) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Full Package Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Package className="w-3.5 h-3.5 text-indigo-500" />
                <span>Product / Item Label</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                {packageName}
              </p>
            </div>

            {/* 2. Courier Name */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Delivery Courier Partner</span>
              </div>
              <p className="text-sm font-bold text-indigo-950 mt-1">
                {courierName}
              </p>
            </div>

            {/* 3. Brand / Platform Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Brand / Platform Name</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {brandName}
              </p>
            </div>

            {/* 4. Source Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>Tracking Data Source</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>{sourceName}</span>
              </p>
            </div>
          </div>

          {/* Quick Tracking & Estimated Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tracking Number */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tracking Number
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">
                  {shipment.trackingNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-200/60 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Estimated Delivery */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estimated Delivery
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {shipment.estimatedDeliveryAt
                    ? formatDate(shipment.estimatedDeliveryAt)
                    : "Carrier Pending Estimate"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details & Logistics Reference Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                Logistics & Order Reference
              </span>
              {shipment.orderReference && (
                <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {shipment.orderReference}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                <strong>Gmail Auto-Discovery (Milestone 5):</strong> Connects directly to Amazon, Flipkart & Myntra order emails to automatically sync product photos, item titles, and invoices.
              </span>
            </div>
          </div>

          {/* Verbatim Courier Status Scan Note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Latest Courier Scan Note
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Last updated {formatRelativeTime(shipment.lastEventAt || shipment.lastCheckedAt)}
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed font-semibold">
              &ldquo;{shipment.rawStatus}&rdquo;
            </p>
          </div>

          {/* Chronological Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Transit Scan History ({shipment.events?.length || 0})
              </h4>
            </div>
            <ShipmentTimeline events={shipment.events} carrierName={shipment.carrierName} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onArchive && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => {
                  onArchive(shipment.id);
                  onClose();
                }}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{shipment.isArchived ? "Unarchive" : "Archive"}</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Are you sure you want to remove this shipment from your tracking dashboard?")) {
                    onDelete(shipment.id);
                    onClose();
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {onRefresh && (
              <Button
                variant="secondary"
                size="sm"
                isLoading={isRefreshing}
                onClick={handleRefresh}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh Live</span>
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
