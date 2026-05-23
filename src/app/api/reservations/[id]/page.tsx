import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { ReservationActions } from "@/components/ReservationActions";

export const revalidate = 0;

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) notFound();

  const product = await prisma.product.findUnique({ where: { id: reservation.productId } });
  const warehouse = await prisma.warehouse.findUnique({ where: { id: reservation.warehouseId } });

  const statusColors = {
    PENDING:   "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    RELEASED:  "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reservation Details</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{product?.name}</h2>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[reservation.status]}`}>
            {reservation.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">Warehouse:</span> {warehouse?.name}, {warehouse?.city}</p>
          <p><span className="font-medium">Quantity:</span> {reservation.quantity}</p>
          <p><span className="font-medium">Reserved at:</span> {new Date(reservation.createdAt).toLocaleString()}</p>
        </div>

        {reservation.status === "PENDING" && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 font-medium">
              ⏱ Time remaining: <Countdown expiresAt={reservation.expiresAt.toISOString()} />
            </p>
          </div>
        )}

        {reservation.status === "CONFIRMED" && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">✅ Purchase confirmed! Thank you.</p>
          </div>
        )}

        {reservation.status === "RELEASED" && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 font-medium">❌ Reservation cancelled or expired.</p>
          </div>
        )}

        {reservation.status === "PENDING" && <ReservationActions id={reservation.id} />}
      </div>
    </div>
  );
}