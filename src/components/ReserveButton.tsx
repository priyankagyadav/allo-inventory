"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  warehouseId: string;
  warehouseName: string;
  available: number;
}

export function ReserveButton({ productId, warehouseId, warehouseName, available }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReserve() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
      });
      const data = await res.json();
      if (res.status === 409) { setError("❌ Not enough stock."); return; }
      if (!res.ok) { setError("Something went wrong."); return; }
      router.push(`/reservations/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (available === 0) {
    return <span style={{ color: "#A03020", fontSize: "0.8rem", fontWeight: 600 }}>Out of stock</span>;
  }

  return (
    <div>
      <button
        onClick={handleReserve}
        disabled={loading}
        style={{
          background: loading ? "#C4956A" : "#A0522D",
          color: "#FFF8F4",
          border: "none",
          borderRadius: "8px",
          padding: "6px 14px",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%"
        }}
      >
        {loading ? "Reserving..." : `Reserve →`}
      </button>
      {error && <p style={{ color: "#A03020", fontSize: "0.75rem", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}