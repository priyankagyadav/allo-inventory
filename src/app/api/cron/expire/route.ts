import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expired = await prisma.reservation.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
  });
  for (const r of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE "Stock" SET reserved = reserved - ${r.quantity}
        WHERE "productId" = ${r.productId} AND "warehouseId" = ${r.warehouseId}
      `;
      await tx.reservation.update({ where: { id: r.id }, data: { status: "RELEASED" } });
    });
  }
  return NextResponse.json({ released: expired.length });
}