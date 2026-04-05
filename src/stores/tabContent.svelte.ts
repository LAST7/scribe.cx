import { Extraction } from "@/types";

let tabContent: Extraction | null = $state(null);

export function getTabContent() {
    return {
        get tabContent() {
            return tabContent;
        }
    };
}

export async function sendExtractionMsg() {
    const curTabId = (
        await browser.tabs.query({ active: true, currentWindow: true })
    )[0]?.id;

    if (!curTabId) {
        logger.error("Invalid tabId: ", curTabId);
        return;
    }

    tabContent = await browser.tabs.sendMessage(curTabId, {
        type: "EXTRACT_PAGE_CONTENT"
    });
}
