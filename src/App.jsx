import { useEffect, useRef, useState } from "react";
import { userManager, authConfig } from "./auth";

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

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>React + Salesforce SSO POC</h1>

      {!user ? (
        <>
          <p>Redirecting to Google SSO...</p>
          <button
            onClick={() =>
              userManager.signinRedirect({
                extraQueryParams: {
                  sso_provider: "Google",
                  prompt: "login",
                  display: "page"
                }
              })
            }
          >
            Login with Google SSO
          </button>
        </>
      ) : (
        <>
          <p><strong>Logged in successfully</strong></p>
          <p>Name: {user.profile.name || "N/A"}</p>
          <p>Email: {user.profile.email || "N/A"}</p>
          <p>Issuer: {user.profile.iss || "N/A"}</p>
          <pre>{JSON.stringify(user.profile, null, 2)}</pre>
          <button onClick={logout}>Logout</button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}