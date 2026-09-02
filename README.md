# Admin Panel — Ecommerce genérico

Panel administrativo con CRUDs de Categorías y Productos, y Ventas conectadas a la base de datos.

- **Backend**: NestJS + Prisma + PostgreSQL (JWT auth simple)
- **Frontend**: Next.js (App Router) + TailwindCSS + componentes estilo Shadcn UI

## Requisitos

- Node.js 18+
- Docker (para levantar PostgreSQL sin instalarlo local)

## 1. Levantar la base de datos

```bash
cd backend
docker compose up -d
```

Esto levanta un Postgres en `localhost:5432` con usuario `admin` / password `admin` / db `admin_panel`.

## 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init   # crea las tablas
npx prisma db seed                    # carga datos de ejemplo (o: npm run prisma:seed)
npm run start:dev
```

Backend corriendo en `http://localhost:3001/api`.

**Usuario para el login (seedeado automáticamente):**
- Email: `admin@admin.com`
- Password: `admin123`

Si querés hacer todo en un solo paso (migrar + seed): `npm run db:setup`.

## 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:3000`. Te va a redirigir a `/login`.

Si el backend corre en otro puerto/host, creá un `.env.local` en `frontend/` con:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Estructura del proyecto

```
admin-panel/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # User, Category, Product, Sale, SaleItem
│   │   └── seed.ts            # seed automático (usuario, categorías, productos, venta demo)
│   └── src/
│       ├── auth/              # login + JWT guard
│       ├── categories/        # CRUD categorías
│       ├── products/          # CRUD productos
│       ├── sales/             # crear/listar ventas
│       └── prisma/            # servicio Prisma global
│
└── frontend/
    └── src/
        ├── app/
        │   ├── login/
        │   └── (panel)/       # rutas protegidas: categories, products, sales
        ├── components/
        │   ├── ui/            # primitivos estilo shadcn (button, input, dialog, table, select...)
        │   ├── layout/        # Sidebar
        │   └── shared/
        │       ├── data-table.tsx   # tabla genérica reutilizable (columnas configurables)
        │       └── form-modal.tsx   # modal genérico para crear/editar
        ├── hooks/
        │   └── use-crud.ts    # hook genérico de CRUD (fetch, create, update, delete, toasts)
        └── lib/
            ├── api.ts         # cliente fetch con manejo de token/errores
            └── auth-context.tsx
```

## Decisiones de diseño

- **Componentes reutilizables**: `DataTable` y `FormModal` son genéricos y se usan igual en las tres
  secciones (Categorías, Productos, Ventas), solo cambiando la configuración de columnas y el
  contenido del formulario. El hook `useCrud<T>` centraliza toda la lógica de fetch/loading/errores
  para no repetirla en cada página.
- **Ventas conectada a datos reales**: en vez de un total "suelto", la venta se arma eligiendo
  productos y cantidades existentes (`SaleItem`), calculando el total en el backend a partir del
  precio real del producto. Esto evita manipulación del total desde el cliente.
- **Sin stock ni pagos**: tal como pide la consigna, no hay control de stock ni pasarela de pago.
- **Seed automático**: para no perder tiempo configurando datos a mano, `prisma db seed` crea el
  usuario admin, categorías, productos y una venta de ejemplo.
