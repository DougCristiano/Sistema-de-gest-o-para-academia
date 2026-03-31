import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Usar jsdom para simular DOM em testes
    environment: "jsdom",
    
    // Setup files que rodam antes dos testes
    setupFiles: ["./tests/setup.ts"],
    
    // Incluir testes com extensões .test.ts, .test.tsx, .spec.ts, .spec.tsx
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    
    // Excluir node_modules e dist
    exclude: ["node_modules", "dist"],
    
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData.ts",
      ],
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75,
    },
    
    // Globals: permite usar describe, it, expect sem import
    globals: true,
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
