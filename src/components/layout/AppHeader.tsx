"use client";

import React from "react";
import { WhereBoxLogo } from "../brand/Logo";
import { NotificationDropdown } from "../ui/NotificationDropdown";
import { NotificationItem } from "@/types/shipment";
import { SearchBar } from "../ui/SearchBar";
// Header component with search, notifications, and user avatar

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
  onSelectShipment?: (shipmentId: string) => void;
  userName?: string;
}

export function AppHeader({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAllAsRead,
  onClearAllNotifications,
  onSelectShipment,
  userName = "Aman Mehta",
}: AppHeaderProps) {
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-6 max-w-7xl mx-auto">
        {/* Left: Brand on Mobile / Small tablet */}
        <div className="flex items-center gap-3 md:hidden">
          <WhereBoxLogo variant="compact" size="sm" />
          <span className="font-bold text-slate-900 tracking-tight text-base">WhereBox</span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Right: Notifications & User profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <NotificationDropdown
            notifications={notifications}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAll={onClearAllNotifications}
            onSelectShipment={onSelectShipment}
          />

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-xs">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center font-bold text-indigo-600 text-xs">
                {userInitials}
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{userName}</p>
              <p className="text-[10px] font-medium text-slate-400">Personal Vault</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
