import { LLMConfig } from "@/types";

function isLLMConfig(cfg: any): cfg is LLMConfig {
    if (!cfg || typeof cfg !== "object") return false;

    const candidate = cfg as Partial<LLMConfig>;

    return (
        typeof candidate.endpoint === "string" &&
        typeof candidate.apiKey === "string" &&
        typeof candidate.modelName === "string" &&
        typeof candidate.provider === "string"
    );
}

export async function readLLMConfig() {
    try {
        const cfg = (await storage.getItem("local:llm_config")) as LLMConfig;
        if (isLLMConfig(cfg)) {
            logger.debug("LLMConfig Read from storage.");
            return cfg;
        } else {
            logger.error("Incompatible or null llm config: ", cfg);
            return null;
        }
    } catch (error: unknown) {
        // TODO: handle error
        logger.error("Error when reading llm config from storage: ", error);
        return null;
    }
}

// TODO: listen to port and read config again after user change
