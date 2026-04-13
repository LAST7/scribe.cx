import { isProbablyReaderable } from "@mozilla/readability";

import { Extraction } from "@/types";

import {
    tryReadabilityExtraction,
    tryFallbackExtraction
} from "@/parser/default";
import { logger } from "@/utils/logger";

export async function pageExtraction(): Promise<Extraction> {
    const readerable = isProbablyReaderable(document);

    if (!readerable)
        logger.info(
            "Scribe.cx: page is probably not readerable, but readability will still be attempted."
        );

    const readabilityResult: Extraction = tryReadabilityExtraction(document);
    if (readabilityResult.ok) {
        logger.debug(
            `Extraction success via Readability:
title: ${readabilityResult.title}
length: ${readabilityResult.text.length}`
        );

        return readabilityResult;
    }

    logger.warn(
        "Readability failed or content quality was poor. Fallback will be used."
    );

    const fallbackResult: Extraction = tryFallbackExtraction(document);
    if (fallbackResult.ok) {
        logger.debug(
            `Extraction success via fallback:
title: ${fallbackResult.title}
length: ${fallbackResult.text.length}`
        );

        return fallbackResult;
    }

    logger.error("Page extraction failed: no usable content found.");
    return {
        ok: false,
        reason: "No usable content found on this page."
    };
}

export default defineContentScript({
    matches: ["http://*/*", "https://*/*"],
    runAt: "document_idle",
    main(_ctx) {
        logger.info("Scribe.cx: Hello Content.");
        browser.runtime.onMessage.addListener(
            (msg): Promise<Extraction | null> | undefined => {
                logger.info("Scribe.cx: Hello Extraction.");

                switch (msg?.type) {
                    case "EXTRACT_PAGE_CONTENT":
                        return pageExtraction();

                    default:
                        return;
                }
            }
        );
    }
});
