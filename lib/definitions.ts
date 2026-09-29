import { z } from "zod";
import {
  INTERVAL_OPTIONS,
  MAX_EVENT_DATES,
  MAX_EVENT_TITLE_LENGTH,
  MAX_PARTICIPANT_NAME_LENGTH,
  SCHEDULE_MODES,
  validateEventRange,
  type ScheduleMode,
  type Weekday,
} from "@/lib/slots";

export const CreateEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Please enter an event name.")
      .max(
        MAX_EVENT_TITLE_LENGTH,
        `Event name must be ${MAX_EVENT_TITLE_LENGTH} characters or fewer.`,
      ),
    scheduleMode: z.enum(SCHEDULE_MODES),
    dates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."))
      .max(MAX_EVENT_DATES, `Please choose ${MAX_EVENT_DATES} dates or fewer.`),
    weekdays: z.array(z.number().int().min(0).max(6)),
    startTime: z.string().min(1, "Choose a start time."),
    endTime: z.string().min(1, "Choose an end time."),
    intervalMinutes: z.union([
      z.literal(15),
      z.literal(30),
      z.literal(60),
    ]),
    timezone: z.string().min(1, "Timezone is required."),
  })
  .superRefine((data, ctx) => {
    const result = validateEventRange(data);
    if (!result.ok) {
      ctx.addIssue({
        code: "custom",
        message: result.message,
      });
    }

    if (!INTERVAL_OPTIONS.includes(data.intervalMinutes)) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalMinutes"],
        message: "Choose a 15, 30, or 60 minute interval.",
      });
    }
  });

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const SaveAvailabilitySchema = z.object({
  eventId: z.string().min(1),
  displayName: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(
      MAX_PARTICIPANT_NAME_LENGTH,
      `Name must be ${MAX_PARTICIPANT_NAME_LENGTH} characters or fewer.`,
    ),
  slotStarts: z.array(z.string().datetime({ offset: true })),
  editToken: z.string().optional(),
  participantId: z.string().uuid().optional(),
});

export type SaveAvailabilityInput = z.infer<typeof SaveAvailabilitySchema>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export type PublicParticipant = {
  id: string;
  displayName: string;
  slotStarts: string[];
  updatedAt: string;
};

export type PublicEvent = {
  id: string;
  title: string;
  timezone: string;
  startTime: string;
  endTime: string;
  intervalMinutes: 15 | 30 | 60;
  scheduleMode: ScheduleMode;
  dates: string[];
  weekdays: Weekday[];
  createdAt: string;
  participants: PublicParticipant[];
};
