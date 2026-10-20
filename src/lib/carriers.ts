import { CarrierInfo } from "@/types/shipment";

export const SUPPORTED_CARRIERS: CarrierInfo[] = [
  // India Priority Couriers
  { code: "delhivery", name: "Delhivery", region: "India" },
  { code: "bluedart", name: "Blue Dart", region: "India" },
  { code: "dtdc", name: "DTDC", region: "India" },
  { code: "indiapost", name: "India Post", region: "India" },
  { code: "xpressbees", name: "Xpressbees", region: "India" },
  { code: "ekart", name: "Ekart Logistics", region: "India" },
  { code: "ecomexpress", name: "Ecom Express", region: "India" },
  { code: "amazon_in", name: "Amazon Logistics (India)", region: "India" },
  { code: "shadowfax", name: "Shadowfax", region: "India" },

  // International Couriers
  { code: "fedex", name: "FedEx", region: "International" },
  { code: "dhl", name: "DHL Express", region: "International" },
  { code: "ups", name: "UPS", region: "International" },
  { code: "usps", name: "USPS", region: "International" },
  { code: "royalmail", name: "Royal Mail", region: "International" },
];

export const POPULAR_STORES = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Ajio",
  "Meesho",
  "Nykaa",
  "Tata CLiQ",
  "Apple",
  "Zara",
  "Nike",
  "Shopify Store",
  "Other Store",
];

/**
 * Heuristic tracking number carrier auto-detection
 */
export function detectCarrierHeuristic(trackingNumber: string): CarrierInfo | null {
  const clean = trackingNumber.trim().toUpperCase();

  // India Post: usually 2 letters + 9 digits + 2 letters (e.g. EM123456789IN or CP123456789IN)
  if (/^[A-Z]{2}\d{9}IN$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "indiapost") || null;
  }

  // Blue Dart: 8, 9, 11 digits
  if (/^\d{8,11}$/.test(clean) && (clean.startsWith("1") || clean.startsWith("2") || clean.startsWith("3") || clean.startsWith("4") || clean.startsWith("5"))) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "bluedart") || null;
  }

  // Delhivery: 12-14 digits (often starting with 1, 2, or 3) or DEL followed by numbers
  if (/^(DEL\d{10,14}|\d{12,14})$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "delhivery") || null;
  }

  // DTDC: D followed by 8 digits or 9 digits beginning with D/B/Z
  if (/^[DGBKZ]\d{8,9}$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "dtdc") || null;
  }

  // Ekart: FMPC or KLPA or generic 14 chars starting with FMPC
  if (/^FMPC\d{10}$/.test(clean) || /^KLPA\d{10}$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "ekart") || null;
  }

  // Xpressbees: 14-16 digits or 13 digits starting with 1
  if (/^\d{13,15}$/.test(clean) && clean.startsWith("1")) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "xpressbees") || null;
  }

  // FedEx: 12 or 15 digits
  if (/^(\d{12}|\d{15})$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "fedex") || null;
  }

  // UPS: 1Z + 16 alphanumeric characters
  if (/^1Z[0-9A-Z]{16}$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "ups") || null;
  }

  // DHL: 10 digits
  if (/^\d{10}$/.test(clean)) {
    return SUPPORTED_CARRIERS.find((c) => c.code === "dhl") || null;
  }

  return null;
}
