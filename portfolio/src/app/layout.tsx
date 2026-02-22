import type { Metadata } from "next";
import "./globals.css";
// 1. 在这里导入 Analytics 组件
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
        {/* 2. 在这里添加 Analytics 组件 */}
        <Analytics />
      </body>
    </html>
  );
}