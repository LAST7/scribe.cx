export type MessageFeed = {
    id: string;
    role: "user" | "assistant" | "system";
    timestamp: string;
    content: string;
};

export type LLMResponseState = {
    messageId: string;
    phase: "idle" | "pending" | "streaming" | "error";
    error: string;
};

export type LLMCallback = {
    onStream: (chunk: string) => void;
    onDone: () => void;
    onError: (error: string) => void;
};

// TODO: conversation abstraction
export type ConversationAbstract = {
    sessionId: string;
    title: string;
};
