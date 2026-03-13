import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const configDir = fileURLToPath(new URL(".", import.meta.url));

const getAllowedHosts = (rawHosts) =>
  (rawHosts || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, configDir, "");

  return {
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST || "0.0.0.0",
      port: Number(env.VITE_DEV_PORT || 5173),
      strictPort: true,
      allowedHosts: getAllowedHosts(env.VITE_ALLOWED_HOSTS)
    }
  };
});
