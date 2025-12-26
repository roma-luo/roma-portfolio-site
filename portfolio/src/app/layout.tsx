import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
