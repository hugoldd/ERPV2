import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT : le nom du repo GitHub Pages
  base: "/ERPV2/",
});
