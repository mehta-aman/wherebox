import { ITrackingProvider, ProviderTrackingResult, ProviderTrackingEvent } from "../types";
import { CarrierInfo, NormalizedStatus } from "@/types/shipment";
import { detectCarrierHeuristic, SUPPORTED_CARRIERS } from "@/lib/carriers";

// 17TRACK Carrier Code mappings
const CARRIER_CODE_MAP: Record<string, number> = {
  indiapost: 190004,
  bluedart: 190008,
  delhivery: 190012,
  dtdc: 190014,
  ecomexpress: 190035,
  ekart: 190098,
  xpressbees: 190117,
  shadowfax: 190104,
  dhl: 100001,
  ups: 100002,
  fedex: 100003,
  usps: 21051,
  royalmail: 3011,
};

function normalize17TrackStatus(status?: string, substatus?: string): NormalizedStatus {
  if (!status) return "UNKNOWN";
  const s = status.toLowerCase();
  const sub = (substatus || "").toLowerCase();

  if (s.includes("delivered")) return "DELIVERED";
  if (s.includes("outfordelivery") || sub.includes("out_for_delivery")) return "OUT_FOR_DELIVERY";
  if (s.includes("intransit") || s.includes("transit")) return "IN_TRANSIT";
  if (s.includes("pickup") || sub.includes("facility") || sub.includes("hub")) return "AT_FACILITY";
  if (s.includes("inforeceived") || s.includes("created")) return "LABEL_CREATED";
  if (s.includes("exception") || s.includes("alert")) return "EXCEPTION";
  if (s.includes("deliveryfailure") || s.includes("attempt")) return "DELIVERY_ATTEMPTED";
  if (s.includes("expired")) return "DELAYED";

  return "IN_TRANSIT";
}

export class SeventeenTrackProvider implements ITrackingProvider {
  name = "17TRACK";
  private apiKey: string;
  private baseUrl = "https://api.17track.net/track/v2.2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectCarrier(trackingNumber: string): Promise<CarrierInfo | null> {
    return detectCarrierHeuristic(trackingNumber);
  }

  async registerAndFetch(trackingNumber: string, carrierCode?: string): Promise<ProviderTrackingResult> {
    if (!this.apiKey) {
      return {
        success: false,
        trackingNumber,
        carrierCode: carrierCode || "generic",
        carrierName: "Multi-Carrier",
        normalizedStatus: "UNKNOWN",
        rawStatus: "17TRACK API key not configured",
        events: [],
        providerName: this.name,
        errorMessage: "TRACKING_PROVIDER_API_KEY is not configured.",
      };
    }

    try {
      // 1. Resolve carrier number for 17TRACK
      const numericCarrier = carrierCode && CARRIER_CODE_MAP[carrierCode] ? CARRIER_CODE_MAP[carrierCode] : undefined;

      // 2. Register tracking number with 17TRACK
      const regPayload: Array<{ number: string; carrier?: number }> = [{ number: trackingNumber }];
      if (numericCarrier) {
        regPayload[0].carrier = numericCarrier;
      }

      await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "17token": this.apiKey,
        },
        body: JSON.stringify(regPayload),
      });

      // 3. Immediately query tracking info
      return await this.fetchTracking(trackingNumber, carrierCode);
    } catch (err) {
      return {
        success: false,
        trackingNumber,
        carrierCode: carrierCode || "generic",
        carrierName: "Multi-Carrier",
        normalizedStatus: "UNKNOWN",
        rawStatus: "Provider request failed",
        events: [],
        providerName: this.name,
        errorMessage: (err as Error).message,
      };
    }
  }

  async fetchTracking(trackingNumber: string, carrierCode?: string): Promise<ProviderTrackingResult> {
    const numericCarrier = carrierCode && CARRIER_CODE_MAP[carrierCode] ? CARRIER_CODE_MAP[carrierCode] : undefined;
    const reqPayload: Array<{ number: string; carrier?: number }> = [{ number: trackingNumber }];
    if (numericCarrier) {
      reqPayload[0].carrier = numericCarrier;
    }

    const res = await fetch(`${this.baseUrl}/gettrackinfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "17token": this.apiKey,
      },
      body: JSON.stringify(reqPayload),
    });

    if (!res.ok) {
      return {
        success: false,
        trackingNumber,
        carrierCode: carrierCode || "generic",
        carrierName: "Multi-Carrier",
        normalizedStatus: "UNKNOWN",
        rawStatus: `Provider HTTP Error ${res.status}`,
        events: [],
        providerName: this.name,
        errorMessage: `17TRACK returned status ${res.status}`,
      };
    }

    const data = await res.json();
    const accepted = data?.data?.accepted?.[0];

    if (!accepted) {
      return {
        success: false,
        trackingNumber,
        carrierCode: carrierCode || "generic",
        carrierName: "Multi-Carrier",
        normalizedStatus: "UNKNOWN",
        rawStatus: "Tracking number not found with carrier",
        events: [],
        providerName: this.name,
        errorMessage: "Courier tracking information not yet available.",
      };
    }

    const trackInfo = accepted.track_info;
    const latestStatus = trackInfo?.latest_status?.status || "InTransit";
    const subStatus = trackInfo?.latest_status?.sub_status;
    const normalizedStatus = normalize17TrackStatus(latestStatus, subStatus);

    const detectedCarrierName =
      accepted.carrier_name ||
      SUPPORTED_CARRIERS.find((c) => c.code === carrierCode)?.name ||
      "Carrier Express";

    // Extract raw events timeline
    const rawEvents: Array<{ time_iso?: string; description?: string; location?: string; stage?: string }> =
      trackInfo?.tracking?.providers?.[0]?.events || [];

    const events: ProviderTrackingEvent[] = rawEvents.map((e) => ({
      timestamp: e.time_iso || new Date().toISOString(),
      description: e.description || "Package movement scan",
      location: e.location || undefined,
      stage: e.stage || undefined,
      rawStatus: e.description,
    }));

    // Latest raw status
    const latestEvent = events.length > 0 ? events[0] : null;
    const rawStatus = latestEvent?.description || `Status: ${latestStatus}`;

    // Estimated delivery date
    const estDelivery = trackInfo?.time_metrics?.estimated_delivery_date?.from;

    return {
      success: true,
      trackingNumber,
      carrierCode: carrierCode || "generic",
      carrierName: detectedCarrierName,
      normalizedStatus,
      rawStatus,
      estimatedDeliveryAt: estDelivery ? new Date(estDelivery).toISOString() : undefined,
      shippedAt: trackInfo?.time_metrics?.pickup_time,
      deliveredAt: trackInfo?.time_metrics?.delivered_time,
      lastEventAt: latestEvent?.timestamp || new Date().toISOString(),
      events,
      providerName: this.name,
      providerShipmentId: String(accepted.carrier || ""),
    };
  }
}
