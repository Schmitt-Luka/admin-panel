import { PrismaClient, Category, Product } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Usuario admin para el login
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      password: passwordHash,
      name: "Administrador",
    },
  });

  // Categorías
  const categoriesData = [
    {
      name: "Electrónica",
      description: "Dispositivos y accesorios electrónicos",
    },
    { name: "Indumentaria", description: "Ropa y accesorios" },
    { name: "Hogar", description: "Artículos para el hogar" },
  ];

  const categories: Category[] = [];
  for (const c of categoriesData) {
    const existing = await prisma.category.findFirst({
      where: { name: c.name },
    });
    if (existing) {
      categories.push(existing);
    } else {
      categories.push(await prisma.category.create({ data: c }));
    }
  }

  // Productos
  const productsData = [
    {
      name: "Auriculares Bluetooth",
      price: 15999.99,
      categoryId: categories[0].id,
      description: "Auriculares inalámbricos con cancelación de ruido",
    },
    {
      name: "Smartwatch",
      price: 34999.5,
      categoryId: categories[0].id,
      description: "Reloj inteligente con monitor de actividad",
    },
    {
      name: "Remera básica",
      price: 4500,
      categoryId: categories[1].id,
      description: "Remera 100% algodón",
    },
    {
      name: "Campera de abrigo",
      price: 22000,
      categoryId: categories[1].id,
      description: "Campera impermeable para invierno",
    },
    {
      name: "Set de sábanas",
      price: 12500,
      categoryId: categories[2].id,
      description: "Juego de sábanas 2 plazas",
    },
  ];

  const products: Product[] = [];
  for (const p of productsData) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (existing) {
      products.push(existing);
    } else {
      products.push(await prisma.product.create({ data: p }));
    }
  }

  // Ventas de ejemplo
  const existingSales = await prisma.sale.count();
  if (existingSales === 0) {
    await prisma.sale.create({
      data: {
        total: Number(products[0].price) * 2 + Number(products[2].price),
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              unitPrice: products[0].price,
            },
            {
              productId: products[2].id,
              quantity: 1,
              unitPrice: products[2].price,
            },
          ],
        },
      },
    });
  }

  console.log("Seed ejecutado correctamente ✅");
  console.log("Login -> email: admin@admin.com / password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
