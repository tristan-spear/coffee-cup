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
      <p className="text-base text-muted">No responses yet.</p>
    );
  }

  const nameCounts = new Map<string, number>();
  for (const p of participants) {
    const key = p.displayName.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  const seen = new Map<string, number>();
  const labels = participants.map((participant) => {
    const key = participant.displayName.toLowerCase();
    const total = nameCounts.get(key) ?? 1;
    const index = (seen.get(key) ?? 0) + 1;
    seen.set(key, index);
    const base =
      total > 1
        ? `${participant.displayName} (${index})`
        : participant.displayName;
    const isYou = participant.id === activeParticipantId;
    return isYou ? `${base} (you)` : base;
  });

  return (
    <p className="text-base text-muted">
      <span className="text-ink">Responded:</span> {labels.join(", ")}
    </p>
  );
}
