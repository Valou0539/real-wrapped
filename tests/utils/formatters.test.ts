import { describe, it, expect } from "vitest";
import { formatDuration, formatDate } from "~/utils/formatters";

describe("formatters", () => {
  describe("formatDuration", () => {
    it("formats duration less than an hour", () => {
      expect(formatDuration(300000)).toBe("5m"); // 5 minutes
    });

    it("formats duration more than an hour", () => {
      // 1 hour 30 minutes = 5400000 ms
      expect(formatDuration(5400000)).toBe("1h30");
    });

    it("pads minutes correctly", () => {
      // 1 hour 5 minutes = 3900000 ms
      expect(formatDuration(3900000)).toBe("1h05");
    });
  });

  describe("formatDate", () => {
    it("formats date correctly with default locale", () => {
      const date = "2023-10-25";
      const formatted = formatDate(date, "en-US");
      expect(formatted).toBe("10/25/2023");

      const frFormatted = formatDate(date, "fr-FR");
      expect(frFormatted).toBe("25/10/2023");
    });

    it("returns empty string for empty input", () => {
      expect(formatDate("")).toBe("");
    });
  });
});
