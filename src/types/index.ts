export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type MessageFeed = {
    id: string;
    role: "user" | "assistant" | "system";
    timestamp: string;
    content: string;
};

export type Conversation = {
    sessionId: UUID | null;
    messages: Array<MessageFeed>;
};

export type ConversationListItem = {
    sessionId: UUID;
    title: string;
    updatedAt: number;
    pinned?: boolean;
    manualOrder?: number;
};

export type ConversationList = Array<ConversationListItem>;

export type LLMResponseState = {
    messageId: UUID | null;
    phase: "idle" | "pending" | "streaming" | "error";
    error: string;
};

export type LLMCallback = {
    onStream: (chunk: string) => void;
    onDone: () => void;
    onError: (error: string) => void;
};

export type LLMConfigStorage = {
    provider: string;
    endpoint: string;
    apiKey: string;
    modelName: string;
};

export type CallLLMParams = {
    endpoint: string;
    apiKey: string;
    modelName: string;
    conversation: Conversation;
    userPrompt: string;
    callback: LLMCallback;
};
