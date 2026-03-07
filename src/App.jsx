import { useEffect, useRef, useState } from "react";
import { internalUserManager } from "./auth/internalAuth";
import { portalAuthConfig } from "./auth/portalAuth";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const loginStartedRef = useRef(false);

  const mode =
    new URLSearchParams(window.location.search).get("mode") === "portal"
      ? "portal"
      : "internal";

  useEffect(() => {
    if (mode === "portal") {
      const portalUserRaw = sessionStorage.getItem("portal_user");
      if (portalUserRaw) {
        try {
          setUser(JSON.parse(portalUserRaw));
          return;
        } catch {
          sessionStorage.removeItem("portal_user");
        }
      }
    }

    internalUserManager
      .getUser()
      .then(async (u) => {
        if (mode === "internal" && u && !u.expired) {
          setUser(u);
          return;
        }

        if (loginStartedRef.current) return;
        loginStartedRef.current = true;

        if (mode === "internal") {
          sessionStorage.setItem("login_mode", "internal");

          await internalUserManager.signinRedirect({
            extraQueryParams: {
              sso_provider: "Google",
              display: "page"
            }
          });
          return;
        }

        sessionStorage.setItem("login_mode", "portal");

        const portalUrl =
          `${portalAuthConfig.oauthInitUrl}` +
          `?client_id=${encodeURIComponent(portalAuthConfig.clientId)}` +
          `&redirect_uri=${encodeURIComponent(portalAuthConfig.redirectUri)}` +
          `&response_type=code`;

        window.location.assign(portalUrl);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load user session.");
      });
  }, [mode]);

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
            Redirecting to {mode === "portal" ? "Experience Cloud" : "Salesforce"} login...
          </p>
          {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        </div>
      ) : (
        <Dashboard user={user} error={error} mode={mode} />
      )}
    </div>
  );
}