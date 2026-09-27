"use client";

import { useState } from "react";

type ParticipantNameFormProps = {
  initialName?: string;
  onSubmit: (name: string) => void;
  submitLabel?: string;
  disabled?: boolean;
};

export function ParticipantNameForm({
  initialName = "",
  onSubmit,
  submitLabel = "Add my availability",
  disabled = false,
}: ParticipantNameFormProps) {
  const [name, setName] = useState(initialName);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }
        onSubmit(trimmed);
      }}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor="display-name" className="mb-2 block text-xl">
          Your name
        </label>
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="First name or nickname"
          className="sketch-sm w-full border-2 border-brown/25 bg-cream px-4 py-3 text-xl outline-none focus:border-brown"
          disabled={disabled}
          required
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !name.trim()}
        className="sketch-sm h-12 bg-brown px-5 text-xl text-cream disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}
