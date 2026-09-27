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
};

function toKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function MultiDateSelector({
  selected,
  onChange,
  maxDates = 31,
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
    <div className="sketch-panel border-2 border-brown/25 bg-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="sketch-sm border border-brown/30 px-3 py-1 text-lg hover:bg-beige"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-xl tracking-wide">{format(month, "MMMM yyyy")}</p>
        <button
          type="button"
          className="sketch-sm border border-brown/30 px-3 py-1 text-lg hover:bg-beige"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-sm text-muted">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
          <span key={label}>{label}</span>
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
              className={`sketch-sm aspect-square text-lg transition-colors ${
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

      <p className="mt-3 text-base text-muted">
        {selected.length === 0
          ? "Select one or more dates."
          : `${selected.length} date${selected.length === 1 ? "" : "s"} selected`}
      </p>
    </div>
  );
}
