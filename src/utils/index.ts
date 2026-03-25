import { MessageFeed, UUID } from "@/types";

export function getCurrentTimestamp(): string {
    return new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false
    });
}

export function createMessage(
    messageId: UUID,
    role: "user" | "assistant",
    content: string
): MessageFeed {
    return {
        id: messageId,
        role,
        timestamp: getCurrentTimestamp(),
        content
    };
}
