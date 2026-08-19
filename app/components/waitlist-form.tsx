"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";

const initialState: WaitlistState = {
  status: "idle",
  message: "",
};

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p className="max-w-md text-xl leading-relaxed" aria-live="polite">
        {state.message}
      </p>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <form
        action={formAction}
        className="flex w-full flex-col items-stretch gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="your email address"
          className="h-12 w-full flex-1 border-2 border-brown bg-cream px-4 text-xl text-brown placeholder:text-brown/70 focus:outline-none focus:ring-2 focus:ring-brown/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 shrink-0 bg-brown px-6 text-xl text-cream transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {pending ? "joining..." : "join waitlist"}
        </button>
      </form>
      {state.status === "error" ? (
        <p className="mt-3 text-lg" aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
