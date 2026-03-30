import type { Conversation, LLMConfig, LLMResponseState, UUID } from "@/types";

import {
    storeConversation,
    storeNewConversation
} from "@/storage/conversation";
import { createMessage } from "@/utils";
import { callLLM } from "@/utils/llm";

import { logger } from "@/utils/logger";

let conversation: Conversation = $state({
    sessionId: null,
    messages: []
});
let llmResponse: LLMResponseState = $state({
    phase: "idle",
    messageId: null,
    error: ""
});

/**
 * @param messageId the target message feed reserved for LLM response
 * @param chunk new arrived chunk ready for streaming
 *
 * @description update message with id `messageId` in `messageFeed` by adding `chunk` to its content
 */
function streamMessage(messageId: UUID, chunk: string) {
    const index = conversation?.messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
        logger.error("target messageId does not exist: ", messageId);
        return;
    }

    llmResponse.phase = "streaming";
    // NOTE: requires svelte 5 deep state
    conversation.messages[index].content += chunk;
}

function ensureConversation(): Conversation {
    if (!conversation.sessionId) {
        const newSessionId: UUID = crypto.randomUUID();
        storeNewConversation(newSessionId);
        conversation = {
            sessionId: newSessionId,
            messages: []
        };
    }

    return conversation;
}

export function getConvState() {
    return {
        get llmResponse() {
            return llmResponse;
        },
        get conversation() {
            return conversation;
        }
    };
}

/**
 * Submits a user prompt and manages the LLM streaming response lifecycle.
 *
 * @param userPrompt - The user's input text to send to the LLM.
 * @param llmConfig - LLM config including provider, endpoint, api key and model name
 */
export async function submitPrompt(userPrompt: string, llmConfig: LLMConfig) {
    if (llmResponse.phase !== "idle") {
        logger.error("Cannot submit while LLM is not idle.");
        return;
    }

    if (!(llmConfig.endpoint && llmConfig.apiKey && llmConfig.modelName)) {
        llmResponse.phase = "error";
        llmResponse.error = `Incomplete LLM config: ${llmConfig}`;

        logger.error("Incomplete LLM config: ", llmConfig);
        return;
    }

    const conv = ensureConversation();
    const userMessageId: UUID = crypto.randomUUID();
    const llmMessageId: UUID = crypto.randomUUID();

    llmResponse.phase = "pending";
    llmResponse.messageId = llmMessageId;

    conv.messages = [
        ...conv.messages,
        createMessage(userMessageId, "user", userPrompt),
        createMessage(llmMessageId, "assistant", "")
    ];

    try {
        await callLLM({
            ...llmConfig,
            chatHistory: conversation.messages,
            userPrompt,
            callback: {
                onStream: (chunk: string) => {
                    streamMessage(llmMessageId, chunk);
                },
                onDone: () => {
                    storeConversation(conv);
                    llmResponse.phase = "idle";
                    llmResponse.messageId = null;
                    llmResponse.error = "";
                },
                onError: (error: string) => {
                    llmResponse.phase = "error";
                    llmResponse.error = error;
                    // TODO: render error message
                    // TODO: error handling, how do we restore from error state?
                    // Q: where to trigger the render?
                }
            }
        });
    } catch (err: unknown) {
        // QUESTION: is it required when inner function already has some kind of try-catch mechanism?
        logger.error(err);
        llmResponse.phase = "error";
        llmResponse.error = String(err);
    }
}
