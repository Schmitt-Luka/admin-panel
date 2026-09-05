'use client';

import * as React from 'react';

export const BRAND_PRESETS = [
  { name: 'Índigo', value: '234 89% 64%' },
  { name: 'Azul', value: '217 91% 60%' },
  { name: 'Verde', value: '142 71% 45%' },
  { name: 'Rosa', value: '330 81% 60%' },
  { name: 'Naranja', value: '24 95% 58%' },
  { name: 'Violeta', value: '271 81% 65%' },
  { name: 'Rojo', value: '0 84% 60%' },
  { name: 'Teal', value: '173 80% 40%' },
] as const;

const DEFAULT_BRAND_COLOR = BRAND_PRESETS[0].value;
const STORAGE_KEY = 'brand_color';

interface BrandThemeContextType {
  brandColor: string;
  setBrandColor: (value: string) => void;
}

const BrandThemeContext = React.createContext<BrandThemeContextType | undefined>(undefined);

function applyBrandColor(value: string) {
  document.documentElement.style.setProperty('--primary', value);
  document.documentElement.style.setProperty('--ring', value);
}

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const [brandColor, setBrandColorState] = React.useState<string>(DEFAULT_BRAND_COLOR);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored || DEFAULT_BRAND_COLOR;
    setBrandColorState(initial);
    applyBrandColor(initial);
  }, []);

  const setBrandColor = (value: string) => {
    setBrandColorState(value);
    localStorage.setItem(STORAGE_KEY, value);
    applyBrandColor(value);
  };

  return (
    <BrandThemeContext.Provider value={{ brandColor, setBrandColor }}>
      {children}
    </BrandThemeContext.Provider>
  );
}

export function useBrandTheme() {
  const ctx = React.useContext(BrandThemeContext);
  if (!ctx) throw new Error('useBrandTheme debe usarse dentro de un BrandThemeProvider');
  return ctx;
}
