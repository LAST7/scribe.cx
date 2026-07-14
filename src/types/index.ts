export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type MessageFeed = {
    id: UUID;
    role: "user" | "assistant" | "system";
    timestamp: string;
    content: string;
    error: boolean;
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

export type LLMConfig = {
    provider: string;
    endpoint: string;
    apiKey: string;
    modelName: string;
};

export type CallLLMParams = {
    conv: Conversation;
    userPrompt: string;
    llmMessageId: UUID;
};

// Content

export type Extraction = ExtractionSuccess | ExtractionFailure;

type ExtractionFailure = {
    ok: false;
    tabId?: number;
    reason: string;
};

type ExtractionSuccess = {
    ok: true;
    tabId?: number;
    title: string | undefined | null;
    content: string;
    byline?: string;
    siteName?: string;
    parser: "crw" | "readability" | "fallback";
};
