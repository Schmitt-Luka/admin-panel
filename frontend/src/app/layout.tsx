import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { BrandThemeProvider } from '@/lib/brand-theme-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Panel de administración genérico para ecommerce',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <BrandThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </BrandThemeProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
