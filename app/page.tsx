import Image from "next/image";
import { WaitlistForm } from "@/app/components/waitlist-form";

function Heart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20s-7.2-4.35-7.2-10.1A4.15 4.15 0 0 1 12 7.4a4.15 4.15 0 0 1 7.2 2.5C19.2 15.65 12 20 12 20Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-cream text-brown">
      <header className="flex items-center gap-2 bg-brown px-5 py-3 text-cream">
        <Image
          src="/assets/logo-trans.png"
          alt=""
          width={27}
          height={40}
          className="h-9 w-auto"
          priority
        />
        <span className="text-2xl leading-none tracking-wide">CoffeeCup</span>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <Image
          src="/assets/logo-alt-trans.png"
          alt="CoffeeCup"
          width={140}
          height={210}
          className="mb-6 h-44 w-auto"
          priority
        />

        <h1 className="text-4xl tracking-wide uppercase sm:text-5xl">
          Meetings Made Easy
        </h1>

        <Heart className="mt-4 h-7 w-7" />

        <p className="mt-4 max-w-md text-xl leading-relaxed">
          CoffeeCup is on the way.
          <br />
          Join the waitlist to be the first to know when we launch.
        </p>

        <div className="mt-8 flex w-full justify-center">
          <WaitlistForm />
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-lg">
          <Heart className="h-5 w-5" />
          <span>
            we&apos;ll never spam you.{" "}
            <span className="underline">promise.</span>
          </span>
        </p>
      </main>
    </div>
  );
}
