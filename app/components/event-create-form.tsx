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
      className="sketch-panel mx-auto w-full max-w-xl border-2 border-brown/20 bg-soft p-6 sm:p-8"
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="event-title" className="mb-2 block text-xl">
            Event name
          </label>
          <input
            id="event-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Team sync, study group, dinner…"
            className="sketch-sm w-full border-2 border-brown/25 bg-cream px-4 py-3 text-xl outline-none focus:border-brown"
            required
          />
        </div>

        <div>
          <p className="mb-2 text-xl">Possible dates</p>
          <MultiDateSelector selected={dates} onChange={setDates} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start-time" className="mb-2 block text-xl">
              Earliest time
            </label>
            <select
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="sketch-sm w-full border-2 border-brown/25 bg-cream px-4 py-3 text-xl outline-none focus:border-brown"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {formatTimeLabel(time)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="end-time" className="mb-2 block text-xl">
              Latest time
            </label>
            <select
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="sketch-sm w-full border-2 border-brown/25 bg-cream px-4 py-3 text-xl outline-none focus:border-brown"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {formatTimeLabel(time)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-xl">Time interval</legend>
          <div className="flex flex-wrap gap-2">
            {([15, 30, 60] as const).map((interval) => (
              <label
                key={interval}
                className={`sketch-sm cursor-pointer border-2 px-4 py-2 text-lg transition-colors ${
                  intervalMinutes === interval
                    ? "border-brown bg-brown text-cream"
                    : "border-brown/25 bg-cream hover:bg-beige"
                }`}
              >
                <input
                  type="radio"
                  name="interval"
                  value={interval}
                  checked={intervalMinutes === interval}
                  onChange={() => setIntervalMinutes(interval)}
                  className="sr-only"
                />
                {interval} min
              </label>
            ))}
          </div>
        </fieldset>

        {error ? (
          <p
            role="alert"
            className="sketch-sm border border-brown/30 bg-beige px-4 py-3 text-lg"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="sketch-sm inline-flex h-12 w-full items-center justify-center bg-brown px-6 text-xl text-cream transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Creating…" : "Create an event"}
        </button>
      </div>
    </form>
  );
}
