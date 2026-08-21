import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarIcon,
  CheckCircleIcon,
  GoogleGIcon,
  Heart,
  LinkIcon,
  LockIcon,
  PersonIcon,
  ShieldLockIcon,
} from "@/app/components/icons";

function CtaButtons({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 ${className ?? ""}`}
    >
      <a
        href="#get-started"
        className="sketch-sm inline-flex h-12 min-w-[11rem] items-center justify-center bg-brown px-6 text-xl text-cream transition-transform duration-200 hover:-translate-y-0.5"
      >
        create your page
      </a>
      <a
        href="#book"
        className="sketch-sm inline-flex h-12 min-w-[11rem] items-center justify-center border-2 border-brown bg-cream px-6 text-xl text-brown transition-transform duration-200 hover:-translate-y-0.5"
      >
        book a meeting
      </a>
    </div>
  );
}

function BrowserChrome({ children }: { children: ReactNode }) {
  return (
    <div className="sketch-panel overflow-hidden border-2 border-brown bg-cream shadow-[3px_3px_0_rgba(61,43,31,0.08)]">
      <div className="flex items-center gap-1.5 border-b-2 border-brown px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full border border-brown" />
        <span className="h-2.5 w-2.5 rounded-full border border-brown" />
        <span className="h-2.5 w-2.5 rounded-full border border-brown" />
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function ProfileMockup() {
  const slots = [
    { day: "Mon", time: "9:00am – 12:00pm" },
    { day: "Tue", time: "1:00pm – 4:00pm" },
    { day: "Wed", time: "9:00am – 12:00pm" },
    { day: "Thu", time: "2:00pm – 5:00pm" },
    { day: "Fri", time: "10:00am – 1:00pm" },
  ];

  return (
    <BrowserChrome>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brown">
            <PersonIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xl leading-tight">Alex Kim</p>
            <p className="text-base opacity-80">Product Designer</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-[14rem]">
          <p className="mb-2 text-lg">Meeting availability</p>
          <ul className="space-y-1.5 text-base">
            {slots.map((slot) => (
              <li key={slot.day} className="flex justify-between gap-3">
                <span>{slot.day}</span>
                <span className="opacity-85">{slot.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-brown/30 pt-3 text-base">
        <LockIcon className="h-3.5 w-3.5" />
        <span>coffeecup.com/alex</span>
      </div>
      <p className="mt-1 text-sm opacity-70">Times shown in PT</p>
    </BrowserChrome>
  );
}

function BookingMockup() {
  const options = [
    { label: "Mon, May 20 · 10:00am", checked: true },
    { label: "Tue, May 21 · 2:30pm", checked: true },
    { label: "Wed, May 22 · 11:00am", checked: false },
    { label: "Thu, May 23 · 4:00pm", checked: false },
  ];

  return (
    <div>
      <BrowserChrome>
        <p className="text-lg leading-snug">
          Book a meeting with Alex.
          <br />
          Select a time that works for you.
        </p>

        <div className="relative mt-4">
          <p className="mb-2 text-base opacity-80">What works best? (pick up to 3)</p>
          <ul className="space-y-2">
            {options.map((option) => (
              <li key={option.label} className="flex items-center gap-3 text-base">
                <span
                  className={`flex h-5 w-5 items-center justify-center border-2 border-brown ${
                    option.checked ? "bg-brown text-cream" : "bg-cream"
                  }`}
                  aria-hidden
                >
                  {option.checked ? "✓" : ""}
                </span>
                <span>{option.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="sketch-sm mt-5 inline-flex h-10 items-center justify-center bg-brown px-5 text-lg text-cream"
        >
          request meeting
        </button>
      </BrowserChrome>
      <p className="mt-3 text-center text-base opacity-80">
        They&apos;ll receive a calendar invite once you confirm.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-cream text-brown">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 bg-brown px-4 text-cream sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <Image
            src="/assets/logo-trans.png"
            alt=""
            width={27}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <span className="text-2xl leading-none tracking-wide">CoffeeCup</span>
        </a>

        <nav className="hidden items-center gap-5 text-lg md:flex">
          <a href="#how-it-works" className="transition-opacity hover:opacity-80">
            how it works
          </a>
          <a href="#features" className="transition-opacity hover:opacity-80">
            features
          </a>
          <a href="#pricing" className="transition-opacity hover:opacity-80">
            pricing
          </a>
          <a
            href="#login"
            className="sketch-sm border border-cream px-3 py-1 transition-opacity hover:opacity-80"
          >
            login
          </a>
        </nav>

        <a
          href="#login"
          className="sketch-sm border border-cream px-3 py-1 text-lg md:hidden"
        >
          login
        </a>
      </header>

      <main id="top">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-12 text-center sm:pb-20 sm:pt-16">
          <Image
            src="/assets/logo-alt-trans.png"
            alt="CoffeeCup"
            width={140}
            height={210}
            className="animate-float mb-6 h-40 w-auto sm:h-44"
            priority
          />

          <h1 className="animate-rise text-4xl tracking-wide uppercase sm:text-5xl">
            Meetings Made Easy
          </h1>

          <Heart className="animate-rise-delay-1 mt-4 h-7 w-7" />

          <p className="animate-rise-delay-1 mt-4 max-w-md text-xl leading-relaxed">
            Share your availability. Let others book time that works for you. No
            back and forth.
          </p>

          <CtaButtons className="animate-rise-delay-2 mt-8" />

          <p className="animate-rise-delay-3 mt-8 flex items-center justify-center gap-2 text-lg">
            <Heart className="h-5 w-5" />
            <span>simple. personal. productive.</span>
          </p>
        </section>

        <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mx-auto mb-12 flex max-w-xs flex-col items-center">
            <div className="mb-3 h-px w-16 bg-brown" />
            <h2 className="text-center text-3xl tracking-wide uppercase sm:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div className="flex max-w-[14rem] flex-col items-center text-center">
              <PersonIcon className="mb-4 h-16 w-16" />
              <p className="text-lg leading-relaxed">
                <span className="font-normal">1. create your page.</span>
                <br />
                Add your availability and share your link.
              </p>
            </div>

            <ArrowRight className="hidden h-8 w-12 shrink-0 self-center opacity-70 lg:block" />

            <div className="flex max-w-[14rem] flex-col items-center text-center">
              <CalendarIcon className="mb-4 h-16 w-16" />
              <p className="text-lg leading-relaxed">
                <span className="font-normal">2. someone books.</span>
                <br />
                They pick a time that works best for them.
              </p>
            </div>

            <ArrowRight className="hidden h-8 w-12 shrink-0 self-center opacity-70 lg:block" />

            <div className="flex max-w-[14rem] flex-col items-center text-center">
              <CheckCircleIcon className="mb-4 h-16 w-16" />
              <p className="text-lg leading-relaxed">
                <span className="font-normal">3. meeting scheduled.</span>
                <br />
                Everyone gets a calendar invite. You&apos;re all set.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="sketch-panel grid items-center gap-8 bg-beige px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-2 lg:gap-12">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl tracking-wide uppercase sm:text-4xl">
                  Your Own Page
                </h2>
                <p className="mt-4 text-xl leading-relaxed">
                  A personal page with your availability and info. Share one
                  link. That&apos;s it.
                </p>
                <Heart className="mx-auto mt-5 h-6 w-6 lg:mx-0" />
              </div>
              <ProfileMockup />
            </div>

            <div className="sketch-panel grid items-center gap-8 bg-beige px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-2 lg:gap-12">
              <div className="order-2 lg:order-1">
                <BookingMockup />
              </div>
              <div className="order-1 text-center lg:order-2 lg:text-left">
                <h2 className="text-3xl tracking-wide uppercase sm:text-4xl">
                  Easy Booking
                </h2>
                <p className="mt-4 text-xl leading-relaxed">
                  Visitors choose up to 3 times that work for them. You pick the
                  best fit. Everyone gets a calendar invite.
                </p>
                <Heart className="mx-auto mt-5 h-6 w-6 lg:mx-0" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mx-auto mb-12 flex max-w-md flex-col items-center">
            <div className="mb-3 h-px w-16 bg-brown" />
            <h2 className="text-center text-3xl tracking-wide uppercase sm:text-4xl">
              Built for Real People
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div className="flex flex-col items-center text-center">
              <LinkIcon className="mb-4 h-14 w-14" />
              <p className="text-lg leading-relaxed">
                <span className="block">one simple link.</span>
                Share your page anywhere. Keep it simple.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CalendarIcon className="mb-4 h-14 w-14" />
              <p className="text-lg leading-relaxed">
                <span className="block">smart availability.</span>
                Show when you&apos;re free. Let others book the right time.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <GoogleGIcon className="mb-4 h-14 w-14" />
              <p className="text-lg leading-relaxed">
                <span className="block">google calendar.</span>
                Syncs with Google Calendar so you&apos;re always up to date.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldLockIcon className="mb-4 h-14 w-14" />
              <p className="text-lg leading-relaxed">
                <span className="block">optional google login.</span>
                Sign in with Google (or skip it). Your choice.
              </p>
            </div>
          </div>
        </section>

        <section
          id="get-started"
          className="mx-auto max-w-3xl border-t border-brown/40 px-6 py-16 text-center sm:py-20"
        >
          <Image
            src="/assets/logo-alt-trans.png"
            alt=""
            width={48}
            height={72}
            className="mx-auto mb-5 h-12 w-auto"
          />
          <h2 className="text-3xl tracking-wide uppercase sm:text-4xl">
            Ready When You Are
          </h2>
          <p className="mt-3 text-xl">Create your page and start sharing.</p>
          <CtaButtons className="mt-8" />
          <p className="mt-10 flex items-center justify-center gap-2 text-lg">
            <Heart className="h-5 w-5" />
            <span>thanks for being here.</span>
          </p>
        </section>
      </main>

      <footer className="bg-brown px-6 py-16 text-cream sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#top" className="inline-flex items-center gap-2">
              <Image
                src="/assets/logo-trans.png"
                alt=""
                width={27}
                height={40}
                className="h-9 w-auto"
              />
              <span className="text-3xl leading-none tracking-wide">
                CoffeeCup
              </span>
            </a>
            <p className="mt-4 max-w-xs text-xl leading-relaxed text-cream/85">
              Meetings made easy. Share your availability and skip the back and
              forth.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xl tracking-wide uppercase">Explore</p>
            <ul className="space-y-3 text-lg text-cream/90">
              <li>
                <a href="#how-it-works" className="transition-opacity hover:opacity-80">
                  how it works
                </a>
              </li>
              <li>
                <a href="#features" className="transition-opacity hover:opacity-80">
                  features
                </a>
              </li>
              <li>
                <a href="#pricing" className="transition-opacity hover:opacity-80">
                  pricing
                </a>
              </li>
              <li>
                <a href="#get-started" className="transition-opacity hover:opacity-80">
                  get started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xl tracking-wide uppercase">Account</p>
            <ul className="space-y-3 text-lg text-cream/90">
              <li>
                <a href="#login" className="transition-opacity hover:opacity-80">
                  login
                </a>
              </li>
              <li>
                <a href="#get-started" className="transition-opacity hover:opacity-80">
                  create your page
                </a>
              </li>
              <li>
                <a href="#book" className="transition-opacity hover:opacity-80">
                  book a meeting
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xl tracking-wide uppercase">Say hello</p>
            <p className="text-lg leading-relaxed text-cream/90">
              Have suggestions?
              <br />
              <a
                href="mailto:support@coffeecup.world"
                className="underline decoration-cream/50 underline-offset-2 transition-opacity hover:opacity-80"
              >
                We&apos;d love to hear them.
              </a>
            </p>
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-cream/25 pt-8 text-center text-lg text-cream/75 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} CoffeeCup. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>simple. personal. productive.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
