"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import type { Category, Product } from "@/types";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  categoryId: string;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
};

export default function ProductsPage() {
  const { data, loading, submitting, create, update, remove } =
    useCrud<Product>("/products");
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch((err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Error al cargar categorías",
        ),
      );
  }, []);

  const filtered = React.useMemo(
    () =>
      data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  );

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<ProductFormState>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      categoryId: product.categoryId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      categoryId: form.categoryId,
    };
    if (editing) {
      await update(editing.id, payload as unknown as Partial<Product>);
    } else {
      await create(payload as unknown as Partial<Product>);
    }
    setModalOpen(false);
  };

  const columns: DataTableColumn<Product>[] = [
    {
      header: "Nombre",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Categoría",
      cell: (row) => <Badge variant="info">{row.category?.name || "—"}</Badge>,
    },
    { header: "Precio", cell: (row) => formatCurrency(row.price) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná el catálogo de productos.
          </p>
        </div>
        <Button onClick={openCreate} disabled={categories.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {categories.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">
          Creá al menos una categoría antes de agregar productos.
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => remove(row.id)}
        emptyMessage={
          search
            ? "No se encontraron productos con ese nombre."
            : "Todavía no creaste ningún producto."
        }
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Editar producto" : "Nuevo producto"}
        description="Completá los datos del producto."
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={form.categoryId}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, categoryId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
