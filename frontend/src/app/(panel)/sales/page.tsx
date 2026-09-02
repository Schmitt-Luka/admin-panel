"use client";

import * as React from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useCrud } from "@/hooks/use-crud";
import type { Category, Product, Sale } from "@/types";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";

interface DraftItem {
  productId: string;
  quantity: number;
}

export default function SalesPage() {
  const { data: sales, loading, submitting, create } = useCrud<Sale>("/sales");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [items, setItems] = React.useState<DraftItem[]>([
    { productId: "", quantity: 1 },
  ]);

  React.useEffect(() => {
    api
      .get<Product[]>("/products")
      .then(setProducts)
      .catch((err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Error al cargar productos",
        ),
      );
  }, []);

  const filtered = React.useMemo(
    () =>
      sales.filter((sale) =>
        sale.items.some((i) =>
          i.product.name.toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    [sales, search],
  );

  const openCreate = () => {
    setItems([{ productId: "", quantity: 1 }]);
    setModalOpen(true);
  };

  const addItemRow = () =>
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeItemRow = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, patch: Partial<DraftItem>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const total = items.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId);
    return acc + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Agregá al menos un producto a la venta");
      return;
    }
    await create({ items: validItems } as unknown as Partial<Sale>);
    setModalOpen(false);
  };

  const columns: DataTableColumn<Sale>[] = [
    {
      header: "Productos",
      cell: (row) => (
        <span className="text-sm">
          {row.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ")}
        </span>
      ),
    },
    {
      header: "Total",
      cell: (row) => (
        <Badge variant="success">{formatCurrency(row.total)}</Badge>
      ),
    },
    { header: "Fecha", cell: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Listado de ventas registradas en el sistema.
          </p>
        </div>
        <Button onClick={openCreate} disabled={products.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Generar venta
        </Button>
      </div>

      {products.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">
          Creá al menos un producto antes de generar una venta.
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage={
          search
            ? "No se encontraron ventas con ese producto."
            : "Todavía no se generó ninguna venta."
        }
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Generar venta"
        description="Elegí los productos y cantidades para registrar la venta."
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Generar venta"
      >
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>Producto</Label>
                <Select
                  value={item.productId}
                  onValueChange={(value) =>
                    updateItem(index, { productId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, { quantity: Number(e.target.value) })
                  }
                />
              </div>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItemRow(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItemRow}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar producto
          </Button>

          <div className="flex justify-between border-t pt-3 text-sm font-medium">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
