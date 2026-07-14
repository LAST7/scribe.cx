import type { Conversation, LLMResponseState, UUID } from "@/types";
import { CHAT_PORT_NAME, ChatPortMsgToFT } from "@/types/portmessage";

import { createMessage } from "@/utils";
import { sendChatRequest } from "@/services/chatClient";

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
    let index: number | null = null;
    if (conv.messages.at(-1)?.id === messageId) {
        index = conv.messages.length - 1;
    } else {
        index = conv?.messages.findIndex((m) => m.id === messageId);
    }

    if (!index || index === -1) {
        // TODO: handle error
        logger.error("target messageId does not exist: ", messageId);
        return;
    }

    // NOTE: requires svelte 5 deep state
    conv.messages[index].content += chunk;
}

export function handleChatPortMsg(msg: ChatPortMsgToFT) {
    switch (msg.type) {
        case "CHAT_STARTED":
            llmResponse.phase = "streaming";
            logger.debug("Streaming starts.");
            break;
        case "CHAT_CHUNK":
            streamMessage(msg.messageId, msg.chunk);
            break;

        case "CHAT_DONE":
            llmResponse.phase = "idle";
            llmResponse.messageId = null;
            logger.debug("Streaming ends.");
            break;
        case "CHAT_ERROR":
            llmResponse.phase = "error";
            llmResponse.error = msg.error;
            const targetMessage = conv.messages.find(
                (m) => m.id === llmResponse.messageId
            );
            if (targetMessage) {
                targetMessage.error = true;
                targetMessage.content = msg.error;
            }
            logger.debug("Error occurs when streaming: ", msg.error);
            break;

        default:
            logger.error(
                `Unsupported port(${CHAT_PORT_NAME}) message type: ${msg}`
            );
            break;
    }
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
 */
export async function submitPrompt(
    chatPort: browser.runtime.Port,
    userPrompt: string
) {
    if (llmResponse.phase !== "idle") {
        // TODO: inform user?
        logger.error("Cannot submit while LLM is not idle.");
        return;
    }

    const userMessageId: UUID = crypto.randomUUID();
    const llmMessageId: UUID = crypto.randomUUID();

    llmResponse.phase = "pending";
    llmResponse.messageId = llmMessageId;

    conv.messages = [
        ...conv.messages,
        createMessage(userMessageId, "user", userPrompt),
        createMessage(llmMessageId, "assistant", "")
    ];

    const convSnapshot = $state.snapshot(conv);

    try {
        sendChatRequest(chatPort, {
            conv: convSnapshot,
            userPrompt,
            llmMessageId
        });
    } catch (error: unknown) {
        // NOTE: errors caught here are related to port message
        logger.error(error);
        llmResponse.phase = "error";
        llmResponse.error = String(error);
    }
}
