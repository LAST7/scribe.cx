import { logger } from "@/utils/logger";

import { openSidePanelAsDefault } from "./sidepanel";
import { registerPortMsgListeners } from "./port";

export default defineBackground(() => {
    logger.info(`Hello ${import.meta.env.BROWSER}.`);
    logger.info(`Manifest Version: ${import.meta.env.MANIFEST_VERSION}`);
    logger.debug(
        "Current env: ",
        import.meta.env.DEV ? "development" : "production"
    );

    // Configure the extension icon to open the side panel as default behavior
    openSidePanelAsDefault();

    // TEST: init mock data
    if (import.meta.env.DEV)
        import("@/mock/llm").then(({ initLLM }) => {
            initLLM();
        });

    // Set port message listener
    registerPortMsgListeners();
});
