"use client";

import React from "react";
import { NormalizedStatus } from "@/types/shipment";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Truck, 
  Clock, 
  AlertTriangle, 
  Package, 
  RotateCcw, 
  HelpCircle,
  MapPin
} from "lucide-react";

interface StatusBadgeProps {
  status: NormalizedStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function getStatusConfig(status: NormalizedStatus) {
  switch (status) {
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        icon: MapPin,
        badgeClass: "bg-indigo-50/90 text-indigo-700 border-indigo-200/80 shadow-indigo-100",
        dotClass: "bg-indigo-600 animate-ping",
      };
    case "IN_TRANSIT":
    case "SHIPPED":
    case "AT_FACILITY":
      return {
        label: status === "AT_FACILITY" ? "At Facility" : status === "SHIPPED" ? "Shipped" : "In Transit",
        icon: Truck,
        badgeClass: "bg-blue-50/90 text-blue-700 border-blue-200/80 shadow-blue-100",
        dotClass: "bg-blue-600",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        icon: CheckCircle2,
        badgeClass: "bg-teal-50/90 text-teal-800 border-teal-200/80 shadow-teal-100",
        dotClass: "bg-teal-600",
      };
    case "DELAYED":
      return {
        label: "Possible Delay",
        icon: Clock,
        badgeClass: "bg-amber-50/90 text-amber-800 border-amber-200/80 shadow-amber-100",
        dotClass: "bg-amber-600",
      };
    case "EXCEPTION":
    case "DELIVERY_ATTEMPTED":
      return {
        label: status === "DELIVERY_ATTEMPTED" ? "Delivery Attempted" : "Action Needed",
        icon: AlertTriangle,
        badgeClass: "bg-red-50/90 text-red-700 border-red-200/80 shadow-red-100",
        dotClass: "bg-red-600",
      };
    case "LABEL_CREATED":
    case "ORDER_PLACED":
      return {
        label: status === "ORDER_PLACED" ? "Order Placed" : "Label Created",
        icon: Package,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80",
        dotClass: "bg-slate-500",
      };
    case "RETURN_TO_SENDER":
    case "CANCELLED":
      return {
        label: status === "RETURN_TO_SENDER" ? "Return to Sender" : "Cancelled",
        icon: RotateCcw,
        badgeClass: "bg-gray-100 text-gray-700 border-gray-300",
        dotClass: "bg-gray-500",
      };
    case "UNKNOWN":
    default:
      return {
        label: "Needs Carrier",
        icon: HelpCircle,
        badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
        dotClass: "bg-slate-400",
      };
  }
}

export function StatusBadge({
  status,
  className,
  size = "md",
  showIcon = true,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5 font-medium rounded-md",
    md: "text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-lg",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-semibold rounded-xl",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border shadow-xs tracking-tight transition-colors duration-150 backdrop-blur-sm",
        config.badgeClass,
        sizeStyles[size],
        className
      )}
    >
      {showIcon && <IconComponent className={cn(iconSizes[size], "shrink-0")} />}
      <span>{config.label}</span>
    </span>
  );
}
