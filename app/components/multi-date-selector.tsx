"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";

type MultiDateSelectorProps = {
  selected: string[];
  onChange: (dates: string[]) => void;
  maxDates?: number;
  labelledBy?: string;
};

function toKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function MultiDateSelector({
  selected,
  onChange,
  maxDates = 31,
  labelledBy,
}: MultiDateSelectorProps) {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(startOfMonth(today));
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const leadingBlanks = getDay(startOfMonth(month));

  function toggle(date: Date) {
    const key = toKey(date);
    if (isBefore(date, today)) {
      return;
    }

    if (selectedSet.has(key)) {
      onChange(selected.filter((d) => d !== key));
      return;
    }

    if (selected.length >= maxDates) {
      return;
    }

    onChange([...selected, key].sort());
  }

  return (
    <div
      className="rounded-md border border-brown/25 bg-cream p-3"
      role="group"
      aria-labelledby={labelledBy}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          className="min-h-10 min-w-10 rounded-md border border-brown/25 px-2 text-xl hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-lg" aria-live="polite">
          {format(month, "MMMM yyyy")}
        </p>
        <button
          type="button"
          className="min-h-10 min-w-10 rounded-md border border-brown/25 px-2 text-xl hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-sm text-muted">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
          <span key={label} aria-hidden>
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((day) => {
          const key = toKey(day);
          const isPast = isBefore(day, today);
          const isSelected = selectedSet.has(key);

          return (
            <button
              key={key}
              type="button"
              disabled={isPast}
              onClick={() => toggle(day)}
              aria-pressed={isSelected}
              aria-label={format(day, "EEEE, MMMM d, yyyy")}
              className={`min-h-10 rounded-md text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${
                isSelected
                  ? "bg-brown text-cream"
                  : isPast
                    ? "cursor-not-allowed text-muted/40"
                    : "hover:bg-beige"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-base text-muted" aria-live="polite">
        {selected.length === 0
          ? "Choose at least one date."
          : `${selected.length} selected`}
      </p>
    </div>
  );
}
