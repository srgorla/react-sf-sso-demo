import { useEffect, useRef, useState } from "react";
import { userManager, authConfig } from "./auth";

function InfoCard({ label, value }) {
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

function StatTile({ title, value, subtitle }) {
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

function ProgressBar({ label, percent }) {
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

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showProfileJson, setShowProfileJson] = useState(false);
  const loginStartedRef = useRef(false);

  useEffect(() => {
    userManager
      .getUser()
      .then(async (u) => {
        if (u && !u.expired) {
          setUser(u);
          return;
        }

        if (!loginStartedRef.current) {
          loginStartedRef.current = true;
          await userManager.signinRedirect({
            extraQueryParams: {
              sso_provider: "Google",
              prompt: "login",
              display: "page"
            }
          });
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load user session.");
      });
  }, []);

  const logout = async () => {
    try {
      await userManager.removeUser();
      const logoutUrl =
        `${authConfig.authority}/secur/logout.jsp` +
        `?retUrl=${encodeURIComponent(authConfig.postLogoutRedirectUri)}`;
      window.location.assign(logoutUrl);
    } catch (e) {
      console.error(e);
      setError("Logout failed.");
    }
  };

  const userName = user?.profile?.name || "N/A";
  const email = user?.profile?.email || "N/A";
  const issuer = user?.profile?.iss || "N/A";

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#111827"
      }}
    >
      {!user ? (
        <div style={{ padding: "56px 40px" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
            React + Salesforce SSO POC
          </h1>
          <p style={{ fontSize: "22px", color: "#374151" }}>
            Redirecting to Google SSO...
          </p>
          {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        </div>
      ) : (
        <div style={{ padding: "32px" }}>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto"
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #0f766e)",
                color: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                marginBottom: "28px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "8px" }}>
                    React + Salesforce SSO POC
                  </div>
                  <h1 style={{ fontSize: "38px", margin: 0, marginBottom: "10px" }}>
                    Welcome, {userName}
                  </h1>
                  <p style={{ fontSize: "16px", margin: 0, opacity: 0.92 }}>
                    Signed in through Salesforce with Google SSO
                  </p>
                </div>

                <button
                  onClick={logout}
                  style={{
                    background: "white",
                    color: "#111827",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.12)"
                  }}
                >
                  Logout
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                marginBottom: "24px"
              }}
            >
              <InfoCard label="Status" value="Logged in successfully" />
              <InfoCard label="Name" value={userName} />
              <InfoCard label="Email" value={email} />
              <InfoCard label="Issuer" value={issuer} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "24px",
                alignItems: "start"
              }}
            >
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
                    onClick={() => setShowProfileJson((prev) => !prev)}
                    style={{
                      background: showProfileJson ? "#111827" : "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    {showProfileJson ? "Collapse JSON" : "Expand JSON"}
                  </button>
                </div>

                {showProfileJson ? (
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
                    {JSON.stringify(user.profile, null, 2)}
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

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: "24px" }}>Quick Stats</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "14px",
                    marginBottom: "22px"
                  }}
                >
                  <StatTile title="Identity Source" value="Salesforce" subtitle="OIDC issuer" />
                  <StatTile title="Authentication Mode" value="Google SSO" subtitle="Brokered through Salesforce" />
                  <StatTile
                    title="Email Verified"
                    value={user?.profile?.email_verified ? "Yes" : "No"}
                    subtitle="From returned profile claims"
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: "24px" }}>Visual Experience</h2>
              <p style={{ color: "#6b7280", marginTop: "8px" }}>
                A lightweight dashboard section to make the authenticated experience feel more like
                an application.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr",
                  gap: "24px",
                  marginTop: "20px"
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0 }}>Profile Completeness</h3>
                  <ProgressBar label="Basic identity loaded" percent={100} />
                  <ProgressBar label="Email claim available" percent={user?.profile?.email ? 100 : 0} />
                  <ProgressBar
                    label="Verified email"
                    percent={user?.profile?.email_verified ? 100 : 40}
                  />
                  <ProgressBar label="User session active" percent={100} />
                </div>

                <div>
                  <h3 style={{ marginTop: 0 }}>Identity Summary</h3>
                  <div
                    style={{
                      height: "220px",
                      borderRadius: "18px",
                      background:
                        "radial-gradient(circle at top, #60a5fa, #2563eb 45%, #0f172a 100%)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "24px",
                        left: "24px",
                        color: "white"
                      }}
                    >
                      <div style={{ fontSize: "14px", opacity: 0.85 }}>Authenticated User</div>
                      <div style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>
                        {userName}
                      </div>
                      <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.92 }}>
                        {email}
                      </div>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        right: "24px",
                        bottom: "24px",
                        width: "96px",
                        height: "96px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.16)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "28px"
                      }}
                    >
                      {userName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        left: "-30px",
                        bottom: "-30px",
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.10)"
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        right: "120px",
                        top: "30px",
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.10)"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p style={{ color: "#dc2626", marginTop: "16px" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}