"use client";

import * as React from "react";
import { Plus, Search, ImagePlus, X } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import type { Category, Product } from "@/types";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { fileToBase64 } from "@/lib/image-upload";
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
  imageUrl: string;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
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
  const [uploadingImage, setUploadingImage] = React.useState(false);

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
      imageUrl: product.imageUrl || "",
    });
    setModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const base64 = await fileToBase64(file);
      setForm((f) => ({ ...f, imageUrl: base64 }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo cargar la imagen",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      categoryId: form.categoryId,
      imageUrl: form.imageUrl,
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
      header: "",
      className: "w-14",
      cell: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.name}
            className="h-10 w-10 rounded-md border object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-secondary text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        ),
    },
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="space-y-2">
          <Label>Imagen del producto</Label>
          {form.imageUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={form.imageUrl}
                alt="Vista previa"
                className="h-16 w-16 rounded-md border object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
              >
                <X className="mr-2 h-4 w-4" />
                Quitar
              </Button>
            </div>
          ) : (
            <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-secondary/50">
              <ImagePlus className="h-5 w-5" />
              {uploadingImage ? "Cargando..." : "Subir imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploadingImage}
              />
            </label>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
