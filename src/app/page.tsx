"use client";

import React, { useState, useMemo } from "react";
import { ResponsiveSidebar, NavTab } from "@/components/layout/ResponsiveSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { TrackingInput } from "@/components/ui/TrackingInput";
import { SummaryCard, SummaryFilterType } from "@/components/ui/SummaryCard";
import { ShipmentCard } from "@/components/ui/ShipmentCard";
import { ShipmentDetailsModal } from "@/components/ui/ShipmentDetailsModal";
import { UpcomingDeliveriesPanel } from "@/components/ui/UpcomingDeliveriesPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { BrandAssetsViewer } from "@/components/brand/BrandAssetsViewer";
import { DEMO_SHIPMENTS, DEMO_NOTIFICATIONS, computeSummary } from "@/data/demo-shipments";
import { Shipment, NotificationItem, CarrierInfo } from "@/types/shipment";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [activeNavTab, setActiveNavTab] = useState<NavTab>("dashboard");
  const [shipments, setShipments] = useState<Shipment[]>(DEMO_SHIPMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSummaryFilter, setSelectedSummaryFilter] = useState<SummaryFilterType>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");

  // Compute live summary statistics
  const summary = useMemo(() => computeSummary(shipments), [shipments]);

  // Unique carriers present in user's shipments
  const activeCarriers = useMemo(() => {
    const list = Array.from(new Set(shipments.map((s) => s.carrierName)));
    return list.sort();
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // Nav tab filtering
      if (activeNavTab === "archived") {
        if (!s.isArchived) return false;
      } else {
        if (s.isArchived) return false;
      }

      if (activeNavTab === "upcoming") {
        if (!s.estimatedDeliveryAt || s.normalizedStatus === "DELIVERED") return false;
      }

      // Summary Card filter
      if (selectedSummaryFilter === "in_transit") {
        if (!["IN_TRANSIT", "SHIPPED", "AT_FACILITY"].includes(s.normalizedStatus)) return false;
      } else if (selectedSummaryFilter === "out_for_delivery") {
        if (s.normalizedStatus !== "OUT_FOR_DELIVERY") return false;
      } else if (selectedSummaryFilter === "delivered") {
        if (s.normalizedStatus !== "DELIVERED") return false;
      } else if (selectedSummaryFilter === "exceptions") {
        if (!["DELAYED", "EXCEPTION", "DELIVERY_ATTEMPTED"].includes(s.normalizedStatus)) return false;
      }

      // Carrier filter
      if (carrierFilter !== "all" && s.carrierName !== carrierFilter) {
        return false;
      }

      // Search query filter (matches tracking number, store, carrier, product, order)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesNumber = s.trackingNumber.toLowerCase().includes(query);
        const matchesStore = s.storeName?.toLowerCase().includes(query) ?? false;
        const matchesCarrier = s.carrierName.toLowerCase().includes(query);
        const matchesItem = s.itemLabel?.toLowerCase().includes(query) ?? false;
        const matchesOrder = s.orderReference?.toLowerCase().includes(query) ?? false;

        if (!matchesNumber && !matchesStore && !matchesCarrier && !matchesItem && !matchesOrder) {
          return false;
        }
      }

      return true;
    });
  }, [shipments, activeNavTab, selectedSummaryFilter, carrierFilter, searchQuery]);

  // Handle adding a new shipment from Quick Track
  const handleAddShipment = async (payload: {
    trackingNumber: string;
    storeName?: string;
    carrier?: CarrierInfo;
  }): Promise<{ success: boolean; message?: string }> => {
    await new Promise((r) => setTimeout(r, 600));

    const carrierName = payload.carrier?.name || "India Post / Multi-Carrier";
    const carrierCode = payload.carrier?.code || "generic";
    const nowIso = new Date().toISOString();

    const newShipment: Shipment = {
      id: `ship-${Date.now()}`,
      userId: "demo-user",
      trackingNumber: payload.trackingNumber,
      carrierCode,
      carrierName,
      sourceType: "manual",
      storeName: payload.storeName || "Online Store",
      orderReference: `WB-${Math.floor(100000 + Math.random() * 900000)}`,
      itemLabel: "Standard Package Shipment",
      normalizedStatus: "IN_TRANSIT",
      rawStatus: `Shipment picked up by ${carrierName}`,
      estimatedDeliveryAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      shippedAt: nowIso,
      lastEventAt: nowIso,
      lastCheckedAt: nowIso,
      providerName: "MockProvider",
      isArchived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      events: [
        {
          id: `evt-${Date.now()}-1`,
          shipmentId: `ship-${Date.now()}`,
          normalizedStatus: "IN_TRANSIT",
          description: `Shipment registered and in transit with ${carrierName}`,
          location: "Central Logistics Hub",
          timestamp: nowIso,
        },
      ],
    };

    setShipments((prev) => [newShipment, ...prev]);

    // Add in-app notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      shipmentId: newShipment.id,
      trackingNumber: newShipment.trackingNumber,
      storeName: newShipment.storeName,
      title: "Package Added",
      message: `Tracking initiated for #${newShipment.trackingNumber} via ${carrierName}`,
      status: "IN_TRANSIT",
      timestamp: nowIso,
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Package #${payload.trackingNumber} added and tracking initialized!`,
    };
  };

  // Archive shipment
  const handleArchive = (shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, isArchived: !s.isArchived } : s))
    );
  };

  // Delete shipment
  const handleDelete = (shipmentId: string) => {
    setShipments((prev) => prev.filter((s) => s.id !== shipmentId));
  };

  // Refresh shipment tracking info
  const handleRefresh = async (shipmentId: string) => {
    await new Promise((r) => setTimeout(r, 600));
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            lastCheckedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  // Notification actions
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSelectFromNotification = (shipmentId: string) => {
    const found = shipments.find((s) => s.id === shipmentId);
    if (found) {
      setSelectedShipment(found);
      setIsDetailsOpen(true);
    }
  };

  const openDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailsOpen(true);
  };

  const activeCount = shipments.filter((s) => !s.isArchived).length;
  const upcomingCount = shipments.filter(
    (s) => !s.isArchived && s.normalizedStatus !== "DELIVERED" && s.estimatedDeliveryAt
  ).length;
  const archivedCount = shipments.filter((s) => s.isArchived).length;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop & Tablet Sidebar */}
      <ResponsiveSidebar
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          setSelectedSummaryFilter("all");
        }}
        activeCount={activeCount}
        upcomingCount={upcomingCount}
        archivedCount={archivedCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllRead}
          onClearAllNotifications={handleClearAllNotifications}
          onSelectShipment={handleSelectFromNotification}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* Settings Tab: Shows Brand Assets & System Info */}
          {activeNavTab === "settings" ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Settings & Brand System</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage application preferences, view design tokens, and review privacy controls.
                </p>
              </div>
              <BrandAssetsViewer />
            </div>
          ) : (
            <>
              {/* Welcome Section & Quick Track */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      Your deliveries, all in one place.
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Unified tracking for Delhivery, Blue Dart, DTDC, India Post, Amazon, and global packages.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Tracking Hub Online
                    </span>
                  </div>
                </div>

                {/* Quick Track Input Bar */}
                <TrackingInput
                  onAddShipment={handleAddShipment}
                  existingTrackingNumbers={shipments.map((s) => s.trackingNumber)}
                />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <SummaryCard
                  type="all"
                  label="Total Packages"
                  count={summary.total}
                  isActive={selectedSummaryFilter === "all"}
                  onClick={() => setSelectedSummaryFilter("all")}
                />
                <SummaryCard
                  type="in_transit"
                  label="In Transit"
                  count={summary.inTransit}
                  isActive={selectedSummaryFilter === "in_transit"}
                  onClick={() => setSelectedSummaryFilter("in_transit")}
                />
                <SummaryCard
                  type="out_for_delivery"
                  label="Out for Delivery"
                  count={summary.outForDelivery}
                  isActive={selectedSummaryFilter === "out_for_delivery"}
                  onClick={() => setSelectedSummaryFilter("out_for_delivery")}
                />
                <SummaryCard
                  type="delivered"
                  label="Delivered"
                  count={summary.delivered}
                  isActive={selectedSummaryFilter === "delivered"}
                  onClick={() => setSelectedSummaryFilter("delivered")}
                />
                <SummaryCard
                  type="exceptions"
                  label="Delayed / Exception"
                  count={summary.delayedOrException}
                  isActive={selectedSummaryFilter === "exceptions"}
                  onClick={() => setSelectedSummaryFilter("exceptions")}
                />
              </div>

              {/* Main Content Split: Left (Shipment List) + Right (Upcoming Panel) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left 2 Cols: Shipment List */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Filters & Count bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {activeNavTab === "archived" ? "Archived Packages" : "Shipments"}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tabular-nums">
                        {filteredShipments.length}
                      </span>
                    </div>

                    {/* Carrier Selector & Reset Filters */}
                    <div className="flex items-center gap-2">
                      {activeCarriers.length > 0 && (
                        <select
                          value={carrierFilter}
                          onChange={(e) => setCarrierFilter(e.target.value)}
                          className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="all">All Couriers</option>
                          {activeCarriers.map((carrier) => (
                            <option key={carrier} value={carrier}>
                              {carrier}
                            </option>
                          ))}
                        </select>
                      )}

                      {(selectedSummaryFilter !== "all" || carrierFilter !== "all" || searchQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSummaryFilter("all");
                            setCarrierFilter("all");
                            setSearchQuery("");
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of Shipments */}
                  {filteredShipments.length === 0 ? (
                    <EmptyState
                      filtered={Boolean(searchQuery || selectedSummaryFilter !== "all" || carrierFilter !== "all")}
                      onAction={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredShipments.map((shipment) => (
                        <ShipmentCard
                          key={shipment.id}
                          shipment={shipment}
                          onSelect={openDetails}
                          onArchive={handleArchive}
                          onDelete={handleDelete}
                          onRefresh={handleRefresh}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Upcoming Deliveries Panel */}
                <div className="space-y-4">
                  <UpcomingDeliveriesPanel
                    shipments={shipments}
                    onSelectShipment={openDetails}
                  />

                  {/* Multi-carrier preview */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-teal-500/5 border border-indigo-100/70">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Multi-Carrier Coverage</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Optimized for Indian delivery networks: Delhivery, Blue Dart, DTDC, India Post, Ekart, Xpressbees, and global express couriers.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          setSelectedSummaryFilter("all");
        }}
        activeCount={activeCount}
        upcomingCount={upcomingCount}
      />

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal
        shipment={selectedShipment}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedShipment(null);
        }}
        onRefresh={handleRefresh}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    </div>
  );
}
