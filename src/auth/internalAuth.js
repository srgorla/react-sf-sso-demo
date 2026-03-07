import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const internalAuthConfig = {
  clientId:
    "3MVG9dAEux2v1sLvyGcPikl9WBWIxXVvW1AVHRGGx2MWY9iOyLjI9VmPMKmDwRhEY7tI9uoKqh2OFw5wGk0By",
  authority:
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com",
  redirectUri: "http://localhost:5173/callback",
  postLogoutRedirectUri: "http://localhost:5173/?mode=internal"
};

export const internalUserManager = new UserManager({
  authority: internalAuthConfig.authority,
  client_id: internalAuthConfig.clientId,
  redirect_uri: internalAuthConfig.redirectUri,
  response_type: "code",
  scope: "openid profile email api id",
  post_logout_redirect_uri: internalAuthConfig.postLogoutRedirectUri,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: false,
  loadUserInfo: true
});