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

export function ShareLinkControl({ url }: ShareLinkControlProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare] = useState(supportsNativeShare);
  const timeoutRef = useRef<number | null>(null);

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
        text: "Mark when you're free:",
        url: absolute,
      });
    } catch {
      // cancelled
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-base text-muted">Share with others:</p>
      <button
        type="button"
        onClick={copyLink}
        className="min-h-10 rounded-md bg-brown px-4 text-lg text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      {canNativeShare ? (
        <button
          type="button"
          onClick={nativeShare}
          className="min-h-10 rounded-md border border-brown/30 px-4 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
        >
          Share
        </button>
      ) : null}
    </div>
  );
}
