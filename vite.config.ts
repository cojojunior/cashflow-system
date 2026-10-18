import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "logo192.svg", "logo512.svg"],
      manifest: {
        name: "SME CashFlow Manager",
        short_name: "CashFlow",
        description: "Track cash flow, manage income and expenses.",
        theme_color: "#0b1a2b",
        background_color: "#f7f9fc",
        icons: [
          {
            src: "logo192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "logo512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
