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
  Truck,
  Building2,
  Package
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

  const latestEvent = shipment.events && shipment.events.length > 0 ? shipment.events[0] : null;
  const storeName = shipment.storeName || "Online Store";
  const packageName = shipment.itemLabel || shipment.storeName || "Package Shipment";

  return (
    <div
      onClick={() => onSelect(shipment)}
      className="group relative rounded-3xl bg-white/85 hover:bg-white backdrop-blur-xl border border-white/80 hover:border-indigo-300/80 p-4 sm:p-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(99,102,241,0.15)] transition-all duration-200 cursor-pointer"
    >
      {/* Top Bar: Highlighted Brand & Courier Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Highlighted Brand / Platform Name */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/90 shadow-2xs group-hover:bg-slate-200/70 transition-colors">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{storeName}</span>
          </span>

          {/* Highlighted Courier Partner Name */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{shipment.carrierName}</span>
          </span>

          {shipment.sourceType === "email" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
              <Mail className="w-2.5 h-2.5" />
              Gmail
            </span>
          )}
        </div>

        {/* Status Badge & Refresh Button */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={shipment.normalizedStatus} size="sm" />
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Refresh tracking status"
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/80 transition-colors"
          >
            <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-indigo-600")} />
          </button>
        </div>
      </div>

      {/* Middle: Full Package / Product Name */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500 shrink-0" />
            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
              {packageName}
            </h4>
          </div>
          {shipment.orderReference && (
            <p className="text-[11px] font-mono text-slate-400 mt-1 pl-6">
              Ref #{shipment.orderReference}
            </p>
          )}
        </div>

        {/* Estimated Delivery Date Badge */}
        {shipment.estimatedDeliveryAt && (
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-indigo-50/70 px-2.5 py-1.5 rounded-xl border border-indigo-100 text-[11px] shrink-0">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Est: {formatDate(shipment.estimatedDeliveryAt)}</span>
          </div>
        )}
      </div>

      {/* Bottom Row: Tracking Number, Latest Event & Relative Time */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Tracking Number pill */}
        <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 text-xs">
          <span>{shipment.trackingNumber}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
            title="Copy tracking number"
          >
            {copied ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Latest Scan description */}
        <div className="flex items-center gap-1.5 min-w-0 max-w-xs sm:max-w-md text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px] text-slate-600">
            {latestEvent ? latestEvent.description : shipment.rawStatus}
          </span>
        </div>

        {/* Relative time & chevron */}
        <div className="flex items-center gap-1 shrink-0 text-[11px] text-slate-400 font-medium">
          <span>{formatRelativeTime(shipment.lastEventAt || shipment.updatedAt)}</span>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
