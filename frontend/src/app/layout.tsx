import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "PRECEDENT — Institutional Intelligence Platform",
  description: "AI-native institutional proposal & RFP intelligence with persistent Hindsight memory and contradiction protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}

