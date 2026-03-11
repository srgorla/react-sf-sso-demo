const env = import.meta.env;

const parseBooleanEnv = (value, fallback) => {
  if (value === undefined) return fallback;
  return value === "true";
};

export const portalAuthConfig = {
  clientId:
    env.VITE_SF_PORTAL_CLIENT_ID ||
    "3MVG9dAEux2v1sLvyGcPikl9WBUoRpqHXmD2bhKDe4iDlE1s9bf1LzAPO3GZ1f8R5mVCbSB.LF.IytBDiueXj",
  // Keep portal scopes minimal unless your Connected App explicitly allows more.
  scope: env.VITE_SF_PORTAL_SCOPE || "openid profile email",
  redirectUri: env.VITE_APP_REDIRECT_URI || "http://localhost:5173/callback",
  postLogoutRedirectUri:
    env.VITE_PORTAL_POST_LOGOUT_REDIRECT_URI ||
    "http://localhost:5173/?mode=portal",

  // Experience Cloud OAuth authorize endpoint for the active site path.
  // This is used for the authorization-code redirect back to the React callback URL.
  oauthInitUrl:
    env.VITE_SF_PORTAL_OAUTH_INIT_URL ||
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.site.com/mylwrvforcesite/services/oauth2/authorize",
  appendStandardOauthParams: parseBooleanEnv(
    env.VITE_SF_PORTAL_APPEND_STANDARD_PARAMS,
    true
  ),

  // Token exchange still goes to the Salesforce token endpoint
  tokenUrl:
    env.VITE_SF_PORTAL_TOKEN_URL ||
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com/services/oauth2/token",

  logoutUrl:
    env.VITE_SF_PORTAL_LOGOUT_URL ||
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.site.com/mylwrvforcesite/secur/logout.jsp"
};
