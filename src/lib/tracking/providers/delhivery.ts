import { ITrackingProvider, ProviderTrackingResult, ProviderTrackingEvent } from "../types";
import { CarrierInfo, NormalizedStatus } from "@/types/shipment";
import { detectCarrierHeuristic } from "@/lib/carriers";

export class DelhiveryProvider implements ITrackingProvider {
  name = "Delhivery Direct";
  private baseUrl = "https://dlv-api.delhivery.com/v3/unified-tracking";

  async detectCarrier(trackingNumber: string): Promise<CarrierInfo | null> {
    const detected = detectCarrierHeuristic(trackingNumber);
    if (detected && detected.code === "delhivery") {
      return detected;
    }
    return null;
  }

  async registerAndFetch(trackingNumber: string): Promise<ProviderTrackingResult> {
    return this.fetchTracking(trackingNumber);
  }

  async fetchTracking(trackingNumber: string): Promise<ProviderTrackingResult> {
    const cleanNumber = trackingNumber.trim().toUpperCase();

    try {
      const res = await fetch(`${this.baseUrl}?wbn=${cleanNumber}`, {
        method: "GET",
        headers: {
          Origin: "https://www.delhivery.com",
          Referer: "https://www.delhivery.com/",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        return {
          success: false,
          trackingNumber: cleanNumber,
          carrierCode: "delhivery",
          carrierName: "Delhivery",
          normalizedStatus: "UNKNOWN",
          rawStatus: `Delhivery API HTTP error ${res.status}`,
          events: [],
          providerName: this.name,
          errorMessage: `Delhivery API returned status ${res.status}`,
        };
      }

      const json = await res.json();
      const pkg = json?.data?.[0];

      if (!pkg || !pkg.status) {
        return {
          success: false,
          trackingNumber: cleanNumber,
          carrierCode: "delhivery",
          carrierName: "Delhivery",
          normalizedStatus: "UNKNOWN",
          rawStatus: "Shipment details not found in Delhivery network",
          events: [],
          providerName: this.name,
          errorMessage: "Waybill not found in active records",
        };
      }

      const statusRaw = (pkg.status.status || "IN_TRANSIT").toUpperCase();
      let normalizedStatus: NormalizedStatus = "IN_TRANSIT";

      if (statusRaw.includes("DELIVERED") || statusRaw === "DL") {
        normalizedStatus = "DELIVERED";
      } else if (
        statusRaw.includes("OUT_FOR_DELIVERY") ||
        statusRaw.includes("DISPATCHED") ||
        statusRaw === "OFD"
      ) {
        normalizedStatus = "OUT_FOR_DELIVERY";
      } else if (
        statusRaw.includes("IN_TRANSIT") ||
        statusRaw.includes("CONNECTED") ||
        statusRaw === "UD"
      ) {
        normalizedStatus = "IN_TRANSIT";
      } else if (statusRaw.includes("FAILED") || statusRaw.includes("CANCEL") || statusRaw.includes("RTO")) {
        normalizedStatus = "EXCEPTION";
      } else if (statusRaw.includes("PENDING") || statusRaw.includes("MANIFEST")) {
        normalizedStatus = "LABEL_CREATED";
      }

      // Extract events
      const events: ProviderTrackingEvent[] = [];

      if (pkg.trackingStates && Array.isArray(pkg.trackingStates)) {
        for (const state of pkg.trackingStates) {
          if (state.scans && Array.isArray(state.scans)) {
            for (const scan of state.scans) {
              const locationStr = [scan.scannedLocation, scan.cityLocation].filter(Boolean).join(" - ") || pkg.destination;
              events.push({
                timestamp: scan.scanDateTime || pkg.status.statusDateTime || new Date().toISOString(),
                description: scan.scanNslRemark || scan.scan || pkg.status.instructions || "In transit scan",
                location: locationStr || undefined,
                rawStatus: scan.scan || pkg.status.status,
              });
            }
          }
        }
      }

      // If no nested scans, synthesize main status event
      if (events.length === 0 && pkg.status) {
        events.push({
          timestamp: pkg.status.statusDateTime || new Date().toISOString(),
          description: pkg.status.instructions || `Status: ${pkg.status.status}`,
          location: pkg.destination || undefined,
          rawStatus: pkg.status.status,
        });
      }

      // Sort chronological descending
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Parse estimated delivery date
      let estDeliveryIso: string | undefined = undefined;
      if (pkg.promiseDeliveryDate) {
        try {
          estDeliveryIso = new Date(pkg.promiseDeliveryDate).toISOString();
        } catch {
          // ignore
        }
      }

      return {
        success: true,
        trackingNumber: cleanNumber,
        carrierCode: "delhivery",
        carrierName: "Delhivery",
        normalizedStatus,
        rawStatus: pkg.status.instructions || pkg.status.status || "In transit",
        estimatedDeliveryAt: estDeliveryIso,
        deliveredAt: normalizedStatus === "DELIVERED" ? pkg.status.statusDateTime : undefined,
        lastEventAt: pkg.status.statusDateTime || new Date().toISOString(),
        events,
        providerName: this.name,
        providerShipmentId: pkg.referenceNo || undefined,
        destinationCity: pkg.destination || undefined,
        orderReference: pkg.referenceNo || undefined,
        paymentMode: pkg.packageType ? (pkg.packageType === "COD" ? "Cash on Delivery (COD)" : "Prepaid") : undefined,
      };
    } catch (err) {
      return {
        success: false,
        trackingNumber: cleanNumber,
        carrierCode: "delhivery",
        carrierName: "Delhivery",
        normalizedStatus: "UNKNOWN",
        rawStatus: "Network error connecting to Delhivery",
        events: [],
        providerName: this.name,
        errorMessage: (err as Error).message,
      };
    }
  }
}
