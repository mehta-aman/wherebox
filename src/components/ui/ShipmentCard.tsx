"use client";

import React, { useState } from "react";
import { Shipment } from "@/types/shipment";
import { StatusBadge } from "./StatusBadge";
import { 
  Copy, 
  Check, 
  Clock, 
  ChevronRight, 
  Calendar, 
  RotateCw,
  Mail,
  Archive,
  Trash2
} from "lucide-react";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ShipmentCardProps {
  shipment: Shipment;
  onSelect: (shipment: Shipment) => void;
  onArchive?: (shipmentId: string) => void;
  onDelete?: (shipmentId: string) => void;
  onRefresh?: (shipmentId: string) => void;
}

export function ShipmentCard({
  shipment,
  onSelect,
  onArchive,
  onDelete,
  onRefresh,
}: ShipmentCardProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh(shipment.id);
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) onArchive(shipment.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm("Remove this package from your tracking dashboard?")) {
      onDelete(shipment.id);
    }
  };

  const latestEvent = shipment.events && shipment.events.length > 0 ? shipment.events[0] : null;
  const storeInitial = shipment.storeName ? shipment.storeName.charAt(0).toUpperCase() : "P";

  return (
    <div
      onClick={() => onSelect(shipment)}
      className="group relative rounded-2xl bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-indigo-200/90 p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.12)] transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
        {/* Store & Item info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-indigo-600 shrink-0 text-sm shadow-xs">
            {storeInitial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm truncate">
                {shipment.storeName || "Package"}
              </span>
              {shipment.sourceType === "email" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
                  <Mail className="w-2.5 h-2.5" />
                  Gmail
                </span>
              )}
            </div>
            {shipment.itemLabel ? (
              <p className="text-xs text-slate-600 truncate mt-0.5 max-w-xs sm:max-w-md">
                {shipment.itemLabel}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-0.5">Order #{shipment.orderReference || "—"}</p>
            )}
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <StatusBadge status={shipment.normalizedStatus} />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefreshClick}
              title="Refresh tracking status"
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/80 transition-colors"
            >
              <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-indigo-600")} />
            </button>
            {onArchive && (
              <button
                type="button"
                onClick={handleArchiveClick}
                title={shipment.isArchived ? "Unarchive" : "Archive"}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors hidden group-hover:inline-flex"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                title="Delete package"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors hidden group-hover:inline-flex"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Middle row: Courier & Tracking Number */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 bg-slate-100/90 px-2.5 py-1 rounded-lg">
            {shipment.carrierName}
          </span>
          <div className="flex items-center gap-1 font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
            <span>{shipment.trackingNumber}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
              title="Copy tracking number"
            >
              {copied ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Estimated Delivery */}
        {shipment.estimatedDeliveryAt && (
          <div className="flex items-center gap-1.5 text-slate-600 font-medium bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-100/80 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Est: {formatDate(shipment.estimatedDeliveryAt)}</span>
          </div>
        )}
      </div>

      {/* Bottom row: Latest Event & Time */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 min-w-0 pr-3">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px] text-slate-600">
            {latestEvent ? latestEvent.description : shipment.rawStatus}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-[11px] text-slate-400">
          <span>{formatRelativeTime(shipment.lastEventAt || shipment.updatedAt)}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
