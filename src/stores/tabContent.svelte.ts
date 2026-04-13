import { Extraction } from "@/types";

// TODO: make it an array of Extractions
let tabContent: Extraction | null = $state(null);

export async function getLatestTabContent(tabId?: number) {
    const curTabId = tabId
        ? tabId
        : (await browser.tabs.query({ active: true, currentWindow: true }))[0]
              ?.id;

    if (!curTabId) throw new Error("Invalid tabId");

    const content: Extraction = await browser.tabs.sendMessage(curTabId, {
        type: "EXTRACT_PAGE_CONTENT"
    });

    tabContent = content;
    return content;
}
