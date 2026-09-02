'use client';

import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void | Promise<void>;
  emptyMessage?: string;
}

/**
 * Tabla genérica reutilizable: recibe columnas configurables y datos tipados.
 * Se usa igual en Categorías, Productos y Ventas, cambiando solo `columns`.
 */
export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  emptyMessage = 'No hay elementos para mostrar todavía.',
}: DataTableProps<T>) {
  const [rowToDelete, setRowToDelete] = React.useState<T | null>(null);
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.header} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center text-muted-foreground py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            )}

            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center text-muted-foreground py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="text-right space-x-1">
                      {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRowToDelete(row)}
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

      <AlertDialog open={!!rowToDelete} onOpenChange={(open) => !open && setRowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro se eliminará de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (rowToDelete && onDelete) await onDelete(rowToDelete);
                setRowToDelete(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
