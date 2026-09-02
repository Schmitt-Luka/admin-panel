"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Receipt, LogOut, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/categories", label: "Categorías", icon: LayoutGrid },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/sales", label: "Ventas", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-white">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Store className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold">Admin Panel</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
