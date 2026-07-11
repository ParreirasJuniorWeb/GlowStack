import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
        css: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/main.tsx", "src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
        },
    },
});
