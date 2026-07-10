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

type ExtractionFailure = {
    ok: false;
    reason: string;
};

type ExtractionSuccess = {
    ok: true;
    title: string | undefined | null;
    content: string;
    byline?: string;
    siteName?: string;
    // url: string;
    parser: "crw" | "readability" | "fallback";
};

// CRW

type CRWLLMUsage = {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    model: string;
    provider: string;
};

type CRWChunk = {
    content: string;
    score: number;
    index: number;
};

type CRWMetaData = {
    title: string;
    description: string;
    sourceURL: string;
    statusCode?: number;
    elapseMs: number;
};

type CRWData = {
    markdown: string | null;
    html?: string | null;
    links?: Array<string>;
    json?: any;
    summary?: string | null;
    llmUsage?: CRWLLMUsage;
    chunks?: Array<CRWChunk>;
    warnings?: Array<string>;
    warning?: string;
    metadata: CRWMetaData;
};

export type CRWScrapeResult = {
    success: boolean;
    data: CRWData;
};
