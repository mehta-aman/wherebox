import { describe, it, expect } from "vitest";
import { computeSummary, DEMO_SHIPMENTS } from "../data/demo-shipments";
import { Shipment } from "../types/shipment";

describe("Shipment Summary Computations", () => {
  it("computes summary accurately for demo shipments", () => {
    const summary = computeSummary(DEMO_SHIPMENTS);

    expect(summary.total).toBe(DEMO_SHIPMENTS.filter((s) => !s.isArchived).length);
    expect(summary.outForDelivery).toBeGreaterThanOrEqual(1);
    expect(summary.delivered).toBeGreaterThanOrEqual(1);
    expect(summary.delayedOrException).toBeGreaterThanOrEqual(1);
  });

  it("excludes archived packages from active count", () => {
    const sampleShipments: Shipment[] = [
      {
        ...DEMO_SHIPMENTS[0],
        id: "s1",
        isArchived: true,
      },
      {
        ...DEMO_SHIPMENTS[1],
        id: "s2",
        isArchived: false,
      },
    ];

    const summary = computeSummary(sampleShipments);
    expect(summary.total).toBe(1);
  });
});
