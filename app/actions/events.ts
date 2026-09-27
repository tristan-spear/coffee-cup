"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CreateEventSchema,
  SaveAvailabilitySchema,
  type ActionResult,
  type PublicEvent,
} from "@/lib/definitions";
import {
  createEventRecord,
  createParticipant,
  findParticipantById,
  findParticipantByName,
  getEventById,
  isDatabaseConfigured,
  replaceAvailabilitySlots,
  updateParticipantName,
} from "@/lib/events";
import { filterValidSlots, generateSlotStarts } from "@/lib/slots";
import {
  generateEditToken,
  verifyEditToken,
} from "@/lib/tokens";

function databaseMissingResult<T>(): ActionResult<T> {
  return {
    ok: false,
    message:
      "Database is not configured yet. Add DATABASE_URL to your environment and run migrations.",
  };
}

export async function createEvent(
  input: unknown,
): Promise<ActionResult<{ eventId: string }>> {
  if (!isDatabaseConfigured()) {
    return databaseMissingResult();
  }

  const parsed = CreateEventSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Please check the form and try again.";
    return {
      ok: false,
      message: firstMessage,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([key, value]) => [
          key,
          value ?? [],
        ]),
      ),
    };
  }

  try {
    const eventId = await createEventRecord({
      title: parsed.data.title,
      timezone: parsed.data.timezone,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      intervalMinutes: parsed.data.intervalMinutes,
      dates: parsed.data.dates,
    });

    redirect(`/event/${eventId}`);
  } catch (error) {
    // Next.js redirect throws; rethrow it
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("createEvent failed", error);
    return {
      ok: false,
      message: "We couldn't create that event. Please try again in a moment.",
    };
  }
}

export async function fetchEvent(
  eventId: string,
): Promise<ActionResult<PublicEvent>> {
  if (!isDatabaseConfigured()) {
    return databaseMissingResult();
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { ok: false, message: "We couldn't find that event." };
    }
    return { ok: true, data: event };
  } catch (error) {
    console.error("fetchEvent failed", error);
    return {
      ok: false,
      message: "Something went wrong loading this event. Please try again.",
    };
  }
}

export async function saveAvailability(
  input: unknown,
): Promise<
  ActionResult<{
    participantId: string;
    editToken?: string;
    event: PublicEvent;
  }>
> {
  if (!isDatabaseConfigured()) {
    return databaseMissingResult();
  }

  const parsed = SaveAvailabilitySchema.safeParse(input);
  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Please check your availability and try again.";
    return { ok: false, message: firstMessage };
  }

  const { eventId, displayName, slotStarts, editToken, participantId } =
    parsed.data;

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { ok: false, message: "We couldn't find that event." };
    }

    const config = {
      dates: event.dates,
      startTime: event.startTime,
      endTime: event.endTime,
      intervalMinutes: event.intervalMinutes,
      timezone: event.timezone,
    };

    const validSlots = filterValidSlots(slotStarts, config);
    if (slotStarts.length > 0 && validSlots.length === 0) {
      return {
        ok: false,
        message: "Those time slots don't match this event's schedule.",
      };
    }

    // Reject any submitted slots outside the event window
    if (validSlots.length !== dedupeLength(slotStarts)) {
      return {
        ok: false,
        message: "Some selected times fall outside this event. Please refresh and try again.",
      };
    }

    let resolvedParticipantId = participantId;
    let returnedToken: string | undefined;

    if (participantId && editToken) {
      const existing = await findParticipantById(participantId);
      if (!existing || existing.event_id !== eventId) {
        return {
          ok: false,
          message: "We couldn't find your saved response for this event.",
        };
      }

      if (!verifyEditToken(editToken, existing.edit_token_hash)) {
        return {
          ok: false,
          message:
            "Your edit link for this browser is no longer valid. Add your availability as a new response.",
        };
      }

      // Name changes on edit: ensure no collision with another participant
      if (
        existing.display_name.trim().toLowerCase() !==
        displayName.trim().toLowerCase()
      ) {
        const collision = await findParticipantByName(eventId, displayName);
        if (collision && collision.id !== existing.id) {
          return {
            ok: false,
            message:
              "Someone else already used that name. Try adding a last initial.",
          };
        }
      }

      if (
        existing.display_name.trim() !== displayName.trim()
      ) {
        await updateParticipantName({
          participantId: existing.id,
          displayName,
        });
      }

      resolvedParticipantId = existing.id;
    } else {
      const collision = await findParticipantByName(eventId, displayName);
      if (collision) {
        return {
          ok: false,
          message:
            "That name is already taken for this event. Try adding a last initial or nickname.",
        };
      }

      returnedToken = generateEditToken();
      const created = await createParticipant({
        eventId,
        displayName,
        editToken: returnedToken,
      });
      resolvedParticipantId = created.id;
    }

    if (!resolvedParticipantId) {
      return {
        ok: false,
        message: "We couldn't save your availability. Please try again.",
      };
    }

    await replaceAvailabilitySlots({
      participantId: resolvedParticipantId,
      eventId,
      slotStarts: validSlots,
    });

    const refreshed = await getEventById(eventId);
    if (!refreshed) {
      return {
        ok: false,
        message: "Saved, but we couldn't reload the event. Please refresh.",
      };
    }

    revalidatePath(`/event/${eventId}`);

    return {
      ok: true,
      data: {
        participantId: resolvedParticipantId,
        editToken: returnedToken,
        event: refreshed,
      },
    };
  } catch (error) {
    console.error("saveAvailability failed", error);
    return {
      ok: false,
      message:
        "Something went wrong saving your availability. Please check your connection and try again.",
    };
  }
}

function dedupeLength(slotStarts: string[]): number {
  return new Set(slotStarts.map((s) => new Date(s).toISOString())).size;
}

/** Exported for tests / unused slot generation sanity. */
export async function getEventSlotStarts(eventId: string): Promise<string[]> {
  const event = await getEventById(eventId);
  if (!event) {
    return [];
  }

  return generateSlotStarts({
    dates: event.dates,
    startTime: event.startTime,
    endTime: event.endTime,
    intervalMinutes: event.intervalMinutes,
    timezone: event.timezone,
  });
}
