import { describe, expect, it, vi } from "vitest";

describe("conversation store", () => {
    it("submits prompt and stores streamed assistant response", async () => {
        vi.resetModules();

        const { submitPrompt, getConvState } =
            await import("@/stores/conversation.svelte");
        const { storage } = await import("wxt/utils/storage");

        await submitPrompt("Summarize this website", {
            provider: "YUNWU",
            endpoint: "https://api.openai.com/v1",
            apiKey: "test-key",
            modelName: "gpt-4o-mini"
        });

        const state = getConvState();

        expect(state.llmResponse.phase).toBe("idle");
        expect(state.llmResponse.error).toBe("");
        expect(state.conversation.sessionId).not.toBeNull();
        expect(state.conversation.messages).toHaveLength(2);
        expect(state.conversation.messages[0].role).toBe("user");
        expect(state.conversation.messages[0].content).toBe(
            "Summarize this website"
        );
        expect(state.conversation.messages[1].role).toBe("assistant");
        expect(state.conversation.messages[1].content).toBe(
            "Mock summary: concise result from the page."
        );

        const sessionId = state.conversation.sessionId as string;
        const storedConversation = await storage.getItem(
            `local:conversation:${sessionId}`
        );
        const conversationList = await storage.getItem(
            "local:conversation_list"
        );

        expect(storedConversation).toHaveLength(2);
        expect(conversationList).toHaveLength(1);
    });

    it("rejects incomplete llm config", async () => {
        vi.resetModules();

        const { submitPrompt, getConvState } =
            await import("@/stores/conversation.svelte");

        await submitPrompt("Hello", {
            provider: "",
            endpoint: "",
            apiKey: "",
            modelName: ""
        });

        const state = getConvState();
        expect(state.llmResponse.phase).toBe("error");
        expect(state.llmResponse.error).toContain("Incomplete LLM config");
    });
});
