import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const PRODUCTION_API = "https://taxpal-batch3.onrender.com/api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let apiUrl = env.VITE_API_URL?.trim() || "http://localhost:4000/api";

  if (
    mode === "production" &&
    (!apiUrl ||
      /your-api|your-backend|YOUR-API/i.test(apiUrl) ||
      !apiUrl.includes("taxpal-batch3"))
  ) {
    apiUrl = PRODUCTION_API;
  }

  if (!apiUrl.endsWith("/api")) {
    apiUrl = `${apiUrl.replace(/\/+$/, "")}/api`;
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
  };
});
