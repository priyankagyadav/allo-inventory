import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (r.status !== "PENDING") return NextResponse.json({ error: "Not pending" }, { status: 400 });
  if (new Date() > r.expiresAt) {
    await prisma.reservation.update({ where: { id }, data: { status: "RELEASED" } });
    return NextResponse.json({ error: "Reservation expired" }, { status: 410 });
  }
  const confirmed = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "Stock" SET reserved = reserved - ${r.quantity}, total = total - ${r.quantity}
      WHERE "productId" = ${r.productId} AND "warehouseId" = ${r.warehouseId}
    `;
    return tx.reservation.update({ where: { id }, data: { status: "CONFIRMED" } });
  });
  return NextResponse.json(confirmed);
}