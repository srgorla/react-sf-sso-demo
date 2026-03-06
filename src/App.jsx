import { useEffect, useState } from "react";
import { userManager, authConfig } from "./auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    userManager
      .getUser()
      .then((u) => {
        if (u && !u.expired) {
          setUser(u);
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load user session.");
      });
  }, []);

  const loginWithGoogle = async () => {
    setError("");
    try {
      await userManager.signinRedirect({
        extraQueryParams: {
          sso_provider: "Google",
          prompt: "login",
          display: "page"
        }
      });
    } catch (e) {
      console.error(e);
      setError("Google SSO redirect failed.");
    }
  };

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
          <p>This app redirects directly to Google SSO through Salesforce.</p>
          <button onClick={loginWithGoogle}>Login with Google SSO</button>
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