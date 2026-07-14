import { CHAT_PORT_NAME } from "@/types/portmessage";
import { setBGChatPortListener } from "./llm";

/**
 * Background: Set Port message listener for messages from frontend
 */
export function registerPortMsgListeners() {
    browser.runtime.onConnect.addListener((p: browser.runtime.Port) => {
        switch (p.name) {
            case CHAT_PORT_NAME:
                setBGChatPortListener(p);
                // TEST: debug
                logger.debug("Port connected: ", CHAT_PORT_NAME);
                break;

            default:
                logger.error("Unsupported port connection name: ", p.name);
                break;
        }
    });

    // TEST: debug
    logger.debug("Port message listener set by background.");
}
