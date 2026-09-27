import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

export default function NotFound() {
  return (
    <div className="bg-cream text-brown">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
        <Image
          src="/assets/logo-alt-trans.png"
          alt=""
          width={80}
          height={120}
          className="mb-6 h-24 w-auto opacity-90"
        />
        <h1 className="text-4xl tracking-wide">We couldn&apos;t find that event</h1>
        <p className="mt-4 text-xl leading-relaxed text-muted">
          The link may be mistyped, or the event might have been removed. Create
          a new one from the homepage.
        </p>
        <Link
          href="/"
          className="sketch-sm mt-8 inline-flex bg-brown px-5 py-3 text-xl text-cream"
        >
          Create an event
        </Link>
      </main>
    </div>
  );
}
