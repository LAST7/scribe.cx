import { Extraction } from "@/types";
import { CRWConfig, CRWScrapeResult } from "@/types/crw";

function isCRWConfig(cfg: any): cfg is CRWConfig {
    if (!cfg || typeof cfg !== "object") return false;

    const candidate = cfg as Partial<CRWConfig>;

    return (
        typeof candidate.endpoint === "string" &&
        typeof candidate.apiKey === "string"
    );
}

async function readCRWConfig() {
    try {
        const cfg = (await storage.getItem("local:crw_config")) as CRWConfig;
        if (isCRWConfig(cfg)) {
            logger.debug("CRWConfig Read from storage.");
            return cfg;
        } else {
            logger.error("Incompatible or null crw config: ", cfg);
            return null;
        }
    } catch (error: unknown) {
        // TODO: handle error
        logger.error("Error when reading crw config from storage: ", error);
        return null;
    }
}

function CRWtoExtraction(
    crwResult: CRWScrapeResult,
    tabId?: number
): Extraction {
    // TEST: debug
    logger.debug(crwResult);

    if (!crwResult.success) {
        return {
            ok: false,
            reason: "CRW extraction failed. No usable content found on this page."
        };
    }

    return {
        // TODO: description? what about other unused property in Extraction?
        ok: true,
        tabId,
        title: crwResult.data.metadata.title,
        content: crwResult.data.markdown ?? "",
        parser: "crw"
    };
}

export async function CRWExtraction(
    url: string,
    tabId?: number
): Promise<Extraction> {
    const crwConfig: CRWConfig | null = await readCRWConfig();

    if (!crwConfig) {
        logger.error("CRW config is null.");
        return {
            ok: false,
            reason: "CRW config not found."
        };
    }

    const response = await fetch(crwConfig?.endpoint, {
        method: "POST",
        // TODO: read crw api key from storage
        headers: {
            Authorization: `Bearer ${crwConfig?.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url,
            formats: ["markdown"]
        })
    });

    if (!response.ok) {
        logger.error(
            "CRW processing failed with status code: ",
            response.status
        );
        return {
            ok: false,
            reason: await response.json()
        };
    }

    const data: CRWScrapeResult = await response.json();
    return CRWtoExtraction(data, tabId);
}
