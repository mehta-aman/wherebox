"use client";

import React, { useState } from "react";
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
  Trash2
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface ShipmentDetailsModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: (shipmentId: string) => Promise<void>;
  onArchive?: (shipmentId: string) => void;
  onDelete?: (shipmentId: string) => void;
}

export function ShipmentDetailsModal({
  shipment,
  isOpen,
  onClose,
  onRefresh,
  onArchive,
  onDelete,
}: ShipmentDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              {shipment.storeName ? shipment.storeName.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {shipment.storeName || "Package"}
                </h3>
                <StatusBadge status={shipment.normalizedStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {shipment.itemLabel || `Order #${shipment.orderReference || "—"}`}
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Courier & Tracking # */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Courier & Tracking
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{shipment.carrierName}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs font-mono text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200/60 transition-colors"
                >
                  <span>{shipment.trackingNumber}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Estimated Delivery
              </span>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-800">
                  {shipment.estimatedDeliveryAt
                    ? formatDate(shipment.estimatedDeliveryAt)
                    : "Pending Carrier Estimate"}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Provider Status Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-900">Latest Carrier Scan Note</span>
              <span className="text-[11px] text-indigo-500 font-medium">
                Last checked {formatRelativeTime(shipment.lastCheckedAt)}
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed font-medium">
              &ldquo;{shipment.rawStatus}&rdquo;
            </p>
          </div>

          {/* Chronological Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">Tracking Event Timeline</h4>
              <span className="text-xs text-slate-500">
                {shipment.events?.length || 0} event{shipment.events?.length === 1 ? "" : "s"}
              </span>
            </div>
            <ShipmentTimeline events={shipment.events} carrierName={shipment.carrierName} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
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
                <span>Refresh Now</span>
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
