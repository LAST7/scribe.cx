import { storage } from "#imports";
import { logger } from "./logger";

import { ConversationAbstract, MessageFeed } from "@/types";

export const LLMProviderEndpoint = storage.defineItem("local:llm_endpoint", {
    fallback: "https://yunwu.ai/v1"
});

export const LLMKeyStorage: WxtStorageItem<string, {}> = storage.defineItem(
    "local:llm_api_key",
    {
        fallback: ""
    }
);

export const CurrentConversationStorage = storage.defineItem<
    Array<MessageFeed>
>("local:cur_conversation", {
    fallback: []
});

export const ConversationListStorage = storage.defineItem<
    Array<ConversationAbstract>
>("local:conversation_list", {
    fallback: []
});

// TODO: history conversation
