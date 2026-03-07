export const portalAuthConfig = {
  clientId:
    "3MVG9dAEux2v1sLvyGcPikl9WBUoRpqHXmD2bhKDe4iDlE1s9bf1LzAPO3GZ1f8R5mVCbSB.LF.IytBDiueXj",
  redirectUri: "http://localhost:5173/callback",
  postLogoutRedirectUri: "http://localhost:5173/?mode=portal",

  // Use the exact site-specific URL from the Auth Provider page for mylwr
  oauthInitUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.site.com/mylwrvforcesite/services/auth/oauth/Google",

  // Token exchange still goes to the Salesforce token endpoint
  tokenUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com/services/oauth2/token",

  logoutUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com/secur/logout.jsp"
};