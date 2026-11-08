"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/" || pathname === "/about" || pathname.startsWith("/about");

  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-background text-text-primary selection:bg-aurora-violet/30 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
