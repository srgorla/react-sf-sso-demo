import { useEffect, useState } from "react";
import { userManager } from "./auth";

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

  const login = async () => {
    setError("");
    try {
      await userManager.signinRedirect();
    } catch (e) {
      console.error(e);
      setError("Login redirect failed.");
    }
  };

  const logout = async () => {
    try {
      await userManager.removeUser();
      setUser(null);
      window.location.href = "/";
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
          <p>This app will redirect to Salesforce login, then Google SSO.</p>
          <button onClick={login}>Login with Salesforce</button>
        </>
      ) : (
        <>
          <p><strong>Logged in successfully</strong></p>
          <p>Name: {user.profile.name || "N/A"}</p>
          <p>Email: {user.profile.email || "N/A"}</p>
          <pre>{JSON.stringify(user.profile, null, 2)}</pre>
          <button onClick={logout}>Logout</button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}