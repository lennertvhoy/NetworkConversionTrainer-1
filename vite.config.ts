import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import url from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Helper to find the project root by walking up the directory tree
function findProjectRoot(): string {
  let currentDir = path.dirname(url.fileURLToPath(import.meta.url));
  while (path.basename(currentDir) !== 'NetworkConversionTrainer-1' && currentDir !== path.parse(currentDir).root) {
    currentDir = path.resolve(currentDir, '..');
  }
  if (path.basename(currentDir) === 'NetworkConversionTrainer-1') {
    return currentDir;
  } else {
    // Fallback or error if root not found, though it should be found in this project structure
    console.error("Could not find project root: NetworkConversionTrainer-1");
    return process.cwd(); // Fallback
  }
}

const projectRoot = findProjectRoot();

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client", "src"),
      "@shared": path.resolve(projectRoot, "shared"),
      "@assets": path.resolve(projectRoot, "attached_assets"),
    },
  },
  root: path.resolve(projectRoot, "client"),
  build: {
    outDir: path.resolve(projectRoot, "dist", "public"),
    emptyOutDir: true,
  },
});
