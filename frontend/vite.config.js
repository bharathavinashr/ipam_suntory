import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import ReactInspector from 'vite-plugin-react-inspector';

export default defineConfig({
  plugins: [
    react(),
    ReactInspector({
      toggleCombo: 'control-shift-c',
      editor: 'code',
    }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8008",
    },
  },
});
