import { describe, it, expect } from "vitest";
import { maskTrackingNumber, formatDate, formatRelativeTime, cn } from "../lib/utils";

describe("Utility Functions", () => {
  it("masks tracking numbers appropriately", () => {
    expect(maskTrackingNumber("DEL14982736190")).toBe("DEL1••••6190");
    expect(maskTrackingNumber("12345678")).toBe("12345678"); // Short number unmasked
  });

  it("handles empty or invalid dates gracefully", () => {
    expect(formatDate(null)).toBe("N/A");
    expect(formatDate(undefined)).toBe("N/A");
    expect(formatRelativeTime(null)).toBe("No updates yet");
  });

  it("merges tailwind class names properly with cn", () => {
    const result = cn("p-4 bg-white", "p-6", { "text-red-500": true, "text-blue-500": false });
    expect(result).toBe("bg-white p-6 text-red-500");
  });
});
