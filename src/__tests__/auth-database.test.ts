import { describe, it, expect } from "vitest";
import { mapDbShipmentToFrontend, mapDbNotificationToFrontend, DbShipment, DbNotification } from "../lib/mappers";

describe("Database Mappers & Model Isolation", () => {
  it("correctly maps database snake_case columns to frontend camelCase domain models", () => {
    const dbShipment: DbShipment = {
      id: "ship-uuid-1",
      user_id: "user-uuid-1",
      tracking_number: "DEL14982736190",
      carrier_code: "delhivery",
      carrier_name: "Delhivery",
      source_type: "manual",
      store_name: "Amazon India",
      order_reference: "402-12345",
      item_label: "Wireless Earbuds",
      normalized_status: "OUT_FOR_DELIVERY",
      raw_status: "Out for delivery with courier associate",
      estimated_delivery_at: "2026-10-21T18:00:00Z",
      shipped_at: "2026-10-19T10:00:00Z",
      delivered_at: null,
      last_event_at: "2026-10-20T08:30:00Z",
      last_checked_at: "2026-10-20T08:30:00Z",
      provider_name: "manual",
      provider_shipment_id: null,
      is_archived: false,
      created_at: "2026-10-19T09:00:00Z",
      updated_at: "2026-10-20T08:30:00Z",
      events: [
        {
          id: "evt-1",
          shipment_id: "ship-uuid-1",
          normalized_status: "OUT_FOR_DELIVERY",
          description: "Package is out for delivery",
          location: "Bengaluru Hub",
          timestamp: "2026-10-20T08:30:00Z",
        },
      ],
    };

    const frontend = mapDbShipmentToFrontend(dbShipment);

    expect(frontend.id).toBe("ship-uuid-1");
    expect(frontend.userId).toBe("user-uuid-1");
    expect(frontend.trackingNumber).toBe("DEL14982736190");
    expect(frontend.carrierName).toBe("Delhivery");
    expect(frontend.normalizedStatus).toBe("OUT_FOR_DELIVERY");
    expect(frontend.storeName).toBe("Amazon India");
    expect(frontend.events).toHaveLength(1);
    expect(frontend.events[0].location).toBe("Bengaluru Hub");
  });

  it("correctly maps database notifications to frontend format", () => {
    const dbNotif: DbNotification = {
      id: "notif-uuid-1",
      user_id: "user-uuid-1",
      shipment_id: "ship-uuid-1",
      tracking_number: "DEL14982736190",
      store_name: "Amazon India",
      title: "Out for Delivery",
      message: "Package is out for delivery today",
      status: "OUT_FOR_DELIVERY",
      is_read: false,
      created_at: "2026-10-20T08:30:00Z",
    };

    const frontendNotif = mapDbNotificationToFrontend(dbNotif);

    expect(frontendNotif.id).toBe("notif-uuid-1");
    expect(frontendNotif.trackingNumber).toBe("DEL14982736190");
    expect(frontendNotif.status).toBe("OUT_FOR_DELIVERY");
    expect(frontendNotif.isRead).toBe(false);
  });
});
