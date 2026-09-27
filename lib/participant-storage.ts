const STORAGE_PREFIX = "coffeecup:participant:";

export type StoredParticipant = {
  participantId: string;
  editToken: string;
  displayName: string;
};

export function getStoredParticipant(eventId: string): StoredParticipant | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${eventId}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredParticipant;
    if (
      !parsed.participantId ||
      !parsed.editToken ||
      !parsed.displayName
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setStoredParticipant(
  eventId: string,
  value: StoredParticipant,
): void {
  window.localStorage.setItem(
    `${STORAGE_PREFIX}${eventId}`,
    JSON.stringify(value),
  );
}

export function clearStoredParticipant(eventId: string): void {
  window.localStorage.removeItem(`${STORAGE_PREFIX}${eventId}`);
}
