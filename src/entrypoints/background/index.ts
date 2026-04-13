import { logger } from "@/utils/logger";
import { openSidePanelAsDefault } from "./sidepanel";

export default defineBackground(() => {
    logger.info(`Hello ${import.meta.env.BROWSER}.`);
    logger.info(`Manifest Version: ${import.meta.env.MANIFEST_VERSION}`);
    logger.debug(
        "Current env: ",
        import.meta.env.DEV ? "development" : "production"
    );

    // Configure the extension icon to open the side panel as default behavior
    openSidePanelAsDefault();
});
