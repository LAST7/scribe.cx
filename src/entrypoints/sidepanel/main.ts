import { mount } from "svelte";
import App from "./App.svelte";
import "@/assets/app.css";

// TEST: init mock data
// TODO: add control flags
if (import.meta.env.DEV) {
    const { initLLM, initMockData } = await import("@/mock");
    initLLM();
    initMockData();
}

const app = mount(App, {
    target: document.getElementById("app")!
});

export default app;
