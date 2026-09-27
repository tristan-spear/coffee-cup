import Link from "next/link";
import { notFound } from "next/navigation";
import { EventWorkspace } from "@/app/components/event-workspace";
import { SiteHeader } from "@/app/components/site-header";
import { getEventById, isDatabaseConfigured } from "@/lib/events";

type EventPageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({ params }: EventPageProps) {
  const { eventId } = await params;

  if (!isDatabaseConfigured()) {
    return { title: "Event" };
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { title: "Event not found" };
    }
    return {
      title: event.title,
      description: `Share your availability for ${event.title}`,
    };
  } catch {
    return { title: "Event" };
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <div className="bg-cream text-brown">
        <SiteHeader />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="text-4xl tracking-wide">Almost ready</h1>
          <p className="mt-4 text-xl leading-relaxed text-muted">
            This event page needs a database connection. Add{" "}
            <code className="text-ink">DATABASE_URL</code> and run migrations,
            then try again.
          </p>
          <Link
            href="/"
            className="sketch-sm mt-8 inline-flex bg-brown px-5 py-3 text-xl text-cream"
          >
            Back home
          </Link>
        </main>
      </div>
    );
  }

  let event;
  try {
    event = await getEventById(eventId);
  } catch {
    return (
      <div className="bg-cream text-brown">
        <SiteHeader />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="text-4xl tracking-wide">Couldn&apos;t load event</h1>
          <p className="mt-4 text-xl leading-relaxed text-muted">
            Something went wrong talking to the database. Please try again in a
            moment.
          </p>
          <Link
            href="/"
            className="sketch-sm mt-8 inline-flex bg-brown px-5 py-3 text-xl text-cream"
          >
            Back home
          </Link>
        </main>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const shareUrl = siteUrl
    ? `${siteUrl}/event/${event.id}`
    : `/event/${event.id}`;

  return (
    <div className="min-h-full bg-cream text-brown">
      <SiteHeader />
      <EventWorkspace
        initialEvent={event}
        shareUrl={shareUrl}
      />
    </div>
  );
}
