"use client";

import { usePathname } from "next/navigation";
import { Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useSidebar } from "@/lib/sidebar-context";

const labels: Record<string, string> = {
  categories: "Categorías",
  products: "Productos",
  sales: "Ventas",
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { setMobileOpen } = useSidebar();
  const section =
    pathname === "/" ? "" : pathname?.split("/").filter(Boolean)[0];
  const label = section ? labels[section] || section : "";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" />
        </button>
        <p className="text-sm text-muted-foreground">
          Inicio {label && <span className="text-foreground"> / {label}</span>}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
