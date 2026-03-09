import { useEffect, useRef, useState } from "react";
import { internalUserManager } from "./auth/internalAuth";
import { portalAuthConfig } from "./auth/portalAuth";
import { REACT_ONLY_LOGOUT_MODE_KEY } from "./auth/sessionKeys";
import Dashboard from "./pages/Dashboard";

const getStoredPortalUser = () => {
  const localUser = localStorage.getItem("portal_user");
  if (localUser) return localUser;

  // Backward-compatibility: migrate older sessionStorage value once.
  const sessionUser = sessionStorage.getItem("portal_user");
  if (sessionUser) {
    localStorage.setItem("portal_user", sessionUser);
    sessionStorage.removeItem("portal_user");
    return sessionUser;
  }

  return null;
};

const getParsedPortalUser = () => {
  const portalUserRaw = getStoredPortalUser();
  if (!portalUserRaw) return null;

  try {
    return JSON.parse(portalUserRaw);
  } catch {
    localStorage.removeItem("portal_user");
    sessionStorage.removeItem("portal_user");
    return null;
  }
};

export default function App() {
  const mode =
    new URLSearchParams(window.location.search).get("mode") === "portal"
      ? "portal"
      : "internal";
  const [user, setUser] = useState(() =>
    mode === "portal" ? getParsedPortalUser() : null
  );
  const [error, setError] = useState("");
  const [localLogoutMode, setLocalLogoutMode] = useState(
    () => localStorage.getItem(REACT_ONLY_LOGOUT_MODE_KEY) || ""
  );
  const loginStartedRef = useRef(false);

  const hasLocalLogoutForCurrentMode = localLogoutMode === mode;

  const startLogin = async (loginMode) => {
    loginStartedRef.current = true;

    if (loginMode === "internal") {
      sessionStorage.setItem("login_mode", "internal");
      await internalUserManager.signinRedirect();
      return;
    }

    sessionStorage.setItem("login_mode", "portal");

    const portalUrl =
      `${portalAuthConfig.oauthInitUrl}` +
      `?client_id=${encodeURIComponent(portalAuthConfig.clientId)}` +
      `&redirect_uri=${encodeURIComponent(portalAuthConfig.redirectUri)}` +
      `&response_type=code`;

    window.location.assign(portalUrl);
  };

  const handleSignInAgain = async () => {
    try {
      localStorage.removeItem(REACT_ONLY_LOGOUT_MODE_KEY);
      setLocalLogoutMode("");
      await startLogin(mode);
    } catch (e) {
      console.error(e);
      setError("Failed to start sign-in.");
      loginStartedRef.current = false;
    }
  };

  useEffect(() => {
    internalUserManager
      .getUser()
      .then(async (u) => {
        if (mode === "internal" && u && !u.expired) {
          setUser(u);
          if (localStorage.getItem(REACT_ONLY_LOGOUT_MODE_KEY) === "internal") {
            localStorage.removeItem(REACT_ONLY_LOGOUT_MODE_KEY);
            setLocalLogoutMode("");
          }
          return;
        }

        if (hasLocalLogoutForCurrentMode || loginStartedRef.current) return;

        await startLogin(mode);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load user session.");
      });
  }, [mode, hasLocalLogoutForCurrentMode]);

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

          {hasLocalLogoutForCurrentMode ? (
            <>
              <p style={{ fontSize: "22px", color: "#374151", marginBottom: "20px" }}>
                You are logged out from React for {mode} mode.
              </p>
              <button
                onClick={handleSignInAgain}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "12px 18px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
              >
                Sign In Again
              </button>
            </>
          ) : (
            <p style={{ fontSize: "22px", color: "#374151" }}>
              Redirecting to {mode === "portal" ? "Experience Cloud" : "Salesforce"} login...
            </p>
          )}

          {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        </div>
      ) : (
        <Dashboard user={user} error={error} mode={mode} />
      )}
    </div>
  );
}
