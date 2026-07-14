// CRW

export type CRWConfig = {
    endpoint: string;
    apiKey: string;
}

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
