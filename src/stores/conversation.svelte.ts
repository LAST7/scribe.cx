import type { Conversation, LLMConfig, LLMResponseState, UUID } from "@/types";

import {
    storeConversation,
    storeNewConversation
} from "@/storage/conversation";
import { createMessage } from "@/utils";
import { callLLM } from "@/utils/llm";

import { logger } from "@/utils/logger";

let conv: Conversation = $state({
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
    const index = conv?.messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
        logger.error("target messageId does not exist: ", messageId);
        return;
    }

    llmResponse.phase = "streaming";
    // NOTE: requires svelte 5 deep state
    conv.messages[index].content += chunk;
}

function ensureConversation(): Conversation {
    if (!conv.sessionId) {
        const newSessionId: UUID = crypto.randomUUID();
        storeNewConversation(newSessionId);
        conv = {
            sessionId: newSessionId,
            messages: []
        };
    }

    return conv;
}

export function getConvState() {
    return {
        get llmResponse() {
            return llmResponse;
        },
        get conversation() {
            return conv;
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

    conv = ensureConversation();
    const userMessageId: UUID = crypto.randomUUID();
    const llmMessageId: UUID = crypto.randomUUID();

    llmResponse.phase = "pending";
    llmResponse.messageId = llmMessageId;

    conv.messages = [
        ...conv.messages,
        createMessage(userMessageId, "user", userPrompt)
    ];
    storeConversation(conv);

    conv.messages = [
        ...conv.messages,
        createMessage(llmMessageId, "assistant", "")
    ];

    try {
        await callLLM({
            ...llmConfig,
            chatHistory: conv.messages,
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
                    conv.messages.map((m) => {
                        if (m.id === llmResponse.messageId) {
                            m.error = true;
                            m.content = error;
                        }
                    });
                    // TODO: how do we restore from error state?
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
