import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "PRECEDENT — Institutional Intelligence Platform",
  description: "Your organization's memory. Your next unfair advantage. Every bid builds a better next bid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-foreground antialiased selection:bg-purple-500/20 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
