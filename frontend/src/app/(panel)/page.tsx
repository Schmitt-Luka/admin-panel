"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Package,
  Receipt,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Category, Product, Sale } from "@/types";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api.get<Category[]>("/categories"),
      api.get<Product[]>("/products"),
      api.get<Sale[]>("/sales"),
    ])
      .then(([c, p, s]) => {
        setCategories(c);
        setProducts(p);
        setSales(s);
      })
      .catch((err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Error al cargar el resumen",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total), 0);
  const recentSales = [...sales]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general de tu ecommerce.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Categorías"
          value={String(categories.length)}
          icon={LayoutGrid}
          loading={loading}
        />
        <StatCard
          label="Productos"
          value={String(products.length)}
          icon={Package}
          loading={loading}
        />
        <StatCard
          label="Ventas totales"
          value={String(sales.length)}
          icon={Receipt}
          loading={loading}
        />
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          loading={loading}
        />
      </div>

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
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}

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
                    {sale.items
                      .map((i) => `${i.product.name} x${i.quantity}`)
                      .join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sale.createdAt)}
                  </p>
                </div>
                <Badge variant="success" className="shrink-0">
                  {formatCurrency(sale.total)}
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
