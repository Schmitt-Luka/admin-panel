"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
