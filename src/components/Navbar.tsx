import Link from "next/link";

export function Navbar() {
  return (
    <nav style={{ background: "#7C4A3A", padding: "0.9rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/products" style={{ color: "#FDF6F0", fontSize: "1.3rem", fontWeight: 700, textDecoration: "none" }}>
          🌿 Allo Inventory
        </Link>
        <span style={{ color: "#F4C9B8", fontSize: "0.9rem" }}>Warehouse Management</span>
      </div>
    </nav>
  );
}