type ParticipantListProps = {
  participants: { id: string; displayName: string }[];
  activeParticipantId?: string | null;
};

export function ParticipantList({
  participants,
  activeParticipantId,
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="sketch-panel border-2 border-brown/20 bg-soft p-4">
        <h2 className="text-xl tracking-wide">Participants</h2>
        <p className="mt-2 text-lg text-muted">
          No one has responded yet. Share the link to get started.
        </p>
      </div>
    );
  }

  const nameCounts = new Map<string, number>();
  for (const p of participants) {
    const key = p.displayName.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  const seen = new Map<string, number>();

  return (
    <div className="sketch-panel border-2 border-brown/20 bg-soft p-4">
      <h2 className="text-xl tracking-wide">
        Participants ({participants.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {participants.map((participant) => {
          const key = participant.displayName.toLowerCase();
          const total = nameCounts.get(key) ?? 1;
          const index = (seen.get(key) ?? 0) + 1;
          seen.set(key, index);
          const label =
            total > 1
              ? `${participant.displayName} (${index})`
              : participant.displayName;

          return (
            <li
              key={participant.id}
              className={`flex items-center gap-2 text-lg ${
                participant.id === activeParticipantId ? "font-normal" : ""
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full bg-brown"
                aria-hidden
              />
              <span>
                {label}
                {participant.id === activeParticipantId ? (
                  <span className="text-muted"> · you</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
