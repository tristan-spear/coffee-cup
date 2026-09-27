"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  formatDateLabel,
  formatSlotLabel,
  paintModeForCell,
  slotDateKey,
  toggleSlots,
} from "@/lib/slots";

type AvailabilityGridProps = {
  dates: string[];
  slotStarts: string[];
  timezone: string;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  readOnly?: boolean;
  renderCell?: (slotStart: string) => {
    background: string;
    label: string;
    title: string;
    textClass?: string;
  };
  onCellActivate?: (slotStart: string) => void;
  activeSlot?: string | null;
};

export function AvailabilityGrid({
  dates,
  slotStarts,
  timezone,
  selected,
  onChange,
  readOnly = false,
  renderCell,
  onCellActivate,
  activeSlot,
}: AvailabilityGridProps) {
  const paintingRef = useRef<"select" | "deselect" | null>(null);
  const selectedRef = useRef(selected);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPainting, setIsPainting] = useState(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const date of dates) {
      map.set(date, []);
    }
    for (const slot of slotStarts) {
      const key = slotDateKey(slot, timezone);
      const list = map.get(key);
      if (list) {
        list.push(slot);
      }
    }
    return map;
  }, [dates, slotStarts, timezone]);

  const timeLabels = useMemo(() => {
    const firstDate = dates[0];
    if (!firstDate) {
      return [];
    }
    return slotsByDate.get(firstDate) ?? [];
  }, [dates, slotsByDate]);

  const applyPaint = useCallback(
    (slotStart: string) => {
      const mode = paintingRef.current;
      if (!mode || readOnly) {
        return;
      }
      const next = toggleSlots(selectedRef.current, [slotStart], mode);
      selectedRef.current = next;
      onChange(next);
    },
    [onChange, readOnly],
  );

  const paintFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY);
      const cell = el?.closest<HTMLElement>("[data-slot-start]");
      const slotStart = cell?.dataset.slotStart;
      if (slotStart) {
        applyPaint(slotStart);
      }
    },
    [applyPaint],
  );

  useEffect(() => {
    function endPaint() {
      paintingRef.current = null;
      setIsPainting(false);
    }

    function onPointerMove(event: PointerEvent) {
      if (!paintingRef.current) {
        return;
      }
      event.preventDefault();
      paintFromPoint(event.clientX, event.clientY);
    }

    window.addEventListener("pointerup", endPaint);
    window.addEventListener("pointercancel", endPaint);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    return () => {
      window.removeEventListener("pointerup", endPaint);
      window.removeEventListener("pointercancel", endPaint);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [paintFromPoint]);

  function handlePointerDown(slotStart: string, event: ReactPointerEvent) {
    if (readOnly) {
      onCellActivate?.(slotStart);
      return;
    }

    event.preventDefault();
    paintingRef.current = paintModeForCell(selectedRef.current, slotStart);
    setIsPainting(true);
    applyPaint(slotStart);
  }

  function handleKeyDown(slotStart: string, event: KeyboardEvent) {
    if (readOnly) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onCellActivate?.(slotStart);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const mode = paintModeForCell(selectedRef.current, slotStart);
      const next = toggleSlots(selectedRef.current, [slotStart], mode);
      selectedRef.current = next;
      onChange(next);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto border-2 border-brown/20 bg-soft sketch-panel ${
        isPainting ? "select-none touch-none" : ""
      }`}
      style={{
        WebkitUserSelect: isPainting ? "none" : undefined,
        userSelect: isPainting ? "none" : undefined,
        touchAction: isPainting ? "none" : undefined,
      }}
    >
      <div
        className="inline-grid min-w-full"
        style={{
          gridTemplateColumns: `4.5rem repeat(${dates.length}, minmax(4.5rem, 1fr))`,
        }}
        role="grid"
        aria-label="Availability grid"
      >
        <div
          className="sticky top-0 left-0 z-30 border-b border-r border-brown/15 bg-soft px-2 py-3"
          role="columnheader"
        />
        {dates.map((date) => (
          <div
            key={date}
            className="sticky top-0 z-20 border-b border-brown/15 bg-soft px-2 py-3 text-center text-base leading-tight"
            role="columnheader"
          >
            {formatDateLabel(date)}
          </div>
        ))}

        {timeLabels.map((timeSlot, rowIndex) => {
          const timeLabel = formatSlotLabel(timeSlot, timezone, "h:mm a");

          return (
            <div key={`row-${timeSlot}`} className="contents" role="row">
              <div
                className="sticky left-0 z-10 border-r border-brown/15 bg-soft px-2 py-1 text-sm text-muted"
                role="rowheader"
              >
                {timeLabel}
              </div>
              {dates.map((date) => {
                const daySlots = slotsByDate.get(date) ?? [];
                const slotStart = daySlots[rowIndex];
                if (!slotStart) {
                  return (
                    <div
                      key={`${date}-${rowIndex}`}
                      className="h-9 border-b border-r border-brown/10 bg-cream/40"
                    />
                  );
                }

                const isSelected = selected.has(slotStart);
                const custom = renderCell?.(slotStart);
                const isActive = activeSlot === slotStart;

                return (
                  <button
                    key={slotStart}
                    type="button"
                    role="gridcell"
                    data-slot-start={slotStart}
                    aria-label={`${formatDateLabel(date, "EEEE MMM d")} at ${timeLabel}${
                      custom
                        ? `, ${custom.title}`
                        : isSelected
                          ? ", available"
                          : ", unavailable"
                    }`}
                    aria-pressed={readOnly ? undefined : isSelected}
                    tabIndex={0}
                    className={`h-9 border-b border-r border-brown/10 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brown ${
                      isActive ? "ring-2 ring-inset ring-brown" : ""
                    } ${
                      !custom && isSelected
                        ? "bg-brown text-cream"
                        : !custom
                          ? "bg-cream hover:bg-beige"
                          : ""
                    }`}
                    style={
                      custom
                        ? {
                            backgroundColor:
                              custom.background === "transparent"
                                ? undefined
                                : custom.background,
                          }
                        : undefined
                    }
                    onPointerDown={(event) =>
                      handlePointerDown(slotStart, event)
                    }
                    onKeyDown={(event) => handleKeyDown(slotStart, event)}
                  >
                    <span
                      className={
                        custom?.textClass ??
                        (isSelected && !custom ? "text-cream" : "text-ink")
                      }
                    >
                      {custom?.label ?? ""}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
