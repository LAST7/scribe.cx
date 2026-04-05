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

export type LLMCallback = {
    onStream: (chunk: string) => void;
    onDone: () => void;
    onError: (error: string) => void;
};

export type LLMConfig = {
    provider: string;
    endpoint: string;
    apiKey: string;
    modelName: string;
};

export type CallLLMParams = {
    endpoint: string;
    apiKey: string;
    modelName: string;
    chatHistory: Array<MessageFeed>;
    userPrompt: string;
    callback: LLMCallback;
};

// Content

export type Extraction = ExtractionSuccess | ExtractionFailure;

type ExtractionSuccess = {
    ok: false;
    reason: string;
};

type ExtractionFailure = {
    ok: true;
    title: string | undefined | null;
    textContent: string | undefined | null;
    byline: string | undefined | null;
    siteName: string | undefined | null;
    url: string;
};
