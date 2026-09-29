"use client";

import { WEEKDAY_OPTIONS, type Weekday } from "@/lib/slots";

type WeekdaySelectorProps = {
  selected: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
  labelledBy?: string;
};

export function WeekdaySelector({
  selected,
  onChange,
  labelledBy,
}: WeekdaySelectorProps) {
  const selectedSet = new Set(selected);

  function toggle(day: Weekday) {
    if (selectedSet.has(day)) {
      onChange(selected.filter((d) => d !== day));
      return;
    }
    onChange([...selected, day].sort((a, b) => a - b));
  }

  return (
    <div role="group" aria-labelledby={labelledBy}>
      <div className="flex flex-wrap gap-2">
        {WEEKDAY_OPTIONS.map((day) => {
          const isSelected = selectedSet.has(day.value);
          return (
            <button
              key={day.value}
              type="button"
              aria-pressed={isSelected}
              aria-label={day.long}
              onClick={() => toggle(day.value)}
              className={`min-h-11 min-w-11 rounded-md px-3 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${
                isSelected
                  ? "bg-brown text-cream"
                  : "border border-brown/30 hover:bg-beige"
              }`}
            >
              {day.short}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-base text-muted" aria-live="polite">
        {selected.length === 0
          ? "Choose at least one day."
          : `${selected.length} selected`}
      </p>
    </div>
  );
}
