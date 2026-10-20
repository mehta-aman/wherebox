import { Shipment, TrackingEvent, NotificationItem, NormalizedStatus } from "@/types/shipment";

export interface DbTrackingEvent {
  id: string;
  shipment_id: string;
  provider_event_id?: string | null;
  event_code?: string | null;
  normalized_status: string;
  description: string;
  location?: string | null;
  timestamp: string;
  raw_payload?: Record<string, unknown> | null;
}

export interface DbShipment {
  id: string;
  user_id: string;
  tracking_number: string;
  carrier_code: string;
  carrier_name: string;
  source_type: "manual" | "email" | "store";
  store_name?: string | null;
  order_reference?: string | null;
  item_label?: string | null;
  normalized_status: string;
  raw_status: string;
  estimated_delivery_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  last_event_at?: string | null;
  last_checked_at?: string | null;
  provider_name: string;
  provider_shipment_id?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  tracking_events?: DbTrackingEvent[];
  events?: DbTrackingEvent[];
}

export interface DbNotification {
  id: string;
  user_id: string;
  shipment_id?: string | null;
  tracking_number: string;
  store_name?: string | null;
  title: string;
  message: string;
  status: string;
  is_read: boolean;
  created_at: string;
}

export function mapDbShipmentToFrontend(db: DbShipment): Shipment {
  const eventsList = db.events || db.tracking_events || [];

  return {
    id: db.id,
    userId: db.user_id,
    trackingNumber: db.tracking_number,
    carrierCode: db.carrier_code,
    carrierName: db.carrier_name,
    sourceType: db.source_type,
    storeName: db.store_name || undefined,
    orderReference: db.order_reference || undefined,
    itemLabel: db.item_label || undefined,
    normalizedStatus: (db.normalized_status || "UNKNOWN") as NormalizedStatus,
    rawStatus: db.raw_status,
    estimatedDeliveryAt: db.estimated_delivery_at || undefined,
    shippedAt: db.shipped_at || undefined,
    deliveredAt: db.delivered_at || undefined,
    lastEventAt: db.last_event_at || undefined,
    lastCheckedAt: db.last_checked_at || db.updated_at,
    providerName: db.provider_name,
    providerShipmentId: db.provider_shipment_id || undefined,
    isArchived: db.is_archived ?? false,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    events: eventsList.map((e): TrackingEvent => ({
      id: e.id,
      shipmentId: e.shipment_id,
      providerEventId: e.provider_event_id || undefined,
      eventCode: e.event_code || undefined,
      normalizedStatus: (e.normalized_status || "UNKNOWN") as NormalizedStatus,
      description: e.description,
      location: e.location || undefined,
      timestamp: e.timestamp,
      rawPayload: e.raw_payload || undefined,
    })),
  };
}

export function mapDbNotificationToFrontend(db: DbNotification): NotificationItem {
  return {
    id: db.id,
    shipmentId: db.shipment_id || "",
    trackingNumber: db.tracking_number,
    storeName: db.store_name || undefined,
    title: db.title,
    message: db.message,
    status: (db.status || "UNKNOWN") as NormalizedStatus,
    timestamp: db.created_at,
    isRead: db.is_read ?? false,
  };
}
