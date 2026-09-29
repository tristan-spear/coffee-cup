"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { saveAvailability } from "@/app/actions/events";
import { AvailabilityGrid } from "@/app/components/availability-grid";
import { AvailabilityHeatmap } from "@/app/components/availability-heatmap";
import { ParticipantList } from "@/app/components/participant-list";
import { ParticipantNameForm } from "@/app/components/participant-name-form";
import { ShareLinkControl } from "@/app/components/share-link";
import type { PublicEvent } from "@/lib/definitions";
import {
  getStoredParticipant,
  setStoredParticipant,
  type StoredParticipant,
} from "@/lib/participant-storage";
import { formatDateLabel, generateSlotStarts } from "@/lib/slots";

type EventWorkspaceProps = {
  initialEvent: PublicEvent;
  shareUrl: string;
};

type ViewMode = "mine" | "group";
type EditorPhase = "name" | "editing" | "saved";

export function EventWorkspace({ initialEvent, shareUrl }: EventWorkspaceProps) {
  const [event, setEvent] = useState(initialEvent);
  const [viewMode, setViewMode] = useState<ViewMode>("mine");
  const [stored, setStored] = useState<StoredParticipant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<EditorPhase>("name");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const existing = getStoredParticipant(initialEvent.id);
    if (!existing) {
      return;
    }

    const mine = initialEvent.participants.find(
      (p) => p.id === existing.participantId,
    );

    startTransition(() => {
      setStored(existing);
      setDisplayName(existing.displayName);
      if (mine) {
        setSelected(
          new Set(mine.slotStarts.map((s) => new Date(s).toISOString())),
        );
        setPhase("saved");
        setViewMode("group");
      }
    });
  }, [initialEvent.id, initialEvent.participants, startTransition]);

  const slotStarts = useMemo(
    () =>
      generateSlotStarts({
        dates: event.dates,
        startTime: event.startTime,
        endTime: event.endTime,
        intervalMinutes: event.intervalMinutes,
        timezone: event.timezone,
      }),
    [event],
  );

  function startEditing(name: string) {
    setDisplayName(name);
    setPhase("editing");
    setViewMode("mine");
    setError(null);
    setMessage(null);

    if (stored) {
      const mine = event.participants.find((p) => p.id === stored.participantId);
      if (mine) {
        setSelected(
          new Set(mine.slotStarts.map((s) => new Date(s).toISOString())),
        );
      }
    }
  }

  function handleSave() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await saveAvailability({
        eventId: event.id,
        displayName,
        slotStarts: [...selected],
        participantId: stored?.participantId,
        editToken: stored?.editToken,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      const nextStored: StoredParticipant = {
        participantId: result.data.participantId,
        editToken: result.data.editToken ?? stored?.editToken ?? "",
        displayName,
      };

      if (!nextStored.editToken) {
        setError(
          "Saved, but this browser could not keep your edit key. You may need to respond again later from another device.",
        );
      } else {
        setStoredParticipant(event.id, nextStored);
        setStored(nextStored);
      }

      setEvent(result.data.event);
      setPhase("saved");
      setViewMode("group");
      setMessage("Saved. Here’s when the group is free.");
    });
  }

  const dateSummary = event.dates.map((d) => formatDateLabel(d)).join(", ");
  const hasResponded =
    phase === "saved" ||
    Boolean(
      stored &&
        event.participants.some((p) => p.id === stored.participantId),
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl leading-snug sm:text-4xl">{event.title}</h1>
        <p className="text-lg text-muted">
          {dateSummary}
          <span aria-hidden> · </span>
          {event.timezone}
        </p>
      </header>

      <ShareLinkControl url={shareUrl} />

      <div
        role="tablist"
        aria-label="Availability views"
        className="flex gap-1 rounded-md border border-brown/20 bg-soft p-1"
      >
        <button
          type="button"
          role="tab"
          id="tab-mine"
          aria-selected={viewMode === "mine"}
          aria-controls="panel-mine"
          onClick={() => setViewMode("mine")}
          className={`min-h-11 flex-1 rounded-md px-3 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${
            viewMode === "mine" ? "bg-brown text-cream" : "hover:bg-beige"
          }`}
        >
          Your times
        </button>
        <button
          type="button"
          role="tab"
          id="tab-group"
          aria-selected={viewMode === "group"}
          aria-controls="panel-group"
          onClick={() => setViewMode("group")}
          className={`min-h-11 flex-1 rounded-md px-3 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${
            viewMode === "group" ? "bg-brown text-cream" : "hover:bg-beige"
          }`}
        >
          Group results
        </button>
      </div>

      {message ? (
        <p role="status" aria-live="polite" className="text-lg text-ink">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-lg text-brown">
          {error}
        </p>
      ) : null}

      {viewMode === "mine" ? (
        <section
          id="panel-mine"
          role="tabpanel"
          aria-labelledby="tab-mine"
          className="space-y-4"
        >
          {phase === "name" ? (
            <div className="space-y-2">
              <p className="text-lg text-muted">
                Enter your name, then mark when you&apos;re free.
              </p>
              <ParticipantNameForm
                initialName={displayName}
                onSubmit={startEditing}
                submitLabel="Continue"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg">
                  Marking times for <strong>{displayName}</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(new Set(slotStarts))}
                    className="min-h-10 rounded-md border border-brown/25 px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="min-h-10 rounded-md border border-brown/25 px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <p className="text-base text-muted">
                Drag across time slots to select or deselect. Then save.
              </p>

              <AvailabilityGrid
                dates={event.dates}
                slotStarts={slotStarts}
                timezone={event.timezone}
                selected={selected}
                onChange={setSelected}
              />

              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="min-h-12 w-full rounded-md bg-brown px-5 text-xl text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown disabled:opacity-60 sm:w-auto"
              >
                {isPending ? "Saving…" : "Save my times"}
              </button>
            </>
          )}
        </section>
      ) : (
        <section
          id="panel-group"
          role="tabpanel"
          aria-labelledby="tab-group"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ParticipantList
              participants={event.participants}
              activeParticipantId={stored?.participantId}
            />
            {hasResponded ? (
              <button
                type="button"
                onClick={() =>
                  startEditing(displayName || stored?.displayName || "")
                }
                className="min-h-10 rounded-md border border-brown/25 px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
              >
                Edit my times
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode("mine")}
                className="min-h-10 rounded-md bg-brown px-3 text-base text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
              >
                Add your times
              </button>
            )}
          </div>

          {event.participants.length === 0 ? (
            <p className="rounded-md border border-brown/20 bg-soft p-4 text-lg text-muted">
              No one has responded yet. Add your times, then share the link.
            </p>
          ) : (
            <AvailabilityHeatmap
              dates={event.dates}
              slotStarts={slotStarts}
              timezone={event.timezone}
              participants={event.participants}
            />
          )}
        </section>
      )}
    </div>
  );
}
