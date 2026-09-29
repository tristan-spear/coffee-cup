import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

export default function NotFound() {
  return (
    <div className="bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl leading-snug">Event not found</h1>
        <p className="mt-3 text-lg text-muted">
          This link may be wrong, or the event was removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center rounded-md bg-brown px-5 text-lg text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          Create an event
        </Link>
      </main>
    </div>
  );
}
