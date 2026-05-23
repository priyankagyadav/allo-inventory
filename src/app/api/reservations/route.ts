import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateReservationSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateReservationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { productId, warehouseId, quantity } = parsed.data;
  const idempotencyKey = req.headers.get("Idempotency-Key");

  if (idempotencyKey) {
    const existing = await prisma.reservation.findUnique({ where: { idempotencyKey } });
    if (existing) return NextResponse.json(existing, { status: 200 });
  }

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const stock = await tx.$queryRaw<{ id: string; total: number; reserved: number }[]>`
        SELECT id, total, reserved FROM "Stock"
        WHERE "productId" = ${productId} AND "warehouseId" = ${warehouseId}
        FOR UPDATE
      `;
      if (!stock.length) throw new Error("STOCK_NOT_FOUND");
      if (stock[0].total - stock[0].reserved < quantity) throw new Error("INSUFFICIENT_STOCK");

      await tx.$executeRaw`
        UPDATE "Stock" SET reserved = reserved + ${quantity} WHERE id = ${stock[0].id}
      `;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      return tx.reservation.create({
        data: { productId, warehouseId, quantity, expiresAt,
          ...(idempotencyKey ? { idempotencyKey } : {}) },
      });
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "INSUFFICIENT_STOCK" || msg === "STOCK_NOT_FOUND")
      return NextResponse.json({ error: "Not enough stock available" }, { status: 409 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}