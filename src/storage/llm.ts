import { storage } from "wxt/utils/storage";

import { LLMConfig } from "@/types";

export const LLMConfigStorage = storage.defineItem<LLMConfig, {}>(
    "local:llm_config",
    {
        fallback: {
            provider: "",
            endpoint: "",
            apiKey: "",
            modelName: ""
        }
    }
);
