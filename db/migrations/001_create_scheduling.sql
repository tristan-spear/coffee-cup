-- CoffeeCup group availability scheduling schema (Neon / PostgreSQL)

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  timezone TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  interval_minutes INTEGER NOT NULL CHECK (interval_minutes IN (15, 30, 60)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_time_range_check CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS event_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  CONSTRAINT event_dates_unique UNIQUE (event_id, event_date)
);

CREATE INDEX IF NOT EXISTS event_dates_event_id_idx ON event_dates (event_id);
CREATE INDEX IF NOT EXISTS event_dates_event_date_idx ON event_dates (event_date);

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  edit_token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT participants_display_name_not_blank CHECK (char_length(trim(display_name)) > 0)
);

CREATE INDEX IF NOT EXISTS participants_event_id_idx ON participants (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS participants_event_name_unique
  ON participants (event_id, lower(trim(display_name)));

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT availability_slots_unique UNIQUE (participant_id, slot_start)
);

CREATE INDEX IF NOT EXISTS availability_slots_event_id_idx ON availability_slots (event_id);
CREATE INDEX IF NOT EXISTS availability_slots_participant_id_idx ON availability_slots (participant_id);
CREATE INDEX IF NOT EXISTS availability_slots_slot_start_idx ON availability_slots (slot_start);
