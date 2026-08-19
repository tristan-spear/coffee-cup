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
  title: "CoffeeCup",
  description:
    "CoffeeCup is on the way. Join the waitlist to be the first to know when we launch.",
  icons: {
    icon: "/assets/logo-alt.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${patrickHand.variable} h-full antialiased`}>
      <body className={`${patrickHand.className} flex min-h-full flex-col`}>
        {children}
      </body>
    </html>
  );
}
