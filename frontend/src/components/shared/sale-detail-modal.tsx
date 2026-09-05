'use client';

import { Receipt } from 'lucide-react';
import type { Sale } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SaleDetailModalProps {
  sale: Sale | null;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailModal({ sale, onOpenChange }: SaleDetailModalProps) {
  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {sale && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle>Venta #{sale.id.slice(0, 8).toUpperCase()}</DialogTitle>
                  <DialogDescription>{formatDate(sale.createdAt)}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Productos</p>
              <div className="divide-y rounded-md border">
                {sale.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-secondary/50 p-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">{formatCurrency(sale.total)}</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
