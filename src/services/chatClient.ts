import { logger } from "@/utils/logger";

import { CallLLMParams, Conversation, UUID } from "@/types";
import {
    CHAT_PORT_NAME,
    ChatPortMsgToFT,
    ChatPortMsgToBG
} from "@/types/portmessage";
import {
    storeConversation,
    storeNewConversation
} from "@/storage/conversation";
import { handleChatPortMsg } from "@/stores/conversation.svelte";

function isChatPortMsg(msg: unknown): msg is ChatPortMsgToFT {
    if (!msg || typeof msg !== "object") return false;

    const candidate = msg as Partial<ChatPortMsgToFT>;

    switch (candidate.type) {
        case "CHAT_STARTED":
        // NOTE: fall through
        case "CHAT_DONE":
            return typeof candidate.messageId === "string";

        case "CHAT_CHUNK":
            return typeof candidate.chunk === "string";

        case "CHAT_ERROR":
            return typeof candidate.error === "string";

        default:
            return false;
    }
}

export function setFGChatPortListener(p: browser.runtime.Port) {
    p.onMessage.addListener((msg: unknown) => {
        if (!isChatPortMsg(msg)) {
            logger.error("Invalid chat port message: ", msg);
            return;
        }

        handleChatPortMsg(msg);
    });
}

/**
 * Ensures the given conversation has a valid session ID.
 * If missing, creates a new session ID and stores a new conversation.
 */
function ensureConversation(conv: Conversation) {
    if (!conv.sessionId) {
        const newSessionId: UUID = crypto.randomUUID();
        storeNewConversation(newSessionId);
        conv.sessionId = newSessionId;
    } else {
        storeConversation(conv);
    }
}

export function sendChatRequest(
    chatPort: browser.runtime.Port,
    params: CallLLMParams
) {
    ensureConversation(params.conv);

    try {
        const message: ChatPortMsgToBG = {
            type: "CHAT_SUBMIT",
            messageId: params.llmMessageId,
            userPrompt: params.userPrompt,
            chatHistory: params.conv.messages
        };
        chatPort.postMessage(message);
    } catch (error: unknown) {
        // TODO: handle error
        logger.error(
            `Error when sending port(${CHAT_PORT_NAME}) message to backend: ${error}`
        );
    }
}
