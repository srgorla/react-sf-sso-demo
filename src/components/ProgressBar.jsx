export default function ProgressBar({ label, percent }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          marginBottom: "6px",
          color: "#374151"
        }}
      >
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#e5e7eb",
          borderRadius: "999px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #2563eb, #06b6d4)",
            borderRadius: "999px"
          }}
        />
      </div>
    </div>
  );
}