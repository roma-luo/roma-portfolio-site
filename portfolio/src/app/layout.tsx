import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "rluo.",
  description: "roma-luo - architecture & computational design",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload video files for faster initial playback */}
        <link rel="preload" href="/images/projects/p1-1.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/images/projects/p3-1.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/images/projects/p3-4.mp4" as="video" type="video/mp4" />
      </head>
      <body className="antialiased h-screen w-screen">
        {children}
        <Analytics />

      </body>
    </html>
  );
}