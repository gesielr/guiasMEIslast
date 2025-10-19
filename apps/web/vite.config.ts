import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@config": path.resolve(__dirname, "../../packages/config/src"),
      "@sdk": path.resolve(__dirname, "../../packages/sdk/src")
    }
  },
  define: {
    "process.env": {}
  }
});
