import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { ReservationActions } from "@/components/ReservationActions";

export const revalidate = 0;

export default async function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) notFound();

  const product = await prisma.product.findUnique({ where: { id: reservation.productId } });
  const warehouse = await prisma.warehouse.findUnique({ where: { id: reservation.warehouseId } });

  return (
    <div style={{ background: "#FDF6F0", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ color: "#7C4A3A", fontSize: "1.6rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          📦 Reservation Details
        </h1>
        <div style={{ background: "#FFF8F4", borderRadius: "16px", border: "1px solid #F2D9CC", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ color: "#5C3327", fontWeight: 600 }}>{product?.name}</h2>
            <span style={{
              background: reservation.status === "PENDING" ? "#FFF3CD" : reservation.status === "CONFIRMED" ? "#D4EDD4" : "#FFD6CC",
              color: reservation.status === "PENDING" ? "#856404" : reservation.status === "CONFIRMED" ? "#2E6B2E" : "#A03020",
              padding: "3px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600
            }}>
              {reservation.status}
            </span>
          </div>

          <div style={{ color: "#A07060", fontSize: "0.9rem", lineHeight: "2" }}>
            <p><strong>Warehouse:</strong> {warehouse?.name}, {warehouse?.city}</p>
            <p><strong>Quantity:</strong> {reservation.quantity}</p>
            <p><strong>Reserved at:</strong> {new Date(reservation.createdAt).toLocaleString()}</p>
          </div>

          {reservation.status === "PENDING" && (
            <div style={{ background: "#FEF0E8", border: "1px solid #F2D9CC", borderRadius: "10px", padding: "0.75rem", marginTop: "1rem" }}>
              <p style={{ color: "#7C4A3A", fontWeight: 600, fontSize: "0.9rem" }}>
                ⏱ Time remaining: <Countdown expiresAt={reservation.expiresAt.toISOString()} />
              </p>
            </div>
          )}

          {reservation.status === "CONFIRMED" && (
            <div style={{ background: "#D4EDD4", borderRadius: "10px", padding: "0.75rem", marginTop: "1rem" }}>
              <p style={{ color: "#2E6B2E", fontWeight: 600 }}>✅ Purchase confirmed! Thank you.</p>
            </div>
          )}

          {reservation.status === "RELEASED" && (
            <div style={{ background: "#FFD6CC", borderRadius: "10px", padding: "0.75rem", marginTop: "1rem" }}>
              <p style={{ color: "#A03020", fontWeight: 600 }}>❌ Reservation cancelled or expired.</p>
            </div>
          )}

          {reservation.status === "PENDING" && <ReservationActions id={reservation.id} />}
        </div>
      </div>
    </div>
  );
}