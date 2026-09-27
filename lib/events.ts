import "server-only";

import { getSql } from "@/lib/db";
import type { PublicEvent, PublicParticipant } from "@/lib/definitions";
import type { IntervalMinutes } from "@/lib/slots";
import { generateEventId, hashEditToken } from "@/lib/tokens";

type EventRow = {
  id: string;
  title: string;
  timezone: string;
  start_time: string;
  end_time: string;
  interval_minutes: number;
  created_at: string;
};

type ParticipantRow = {
  id: string;
  event_id: string;
  display_name: string;
  edit_token_hash: string;
  created_at: string;
  updated_at: string;
};

function normalizeTime(value: string): string {
  // Neon TIME may come back as "09:00:00" — normalize to HH:mm
  return value.slice(0, 5);
}

function toDateString(value: string | Date): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export async function createEventRecord(input: {
  title: string;
  timezone: string;
  startTime: string;
  endTime: string;
  intervalMinutes: IntervalMinutes;
  dates: string[];
}): Promise<string> {
  const sql = getSql();
  const id = generateEventId();
  const sortedDates = [...input.dates].sort();

  await sql`
    INSERT INTO events (id, title, timezone, start_time, end_time, interval_minutes)
    VALUES (
      ${id},
      ${input.title},
      ${input.timezone},
      ${input.startTime}::time,
      ${input.endTime}::time,
      ${input.intervalMinutes}
    )
  `;

  for (const date of sortedDates) {
    await sql`
      INSERT INTO event_dates (event_id, event_date)
      VALUES (${id}, ${date}::date)
    `;
  }

  return id;
}

export async function getEventById(eventId: string): Promise<PublicEvent | null> {
  const sql = getSql();

  const eventRows = await sql`
    SELECT id, title, timezone, start_time, end_time, interval_minutes, created_at
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  const event = eventRows[0] as EventRow | undefined;
  if (!event) {
    return null;
  }

  const dateRows = await sql`
    SELECT event_date
    FROM event_dates
    WHERE event_id = ${eventId}
    ORDER BY event_date ASC
  `;

  const participantRows = await sql`
    SELECT id, event_id, display_name, edit_token_hash, created_at, updated_at
    FROM participants
    WHERE event_id = ${eventId}
    ORDER BY created_at ASC
  `;

  const slotRows = await sql`
    SELECT participant_id, slot_start
    FROM availability_slots
    WHERE event_id = ${eventId}
    ORDER BY slot_start ASC
  `;

  const slotsByParticipant = new Map<string, string[]>();
  for (const row of slotRows as { participant_id: string; slot_start: string }[]) {
    const list = slotsByParticipant.get(row.participant_id) ?? [];
    list.push(new Date(row.slot_start).toISOString());
    slotsByParticipant.set(row.participant_id, list);
  }

  const participants: PublicParticipant[] = (
    participantRows as ParticipantRow[]
  ).map((p) => ({
    id: p.id,
    displayName: p.display_name,
    slotStarts: slotsByParticipant.get(p.id) ?? [],
    updatedAt: new Date(p.updated_at).toISOString(),
  }));

  return {
    id: event.id,
    title: event.title,
    timezone: event.timezone,
    startTime: normalizeTime(String(event.start_time)),
    endTime: normalizeTime(String(event.end_time)),
    intervalMinutes: event.interval_minutes as IntervalMinutes,
    dates: (dateRows as { event_date: string | Date }[]).map((d) =>
      toDateString(d.event_date),
    ),
    createdAt: new Date(event.created_at).toISOString(),
    participants,
  };
}

export async function findParticipantByName(
  eventId: string,
  displayName: string,
): Promise<ParticipantRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, event_id, display_name, edit_token_hash, created_at, updated_at
    FROM participants
    WHERE event_id = ${eventId}
      AND lower(trim(display_name)) = lower(trim(${displayName}))
    LIMIT 1
  `;

  return (rows[0] as ParticipantRow | undefined) ?? null;
}

export async function findParticipantById(
  participantId: string,
): Promise<ParticipantRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, event_id, display_name, edit_token_hash, created_at, updated_at
    FROM participants
    WHERE id = ${participantId}
    LIMIT 1
  `;

  return (rows[0] as ParticipantRow | undefined) ?? null;
}

export async function createParticipant(input: {
  eventId: string;
  displayName: string;
  editToken: string;
}): Promise<{ id: string }> {
  const sql = getSql();
  const tokenHash = hashEditToken(input.editToken);

  const rows = await sql`
    INSERT INTO participants (event_id, display_name, edit_token_hash)
    VALUES (${input.eventId}, ${input.displayName.trim()}, ${tokenHash})
    RETURNING id
  `;

  return { id: (rows[0] as { id: string }).id };
}

export async function updateParticipantName(input: {
  participantId: string;
  displayName: string;
}): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE participants
    SET display_name = ${input.displayName.trim()}, updated_at = NOW()
    WHERE id = ${input.participantId}
  `;
}

export async function replaceAvailabilitySlots(input: {
  participantId: string;
  eventId: string;
  slotStarts: string[];
}): Promise<void> {
  const sql = getSql();

  await sql`
    DELETE FROM availability_slots
    WHERE participant_id = ${input.participantId}
  `;

  for (const slotStart of input.slotStarts) {
    await sql`
      INSERT INTO availability_slots (participant_id, event_id, slot_start)
      VALUES (${input.participantId}, ${input.eventId}, ${slotStart}::timestamptz)
    `;
  }

  await sql`
    UPDATE participants
    SET updated_at = NOW()
    WHERE id = ${input.participantId}
  `;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
