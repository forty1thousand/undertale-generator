import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const comicSans = localFont({
  src: "../public/sans-webfont.otf",
  variable: "--font-comic",
});
const dtmMono = localFont({
  src: "../public/dtm-mono.otf",
  variable: "--font-mono-pixel",
});

const papyrus = localFont({
  src: "../public/papyrus-webfont.otf",
  variable: "--font-papyrus",
});

export const metadata: Metadata = {
  title: "Undertale Dialog",
  description:
    "Create custom Undertale-style dialog boxes and export them as animated GIFs.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "https://forty1thousand.github.io/undertale-generator/favicondark.ico",
        href: "https://forty1thousand.github.io/undertale-generator/favicondark.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "https://forty1thousand.github.io/undertale-generator/favicon.ico",
        href: "https://forty1thousand.github.io/undertale-generator/favicon.ico",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dtmMono.className} ${dtmMono.variable} ${comicSans.variable} ${papyrus.variable}`}
    >
      <body
        suppressHydrationWarning
        className="dark:bg-black bg-white dark:text-white min-h-screen relative overflow-x-hidden"
      >
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,#1a103d_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#2d1020_0%,transparent_40%),#0a0a0f] z-[-1]" />
        {children}
      </body>
    </html>
  );
}
