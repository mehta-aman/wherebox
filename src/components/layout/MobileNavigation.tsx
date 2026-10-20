"use client";

import React from "react";
import { NavTab } from "./ResponsiveSidebar";
import { LayoutDashboard, Package, Calendar, Archive, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeCount?: number;
  upcomingCount?: number;
}

export function MobileNavigation({
  activeTab,
  onTabChange,
  activeCount = 0,
  upcomingCount = 0,
}: MobileNavigationProps) {
  const items = [
    { id: "dashboard" as NavTab, label: "Home", icon: LayoutDashboard },
    { id: "packages" as NavTab, label: "Packages", icon: Package, badge: activeCount },
    { id: "upcoming" as NavTab, label: "Upcoming", icon: Calendar, badge: upcomingCount },
    { id: "archived" as NavTab, label: "Archived", icon: Archive },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-slate-200/80 px-2 pt-1 pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center w-14 h-full py-1 text-[10px] font-semibold transition-all",
                isActive ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-700"
              )}
            >
              <div className="relative">
                <IconComponent className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="mt-1 leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
