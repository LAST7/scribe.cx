import { storage } from "wxt/utils/storage";

import { LLMConfigStorage } from "@/types";

export const LLMConfig = storage.defineItem<LLMConfigStorage, {}>(
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
