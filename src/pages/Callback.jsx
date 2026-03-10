import { useEffect, useRef, useState } from "react";
import { internalUserManager } from "../auth/internalAuth";
import { portalAuthConfig } from "../auth/portalAuth";
import {
  PORTAL_AUTH_STATE_KEY,
  PORTAL_PKCE_VERIFIER_KEY
} from "../auth/sessionKeys";

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
        const state = params.get("state");
        const expectedState = sessionStorage.getItem(PORTAL_AUTH_STATE_KEY);
        const codeVerifier = sessionStorage.getItem(PORTAL_PKCE_VERIFIER_KEY);

        if (!code) {
          throw new Error("Missing authorization code");
        }

        if (!codeVerifier) {
          throw new Error("Missing PKCE verifier in browser session");
        }

        if (expectedState && state !== expectedState) {
          throw new Error("Portal login state validation failed");
        }

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: portalAuthConfig.clientId,
          redirect_uri: portalAuthConfig.redirectUri,
          code,
          code_verifier: codeVerifier
        });

        const communityUrlRaw = params.get("sfdc_community_url");
        const tokenUrls = [portalAuthConfig.tokenUrl];
        if (communityUrlRaw) {
          try {
            const communityUrl = new URL(communityUrlRaw);
            const sitePath = communityUrl.pathname.replace(/\/$/, "");
            tokenUrls.push(`${communityUrl.origin}${sitePath}/services/oauth2/token`);
            tokenUrls.push(`${communityUrl.origin}/services/oauth2/token`);
          } catch {
            // Ignore malformed community URL and continue with configured token URL.
          }
        }

        const uniqueTokenUrls = [...new Set(tokenUrls)];
        let tokenResult = null;
        let successfulTokenUrl = "";
        let lastTokenError = "";

        for (const tokenUrl of uniqueTokenUrls) {
          try {
            const tokenResponse = await fetch(tokenUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body
            });

            const tokenText = await tokenResponse.text();
            if (!tokenResponse.ok) {
              lastTokenError = `${tokenUrl}: ${tokenText || `HTTP ${tokenResponse.status}`}`;
              continue;
            }

            tokenResult = JSON.parse(tokenText);
            successfulTokenUrl = tokenUrl;
            break;
          } catch (err) {
            lastTokenError = `${tokenUrl}: ${err?.message || "Network error"}`;
          }
        }

        if (!tokenResult) {
          throw new Error(`Portal token exchange failed (${lastTokenError || "Unknown error"})`);
        }

        const profileUrls = [];
        if (tokenResult.id) {
          profileUrls.push(tokenResult.id);
        }

        if (tokenResult.instance_url) {
          profileUrls.push(`${tokenResult.instance_url}/services/oauth2/userinfo`);
        }

        if (successfulTokenUrl) {
          try {
            const tokenOrigin = new URL(successfulTokenUrl).origin;
            profileUrls.push(`${tokenOrigin}/services/oauth2/userinfo`);
          } catch {
            // No-op.
          }
        }

        const uniqueProfileUrls = [...new Set(profileUrls)];
        let profile = null;
        let lastProfileError = "";

        for (const profileUrl of uniqueProfileUrls) {
          try {
            const profileResponse = await fetch(profileUrl, {
              headers: {
                Authorization: `Bearer ${tokenResult.access_token}`
              }
            });

            if (!profileResponse.ok) {
              const profileText = await profileResponse.text();
              lastProfileError =
                `${profileUrl}: ${profileText || `HTTP ${profileResponse.status}`}`;
              continue;
            }

            profile = await profileResponse.json();
            break;
          } catch (err) {
            lastProfileError = `${profileUrl}: ${err?.message || "Network error"}`;
          }
        }

        if (!profile) {
          throw new Error(`Failed to load portal user profile (${lastProfileError || "Unknown error"})`);
        }

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
        sessionStorage.removeItem(PORTAL_PKCE_VERIFIER_KEY);
        sessionStorage.removeItem(PORTAL_AUTH_STATE_KEY);
        window.location.replace("/?mode=portal");
      } catch (e) {
        console.error("Callback error:", e);
        sessionStorage.removeItem(PORTAL_PKCE_VERIFIER_KEY);
        sessionStorage.removeItem(PORTAL_AUTH_STATE_KEY);
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
