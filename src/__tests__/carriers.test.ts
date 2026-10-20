import { describe, it, expect } from "vitest";
import { detectCarrierHeuristic, SUPPORTED_CARRIERS } from "../lib/carriers";

describe("Carrier Auto-Detection Heuristic", () => {
  it("detects India Post tracking numbers (e.g. EM123456789IN)", () => {
    const carrier = detectCarrierHeuristic("EM829102847IN");
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe("indiapost");
    expect(carrier?.name).toBe("India Post");
  });

  it("detects Delhivery tracking numbers", () => {
    const carrier = detectCarrierHeuristic("DEL14982736190");
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe("delhivery");
  });

  it("detects Ekart logistics tracking numbers (FMPC / KLPA)", () => {
    const carrier = detectCarrierHeuristic("FMPC9928172635");
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe("ekart");
  });

  it("detects DTDC tracking numbers", () => {
    const carrier = detectCarrierHeuristic("D92817263");
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe("dtdc");
  });

  it("detects UPS tracking numbers (1Z...)", () => {
    const carrier = detectCarrierHeuristic("1Z9999999999999999");
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe("ups");
  });

  it("detects DHL tracking numbers (10 digits)", () => {
    const carrier = detectCarrierHeuristic("9876543210");
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe("dhl");
  });

  it("returns null for unrecognized strings", () => {
    const carrier = detectCarrierHeuristic("UNKNOWN123");
    expect(carrier).toBeNull();
  });

  it("has priority Indian carriers registered in SUPPORTED_CARRIERS", () => {
    const codes = SUPPORTED_CARRIERS.map((c) => c.code);
    expect(codes).toContain("delhivery");
    expect(codes).toContain("bluedart");
    expect(codes).toContain("dtdc");
    expect(codes).toContain("indiapost");
    expect(codes).toContain("xpressbees");
    expect(codes).toContain("ekart");
    expect(codes).toContain("ecomexpress");
    expect(codes).toContain("amazon_in");
  });
});
