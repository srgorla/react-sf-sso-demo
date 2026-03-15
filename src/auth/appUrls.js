const DEFAULT_DEV_ORIGIN = "http://localhost:5173";

const trimTrailingSlash = (value) => value.replace(/\/$/, "");

export const getAppOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return DEFAULT_DEV_ORIGIN;
};

export const buildAppUrl = (path) => `${getAppOrigin()}${path}`;
