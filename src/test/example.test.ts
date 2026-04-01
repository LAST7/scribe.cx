import { test, expect } from "vitest";

test("example test", async () => {
    const response = await fetch("https://blog.imlast.top");

    await expect(response.json()).resolves.toEqual({
        id: "last",
        content: "carnival"
    });
});
