"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutGrid,
  Package,
  Receipt,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/lib/sidebar-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/categories", label: "Categorías", icon: LayoutGrid },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/sales", label: "Ventas", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar();

  const content = (
    <>
      <div
        className={cn(
          "flex items-center gap-2 border-b px-5 py-4",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Store className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold">Admin Panel</span>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div
          className={cn(
            "mb-2 flex items-center gap-2 rounded-md px-2 py-1.5",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center px-0",
          )}
          onClick={logout}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </div>

      <button
        type="button"
        onClick={toggleCollapsed}
        className="hidden h-10 items-center justify-center border-t text-muted-foreground hover:bg-secondary hover:text-foreground md:flex"
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col border-r bg-white transition-all duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}
