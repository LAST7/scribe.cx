import { storage } from "wxt/utils/storage";

import { Conversation, ConversationListItem, MessageFeed, UUID } from "@/types";

export const ConversationListStorage = storage.defineItem<
    Array<ConversationListItem>
>("local:conversation_list", {
    fallback: []
});

export function getConversationKey(sessionId: UUID): `local:${string}` {
    return `local:conversation:${sessionId}`;
}

export async function getConversation(
    sessionId: UUID
): Promise<Array<MessageFeed>> {
    return (
        (await storage.getItem<Array<MessageFeed>>(
            getConversationKey(sessionId)
        )) ?? []
    );
}

// TODO: generate title with LLM
function deriveConversationTitle(messages: Array<MessageFeed>): string {
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) {
        return "New Conversation";
    }

    return firstUserMessage.content.slice(0, 10) || "New Conversation";
}

export async function storeNewConversation(sessionId: UUID): Promise<void> {
    const abstracts = await ConversationListStorage.getValue();
    const now = Date.now();

    if (abstracts.some((a) => a.sessionId === sessionId)) {
        logger.error(
            `Conversation with session id ${sessionId} already exists!`
        );
        return;
    }

    const newAbstract: ConversationListItem = {
        sessionId,
        title: "New Conversation",
        updatedAt: now,
        pinned: false
    };

    const updatedList = [newAbstract, ...abstracts];

    await ConversationListStorage.setValue(updatedList);
    await storeConversation({ sessionId, messages: [] });
}

export async function storeConversation(conversation: Conversation) {
    if (!conversation.sessionId) {
        logger.error("Storing conversation with no sessionId.");
        return;
    }

    const key = getConversationKey(conversation.sessionId);

    await storage.setItem(key, conversation.messages);
}
