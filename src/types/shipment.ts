export type NormalizedStatus =
  | "ORDER_PLACED"
  | "LABEL_CREATED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "AT_FACILITY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_ATTEMPTED"
  | "DELAYED"
  | "EXCEPTION"
  | "RETURN_TO_SENDER"
  | "CANCELLED"
  | "UNKNOWN";

export type SourceType = "manual" | "email" | "store";

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  providerEventId?: string;
  eventCode?: string;
  normalizedStatus: NormalizedStatus;
  description: string;
  location?: string;
  timestamp: string;
  rawPayload?: Record<string, unknown>;
}

export interface Shipment {
  id: string;
  userId: string;
  trackingNumber: string;
  carrierCode: string;
  carrierName: string;
  sourceType: SourceType;
  storeName?: string;
  orderReference?: string;
  itemLabel?: string;
  normalizedStatus: NormalizedStatus;
  rawStatus: string;
  estimatedDeliveryAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  lastEventAt?: string;
  lastCheckedAt: string;
  providerName: string;
  providerShipmentId?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  events: TrackingEvent[];
}

export interface ShipmentSummary {
  total: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  delayedOrException: number;
}

export interface CarrierInfo {
  code: string;
  name: string;
  region: "India" | "International";
  logo?: string;
  trackingUrlPattern?: string;
}

export interface NotificationItem {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  storeName?: string;
  title: string;
  message: string;
  status: NormalizedStatus;
  timestamp: string;
  isRead: boolean;
}
