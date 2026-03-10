import { useEffect, useRef, useState } from "react";
import { internalUserManager } from "./auth/internalAuth";
import { portalAuthConfig } from "./auth/portalAuth";
import {
  PORTAL_AUTH_STATE_KEY,
  PORTAL_PKCE_VERIFIER_KEY,
  REACT_ONLY_LOGOUT_MODE_KEY
} from "./auth/sessionKeys";
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

const isPortalUserActive = (portalUser) => {
  if (!portalUser) return false;
  if (!portalUser.expires_at) return true;
  return portalUser.expires_at > Math.floor(Date.now() / 1000);
};

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const createRandomString = (byteLength = 32) => {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

const createCodeChallenge = async (codeVerifier) => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return toBase64Url(new Uint8Array(digest));
};

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get("mode") === "portal" ? "portal" : "internal";
  const isLoggedOutIntent = searchParams.get("logged_out") === "1";
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const loginStartedRef = useRef(false);

  const hasLocalLogoutForCurrentMode =
    localStorage.getItem(REACT_ONLY_LOGOUT_MODE_KEY) === mode;
  const portalUser = mode === "portal" ? getParsedPortalUser() : null;
  const activePortalUser = isPortalUserActive(portalUser) ? portalUser : null;
  const currentUser = mode === "portal" ? activePortalUser : user;

  const startLogin = async (loginMode) => {
    loginStartedRef.current = true;

    if (loginMode === "internal") {
      sessionStorage.setItem("login_mode", "internal");
      await internalUserManager.signinRedirect();
      return;
    }

    sessionStorage.setItem("login_mode", "portal");

    const portalUrl = new URL(portalAuthConfig.oauthInitUrl);
    if (portalAuthConfig.appendStandardOauthParams !== false) {
      const codeVerifier = createRandomString(64);
      const codeChallenge = await createCodeChallenge(codeVerifier);
      const state = createRandomString(24);

      sessionStorage.setItem(PORTAL_PKCE_VERIFIER_KEY, codeVerifier);
      sessionStorage.setItem(PORTAL_AUTH_STATE_KEY, state);

      portalUrl.searchParams.set("client_id", portalAuthConfig.clientId);
      portalUrl.searchParams.set("redirect_uri", portalAuthConfig.redirectUri);
      portalUrl.searchParams.set("response_type", "code");
      portalUrl.searchParams.set("code_challenge", codeChallenge);
      portalUrl.searchParams.set("code_challenge_method", "S256");
      if (portalAuthConfig.scope) {
        portalUrl.searchParams.set("scope", portalAuthConfig.scope);
      }
      portalUrl.searchParams.set("state", state);
    }

    window.location.assign(portalUrl.toString());
  };

  const handleSignInAgain = async () => {
    try {
      localStorage.removeItem(REACT_ONLY_LOGOUT_MODE_KEY);
      await startLogin(mode);
    } catch (e) {
      console.error(e);
      setError("Failed to start sign-in.");
      loginStartedRef.current = false;
    }
  };

  useEffect(() => {
    if (mode === "portal") {
      let blockAutoLogin = hasLocalLogoutForCurrentMode || isLoggedOutIntent;
      if (hasLocalLogoutForCurrentMode && !isLoggedOutIntent) {
        localStorage.removeItem(REACT_ONLY_LOGOUT_MODE_KEY);
        blockAutoLogin = false;
      }

      if (activePortalUser) {
        return;
      }

      localStorage.removeItem("portal_user");
      sessionStorage.removeItem("portal_user");

      if (blockAutoLogin || loginStartedRef.current) return;

      startLogin("portal").catch((e) => {
        console.error(e);
        setError("Failed to load user session.");
        loginStartedRef.current = false;
      });
      return;
    }

    internalUserManager
      .getUser()
      .then(async (u) => {
        let blockAutoLogin = hasLocalLogoutForCurrentMode || isLoggedOutIntent;
        if (hasLocalLogoutForCurrentMode && !isLoggedOutIntent) {
          localStorage.removeItem(REACT_ONLY_LOGOUT_MODE_KEY);
          blockAutoLogin = false;
        }

        if (u && !u.expired) {
          setUser(u);
          if (localStorage.getItem(REACT_ONLY_LOGOUT_MODE_KEY) === "internal") {
            localStorage.removeItem(REACT_ONLY_LOGOUT_MODE_KEY);
          }
          return;
        }

        if (blockAutoLogin || loginStartedRef.current) return;

        await startLogin(mode);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load user session.");
      });
  }, [mode, hasLocalLogoutForCurrentMode, activePortalUser, isLoggedOutIntent]);

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
      {!currentUser ? (
        <div style={{ padding: "56px 40px" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
            React + Salesforce SSO POC
          </h1>

          {hasLocalLogoutForCurrentMode || isLoggedOutIntent ? (
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
        <Dashboard user={currentUser} error={error} mode={mode} />
      )}
    </div>
  );
}
