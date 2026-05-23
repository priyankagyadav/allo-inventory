import { prisma } from "@/lib/prisma";
import { ReserveButton } from "@/components/ReserveButton";

export const revalidate = 0;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { stocks: { include: { warehouse: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ background: "#FDF6F0", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ color: "#7C4A3A", fontSize: "1.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        🌿 Available Products
      </h1>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {products.map((product) => (
          <div key={product.id} style={{
            background: "#FFF8F4", borderRadius: "16px",
            border: "1px solid #F2D9CC", padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(180,100,80,0.07)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ color: "#5C3327", fontSize: "1.1rem", fontWeight: 600 }}>{product.name}</h2>
                <p style={{ color: "#A07060", fontSize: "0.9rem", marginTop: "4px" }}>{product.description}</p>
              </div>
              <span style={{
                background: "#F4C9B8", color: "#7C3A20", fontWeight: 700,
                fontSize: "1.1rem", padding: "4px 14px", borderRadius: "20px"
              }}>₹{product.price}</span>
            </div>
            <div style={{ borderTop: "1px solid #F2D9CC", paddingTop: "1rem" }}>
              <p style={{ color: "#A07060", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                Stock by Warehouse
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {product.stocks.map((stock) => {
                  const available = stock.total - stock.reserved;
                  return (
                    <div key={stock.warehouseId} style={{
                      background: "#FEF0E8", borderRadius: "12px",
                      border: "1px solid #F2D9CC", padding: "0.85rem 1rem", minWidth: "200px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ color: "#5C3327", fontWeight: 600, fontSize: "0.9rem" }}>{stock.warehouse.name}</span>
                        <span style={{
                          background: available > 0 ? "#D4EDD4" : "#FFD6CC",
                          color: available > 0 ? "#2E6B2E" : "#A03020",
                          fontSize: "0.75rem", fontWeight: 600, padding: "2px 10px", borderRadius: "20px"
                        }}>{available} left</span>
                      </div>
                      <p style={{ color: "#B08070", fontSize: "0.8rem", marginBottom: "0.6rem" }}>📍 {stock.warehouse.city}</p>
                      <ReserveButton
                        productId={product.id}
                        warehouseId={stock.warehouseId}
                        warehouseName={stock.warehouse.name}
                        available={available}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}