"use client";

import React from "react";
import { TrackingEvent } from "@/types/shipment";
import { StatusBadge, getStatusConfig } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShipmentTimelineProps {
  events: TrackingEvent[];
  className?: string;
  carrierName?: string;
}

export function ShipmentTimeline({ events, className, carrierName }: ShipmentTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-slate-50/80 border border-slate-200/80">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No tracking events recorded yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Carrier status updates will appear here once scanned by {carrierName || "the courier"}.
        </p>
      </div>
    );
  }

  // Sort chronological descending (latest event on top)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={cn("relative pl-6 space-y-6", className)}>
      {/* Vertical timeline connecting line */}
      <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-200 to-slate-200" />

      {sortedEvents.map((evt, idx) => {
        const isLatest = idx === 0;
        const config = getStatusConfig(evt.normalizedStatus);
        const IconComponent = config.icon;

        return (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={cn(
                "absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs transition-transform duration-200",
                isLatest
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110"
                  : "bg-slate-200 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              )}
            >
              <IconComponent className="w-2.5 h-2.5" />
            </div>

            {/* Event detail card */}
            <div
              className={cn(
                "p-3.5 rounded-xl border transition-all duration-200",
                isLatest
                  ? "bg-white/90 border-indigo-200 shadow-sm"
                  : "bg-white/60 hover:bg-white/80 border-slate-200/60"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={evt.normalizedStatus} size="sm" />
                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                  {formatDate(evt.timestamp)}
                </span>
              </div>

              {/* Carrier Event Description */}
              <p className="text-xs font-medium text-slate-800 mt-2 leading-relaxed">
                {evt.description}
              </p>

              {/* Location info if present */}
              {evt.location && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{evt.location}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
