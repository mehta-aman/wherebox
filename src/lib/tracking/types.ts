import { NormalizedStatus, CarrierInfo } from "@/types/shipment";

export interface ProviderTrackingEvent {
  timestamp: string;
  description: string;
  location?: string;
  stage?: string;
  rawStatus?: string;
}

export interface ProviderTrackingResult {
  success: boolean;
  trackingNumber: string;
  carrierCode: string;
  carrierName: string;
  normalizedStatus: NormalizedStatus;
  rawStatus: string;
  estimatedDeliveryAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  lastEventAt?: string;
  events: ProviderTrackingEvent[];
  providerName: string;
  providerShipmentId?: string;
  destinationCity?: string;
  orderReference?: string;
  paymentMode?: string;
  errorMessage?: string;
}

export interface ITrackingProvider {
  name: string;
  detectCarrier(trackingNumber: string): Promise<CarrierInfo | null>;
  registerAndFetch(trackingNumber: string, carrierCode?: string): Promise<ProviderTrackingResult>;
  fetchTracking(trackingNumber: string, carrierCode?: string): Promise<ProviderTrackingResult>;
}
