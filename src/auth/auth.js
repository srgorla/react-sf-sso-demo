import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const authority = "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com";
const clientId =
  "3MVG9dAEux2v1sLvyGcPikl9WBWIxXVvW1AVHRGGx2MWY9iOyLjI9VmPMKmDwRhEY7tI9uoKqh2OFw5wGk0By";
const redirectUri = "http://localhost:5173/callback";
const postLogoutRedirectUri = "http://localhost:5173/";

export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "openid profile email",
  post_logout_redirect_uri: postLogoutRedirectUri,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false,
  loadUserInfo: true
});

export const authConfig = {
  authority,
  postLogoutRedirectUri
};