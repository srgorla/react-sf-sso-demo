import { useEffect, useRef, useState } from "react";
import { internalUserManager } from "../auth/internalAuth";
import { portalAuthConfig } from "../auth/portalAuth";

export default function Callback() {
  const [message, setMessage] = useState("Completing sign-in...");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const run = async () => {
      try {
        const loginMode = sessionStorage.getItem("login_mode");

        if (loginMode !== "portal") {
          await internalUserManager.signinRedirectCallback();
          window.location.replace("/?mode=internal");
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          throw new Error("Missing authorization code");
        }

        // For the portal auth/oauth URL flow, do not append PKCE/state handling here.
        // Start with the basic code exchange and see what the endpoint returns.
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: portalAuthConfig.clientId,
          redirect_uri: portalAuthConfig.redirectUri,
          code
        });

        const tokenResponse = await fetch(portalAuthConfig.tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body
        });

        const tokenText = await tokenResponse.text();

        if (!tokenResponse.ok) {
          throw new Error(tokenText || "Portal token exchange failed");
        }

        const tokenResult = JSON.parse(tokenText);

        const profileResponse = await fetch(tokenResult.id, {
          headers: {
            Authorization: `Bearer ${tokenResult.access_token}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to load portal user profile");
        }

        const profile = await profileResponse.json();

        const portalUser = {
          profile,
          access_token: tokenResult.access_token,
          id_token: tokenResult.id_token,
          token_type: tokenResult.token_type,
          expires_at:
            Math.floor(Date.now() / 1000) + (tokenResult.expires_in || 3600),
          expired: false
        };

        // Keep portal session shared across tabs.
        localStorage.setItem("portal_user", JSON.stringify(portalUser));
        sessionStorage.removeItem("portal_user");
        window.location.replace("/?mode=portal");
      } catch (e) {
        console.error("Callback error:", e);
        setMessage(`Sign-in failed: ${e?.message || "Unknown error"}`);
      }
    };

    run();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      {message}
    </div>
  );
}
