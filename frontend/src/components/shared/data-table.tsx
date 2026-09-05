'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Si se define, la columna se puede ordenar clickeando el header. */
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  /** Elimina una fila. La UI es optimista: se oculta al toque y hay 4s para deshacer. */
  onDelete?: (row: T) => void | Promise<void>;
  /** Habilita checkboxes + acciones en lote. Requiere onBulkDelete. */
  onBulkDelete?: (rows: T[]) => void | Promise<void>;
  /** Si se define, toda la fila es clickeable (ej: abrir un detalle). */
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
}

const UNDO_WINDOW_MS = 4000;

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  onBulkDelete,
  onRowClick,
  emptyMessage = 'No hay elementos para mostrar todavía.',
  pageSize = 8,
}: DataTableProps<T>) {
  const hasActions = Boolean(onEdit || onDelete);
  const selectable = Boolean(onBulkDelete);

  // --- Undo delete ---
  const [pendingDeleteIds, setPendingDeleteIds] = React.useState<Set<string>>(new Set());
  const timersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const commitDelete = React.useCallback(
    async (row: T) => {
      delete timersRef.current[row.id];
      try {
        if (onDelete) await onDelete(row);
      } finally {
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [onDelete],
  );

  const handleDeleteClick = (row: T) => {
    setPendingDeleteIds((prev) => new Set(prev).add(row.id));
    timersRef.current[row.id] = setTimeout(() => commitDelete(row), UNDO_WINDOW_MS);
    toast('Elemento eliminado', {
      action: {
        label: 'Deshacer',
        onClick: () => {
          clearTimeout(timersRef.current[row.id]);
          delete timersRef.current[row.id];
          setPendingDeleteIds((prev) => {
            const next = new Set(prev);
            next.delete(row.id);
            return next;
          });
        },
      },
      duration: UNDO_WINDOW_MS,
    });
  };

  const visibleData = React.useMemo(
    () => data.filter((row) => !pendingDeleteIds.has(row.id)),
    [data, pendingDeleteIds],
  );

  // --- Sorting ---
  const [sort, setSort] = React.useState<{ header: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sort) return visibleData;
    const col = columns.find((c) => c.header === sort.header);
    if (!col?.sortValue) return visibleData;
    const copy = [...visibleData];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [visibleData, sort, columns]);

  const toggleSort = (header: string) => {
    setSort((prev) => {
      if (!prev || prev.header !== header) return { header, direction: 'asc' };
      if (prev.direction === 'asc') return { header, direction: 'desc' };
      return null;
    });
  };

  // --- Pagination ---
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  React.useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [totalPages, page]);

  const pageData = sortedData.slice(page * pageSize, page * pageSize + pageSize);

  // --- Selection (bulk actions) ---
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const allOnPageSelected = pageData.length > 0 && pageData.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageData.forEach((r) => next.delete(r.id));
      } else {
        pageData.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const rows = data.filter((r) => selectedIds.has(r.id));
    if (rows.length === 0 || !onBulkDelete) return;
    await onBulkDelete(rows);
    setSelectedIds(new Set());
  };

  const colSpan = columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0);

  return (
    <div className="space-y-3">
      {selectable && selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-secondary/50 px-4 py-2 text-sm">
          <span>{selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar seleccionados
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Seleccionar todos"
                    className="h-4 w-4 rounded border-input"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.header} className={col.className}>
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.header)}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      {sort?.header === col.header ? (
                        sort.direction === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                  )}
                </TableRow>
              ))}

            {!loading && pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              pageData.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        aria-label="Seleccionar fila"
                        className="h-4 w-4 rounded border-input"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(row)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!loading && sortedData.length > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page + 1} de {totalPages} · {sortedData.length} elementos
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
