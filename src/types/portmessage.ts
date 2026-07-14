import { MessageFeed, UUID } from ".";

export const CHAT_PORT_NAME = "scribe-chat";

// client to background

type Submit = {
    type: "CHAT_SUBMIT";
    messageId: UUID;
    userPrompt: string;
    chatHistory: Array<MessageFeed>;
};

type Cancel = {
    type: "CHAT_CANCEL";
    messageId: UUID;
};

export type ChatPortMsgToBG = Submit | Cancel;

// background to client

type Started = {
    type: "CHAT_STARTED";
    messageId: UUID;
};

type Chunk = {
    type: "CHAT_CHUNK";
    messageId: UUID;
    chunk: string;
};

type Done = {
    type: "CHAT_DONE";
    messageId: UUID;
};

type Error = {
    type: "CHAT_ERROR";
    messageId: UUID;
    error: string;
};

export type ChatPortMsgToFT = Started | Chunk | Done | Error;
