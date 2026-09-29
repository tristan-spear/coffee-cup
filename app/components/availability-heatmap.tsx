"use client";

import { useMemo, useState } from "react";
import { AvailabilityGrid } from "@/app/components/availability-grid";
import {
  buildAvailabilityCounts,
  heatmapIntensity,
  heatmapShade,
} from "@/lib/slots";

type HeatmapParticipant = {
  id: string;
  displayName: string;
  slotStarts: string[];
};

type AvailabilityHeatmapProps = {
  dates: string[];
  slotStarts: string[];
  timezone: string;
  participants: HeatmapParticipant[];
};

export function AvailabilityHeatmap({
  dates,
  slotStarts,
  timezone,
  participants,
}: AvailabilityHeatmapProps) {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const counts = useMemo(() => {
    const slotsByParticipant = new Map<string, Set<string>>();
    for (const participant of participants) {
      slotsByParticipant.set(
        participant.id,
        new Set(participant.slotStarts.map((s) => new Date(s).toISOString())),
      );
    }

    return buildAvailabilityCounts({
      slotStarts,
      participants: participants.map((p) => ({
        id: p.id,
        displayName: p.displayName,
      })),
      slotsByParticipant,
    });
  }, [participants, slotStarts]);

  const active = activeSlot ? counts.get(activeSlot) : null;
  const total = participants.length;

  return (
    <div className="space-y-3">
      <p className="text-base text-muted">
        Darker times mean more people are free. Select a cell for names.
      </p>

      <AvailabilityGrid
        dates={dates}
        slotStarts={slotStarts}
        timezone={timezone}
        selected={new Set()}
        onChange={() => {}}
        readOnly
        activeSlot={activeSlot}
        onCellActivate={setActiveSlot}
        renderCell={(slotStart) => {
          const info = counts.get(slotStart);
          const count = info?.count ?? 0;
          const intensity = heatmapIntensity(count, total);
          const shade = heatmapShade(intensity);
          const label = total === 0 ? "" : `${count}/${total}`;
          return {
            background: shade,
            label,
            title:
              total === 0
                ? "No responses yet"
                : `${count} of ${total} available`,
            textClass: intensity >= 0.5 ? "text-cream" : "text-ink",
          };
        }}
      />

      {active ? (
        <div
          className="rounded-md border border-brown/20 bg-soft p-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-lg">
            {active.count} of {total} free
          </p>
          {active.availableNames.length > 0 ? (
            <p className="mt-1 text-base">
              <span className="text-muted">Free: </span>
              {active.availableNames.join(", ")}
            </p>
          ) : null}
          {active.unavailableNames.length > 0 ? (
            <p className="mt-1 text-base">
              <span className="text-muted">Busy: </span>
              {active.unavailableNames.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
