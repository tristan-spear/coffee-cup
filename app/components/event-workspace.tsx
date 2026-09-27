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

function readInitialParticipant(
  eventId: string,
  participants: PublicEvent["participants"],
): {
  stored: StoredParticipant | null;
  displayName: string;
  selected: Set<string>;
  phase: EditorPhase;
} {
  const existing = getStoredParticipant(eventId);
  if (!existing) {
    return {
      stored: null,
      displayName: "",
      selected: new Set(),
      phase: "name",
    };
  }

  const mine = participants.find((p) => p.id === existing.participantId);
  return {
    stored: existing,
    displayName: existing.displayName,
    selected: new Set(
      (mine?.slotStarts ?? []).map((s) => new Date(s).toISOString()),
    ),
    phase: mine ? "saved" : "name",
  };
}

export function EventWorkspace({ initialEvent, shareUrl }: EventWorkspaceProps) {
  const [event, setEvent] = useState(initialEvent);
  const [viewMode, setViewMode] = useState<ViewMode>("group");
  const [hydrated, setHydrated] = useState(false);
  const [stored, setStored] = useState<StoredParticipant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<EditorPhase>("name");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // localStorage is only available in the browser; hydrate after mount.
  useEffect(() => {
    const initial = readInitialParticipant(
      initialEvent.id,
      initialEvent.participants,
    );
    queueMicrotask(() => {
      setStored(initial.stored);
      setDisplayName(initial.displayName);
      setSelected(initial.selected);
      setPhase(initial.phase);
      setHydrated(true);
      if (initial.phase === "saved") {
        setViewMode("group");
      }
    });
  }, [initialEvent.id, initialEvent.participants]);

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

  function selectAll() {
    setSelected(new Set(slotStarts));
  }

  function clearSelection() {
    setSelected(new Set());
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
          "Saved, but we couldn't store your edit key in this browser. You may need to respond again later from another device.",
        );
      } else {
        setStoredParticipant(event.id, nextStored);
        setStored(nextStored);
      }

      setEvent(result.data.event);
      setPhase("saved");
      setViewMode("group");
      setMessage("Availability saved. Thanks!");
    });
  }

  const dateSummary = event.dates.map((d) => formatDateLabel(d)).join(" · ");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3 text-center sm:text-left">
        <h1 className="text-4xl tracking-wide uppercase sm:text-5xl">
          {event.title}
        </h1>
        <p className="text-xl text-ink">{dateSummary}</p>
        <p className="text-lg text-muted">
          {`Times shown in ${event.timezone} · ${event.intervalMinutes}-minute slots · ${event.startTime}–${event.endTime}`}
        </p>
      </header>

      <ShareLinkControl url={shareUrl} />

      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewMode("mine")}
              className={`sketch-sm px-4 py-2 text-lg ${
                viewMode === "mine"
                  ? "bg-brown text-cream"
                  : "border-2 border-brown/25 bg-cream hover:bg-beige"
              }`}
            >
              My availability
            </button>
            <button
              type="button"
              onClick={() => setViewMode("group")}
              className={`sketch-sm px-4 py-2 text-lg ${
                viewMode === "group"
                  ? "bg-brown text-cream"
                  : "border-2 border-brown/25 bg-cream hover:bg-beige"
              }`}
            >
              Group results
            </button>
          </div>

          {viewMode === "mine" ? (
            <div className="space-y-4">
              {!hydrated ? (
                <p className="text-lg text-muted">Loading your saved response…</p>
              ) : phase === "name" ? (
                <div className="sketch-panel border-2 border-brown/20 bg-soft p-5">
                  <ParticipantNameForm
                    initialName={displayName}
                    onSubmit={startEditing}
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xl">
                      Editing as{" "}
                      <span className="underline decoration-brown/30">
                        {displayName}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="sketch-sm border-2 border-brown/25 bg-cream px-3 py-1.5 text-lg hover:bg-beige"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="sketch-sm border-2 border-brown/25 bg-cream px-3 py-1.5 text-lg hover:bg-beige"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="sketch-sm bg-brown px-4 py-1.5 text-lg text-cream disabled:opacity-60"
                      >
                        {isPending ? "Saving…" : "Save availability"}
                      </button>
                    </div>
                  </div>

                  {selected.size === 0 ? (
                    <p className="text-base text-muted">
                      Drag across the grid to mark when you&apos;re free. You can
                      save an empty selection to clear your times.
                    </p>
                  ) : (
                    <p className="text-base text-muted">
                      {`${selected.size} slot${selected.size === 1 ? "" : "s"} selected`}
                    </p>
                  )}

                  <AvailabilityGrid
                    dates={event.dates}
                    slotStarts={slotStarts}
                    timezone={event.timezone}
                    selected={selected}
                    onChange={setSelected}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {phase === "saved" || stored ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startEditing(displayName || stored?.displayName || "")
                    }
                    className="sketch-sm border-2 border-brown/25 bg-cream px-4 py-2 text-lg hover:bg-beige"
                  >
                    Edit availability
                  </button>
                </div>
              ) : (
                <div className="sketch-panel border-2 border-brown/20 bg-soft p-5">
                  <p className="mb-4 text-lg text-muted">
                    Add your times so the group heatmap can update.
                  </p>
                  <ParticipantNameForm onSubmit={startEditing} />
                </div>
              )}

              {event.participants.length === 0 ? (
                <div className="sketch-panel border-2 border-brown/20 bg-soft p-6 text-center">
                  <p className="text-xl">No availability yet</p>
                  <p className="mt-2 text-lg text-muted">
                    Once people respond, you&apos;ll see overlapping times here.
                  </p>
                </div>
              ) : (
                <AvailabilityHeatmap
                  dates={event.dates}
                  slotStarts={slotStarts}
                  timezone={event.timezone}
                  participants={event.participants}
                />
              )}
            </div>
          )}

          {message ? (
            <p
              role="status"
              className="sketch-sm border border-brown/30 bg-beige px-4 py-3 text-lg"
            >
              {message}
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="sketch-sm border border-brown/40 bg-beige px-4 py-3 text-lg"
            >
              {error}
            </p>
          ) : null}
        </div>

        <aside>
          <ParticipantList
            participants={event.participants}
            activeParticipantId={stored?.participantId}
          />
        </aside>
      </div>
    </div>
  );
}
