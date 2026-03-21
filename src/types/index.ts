export type MessageFeed = {
    id: string;
    role: "user" | "assistant" | "system";

    // TODO: should avatar be included inside `MessageFeed`?
    // avatar?: number;
    name?: string;
    timestamp: string;
    content: string;
    color?: string;
};

// TODO: conversation abstraction
export type ConversationAbstract = {
    sessionId: string;
    title: string;
};
