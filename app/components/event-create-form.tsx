"use client";

import { useState, useTransition } from "react";
import { createEvent } from "@/app/actions/events";
import { MultiDateSelector } from "@/app/components/multi-date-selector";
import type { IntervalMinutes } from "@/lib/slots";

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function formatTimeLabel(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const fieldClass =
  "w-full rounded-md border border-brown/30 bg-soft px-3 py-2.5 text-lg text-ink outline-none focus-visible:border-brown focus-visible:ring-2 focus-visible:ring-brown/30";

export function EventCreateForm() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [intervalMinutes, setIntervalMinutes] = useState<IntervalMinutes>(30);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    startTransition(async () => {
      const result = await createEvent({
        title,
        dates,
        startTime,
        endTime,
        intervalMinutes,
        timezone,
      });

      if (result && !result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-brown/20 bg-soft p-5 sm:p-6"
      aria-describedby={error ? "create-error" : undefined}
    >
      <div>
        <label htmlFor="event-title" className="mb-1.5 block text-lg">
          Event name
        </label>
        <input
          id="event-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Team sync"
          className={fieldClass}
          required
          autoComplete="off"
        />
      </div>

      <div>
        <p id="dates-label" className="mb-1.5 text-lg">
          Dates
        </p>
        <MultiDateSelector
          selected={dates}
          onChange={setDates}
          labelledBy="dates-label"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start-time" className="mb-1.5 block text-lg">
            From
          </label>
          <select
            id="start-time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={fieldClass}
          >
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {formatTimeLabel(time)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="end-time" className="mb-1.5 block text-lg">
            To
          </label>
          <select
            id="end-time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={fieldClass}
          >
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {formatTimeLabel(time)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="interval" className="mb-1.5 block text-lg">
          Time slots
        </label>
        <select
          id="interval"
          value={intervalMinutes}
          onChange={(e) =>
            setIntervalMinutes(Number(e.target.value) as IntervalMinutes)
          }
          className={fieldClass}
        >
          <option value={15}>Every 15 minutes</option>
          <option value={30}>Every 30 minutes</option>
          <option value={60}>Every 60 minutes</option>
        </select>
      </div>

      {error ? (
        <p id="create-error" role="alert" className="text-lg text-brown">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-brown px-5 text-xl text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
