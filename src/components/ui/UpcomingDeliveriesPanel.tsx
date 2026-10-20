"use client";

import React from "react";
import { Shipment } from "@/types/shipment";
import { Calendar, ChevronRight, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UpcomingDeliveriesPanelProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
}

export function UpcomingDeliveriesPanel({
  shipments,
  onSelectShipment,
}: UpcomingDeliveriesPanelProps) {
  // Filter for active packages with an estimated delivery date
  const upcoming = shipments
    .filter((s) => !s.isArchived && s.normalizedStatus !== "DELIVERED" && s.estimatedDeliveryAt)
    .sort((a, b) => new Date(a.estimatedDeliveryAt!).getTime() - new Date(b.estimatedDeliveryAt!).getTime());

  if (upcoming.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 text-center">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-2">
          <Calendar className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-800">No Scheduled Deliveries</h4>
        <p className="text-[11px] text-slate-500 mt-1">
          Carrier delivery estimates will be plotted here as they become available.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Upcoming Deliveries
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {upcoming.length} expected
        </span>
      </div>

      <div className="space-y-2.5">
        {upcoming.map((shipment) => {
          const estDate = new Date(shipment.estimatedDeliveryAt!);
          const now = new Date();
          const isToday = estDate.toDateString() === now.toDateString();
          const isTomorrow =
            new Date(now.getTime() + 24 * 3600 * 1000).toDateString() === estDate.toDateString();

          const label = isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(shipment.estimatedDeliveryAt);

          return (
            <div
              key={shipment.id}
              onClick={() => onSelectShipment(shipment)}
              className="p-3 rounded-xl bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-200/60 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase",
                      isToday
                        ? "bg-purple-100 text-purple-700"
                        : isTomorrow
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200/70 text-slate-700"
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {shipment.storeName || "Package"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">
                  {shipment.itemLabel || shipment.trackingNumber}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-medium">
                  {shipment.carrierName}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400">
        <AlertCircle className="w-3 h-3 text-slate-300 shrink-0" />
        <span>Dates are courier estimates and may shift based on transit conditions.</span>
      </div>
    </div>
  );
}
