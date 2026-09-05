'use client';

import * as React from 'react';
import { Palette, Check } from 'lucide-react';
import { BRAND_PRESETS, useBrandTheme } from '@/lib/brand-theme-context';

export function ThemeColorPicker() {
  const { brandColor, setBrandColor } = useBrandTheme();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Color de marca"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-card p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Color de marca</p>
          <div className="grid grid-cols-4 gap-2">
            {BRAND_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setBrandColor(preset.value)}
                title={preset.name}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: `hsl(${preset.value})` }}
                aria-label={preset.name}
              >
                {brandColor === preset.value && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Cambia el color principal de toda la app en vivo.
          </p>
        </div>
      )}
    </div>
  );
}
