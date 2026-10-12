import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const nodeModule = (path: string) =>
  fileURLToPath(new URL(`./node_modules/${path}`, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: /^monaco-vim$/,
        replacement: nodeModule("monaco-vim/dist/index.mjs"),
      },
      {
        find: /^monaco-editor\/esm\/vs\//,
        replacement: nodeModule("monaco-editor/esm/vs/"),
      },
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./src/", import.meta.url)),
      },
    ],
  },
  optimizeDeps: { exclude: ["mahoraga-js"] },
});
