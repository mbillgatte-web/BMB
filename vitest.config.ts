import { defineConfig } from "vitest/config";
import path from "path";

// Tests unitaires des fonctions pures (src/lib, src/data sans Supabase).
// Lancer : npm test
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
