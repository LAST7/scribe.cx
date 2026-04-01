import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "~": path.resolve(__dirname, "src"),
            "@@": path.resolve(__dirname, "."),
            "~~": path.resolve(__dirname, ".")
        }
    },
    test: {
        setupFiles: ["./src/test/vitest.setup.ts"],
        environment: "node"
    }
});
