import { describe, it, expect } from "vitest";
import { parseOrderEmail } from "../lib/email/parser";

describe("Email Parser Module", () => {
  it("parses Amazon India dispatch email with TBA tracking and item title", () => {
    const email = {
      from: "auto-confirm@amazon.in",
      subject: "Dispatched: Apple AirPods Pro (2nd Gen)",
      bodyText:
        "Your order 402-1234567-8901234 has been dispatched. Item: Apple AirPods Pro (2nd Gen). Order total: ₹18,990.00. Tracking ID: TBA304918239012. Shipped with Amazon Logistics.",
    };

    const parsed = parseOrderEmail(email);
    expect(parsed).not.toBeNull();
    expect(parsed?.storeName).toBe("Amazon");
    expect(parsed?.orderReference).toBe("402-1234567-8901234");
    expect(parsed?.trackingNumber).toBe("TBA304918239012");
    expect(parsed?.itemTitle).toContain("Apple AirPods Pro");
    expect(parsed?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it("parses Flipkart order update with OD order reference and Ekart tracking", () => {
    const email = {
      from: "order-update@flipkart.com",
      subject: "Your order for Sony WH-1000XM5 has been shipped!",
      bodyText:
        "Hi Aman, Order ID: OD428192019283120192. Product: Sony WH-1000XM5 Wireless Headphones. Ekart Tracking ID: FMPC092182912. Total: ₹26,990.",
    };

    const parsed = parseOrderEmail(email);
    expect(parsed).not.toBeNull();
    expect(parsed?.storeName).toBe("Flipkart");
    expect(parsed?.orderReference).toBe("OD428192019283120192");
    expect(parsed?.trackingNumber).toBe("FMPC092182912");
    expect(parsed?.carrierCode).toBe("ekart");
  });

  it("parses Myntra dispatch email with order number and Delhivery AWB", () => {
    const email = {
      from: "updates@myntra.com",
      subject: "Your Myntra package is on its way!",
      bodyText:
        "Order #544099 has been dispatched via Delhivery. AWB: 43688113129125. Item: Puma RS-X Men Running Shoes. Amount: ₹4,299.",
    };

    const parsed = parseOrderEmail(email);
    expect(parsed).not.toBeNull();
    expect(parsed?.storeName).toBe("Myntra");
    expect(parsed?.orderReference).toBe("#544099");
    expect(parsed?.trackingNumber).toBe("43688113129125");
    expect(parsed?.carrierCode).toBe("delhivery");
  });
});
