import { format, parse } from "date-fns";
import { TZDate } from "@date-fns/tz";

export const INTERVAL_OPTIONS = [15, 30, 60] as const;
export type IntervalMinutes = (typeof INTERVAL_OPTIONS)[number];

export const MAX_EVENT_TITLE_LENGTH = 120;
export const MAX_PARTICIPANT_NAME_LENGTH = 60;
export const MAX_EVENT_DATES = 31;
export const MAX_DATE_SPAN_DAYS = 60;

export type TimeOfDay = {
  hours: number;
  minutes: number;
};

export type EventSlotConfig = {
  dates: string[];
  startTime: string;
  endTime: string;
  intervalMinutes: IntervalMinutes;
  timezone: string;
};

/** Parse "HH:mm" or "HH:mm:ss" into hours/minutes. */
export function parseTimeOfDay(value: string): TimeOfDay {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) {
    throw new Error("Invalid time format. Use HH:mm.");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Time is out of range.");
  }

  return { hours, minutes };
}

export function formatTimeOfDay(time: TimeOfDay): string {
  return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;
}

export function timeOfDayToMinutes(time: TimeOfDay): number {
  return time.hours * 60 + time.minutes;
}

export function validateEventRange(input: {
  title: string;
  dates: string[];
  startTime: string;
  endTime: string;
  intervalMinutes: number;
}): { ok: true } | { ok: false; message: string } {
  const title = input.title.trim();

  if (!title) {
    return { ok: false, message: "Please enter an event name." };
  }

  if (title.length > MAX_EVENT_TITLE_LENGTH) {
    return {
      ok: false,
      message: `Event name must be ${MAX_EVENT_TITLE_LENGTH} characters or fewer.`,
    };
  }

  if (input.dates.length === 0) {
    return { ok: false, message: "Select at least one date." };
  }

  if (input.dates.length > MAX_EVENT_DATES) {
    return {
      ok: false,
      message: `Please choose ${MAX_EVENT_DATES} dates or fewer.`,
    };
  }

  const uniqueDates = new Set(input.dates);
  if (uniqueDates.size !== input.dates.length) {
    return { ok: false, message: "Duplicate dates were selected." };
  }

  for (const date of input.dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { ok: false, message: "One of the selected dates is invalid." };
    }
  }

  const sorted = [...input.dates].sort();
  const first = parse(sorted[0], "yyyy-MM-dd", new Date());
  const last = parse(sorted[sorted.length - 1], "yyyy-MM-dd", new Date());
  const spanDays =
    Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (spanDays > MAX_DATE_SPAN_DAYS) {
    return {
      ok: false,
      message: `Dates must fall within a ${MAX_DATE_SPAN_DAYS}-day window.`,
    };
  }

  if (
    !INTERVAL_OPTIONS.includes(input.intervalMinutes as IntervalMinutes)
  ) {
    return { ok: false, message: "Choose a 15, 30, or 60 minute interval." };
  }

  let start: TimeOfDay;
  let end: TimeOfDay;

  try {
    start = parseTimeOfDay(input.startTime);
    end = parseTimeOfDay(input.endTime);
  } catch {
    return { ok: false, message: "Start and end times must look like 09:00." };
  }

  if (timeOfDayToMinutes(end) <= timeOfDayToMinutes(start)) {
    return { ok: false, message: "Ending time must be later than starting time." };
  }

  const duration = timeOfDayToMinutes(end) - timeOfDayToMinutes(start);
  if (duration < input.intervalMinutes) {
    return {
      ok: false,
      message: "The time range must fit at least one interval.",
    };
  }

  return { ok: true };
}

/**
 * Build slot start instants (UTC ISO strings) for an event.
 * Each slot is the start of an interval on a given date in the event timezone.
 */
