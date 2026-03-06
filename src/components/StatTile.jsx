export default function StatTile({ title, value, subtitle }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff, #f8fafc)",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>
        {title}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
        {subtitle}
      </div>
    </div>
  );
}