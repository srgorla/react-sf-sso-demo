import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const userManager = new UserManager({
  authority: "https://orgfarm-6f61b5a2b9-dev-ed.develop.my.salesforce.com",
  client_id: "3MVG9dAEux2v1sLvyGcPikl9WBWIxXVvW1AVHRGGx2MWY9iOyLjI9VmPMKmDwRhEY7tI9uoKqh2OFw5wGk0By",
  redirect_uri: "http://localhost:5173/callback",
  response_type: "code",
  scope: "openid profile email",
  post_logout_redirect_uri: "http://localhost:5173/",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false,
  loadUserInfo: true
});