'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LayoutGrid, Package, Receipt, Plus, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme-context';
import type { Category, Product } from '@/types';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const router = useRouter();
  const { toggleTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    Promise.all([api.get<Product[]>('/products'), api.get<Category[]>('/categories')])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => {
        // silencioso: si falla, el palette igual sirve para navegar
      });
  }, [open]);

  const go = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar productos, categorías, o navegar..." />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        <CommandGroup heading="Navegación">
          <CommandItem onSelect={() => go('/')}>
            <LayoutDashboard className="h-4 w-4" />
            Inicio
          </CommandItem>
          <CommandItem onSelect={() => go('/categories')}>
            <LayoutGrid className="h-4 w-4" />
            Categorías
          </CommandItem>
          <CommandItem onSelect={() => go('/products')}>
            <Package className="h-4 w-4" />
            Productos
          </CommandItem>
          <CommandItem onSelect={() => go('/sales')}>
            <Receipt className="h-4 w-4" />
            Ventas
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Acciones rápidas">
          <CommandItem onSelect={() => go('/products?new=1')}>
            <Plus className="h-4 w-4" />
            Nuevo producto
          </CommandItem>
          <CommandItem onSelect={() => go('/categories?new=1')}>
            <Plus className="h-4 w-4" />
            Nueva categoría
          </CommandItem>
          <CommandItem onSelect={() => go('/sales?new=1')}>
            <Plus className="h-4 w-4" />
            Generar venta
          </CommandItem>
          <CommandItem
            onSelect={() => {
              toggleTheme();
              setOpen(false);
            }}
          >
            <Sun className="h-4 w-4" />
            <Moon className="-ml-6 h-4 w-4 opacity-0" />
            Cambiar tema
          </CommandItem>
        </CommandGroup>

        {products.length > 0 && (
          <CommandGroup heading="Productos">
            {products.slice(0, 8).map((p) => (
              <CommandItem key={p.id} value={p.name} onSelect={() => go('/products')}>
                <Package className="h-4 w-4" />
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {categories.length > 0 && (
          <CommandGroup heading="Categorías">
            {categories.slice(0, 8).map((c) => (
              <CommandItem key={c.id} value={c.name} onSelect={() => go('/categories')}>
                <LayoutGrid className="h-4 w-4" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
