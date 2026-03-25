<script lang="ts">
    import { storage } from "wxt/utils/storage";

    import type { LLMResponseState, MessageFeed } from "@/types";

    import Header from "@/components/Header.svelte";
    import Chat from "@/components/Chat.svelte";
    import Prompt from "@/components/Prompt.svelte";

    import { createMessage } from "@/utils";
    import { logger } from "@/utils/logger";
    import { callLLM } from "@/utils/llm";

    // Messages
    let messageFeed: Array<MessageFeed> = $state([]);
    // LLM response status
    let LLMResponse: LLMResponseState = $state({
        phase: "idle",
        messageId: "",
        error: ""
    });

    // TODO: should monitor and respond to changes in `local:cur_conversation`
    // messageFeed is `null` at first initialization of mock data
    // Q: `unknown`? How to validate this? zod?
    // FIXME: could cause race condition when storage resolves after user submition
    storage.getItem("local:cur_conversation").then((val: unknown) => {
        messageFeed = val as Array<MessageFeed>;
    });

    /**
     * Submits a user prompt and manages the LLM streaming response lifecycle.
     *
     * @param userMessage - The user's input text to send to the LLM.
     * @returns A promise that resolves when the LLM request setup and streaming lifecycle completes.
     */
    async function onPromptSubmit(userMessage: string) {
        if (LLMResponse.phase !== "idle") return;

        if (userMessage === "") return;

        messageFeed = [
            ...messageFeed,
            createMessage(crypto.randomUUID(), "user", userMessage)
        ];

        LLMResponse = {
            phase: "pending",
            messageId: crypto.randomUUID(),
            error: ""
        };

        // UGLY: defining lambda function here is somewhat ugly
        try {
            await callLLM(userMessage, {
                onStream: (chunk: string) => {
                    streamMessage(LLMResponse.messageId, chunk);
                },
                onDone: () => {
                    LLMResponse.phase = "idle";
                    LLMResponse.messageId = "";
                    LLMResponse.error = "";
                },
                onError: (error: string) => {
                    LLMResponse.phase = "error";
                    LLMResponse.error = error;
                    // TODO: render error message
                    // TODO: error handling, how do we restore from error state?
                    // Q: where to trigger the render?
                }
            });
        } catch (err: unknown) {
            logger.error(err);
        }
    }

    /**
     * @param messageId the target message feed reserved for LLM response
     * @param chunk new arrived chunk ready for streaming
     *
     * @description update message with id `messageId` in `messageFeed` by adding `chunk` to its content
     */
    function streamMessage(messageId: string, chunk: string) {
        if (!messageId) {
            logger.error("No target message to stream");
            return;
        }

        const index = messageFeed.findIndex(
            (m: MessageFeed) => m.id === messageId
        );

        if (index === -1) {
            const newMessage = createMessage(messageId, "assistant", chunk);
            messageFeed = [...messageFeed, newMessage];
            LLMResponse.phase = "streaming";
            return;
        }

        messageFeed[index].content += chunk;
        // just in case
        messageFeed = [...messageFeed];
    }
</script>

<div class="flex flex-col h-screen justify-between bg-surface-100-950">
    <Header />
    <Chat
        {messageFeed}
        {LLMResponse}
        class="flex-1 overflow-y-auto overflow-x-hidden z-10 pb-40" />
    <Prompt
        {onPromptSubmit}
        {LLMResponse}
        class="absolute z-10 bottom-0 w-full bg-transparent pointer-events-none" />
</div>
