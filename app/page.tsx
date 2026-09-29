import Image from "next/image";
import { EventCreateForm } from "@/app/components/event-create-form";
import { SiteHeader } from "@/app/components/site-header";

export default function Home() {
  return (
    <div className="bg-cream text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center">
          <Image
            src="/assets/logo-alt-trans.png"
            alt=""
            width={96}
            height={144}
            className="mx-auto mb-5 h-24 w-auto"
            priority
          />
          <h1 className="text-3xl leading-snug sm:text-4xl">
            Find a time that works for everyone
          </h1>
          <p className="mt-3 text-lg text-muted">
            Create an event, share the link, and see when people are free.
          </p>
        </div>

        <EventCreateForm />

        <p className="mt-8 text-center text-base text-muted">
          No accounts needed. Everyone opens the same link and marks their
          free times.
        </p>
      </main>
    </div>
  );
}
