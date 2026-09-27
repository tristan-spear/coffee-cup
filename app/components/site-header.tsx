import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-brown px-5 text-cream sm:h-18 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/assets/logo-trans.png"
          alt=""
          width={32}
          height={48}
          className="h-9 w-auto sm:h-10"
          priority
        />
        <span className="text-3xl leading-none tracking-wide sm:text-[2rem]">
          CoffeeCup
        </span>
      </Link>

      <nav className="flex items-center gap-4 text-lg sm:text-xl">
        <Link href="/#create" className="transition-opacity hover:opacity-80">
          create event
        </Link>
      </nav>
    </header>
  );
}
