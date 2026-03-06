import { useEffect, useRef, useState } from "react";
import { userManager } from "./auth/auth";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
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
        <Dashboard user={user} error={error} />
      )}
    </div>
  );
}