import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    modules: ["@wxt-dev/module-svelte", "@wxt-dev/webextension-polyfill"],
    vite: () => ({
        plugins: [tailwindcss()]
    }),
    manifest: {
        permissions: ["sidePanel", "storage", "activeTab"],
        action: {}
    }
});
