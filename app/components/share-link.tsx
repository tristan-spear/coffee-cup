"use client";

import { useRef, useState } from "react";

type ShareLinkControlProps = {
  url: string;
};

function supportsNativeShare(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

function resolveShareUrl(shareUrl: string): string {
  if (shareUrl.startsWith("http") || typeof window === "undefined") {
    return shareUrl;
  }
  return `${window.location.origin}${shareUrl.startsWith("/") ? "" : "/"}${shareUrl}`;
}

// Keep the prop stable across SSR/client hydration; resolve to absolute only when sharing.
export function ShareLinkControl({ url }: ShareLinkControlProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare] = useState(supportsNativeShare);
  const timeoutRef = useRef<number | null>(null);
  const displayUrl = url;

  async function copyLink() {
    const absolute = resolveShareUrl(url);
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", absolute);
    }
  }

  async function nativeShare() {
    const absolute = resolveShareUrl(url);
    try {
      await navigator.share({
        title: "CoffeeCup event",
        text: "Share when you're free:",
        url: absolute,
      });
    } catch {
      // user cancelled — ignore
    }
  }

  return (
    <div className="sketch-panel border-2 border-brown/20 bg-soft p-4 sm:p-5">
      <p className="text-lg leading-relaxed text-ink">
        Send this link to everyone who should respond.
      </p>
      <p className="mt-2 truncate text-base text-muted" title={displayUrl}>
        {displayUrl}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="sketch-sm bg-brown px-4 py-2 text-lg text-cream hover:opacity-95"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        {canNativeShare ? (
          <button
            type="button"
            onClick={nativeShare}
            className="sketch-sm border-2 border-brown/30 bg-cream px-4 py-2 text-lg hover:bg-beige"
          >
            Share
          </button>
        ) : null}
      </div>
    </div>
  );
}
