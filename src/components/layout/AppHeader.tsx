"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WhereBoxLogo } from "../brand/Logo";
import { NotificationDropdown } from "../ui/NotificationDropdown";
import { NotificationItem } from "@/types/shipment";
import { SearchBar } from "../ui/SearchBar";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User, Sparkles, ChevronDown } from "lucide-react";

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
  onSelectShipment?: (shipmentId: string) => void;
  userName?: string;
  userEmail?: string;
  isDemo?: boolean;
}

export function AppHeader({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAllAsRead,
  onClearAllNotifications,
  onSelectShipment,
  userName = "Aman Mehta",
  userEmail,
  isDemo = false,
}: AppHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  const userInitials = (userName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

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

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200/80 cursor-pointer group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-xs transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center font-bold text-indigo-600 text-xs">
                  {userInitials}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {userName}
                  </p>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <p className="text-[10px] font-medium text-slate-400">
                  {isDemo ? "Demo Vault" : "Personal Vault"}
                </p>
              </div>
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15)] z-40 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    {userEmail && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>
                    )}
                    {isDemo && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 mt-1.5">
                        <Sparkles className="w-2.5 h-2.5" /> Demo Mode
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    {isDemo ? (
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In with Account</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
