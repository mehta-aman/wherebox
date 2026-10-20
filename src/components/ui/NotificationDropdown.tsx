"use client";

import React, { useState } from "react";
import { NotificationItem } from "@/types/shipment";
import { StatusBadge } from "./StatusBadge";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectShipment?: (shipmentId: string) => void;
}

export function NotificationDropdown({
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectShipment,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15)] z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="text-[11px] text-slate-400 hover:text-red-600 font-medium p-1 rounded"
                    title="Clear all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  No new notifications
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectShipment) onSelectShipment(item.shipmentId);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-3 text-left",
                      !item.isRead && "bg-indigo-50/30"
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      <StatusBadge status={item.status} size="sm" showIcon={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        #{item.trackingNumber}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
