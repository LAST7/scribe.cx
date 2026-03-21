const getContext = (): string => {
    if (typeof window === "undefined") return "BG"; // Background Service Worker
    if (location.protocol.includes("extension")) {
        const path = location.pathname.replace("/", "").replace(".html", "");
        return path ? path.toUpperCase() : "PAGE"; // i.e. SIDEPANEL, OPTIONS
    }
    return "CS"; // Content Script
};

const isDev = import.meta.env.DEV;
const context = getContext();

const prefix = `%c[${context}]`;
const style =
    "color: white; background: #8b5cf6; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-right: 4px;";

export const logger = {
    // INFO: requires console log level 'Verbose'
    debug: (...args: any[]) => {
        if (isDev) console.debug(prefix, style, ...args);
    },
    info: (...args: any[]) => {
        if (isDev) console.info(prefix, style, ...args);
    },
    warn: (...args: any[]) => {
        console.warn(prefix, style, ...args);
    },
    error: (...args: any[]) => {
        console.error(prefix, style, ...args);
    }
};
