<script lang="ts">
    import { storage } from "wxt/utils/storage";

    import type {
        Conversation,
        LLMCallback,
        LLMConfigStorage,
        LLMResponseState,
        MessageFeed,
        UUID
    } from "@/types";

    import Header from "@/components/Header.svelte";
    import Chat from "@/components/Chat.svelte";
    import Prompt from "@/components/Prompt.svelte";

    import { createMessage } from "@/utils";
    import { logger } from "@/utils/logger";
    import { callLLM } from "@/utils/llm";
    import {
        storeConversation,
        storeNewConversation
    } from "@/storage/conversation";

    // Messages
    let curConversation: Conversation = $state({
        sessionId: null,
        messages: []
    });
    // LLM config
    let LLMConfig: LLMConfigStorage | null;
    // LLM response status
    let LLMResponse: LLMResponseState = $state({
        phase: "idle",
        messageId: null,
        error: ""
    });

    onMount(async () => {
        // TODO: should validate data read from storage
        // use valibot
        LLMConfig = (await storage.getItem(
            "local:llm_config"
        )) as LLMConfigStorage;
    });

    // REFACTOR: refactor callback logic
    const callback: LLMCallback = {
        onStream: (chunk: string) => {
            if (!LLMResponse.messageId) {
                logger.error("No target message to stream");
                return;
            }
            streamMessage(LLMResponse.messageId, chunk);
        },
        onDone: () => {
            // REFACTOR: refactor callback logic
            if (!curConversation) return;

            storeConversation(curConversation);
            LLMResponse.phase = "idle";
            LLMResponse.messageId = null;
            LLMResponse.error = "";
        },
        onError: (error: string) => {
            LLMResponse.phase = "error";
            LLMResponse.error = error;
            // TODO: render error message
            // TODO: error handling, how do we restore from error state?
            // Q: where to trigger the render?
        }
    };

    /**
     * Submits a user prompt and manages the LLM streaming response lifecycle.
     *
     * @param userPrompt - The user's input text to send to the LLM.
     */
    async function onPromptSubmit(userPrompt: string) {
        if (LLMResponse.phase !== "idle") {
            logger.error(
                "Can not submit prompt while LLM response status isnt 'idle'."
            );
            return;
        }

        if (!curConversation.sessionId) {
            const newSessionId: UUID = crypto.randomUUID();
            storeNewConversation(newSessionId);
            curConversation.sessionId = newSessionId;
        }

        curConversation.messages = [
            ...curConversation.messages,
            createMessage(crypto.randomUUID(), "user", userPrompt)
        ];

        // TODO: placeholder message

        LLMResponse = {
            phase: "pending",
            messageId: crypto.randomUUID(),
            error: ""
        };

        if (
            !LLMConfig ||
            !(LLMConfig.endpoint && LLMConfig.apiKey && LLMConfig.modelName)
        ) {
            logger.error("Incomplete LLM config: ", LLMConfig);
            return;
        }

        try {
            await callLLM({
                endpoint: LLMConfig.endpoint,
                apiKey: LLMConfig.apiKey,
                modelName: LLMConfig.modelName,
                conversation: curConversation,
                userPrompt,
                callback
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
    function streamMessage(messageId: UUID, chunk: string) {
        if (!curConversation.sessionId) {
            logger.error("Current conversation is null.");
            return;
        }

        const index = curConversation.messages.findIndex(
            (m: MessageFeed) => m.id === messageId
        );

        // REFACTOR: placeholder message
        if (index === -1) {
            const newMessage = createMessage(messageId, "assistant", chunk);
            curConversation.messages = [
                ...curConversation.messages,
                newMessage
            ];
            LLMResponse.phase = "streaming";
            return;
        }

        curConversation.messages[index].content += chunk;
    }
</script>

<div class="flex flex-col h-screen justify-between bg-surface-100-950">
    <Header />
    <Chat
        messages={curConversation.messages}
        {LLMResponse}
        class="flex-1 overflow-y-auto overflow-x-hidden z-10 pb-40" />
    <Prompt
        {onPromptSubmit}
        {LLMResponse}
        class="absolute z-10 bottom-0 w-full bg-transparent pointer-events-none" />
</div>
