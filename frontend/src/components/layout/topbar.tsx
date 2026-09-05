'use client';

import { usePathname } from 'next/navigation';
import { Bell, Sun, Moon, Menu, Search } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useSidebar } from '@/lib/sidebar-context';
import { ThemeColorPicker } from '@/components/shared/theme-color-picker';

const labels: Record<string, string> = {
  categories: 'Categorías',
  products: 'Productos',
  sales: 'Ventas',
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { setMobileOpen } = useSidebar();
  const section = pathname === '/' ? '' : pathname?.split('/').filter(Boolean)[0];
  const label = section ? labels[section] || section : '';

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
          onClick={() =>
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }
          className="hidden items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
          <kbd className="ml-2 rounded border bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={() =>
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground sm:hidden"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>

        <ThemeColorPicker />

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
