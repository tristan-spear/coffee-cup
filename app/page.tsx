import Image from "next/image";
import { EventCreateForm } from "@/app/components/event-create-form";
import { Heart } from "@/app/components/icons";
import { SiteHeader } from "@/app/components/site-header";

export default function Home() {
  return (
    <div className="bg-cream text-brown">
      <SiteHeader />

      <main id="top">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-10 pt-12 text-center sm:pb-12 sm:pt-16">
          <Image
            src="/assets/logo-alt-trans.png"
            alt="CoffeeCup"
            width={140}
            height={210}
            className="animate-float mb-6 h-36 w-auto sm:h-40"
            priority
          />

          <h1 className="animate-rise text-4xl tracking-wide sm:text-5xl">
            Find a time that works for everyone.
          </h1>

          <Heart className="animate-rise-delay-1 mt-4 h-7 w-7" />

          <p className="animate-rise-delay-1 mt-4 max-w-lg text-xl leading-relaxed">
            Create an event, share the link, and see when everyone is free. No
            accounts required.
          </p>
        </section>

        <section id="create" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 h-px w-16 bg-brown" />
            <h2 className="text-3xl tracking-wide uppercase">Create an event</h2>
          </div>
          <EventCreateForm />
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="mb-10 flex flex-col items-center">
            <div className="mb-3 h-px w-16 bg-brown" />
            <h2 className="text-center text-3xl tracking-wide uppercase">
              How it works
            </h2>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            <li className="text-center">
              <p className="text-2xl">1</p>
              <p className="mt-2 text-lg leading-relaxed">
                Create an event with the dates and times that might work.
              </p>
            </li>
            <li className="text-center">
              <p className="text-2xl">2</p>
              <p className="mt-2 text-lg leading-relaxed">
                Share the link. Everyone marks when they&apos;re free—no signup.
              </p>
            </li>
            <li className="text-center">
              <p className="text-2xl">3</p>
              <p className="mt-2 text-lg leading-relaxed">
                See the heatmap of overlapping availability and pick a time.
              </p>
            </li>
          </ol>
        </section>
      </main>

      <footer className="bg-brown px-6 py-12 text-cream sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo-trans.png"
              alt=""
              width={27}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-2xl tracking-wide">CoffeeCup</span>
          </div>
          <p className="flex items-center gap-2 text-lg text-cream/80">
            <Heart className="h-4 w-4" />
            <span>Find time together.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
