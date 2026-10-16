import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import ports from "../../__ports.cjs";

// electron/main.ts reads WEBSITE_URL to know which server to load in dev, but the
// variable is not always present in the Vite process env — fall back to this app's
// own web dev server port instead of the template default (localhost:3000).
process.env.WEBSITE_URL ||= `http://localhost:${ports.website}`;

export default defineConfig({
  build: {
    rollupOptions: {
      input: path.join(__dirname, "electron/__no-renderer.ts"),
    },
  },
  plugins: [
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
    }),
  ],
  server: {
    port: ports.desktop,
    strictPort: true,
    allowedHosts: true,
  },
});
