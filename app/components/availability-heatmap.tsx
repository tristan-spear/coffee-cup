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
    <div className="space-y-4">
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
            textClass:
              intensity >= 0.5 ? "text-cream" : "text-ink",
          };
        }}
      />

      <div className="flex flex-wrap items-center gap-3 text-base text-muted">
        <span>Fewer</span>
        <div className="flex overflow-hidden rounded border border-brown/20">
          {["#F5F0E8", "#E8D5C4", "#C9A98E", "#8A5A3B", "#3D2B1F"].map(
            (color) => (
              <span
                key={color}
                className="h-4 w-6"
                style={{ backgroundColor: color }}
                aria-hidden
              />
            ),
          )}
        </div>
        <span>More</span>
      </div>

      {active ? (
        <div
          className="sketch-panel border-2 border-brown/20 bg-soft p-4"
          role="status"
        >
          <p className="text-lg">
            {active.count} of {total} available
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-base text-muted">Available</p>
              <ul className="mt-1 space-y-1 text-lg">
                {active.availableNames.length === 0 ? (
                  <li className="text-muted">Nobody yet</li>
                ) : (
                  active.availableNames.map((name) => (
                    <li key={`a-${name}`}>{name}</li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="text-base text-muted">Unavailable</p>
              <ul className="mt-1 space-y-1 text-lg">
                {active.unavailableNames.length === 0 ? (
                  <li className="text-muted">Nobody</li>
                ) : (
                  active.unavailableNames.map((name) => (
                    <li key={`u-${name}`}>{name}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-base text-muted">
          Tap or hover a cell to see who is free.
        </p>
      )}
    </div>
  );
}
