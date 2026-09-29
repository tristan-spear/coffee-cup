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
  submitLabel = "Continue",
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
        <label htmlFor="display-name" className="mb-1.5 block text-lg">
          Your name
        </label>
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="First name"
          className="w-full rounded-md border border-brown/30 bg-soft px-3 py-2.5 text-lg outline-none focus-visible:border-brown focus-visible:ring-2 focus-visible:ring-brown/30"
          disabled={disabled}
          required
          autoComplete="nickname"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !name.trim()}
        className="min-h-12 rounded-md bg-brown px-5 text-lg text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}
