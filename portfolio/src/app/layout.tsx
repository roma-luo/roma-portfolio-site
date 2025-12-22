import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roma Portfolio",
  description: "Portfolio of Roma - Architecture & Computational Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
