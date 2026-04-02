import { it, expect, describe } from "vitest";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

describe("authentication", () => {
    it("should return 401 without bearer token", async () => {
        const response = await fetch(OPENAI_URL + "/auth");
        expect(response.status).toBe(401);

        const body = await response.json();
        expect(body.error.message).toBe(
            "Missing bearer authentication in header"
        );
    });
});
