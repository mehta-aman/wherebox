/**
 * WhereBox Universal Order & Dispatch Email Parser
 * Parses incoming emails from Indian & global merchants to extract:
 * - Tracking Number & Courier Partner
 * - Product Title & Thumbnail
 * - Order Number & Total Amount
 * - Confidence Score
 */

export interface ParsedEmailShipment {
  storeName: string;
  orderReference?: string;
  itemTitle?: string;
  itemImageUrl?: string;
  orderAmount?: string;
  trackingNumber?: string;
  carrierCode?: string;
  carrierName?: string;
  confidence: number;
  needsReview: boolean;
}

export interface EmailMessagePayload {
  from: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  date?: string;
}

export function parseOrderEmail(msg: EmailMessagePayload): ParsedEmailShipment | null {
  const fromLower = msg.from.toLowerCase();
  const subjectLower = msg.subject.toLowerCase();
  const text = (msg.bodyText || "") + " " + (msg.bodyHtml ? stripHtml(msg.bodyHtml) : "");

  // 1. AMAZON INDIA
  if (fromLower.includes("amazon.in") || fromLower.includes("amazon.com") || subjectLower.includes("amazon.in")) {
    return parseAmazonEmail(msg, text);
  }

  // 2. FLIPKART
  if (fromLower.includes("flipkart.com") || subjectLower.includes("flipkart")) {
    return parseFlipkartEmail(msg, text);
  }

  // 3. MYNTRA
  if (fromLower.includes("myntra.com") || subjectLower.includes("myntra")) {
    return parseMyntraEmail(msg, text);
  }

  // 4. MEESHO
  if (fromLower.includes("meesho.com") || subjectLower.includes("meesho")) {
    return parseMeeshoEmail(msg, text);
  }

  // 5. AJIO
  if (fromLower.includes("ajio.com") || subjectLower.includes("ajio")) {
    return parseAjioEmail(msg, text);
  }

  // 6. DIRECT CARRIER DISPATCH (Delhivery, Blue Dart, DTDC)
  if (fromLower.includes("delhivery") || subjectLower.includes("delhivery")) {
    return parseDirectDelhiveryEmail(msg, text);
  }

  if (fromLower.includes("bluedart") || subjectLower.includes("blue dart")) {
    return parseDirectBluedartEmail(msg, text);
  }

  // Generic fallback if tracking number detected in any dispatch email
  return parseGenericDispatchEmail(msg, text);
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Amazon India Parser
 */
function parseAmazonEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  let confidence = 0.5;

  // Order Number regex: e.g. 408-1234567-1234567
  const orderMatch = text.match(/\b(\d{3}-\d{7}-\d{7})\b/) || msg.subject.match(/\b(\d{3}-\d{7}-\d{7})\b/);
  const orderReference = orderMatch ? orderMatch[1] : undefined;
  if (orderReference) confidence += 0.2;

  // Tracking Number / AWB
  // Amazon uses TBA... for Amazon Logistics, or numbers for Delhivery/Blue Dart
  let trackingNumber: string | undefined;
  let carrierCode = "amazon_in";
  let carrierName = "Amazon Shipping";

  const tbaMatch = text.match(/\b(TBA\w{10,18})\b/i);
  if (tbaMatch) {
    trackingNumber = tbaMatch[1].toUpperCase();
    confidence += 0.25;
  } else {
    const awbMatch = text.match(/(?:tracking\s*(?:id|number|#)?|awb(?:\s*no)?)\s*[:#-]?\s*([A-Za-z0-9]{8,18})/i);
    if (awbMatch) {
      trackingNumber = awbMatch[1].trim();
      confidence += 0.2;
    }
  }

  // Extract Item Title: prioritize explicit "Item:" or subject pattern
  let itemTitle: string | undefined;
  const explicitItemMatch = text.match(/(?:item|product)\s*[:\-]\s*([^\n\r.]{3,65})/i);
  const subjectMatch = msg.subject.match(/(?:dispatched|shipped|delivered|ordered)\s*[:\-]?\s*([^\n\r.]{3,55})/i);
  const generalItemMatch = text.match(/(?:ordered|dispatched|delivery of)\s*[:\-]?\s*(?:(?:1|2|3|4|5)\s*(?:of|x)\s*)?([^\n\r.]{5,65})/i);

  if (explicitItemMatch) {
    itemTitle = cleanItemTitle(explicitItemMatch[1]);
    confidence += 0.2;
  } else if (subjectMatch) {
    itemTitle = cleanItemTitle(subjectMatch[1]);
    confidence += 0.15;
  } else if (generalItemMatch) {
    itemTitle = cleanItemTitle(generalItemMatch[1]);
    confidence += 0.1;
  } else {
    itemTitle = "Amazon Order Item";
  }

  // Price match (e.g. ₹1,499.00 or Rs. 1,499)
  const priceMatch = text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i);
  const orderAmount = priceMatch ? `₹${priceMatch[1]}` : undefined;

  return {
    storeName: "Amazon",
    orderReference,
    itemTitle,
    orderAmount,
    trackingNumber,
    carrierCode,
    carrierName,
    confidence: Math.min(confidence, 1.0),
    needsReview: confidence < 0.85 || !trackingNumber,
  };
}

/**
 * Flipkart Parser
 */
function parseFlipkartEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  let confidence = 0.5;

  // Flipkart Order ID: e.g. OD43219082312
  const orderMatch = text.match(/\b(OD\d{16,22})\b/i) || msg.subject.match(/\b(OD\d{16,22})\b/i);
  const orderReference = orderMatch ? orderMatch[1].toUpperCase() : undefined;
  if (orderReference) confidence += 0.2;

  // Ekart tracking number or courier
  let trackingNumber: string | undefined;
  let carrierCode = "ekart";
  let carrierName = "Ekart Logistics";

  const ekartMatch = text.match(/\b(FMPC\w{8,14}|EKART\w{6,14})\b/i);
  if (ekartMatch) {
    trackingNumber = ekartMatch[1].toUpperCase();
    confidence += 0.25;
  } else {
    const awbMatch = text.match(/(?:tracking\s*(?:id|#)?|tracking\s*number|awb)\s*[:#-]?\s*([A-Za-z0-9]{8,18})/i);
    if (awbMatch) {
      trackingNumber = awbMatch[1].trim();
      confidence += 0.2;
    }
  }

  // Item Title
  let itemTitle: string | undefined;
  const itemMatch =
    text.match(/(?:item|product|for)\s*[:\-]?\s*([^\n\r.]{5,65})/i) ||
    msg.subject.match(/(?:for|item)\s*([^\n\r]{5,55})/i);

  if (itemMatch) {
    itemTitle = cleanItemTitle(itemMatch[1]);
    confidence += 0.15;
  } else {
    itemTitle = "Flipkart Package";
  }

  const priceMatch = text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i);
  const orderAmount = priceMatch ? `₹${priceMatch[1]}` : undefined;

  return {
    storeName: "Flipkart",
    orderReference,
    itemTitle,
    orderAmount,
    trackingNumber,
    carrierCode,
    carrierName,
    confidence: Math.min(confidence, 1.0),
    needsReview: confidence < 0.85 || !trackingNumber,
  };
}

/**
 * Myntra Parser
 */
function parseMyntraEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  let confidence = 0.55;

  // Myntra Order ID (typically 5 to 16 digits)
  const orderMatch = text.match(/order\s*(?:id|#|number)?\s*[:#-]?\s*#?(\d{5,16})/i);
  const orderReference = orderMatch ? `#${orderMatch[1]}` : undefined;
  if (orderReference) confidence += 0.15;

  // Courier detection (Myntra often uses Delhivery, Blue Dart, Xpressbees)
  let carrierCode = "delhivery";
  let carrierName = "Delhivery";
  if (text.toLowerCase().includes("bluedart") || text.toLowerCase().includes("blue dart")) {
    carrierCode = "bluedart";
    carrierName = "Blue Dart Express";
  } else if (text.toLowerCase().includes("xpressbees")) {
    carrierCode = "xpressbees";
    carrierName = "Xpressbees";
  }

  const awbMatch = text.match(/(?:tracking\s*(?:number|id|#)?|awb(?:\s*no)?)\s*[:#-]?\s*([A-Za-z0-9]{9,16})/i);
  const trackingNumber = awbMatch ? awbMatch[1].trim() : undefined;
  if (trackingNumber) confidence += 0.25;

  let itemTitle: string | undefined;
  const itemMatch = text.match(/(?:packed|shipped|dispatched|ordered)\s*[:\-]?\s*([^\n\r.]{5,60})/i);
  if (itemMatch) {
    itemTitle = cleanItemTitle(itemMatch[1]);
    confidence += 0.15;
  } else {
    itemTitle = "Myntra Fashion Apparel";
  }

  const priceMatch = text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i);
  const orderAmount = priceMatch ? `₹${priceMatch[1]}` : undefined;

  return {
    storeName: "Myntra",
    orderReference,
    itemTitle,
    orderAmount,
    trackingNumber,
    carrierCode,
    carrierName,
    confidence: Math.min(confidence, 1.0),
    needsReview: confidence < 0.85 || !trackingNumber,
  };
}

/**
 * Meesho Parser
 */
function parseMeeshoEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  let confidence = 0.5;
  const awbMatch = text.match(/(?:tracking\s*(?:number|id|#)?|awb)\s*[:#-]?\s*([A-Za-z0-9]{9,16})/i);
  const trackingNumber = awbMatch ? awbMatch[1].trim() : undefined;
  if (trackingNumber) confidence += 0.3;

  return {
    storeName: "Meesho",
    orderReference: undefined,
    itemTitle: "Meesho Order",
    trackingNumber,
    carrierCode: "delhivery",
    carrierName: "Delhivery",
    confidence,
    needsReview: confidence < 0.85 || !trackingNumber,
  };
}

/**
 * Ajio Parser
 */
function parseAjioEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  let confidence = 0.5;
  const awbMatch = text.match(/(?:tracking\s*(?:number|id|#)?|awb)\s*[:#-]?\s*([A-Za-z0-9]{9,16})/i);
  const trackingNumber = awbMatch ? awbMatch[1].trim() : undefined;
  if (trackingNumber) confidence += 0.3;

  return {
    storeName: "AJIO",
    orderReference: undefined,
    itemTitle: "AJIO Fashion Item",
    trackingNumber,
    carrierCode: "delhivery",
    carrierName: "Delhivery",
    confidence,
    needsReview: confidence < 0.85 || !trackingNumber,
  };
}

/**
 * Direct Delhivery email dispatch notice
 */
function parseDirectDelhiveryEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  const awbMatch = text.match(/\b(\d{12,14})\b/) || msg.subject.match(/\b(\d{12,14})\b/);
  const trackingNumber = awbMatch ? awbMatch[1] : undefined;

  // Merchant name in Delhivery notification (e.g. "from Nike India" or "from Myntra")
  const merchantMatch = text.match(/from\s+([A-Za-z0-9\s&]{3,30})(?:\s+has been|\s+is on|\.)/i);
  const storeName = merchantMatch ? merchantMatch[1].trim() : "Delhivery Merchant";

  return {
    storeName,
    trackingNumber,
    carrierCode: "delhivery",
    carrierName: "Delhivery",
    itemTitle: `${storeName} Shipment`,
    confidence: trackingNumber ? 0.9 : 0.4,
    needsReview: !trackingNumber,
  };
}

/**
 * Direct Blue Dart email notice
 */
function parseDirectBluedartEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment {
  const awbMatch = text.match(/\b(\d{9,11})\b/) || msg.subject.match(/\b(\d{9,11})\b/);
  const trackingNumber = awbMatch ? awbMatch[1] : undefined;

  return {
    storeName: "Blue Dart Merchant",
    trackingNumber,
    carrierCode: "bluedart",
    carrierName: "Blue Dart Express",
    itemTitle: "Blue Dart Express Shipment",
    confidence: trackingNumber ? 0.9 : 0.4,
    needsReview: !trackingNumber,
  };
}

/**
 * Generic Dispatch Email
 */
function parseGenericDispatchEmail(msg: EmailMessagePayload, text: string): ParsedEmailShipment | null {
  // Look for any tracking pattern
  const trackingMatch = text.match(/(?:tracking\s*(?:number|id|#)?|awb(?:\s*no)?)\s*[:#-]?\s*([A-Za-z0-9]{8,20})/i);
  if (!trackingMatch) return null;

  const trackingNumber = trackingMatch[1].trim();

  return {
    storeName: "Online Store",
    trackingNumber,
    carrierCode: "generic",
    carrierName: "Express Courier",
    itemTitle: "Order Package",
    confidence: 0.6,
    needsReview: true,
  };
}

function cleanItemTitle(raw: string): string {
  return raw
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/(?:has been dispatched|is out for delivery|has arrived|order placed).*$/i, "")
    .trim();
}
