import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const delhi     = await prisma.warehouse.create({ data: { name: "Delhi Central",  city: "Delhi"     } });
  const mumbai    = await prisma.warehouse.create({ data: { name: "Mumbai West",    city: "Mumbai"    } });
  const bangalore = await prisma.warehouse.create({ data: { name: "Bangalore Hub",  city: "Bangalore" } });

  const p1 = await prisma.product.create({ data: { name: "Performance Booster Kit", description: "Complete wellness kit for peak performance.", price: 1299 } });
  const p2 = await prisma.product.create({ data: { name: "Wellness Daily Pack",     description: "Daily supplements for long-term health.",   price: 899  } });
  const p3 = await prisma.product.create({ data: { name: "Vitality Capsules",       description: "Clinically tested formula for vitality.",    price: 649  } });

  await prisma.stock.createMany({
    data: [
      { productId: p1.id, warehouseId: delhi.id,     total: 10, reserved: 0 },
      { productId: p1.id, warehouseId: mumbai.id,    total: 5,  reserved: 0 },
      { productId: p2.id, warehouseId: delhi.id,     total: 3,  reserved: 0 },
      { productId: p2.id, warehouseId: bangalore.id, total: 8,  reserved: 0 },
      { productId: p3.id, warehouseId: mumbai.id,    total: 1,  reserved: 0 },
      { productId: p3.id, warehouseId: bangalore.id, total: 6,  reserved: 0 },
    ],
  });

  console.log("✅ Seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());