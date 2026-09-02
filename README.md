# Admin Panel — Ecommerce genérico

Panel administrativo con CRUDs de Categorías y Productos, y Ventas conectadas a la base de datos.

- **Backend**: NestJS + Prisma + PostgreSQL (JWT auth simple)
- **Frontend**: Next.js (App Router) + TailwindCSS + componentes estilo Shadcn UI, con soporte de modo claro/oscuro

🔗 **Demo en vivo:** [admin-panel-eight-hazel.vercel.app]


## Requisitos

- Node.js 18+
- PostgreSQL (local, instalado directamente) **o** Docker, lo que prefieras

## 1. Base de datos

Tenés dos formas de levantar Postgres, elegí una:

**Opción A — Postgres instalado localmente**

Creá una base vacía (por ejemplo con pgAdmin4 o `psql`) y anotá usuario, contraseña, host, puerto y nombre de la base. Los vas a necesitar en el paso 2.

**Opción B — Docker (sin instalar Postgres)**

```bash
cd backend
docker compose up -d
```

Esto levanta un Postgres en `localhost:5432` con usuario `admin` / password `admin` / db `admin_panel`.

## 2. Backend

```bash
cd backend
npm install
```

Configurá `backend/.env` (copiá `.env.example` como base) con tu connection string real:

DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db?schema=public"
JWT_SECRET="supersecret-change-me"
PORT=3001


Después corré:

```bash
npx prisma migrate dev --name init   # crea las tablas
npx prisma db seed                    # carga datos de ejemplo
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

NEXT_PUBLIC_API_URL=http://localhost:3001/api


## Estructura del proyecto

admin-panel/
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma # User, Category, Product, Sale, SaleItem
│ │ ├── migrations/
│ │ └── seed.ts # seed automático (usuario, categorías, productos, venta demo)
│ └── src/
│ ├── auth/ # login + JWT guard
│ ├── categories/ # CRUD categorías
│ ├── products/ # CRUD productos
│ ├── sales/ # crear/listar ventas
│ └── prisma/ # servicio Prisma global
│
└── frontend/
└── src/
├── app/
│ ├── login/
│ └── (panel)/ # rutas protegidas: categories, products, sales
├── components/
│ ├── ui/ # primitivos estilo shadcn (button, input, dialog, table, select, badge...)
│ ├── layout/ # Sidebar y Topbar (breadcrumb, notificaciones, toggle de tema)
│ └── shared/
│ ├── data-table.tsx # tabla genérica reutilizable (columnas configurables)
│ └── form-modal.tsx # modal genérico para crear/editar
├── hooks/
│ └── use-crud.ts # hook genérico de CRUD (fetch, create, update, delete, toasts)
└── lib/
├── api.ts # cliente fetch con manejo de token/errores
├── auth-context.tsx # sesión (login/logout, usuario actual)
└── theme-context.tsx # modo claro/oscuro persistido en localStorage


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
- **Modo claro/oscuro**: `ThemeProvider` maneja el toggle y persiste la preferencia en
  `localStorage`, respetando además la preferencia del sistema operativo en la primera visita.

## Deploy

- **Frontend** → Vercel (root directory: `frontend`, variable `NEXT_PUBLIC_API_URL` apuntando al
  backend)
- **Backend** → Render (root directory: `backend`, variables `DATABASE_URL` y `JWT_SECRET`)
- **Base de datos** → Neon (Postgres serverless gratuito)

El primer request al backend puede tardar ~1 minuto en responder si estuvo inactivo (el plan free
de Render "duerme" el servicio sin uso).


  
