import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSaleDto } from "./dto/create-sale.dto";

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException("Uno o más productos no existen");
    }

    const total = dto.items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + Number(product!.price) * item.quantity;
    }, 0);

    if (total <= 0) {
      throw new BadRequestException("La venta debe tener un total mayor a 0");
    }

    return this.prisma.sale.create({
      data: {
        total,
        items: {
          create: dto.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product!.price,
            };
          }),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  findAll() {
    return this.prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!sale) throw new NotFoundException("Venta no encontrada");
    return sale;
  }
}
