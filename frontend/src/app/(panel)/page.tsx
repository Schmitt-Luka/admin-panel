'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { LayoutGrid, Package, Receipt, DollarSign, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, Product, Sale } from '@/types';
import { api, ApiError } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/shared/page-transition';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  loading: boolean;
  index: number;
  colorClass: string;
}

function StatCard({ label, value, icon: Icon, loading, index, colorClass }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-7 w-20" />
            ) : (
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            )}
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories'),
      api.get<Product[]>('/products'),
      api.get<Sale[]>('/sales'),
    ])
      .then(([c, p, s]) => {
        setCategories(c);
        setProducts(p);
        setSales(s);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al cargar el resumen'))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total), 0);
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Ventas por día (últimos 14 días)
  const salesByDay = React.useMemo(() => {
    const days: { date: string; label: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        total: 0,
      });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    sales.forEach((s) => {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      const entry = map.get(key);
      if (entry) entry.total += Number(s.total);
    });
    return days;
  }, [sales]);

  // Top 5 productos más vendidos (por cantidad)
  const topProducts = React.useMemo(() => {
    const qty = new Map<string, number>();
    sales.forEach((s) =>
      s.items.forEach((i) => {
        qty.set(i.product.name, (qty.get(i.product.name) || 0) + i.quantity);
      }),
    );
    return Array.from(qty.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // Distribución de productos por categoría
  const categoryDistribution = React.useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const name = p.category?.name || 'Sin categoría';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Inicio</h1>
          <p className="text-sm text-muted-foreground">Resumen general de tu ecommerce.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            index={0}
            label="Categorías"
            value={String(categories.length)}
            icon={LayoutGrid}
            loading={loading}
            colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            index={1}
            label="Productos"
            value={String(products.length)}
            icon={Package}
            loading={loading}
            colorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          />
          <StatCard
            index={2}
            label="Ventas totales"
            value={String(sales.length)}
            icon={Receipt}
            loading={loading}
            colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            index={3}
            label="Ingresos totales"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            loading={loading}
            colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Ventas de los últimos 14 días</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={salesByDay}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      interval={2}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Productos por categoría</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : categoryDistribution.length === 0 ? (
                <p className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
                  Sin productos todavía.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {categoryDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {!loading && categoryDistribution.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {categoryDistribution.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Productos más vendidos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : topProducts.length === 0 ? (
                <p className="flex h-56 items-center justify-center text-center text-sm text-muted-foreground">
                  Todavía no hay ventas para mostrar un ranking.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={16}>
                      {topProducts.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Ventas recientes</CardTitle>
              <Link
                href="/sales"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loading &&
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}

              {!loading && recentSales.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Todavía no se generó ninguna venta.
                </p>
              )}

              {!loading &&
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {sale.items.map((i) => `${i.product.name} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                    </div>
                    <Badge variant="success" className="shrink-0">
                      {formatCurrency(sale.total)}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
