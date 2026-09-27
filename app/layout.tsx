import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CoffeeCup",
    template: "%s · CoffeeCup",
  },
  description:
    "Find a time that works for everyone. Create an event, share the link, and see when people are free—no accounts required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${patrickHand.variable} h-full antialiased`}>
      <body className={`${patrickHand.className} flex min-h-full flex-col text-ink`}>
        {children}
      </body>
    </html>
  );
}
