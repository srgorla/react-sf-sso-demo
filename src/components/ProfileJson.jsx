import { useState } from "react";

export default function ProfileJson({ profile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "24px" }}>User Profile Payload</h2>
          <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
            Expand to inspect the full OIDC profile returned by Salesforce.
          </p>
        </div>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            background: expanded ? "#111827" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          {expanded ? "Collapse JSON" : "Expand JSON"}
        </button>
      </div>

      {expanded ? (
        <pre
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: "16px",
            padding: "18px",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.45,
            maxHeight: "420px"
          }}
        >
          {JSON.stringify(profile, null, 2)}
        </pre>
      ) : (
        <div
          style={{
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: "14px",
            padding: "20px",
            color: "#475569"
          }}
        >
          JSON payload hidden. Click <strong>Expand JSON</strong> to view the full
          profile.
        </div>
      )}
    </div>
  );
}