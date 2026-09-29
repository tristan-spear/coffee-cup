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

function SimpleMessage({
  title,
  body,
  href = "/",
  linkLabel = "Back home",
}: {
  title: string;
  body: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl leading-snug">{title}</h1>
        <p className="mt-3 text-lg text-muted">{body}</p>
        <Link
          href={href}
          className="mt-6 inline-flex min-h-12 items-center rounded-md bg-brown px-5 text-lg text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
        >
          {linkLabel}
        </Link>
      </main>
    </div>
  );
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <SimpleMessage
        title="Database not set up"
        body={
          <>
            Add <code className="text-ink">DATABASE_URL</code> and run
            migrations, then try again.
          </>
        }
      />
    );
  }

  let event;
  try {
    event = await getEventById(eventId);
  } catch {
    return (
      <SimpleMessage
        title="Couldn’t load this event"
        body="Something went wrong. Please try again in a moment."
      />
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
    <div className="min-h-full bg-cream text-ink">
      <SiteHeader />
      <EventWorkspace initialEvent={event} shareUrl={shareUrl} />
    </div>
  );
}
