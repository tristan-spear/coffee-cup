import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-brown/15 bg-brown px-4 py-3 text-cream sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <Image
          src="/assets/logo-trans.png"
          alt=""
          width={28}
          height={42}
          className="h-8 w-auto"
          priority
        />
        <span className="text-2xl leading-none tracking-wide">CoffeeCup</span>
      </Link>
    </header>
  );
}
