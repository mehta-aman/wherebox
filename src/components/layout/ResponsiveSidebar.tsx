"use client";

import React from "react";
import { WhereBoxLogo } from "../brand/Logo";
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Archive, 
  Settings, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "dashboard" | "packages" | "upcoming" | "archived" | "settings";

interface ResponsiveSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeCount?: number;
  upcomingCount?: number;
  archivedCount?: number;
}

export function ResponsiveSidebar({
  activeTab,
  onTabChange,
  activeCount = 0,
  upcomingCount = 0,
  archivedCount = 0,
}: ResponsiveSidebarProps) {
  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "packages" as NavTab,
      label: "All Packages",
      icon: Package,
      badge: activeCount > 0 ? activeCount : null,
    },
    {
      id: "upcoming" as NavTab,
      label: "Upcoming",
      icon: Calendar,
      badge: upcomingCount > 0 ? upcomingCount : null,
    },
    {
      id: "archived" as NavTab,
      label: "Archived",
      icon: Archive,
      badge: archivedCount > 0 ? archivedCount : null,
    },
    {
      id: "settings" as NavTab,
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 p-5 border-r border-slate-200/70 bg-white/60 backdrop-blur-2xl min-h-screen justify-between sticky top-0 h-screen select-none">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="px-2 pt-1">
          <WhereBoxLogo variant="with-tagline" size="md" />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent text-indigo-600 border border-indigo-200/80 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <IconComponent
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200/80 text-slate-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Privacy & Status */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60 px-2">
        {/* Privacy badge */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-slate-800">Private & Scoped</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Personal tracking dashboard. Zero data sharing.
            </p>
          </div>
        </div>

        {/* User preview / version */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
          <span>WhereBox v1.0 MVP</span>
          <span className="flex items-center gap-1 text-teal-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </aside>
  );
}
