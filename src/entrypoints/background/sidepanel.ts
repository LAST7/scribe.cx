import { Tabs } from "webextension-polyfill";
import { logger } from "@/utils/logger";

/**
 * Defines the contract for side panel operations across different browsers.
 * This abstraction allows the rest of the extension to trigger UI components
 * without platform-specific branching.
 */
export interface SidePanelManager {
    /**
     * Toggles or opens the side panel depending on the browser's capabilities.
     * @param tab The current active tab.
     */
    open: (tab: Tabs.Tab) => Promise<void>;
}

/**
 * Chrome implementation using the MV3 sidePanel API.
 * @requires "sidePanel" permission in manifest.json
 */
async function ChromeOpenSidePanel(tab: Tabs.Tab) {
    // Ensure the API exists
    if (typeof chrome.sidePanel?.open !== "function") {
        logger.error(
            "[Chrome] sidePanel.open is not available. Check 'sidePanel' permission and ensure Chrome version >= 116"
        );
        return;
    }

    // Ensure a valid `windowId`
    const windowId = tab.windowId ?? chrome.windows.WINDOW_ID_CURRENT;

    try {
        await chrome.sidePanel.open({ windowId: windowId });
        logger.info("[Chrome] Side panel opened via action click.");
    } catch (error) {
        logger.error("[Chrome] Failed to open side panel: ", error);
    }
}

/**
 * Firefox implementation using the sidebarAction API.
 * @requires "sidebar_action" definition in manifest.json
 */
async function FirefoxOpenSidePanel(_tab: Tabs.Tab) {
    try {
        await browser.sidebarAction.open();
        logger.info("[Firefox] Side panel opened via action click.");
    } catch (error) {
        logger.error("[Firefox] Failed to open side panel: ", error);
    }
}

const panelImpl: Record<string, SidePanelManager> = {
    chrome: { open: ChromeOpenSidePanel },
    firefox: { open: FirefoxOpenSidePanel }
};

/**
 * A platform-aware manager instance.
 * WXT optimizes this at build-time, removing the unused platform implementation.
 */
export const sidePanelManager: SidePanelManager =
    panelImpl[import.meta.env.BROWSER] ?? panelImpl["chrome"];

/**
 * Configures the extension icon to open the side panel as default behavior.
 *
 * @description
 * This function registers a listener to the extension's action icon.
 * - **Chrome**: Triggers `chrome.sidePanel.open`. Requires `openPanelOnActionClick: false`.
 * - **Firefox**: Triggers `sidebarAction.open`.
 *
 * @architecture
 * Uses `browser.action` for MV3 and fallbacks to `browser.browserAction` for MV2 (Firefox).
 * The imperative approach is used here to allow potential pre-open side effects.
 */
export function openSidePanelAsDefault() {
    // TODO: When in need of multiple listener functions, define a main listener
    // function and call the others inside it to maintain order
    // QUESTION: async function registered as callback causing problem?
    if (import.meta.env.MANIFEST_VERSION === 3) {
        browser.action.onClicked.addListener(sidePanelManager.open);
    } else {
        browser.browserAction.onClicked.addListener(sidePanelManager.open);
    }

    // Chrome specific: Disable the default declarative behavior to ensure
    // the onClicked event is dispatched to our listener.
    if (
        import.meta.env.CHROME &&
        typeof chrome.sidePanel?.setPanelBehavior === "function"
    ) {
        chrome.sidePanel
            .setPanelBehavior({ openPanelOnActionClick: false })
            .catch((error) => {
                logger.error(
                    "[Chrome] Error resetting panel behavior: ",
                    error
                );
            });
    }
}
