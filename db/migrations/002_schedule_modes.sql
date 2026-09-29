-- Add weekday schedule mode alongside specific calendar dates

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS schedule_mode TEXT NOT NULL DEFAULT 'dates';

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_schedule_mode_check;

ALTER TABLE events
  ADD CONSTRAINT events_schedule_mode_check
  CHECK (schedule_mode IN ('dates', 'weekdays'));

CREATE TABLE IF NOT EXISTS event_weekdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT event_weekdays_unique UNIQUE (event_id, weekday)
);

CREATE INDEX IF NOT EXISTS event_weekdays_event_id_idx ON event_weekdays (event_id);
