export const portalAuthConfig = {
  clientId:
    "3MVG9dAEux2v1sLvyGcPikl9WBUoRpqHXmD2bhKDe4iDlE1s9bf1LzAPO3GZ1f8R5mVCbSB.LF.IytBDiueXj",
  // Keep portal scopes minimal unless your Connected App explicitly allows more.
  scope: "openid profile email",
  redirectUri: "http://localhost:5173/callback",
  postLogoutRedirectUri: "http://localhost:5173/?mode=portal",

  // Experience Cloud OAuth authorize endpoint for the active site path.
  // This is used for the authorization-code redirect back to the React callback URL.
  oauthInitUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.site.com/mylwrvforcesite/services/oauth2/authorize",
  appendStandardOauthParams: true,

  // Token exchange still goes to the Salesforce token endpoint
  tokenUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com/services/oauth2/token",

  logoutUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.site.com/mylwrvforcesite/secur/logout.jsp"
};
