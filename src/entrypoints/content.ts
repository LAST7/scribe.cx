import { Extraction } from "@/types";
import { logger } from "@/utils/logger";
import { isProbablyReaderable, Readability } from "@mozilla/readability";

async function pageExtraction(): Promise<Extraction | null> {
    // TODO: add an option: "force readability"
    if (isProbablyReaderable(document)) {
        const domClone = document.cloneNode(true) as Document;
        const article: any = new Readability(domClone).parse();

        if (!article) {
            logger.error("Readability parsing failed.");
            return { ok: false, reason: "Readability parsing failed." };
        }

        logger.debug("Page content extracted: ", article?.title);

        return {
            ok: true,
            title: article.title,
            textContent: article.textContent,
            byline: article.byline,
            siteName: article.siteName,
            url: location.href
        };
    } else {
        logger.info(
            "Scribe.cx: web page is probably not readerable, disable readability parsing."
        );
        return { ok: false, reason: "not readable" };
    }
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
