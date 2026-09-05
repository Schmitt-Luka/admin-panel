'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

/**
 * Hook genérico para operaciones CRUD contra un endpoint REST.
 * Se reutiliza en Categorías, Productos y (parcialmente) Ventas
 * para no repetir la lógica de fetch/loading/errores en cada vista.
 */
export function useCrud<T extends { id: string }>(endpoint: string) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<T[]>(endpoint);
      setData(result);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (payload: Partial<T>) => {
    setSubmitting(true);
    try {
      const created = await api.post<T>(endpoint, payload);
      setData((prev) => [created, ...prev]);
      toast.success('Creado correctamente');
      return created;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al crear');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const update = async (id: string, payload: Partial<T>) => {
    setSubmitting(true);
    try {
      const updated = await api.patch<T>(`${endpoint}/${id}`, payload);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success('Actualizado correctamente');
      return updated;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al actualizar');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al eliminar');
      throw err;
    }
  };

  const removeMany = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => api.delete(`${endpoint}/${id}`)));
      setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      toast.success(`${ids.length} elemento${ids.length > 1 ? 's' : ''} eliminado${ids.length > 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al eliminar en lote');
      await fetchAll();
      throw err;
    }
  };

  return { data, loading, submitting, create, update, remove, removeMany, refetch: fetchAll };
}
