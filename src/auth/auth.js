import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const clientId =
  "3MVG9dAEux2v1sLvyGcPikl9WBWIxXVvW1AVHRGGx2MWY9iOyLjI9VmPMKmDwRhEY7tI9uoKqh2OFw5wGk0By";

const redirectUri = "http://localhost:5173/callback";
const postLogoutRedirectUri = "http://localhost:5173/";

export const authConfig = {
  clientId,
  redirectUri,
  postLogoutRedirectUri,
  internalAuthority:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com",
  portalAuthorizeUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.site.com/mylwrvforcesite/services/auth/oauth/Google",
  tokenUrl:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com/services/oauth2/token"
};

export const userManager = new UserManager({
  authority: authConfig.internalAuthority,
  client_id: authConfig.clientId,
  redirect_uri: authConfig.redirectUri,
  response_type: "code",
  scope: "openid profile email",
  post_logout_redirect_uri: authConfig.postLogoutRedirectUri,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false,
  loadUserInfo: true
});