export function generateSlotStarts(config: EventSlotConfig): string[] {
  const start = parseTimeOfDay(config.startTime);
  const end = parseTimeOfDay(config.endTime);
  const startMinutes = timeOfDayToMinutes(start);
  const endMinutes = timeOfDayToMinutes(end);
  const slots: string[] = [];

  const sortedDates = [...config.dates].sort();

  for (const date of sortedDates) {
    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += config.intervalMinutes
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const local = new TZDate(
        Number(date.slice(0, 4)),
        Number(date.slice(5, 7)) - 1,
        Number(date.slice(8, 10)),
        hours,
        mins,
        0,
        0,
        config.timezone,
      );
      slots.push(new Date(local.getTime()).toISOString());
    }
  }

  return slots;
}

export function isSlotInEvent(
  slotStartIso: string,
  config: EventSlotConfig,
): boolean {
  const allowed = new Set(generateSlotStarts(config));
  return allowed.has(new Date(slotStartIso).toISOString());
}

export function filterValidSlots(
  slotStarts: string[],
  config: EventSlotConfig,
): string[] {
  const allowed = new Set(generateSlotStarts(config));
  const unique = new Set<string>();

  for (const slot of slotStarts) {
    const normalized = new Date(slot).toISOString();
    if (allowed.has(normalized)) {
      unique.add(normalized);
    }
  }

  return [...unique].sort();
}

export function toggleSlots(
  selected: Set<string>,
  targets: string[],
  mode: "select" | "deselect",
): Set<string> {
  const next = new Set(selected);

  for (const target of targets) {
    if (mode === "select") {
      next.add(target);
    } else {
      next.delete(target);
    }
  }

  return next;
}

export function paintModeForCell(
  selected: Set<string>,
  slotStart: string,
): "select" | "deselect" {
  return selected.has(slotStart) ? "deselect" : "select";
}

export type SlotAvailability = {
  slotStart: string;
  count: number;
  availableNames: string[];
  unavailableNames: string[];
};

export function buildAvailabilityCounts(input: {
  slotStarts: string[];
  participants: { id: string; displayName: string }[];
  slotsByParticipant: Map<string, Set<string>>;
}): Map<string, SlotAvailability> {
  const result = new Map<string, SlotAvailability>();
  const total = input.participants.length;

  for (const slotStart of input.slotStarts) {
    const availableNames: string[] = [];
    const unavailableNames: string[] = [];

    for (const participant of input.participants) {
      const slots = input.slotsByParticipant.get(participant.id);
      if (slots?.has(slotStart)) {
        availableNames.push(participant.displayName);
      } else {
        unavailableNames.push(participant.displayName);
      }
    }

    result.set(slotStart, {
      slotStart,
      count: availableNames.length,
      availableNames,
      unavailableNames,
    });
  }

  // unused but keeps intent clear for callers that care about totals
  void total;

  return result;
}

/** Intensity from 0 (none) to 1 (everyone available). */
export function heatmapIntensity(count: number, totalParticipants: number): number {
  if (totalParticipants <= 0 || count <= 0) {
    return 0;
  }

  return Math.min(1, count / totalParticipants);
}

/**
 * CoffeeCup brown shades for heatmap. Index 0 is unused (neutral bg).
 * Higher index = darker / more available.
 */
export function heatmapShade(intensity: number): string {
  if (intensity <= 0) {
    return "transparent";
  }

  if (intensity < 0.25) {
    return "#E8D5C4";
  }

  if (intensity < 0.5) {
    return "#C9A98E";
  }

  if (intensity < 0.75) {
    return "#8A5A3B";
  }

  if (intensity < 1) {
    return "#6B4330";
  }

  return "#3D2B1F";
}

export function formatSlotLabel(
  slotStartIso: string,
  timezone: string,
  pattern = "h:mm a",
): string {
  const date = new TZDate(new Date(slotStartIso), timezone);
  return format(date, pattern);
}

export function formatDateLabel(
  dateIso: string,
  pattern = "EEE MMM d",
): string {
  const date = parse(dateIso, "yyyy-MM-dd", new Date());
  return format(date, pattern);
}

export function slotDateKey(slotStartIso: string, timezone: string): string {
  const date = new TZDate(new Date(slotStartIso), timezone);
  return format(date, "yyyy-MM-dd");
}

export function dedupeSlots(slotStarts: string[]): string[] {
  return [...new Set(slotStarts.map((s) => new Date(s).toISOString()))].sort();
}
