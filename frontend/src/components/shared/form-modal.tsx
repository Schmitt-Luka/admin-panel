'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: () => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
}

/**
 * Modal genérico para formularios de creación/edición.
 * Recibe el formulario como children (inputs controlados desde afuera)
 * y solo se encarga del contenedor, título y acciones (submit/cancelar).
 * Se reutiliza en Categorías, Productos y Ventas.
 */
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitting,
  submitLabel = 'Guardar',
  children,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="space-y-4 py-4">{children}</div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
