import { CRWConfigStorage } from "@/storage/crw";
import { LLMConfigStorage } from "@/storage/llm";

type MockLLMConfig = {
    PROVIDER: string;
    ENDPOINT: string;
    APIKEY: string;
    MODEL: string;
};

type MockCRWConfig = {
    ENDPOINT: string;
    APIKEY: string;
};

function isMockLLMConfig(llmConfig: unknown): llmConfig is MockLLMConfig {
    if (!llmConfig || typeof llmConfig !== "object") return false;

    const candidate: Partial<MockLLMConfig> = llmConfig;

    return (
        typeof candidate.PROVIDER === "string" &&
        typeof candidate.ENDPOINT === "string" &&
        typeof candidate.APIKEY === "string" &&
        typeof candidate.MODEL === "string"
    );
}

function isMockCRWConfig(crwConfig: unknown): crwConfig is MockCRWConfig {
    if (!crwConfig || typeof crwConfig !== "object") return false;

    const candidate: Partial<MockCRWConfig> = crwConfig;

    return (
        typeof candidate.ENDPOINT === "string" &&
        typeof candidate.APIKEY === "string"
    );
}

export function initLLM() {
    browser.runtime.onInstalled.addListener(async (details) => {
        if (details.reason === "install" && import.meta.env.DEV) {
            logger.debug("Dev mode: Initializing LLM related config...");

            const llmConfig: any = {
                PROVIDER: import.meta.env.WXT_PROVIDER,
                ENDPOINT: import.meta.env.WXT_ENDPOINT,
                APIKEY: import.meta.env.WXT_APIKEY,
                MODEL: import.meta.env.WXT_MODEL
            };
            if (!isMockLLMConfig(llmConfig)) {
                logger.error(
                    "Environment variables read from .env does not match desired pattern. LLM config not seeded."
                );
                logger.error("Config read from .env: ", llmConfig);
                return;
            }

            await LLMConfigStorage.setValue({
                provider: llmConfig.PROVIDER,
                endpoint: llmConfig.ENDPOINT,
                apiKey: llmConfig.APIKEY,
                modelName: llmConfig.MODEL
            });

            logger.debug("LLM endpoint & key seeded.");

            logger.debug("Dev mode: Initializing CRW config...");

            const crwConfig: any = {
                ENDPOINT: import.meta.env.WXT_CRW_ENDPOINT,
                APIKEY: import.meta.env.WXT_CRW_KEY
            };
            if (!isMockCRWConfig(crwConfig)) {
                logger.error(
                    "Environment variables read from .env does not match desired pattern. CRW config not seeded."
                );
                logger.error("Config read from .env: ", crwConfig);
                return;
            }

            await CRWConfigStorage.setValue({
                endpoint: crwConfig.ENDPOINT,
                apiKey: crwConfig.APIKEY
            });
        }
    });
}
