import { storage } from "#imports";

export const themeStorage = storage.defineItem("local:theme", {
    fallback: "auto"
});
