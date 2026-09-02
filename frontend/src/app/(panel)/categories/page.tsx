"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import type { Category } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";

interface CategoryFormState {
  name: string;
  description: string;
}

const emptyForm: CategoryFormState = { name: "", description: "" };

export default function CategoriesPage() {
  const { data, loading, submitting, create, update, remove } =
    useCrud<Category>("/categories");

  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [form, setForm] = React.useState<CategoryFormState>(emptyForm);

  const filtered = React.useMemo(
    () =>
      data.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({ name: category.name, description: category.description || "" });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
    };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
    setModalOpen(false);
  };

  const columns: DataTableColumn<Category>[] = [
    {
      header: "Nombre",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Descripción",
      cell: (row) => (
        <span className="text-muted-foreground">{row.description || "—"}</span>
      ),
    },
    {
      header: "Productos",
      cell: (row) => (
        <Badge variant="info">{row._count?.products ?? 0} productos</Badge>
      ),
    },
    { header: "Creada", cell: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Organizá los productos de tu ecommerce en categorías.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
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
            ? "No se encontraron categorías con ese nombre."
            : "Todavía no creaste ninguna categoría."
        }
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Editar categoría" : "Nueva categoría"}
        description="Completá los datos de la categoría."
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
      </FormModal>
    </div>
  );
}
