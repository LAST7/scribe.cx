import { describe, expect, it } from "vitest";

import { callLLM } from "@/utils/llm";

describe("callLLM", () => {
    it("streams mock LLM chunks and completes", async () => {
        const chunks: Array<string> = [];
        let done = false;

        await callLLM({
            endpoint: "https://api.openai.com/v1",
            apiKey: "test-key",
            modelName: "gpt-4o-mini",
            chatHistory: [],
            userPrompt: "Summarize this website",
            callback: {
                onStream: (chunk) => chunks.push(chunk),
                onDone: () => {
                    done = true;
                },
                onError: () => {
                    throw new Error("unexpected error callback");
                }
            }
        });

        expect(done).toBe(true);
        expect(chunks.join("")).toBe(
            "Mock summary: concise result from the page."
        );
        expect(chunks.length).toBeGreaterThan(1);
    });
});
