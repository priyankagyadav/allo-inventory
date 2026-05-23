"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReservationActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading("confirm");
    setError("");
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
    if (res.status === 410) {
      setError("❌ Reservation expired. Stock has been released.");
      setLoading(null);
      return;
    }
    if (!res.ok) {
      setError("Something went wrong.");
      setLoading(null);
      return;
    }
    router.refresh();
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("cancel");
    setError("");
    const res = await fetch(`/api/reservations/${id}/release`, { method: "POST" });
    if (!res.ok) {
      setError("Something went wrong.");
      setLoading(null);
      return;
    }
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={handleConfirm}
        disabled={!!loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading === "confirm" ? "Confirming..." : "✅ Confirm Purchase"}
      </button>
      <button
        onClick={handleCancel}
        disabled={!!loading}
        className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading === "cancel" ? "Cancelling..." : "❌ Cancel"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}