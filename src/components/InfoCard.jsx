export default function InfoCard({ label, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        minWidth: "220px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}