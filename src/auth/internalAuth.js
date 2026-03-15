import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { buildAppUrl } from "./appUrls";

const env = import.meta.env;

export const internalAuthConfig = {
  clientId:
    env.VITE_SF_INTERNAL_CLIENT_ID ||
    "3MVG9dAEux2v1sLvyGcPikl9WBWIxXVvW1AVHRGGx2MWY9iOyLjI9VmPMKmDwRhEY7tI9uoKqh2OFw5wGk0By",
  authority:
    env.VITE_SF_INTERNAL_AUTHORITY ||
    "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com",
  redirectUri: env.VITE_APP_REDIRECT_URI || buildAppUrl("/callback"),
  postLogoutRedirectUri:
    env.VITE_INTERNAL_POST_LOGOUT_REDIRECT_URI ||
    buildAppUrl("/?mode=internal"),
  scope: env.VITE_SF_INTERNAL_SCOPE || "openid profile email api id"
};

export const internalUserManager = new UserManager({
  authority: internalAuthConfig.authority,
  client_id: internalAuthConfig.clientId,
  redirect_uri: internalAuthConfig.redirectUri,
  response_type: "code",
  scope: internalAuthConfig.scope,
  post_logout_redirect_uri: internalAuthConfig.postLogoutRedirectUri,
  // localStorage keeps auth state shared across tabs in the same browser profile.
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false,
  loadUserInfo: true
});
