import { describe, expect, it } from "vitest";
import {
  buildAvailabilityCounts,
  dedupeSlots,
  filterValidSlots,
  generateSlotStarts,
  heatmapIntensity,
  heatmapShade,
  paintModeForCell,
  toggleSlots,
  validateEventRange,
} from "@/lib/slots";
import {
  generateEditToken,
  hashEditToken,
  verifyEditToken,
} from "@/lib/tokens";

describe("validateEventRange", () => {
  it("accepts a valid event", () => {
    const result = validateEventRange({
      title: "Coffee chat",
      dates: ["2026-10-01", "2026-10-02"],
      startTime: "09:00",
      endTime: "12:00",
      intervalMinutes: 30,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = validateEventRange({
      title: "   ",
      dates: ["2026-10-01"],
      startTime: "09:00",
      endTime: "12:00",
      intervalMinutes: 30,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects when end time is not after start time", () => {
    const result = validateEventRange({
      title: "Meetup",
      dates: ["2026-10-01"],
      startTime: "14:00",
      endTime: "14:00",
      intervalMinutes: 30,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects unreasonable date spans", () => {
    const result = validateEventRange({
      title: "Long haul",
      dates: ["2026-01-01", "2026-04-01"],
      startTime: "09:00",
      endTime: "10:00",
      intervalMinutes: 30,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects missing dates", () => {
    const result = validateEventRange({
      title: "Meetup",
      dates: [],
      startTime: "09:00",
      endTime: "10:00",
      intervalMinutes: 30,
    });
    expect(result.ok).toBe(false);
  });
});

describe("generateSlotStarts", () => {
  it("generates slots for 30-minute intervals", () => {
    const slots = generateSlotStarts({
      dates: ["2026-10-01"],
      startTime: "09:00",
      endTime: "10:00",
      intervalMinutes: 30,
      timezone: "UTC",
    });

    expect(slots).toEqual([
      "2026-10-01T09:00:00.000Z",
      "2026-10-01T09:30:00.000Z",
    ]);
  });

  it("respects 15 and 60 minute intervals", () => {
    const fifteen = generateSlotStarts({
      dates: ["2026-10-01"],
      startTime: "09:00",
      endTime: "09:45",
      intervalMinutes: 15,
      timezone: "UTC",
    });
    expect(fifteen).toHaveLength(3);

    const sixty = generateSlotStarts({
      dates: ["2026-10-01"],
      startTime: "09:00",
      endTime: "11:00",
      intervalMinutes: 60,
      timezone: "UTC",
    });
    expect(sixty).toHaveLength(2);
  });

  it("stores UTC while interpreting local timezone", () => {
    const slots = generateSlotStarts({
      dates: ["2026-01-15"],
      startTime: "09:00",
      endTime: "09:30",
      intervalMinutes: 30,
      timezone: "America/Los_Angeles",
    });

    expect(slots).toEqual(["2026-01-15T17:00:00.000Z"]);
  });
});

describe("selection helpers", () => {
  it("selects and deselects cells based on paint mode", () => {
    const empty = new Set<string>();
    expect(paintModeForCell(empty, "a")).toBe("select");

    const selected = toggleSlots(empty, ["a", "b"], "select");
    expect(selected.has("a")).toBe(true);
    expect(selected.has("b")).toBe(true);
    expect(paintModeForCell(selected, "a")).toBe("deselect");

    const cleared = toggleSlots(selected, ["a"], "deselect");
    expect(cleared.has("a")).toBe(false);
    expect(cleared.has("b")).toBe(true);
  });

  it("dedupes and filters invalid slots", () => {
    const config = {
      dates: ["2026-10-01"],
      startTime: "09:00",
      endTime: "10:00",
      intervalMinutes: 30 as const,
      timezone: "UTC",
    };

    const valid = generateSlotStarts(config);
    const mixed = [
      valid[0],
      valid[0],
      "2026-10-01T12:00:00.000Z",
      valid[1],
    ];

    expect(dedupeSlots(mixed)).toHaveLength(3);
    expect(filterValidSlots(mixed, config)).toEqual(valid);
  });
});

describe("heatmap", () => {
  it("counts availability per slot", () => {
    const slotA = "2026-10-01T09:00:00.000Z";
    const slotB = "2026-10-01T09:30:00.000Z";

    const counts = buildAvailabilityCounts({
      slotStarts: [slotA, slotB],
      participants: [
        { id: "1", displayName: "Ada" },
        { id: "2", displayName: "Ben" },
      ],
      slotsByParticipant: new Map([
        ["1", new Set([slotA, slotB])],
        ["2", new Set([slotA])],
      ]),
    });

    expect(counts.get(slotA)?.count).toBe(2);
    expect(counts.get(slotA)?.availableNames).toEqual(["Ada", "Ben"]);
    expect(counts.get(slotB)?.count).toBe(1);
    expect(counts.get(slotB)?.unavailableNames).toEqual(["Ben"]);
  });

  it("maps intensity to darker shades", () => {
    expect(heatmapIntensity(0, 4)).toBe(0);
    expect(heatmapIntensity(2, 4)).toBe(0.5);
    expect(heatmapIntensity(4, 4)).toBe(1);

    expect(heatmapShade(0)).toBe("transparent");
    expect(heatmapShade(0.2)).not.toBe(heatmapShade(1));
    expect(heatmapShade(1)).toBe("#3D2B1F");
  });
});

describe("edit tokens", () => {
  it("hashes tokens and verifies authorization", () => {
    const token = generateEditToken();
    const hash = hashEditToken(token);

    expect(hash).not.toBe(token);
    expect(verifyEditToken(token, hash)).toBe(true);
    expect(verifyEditToken("wrong-token", hash)).toBe(false);
  });
});
