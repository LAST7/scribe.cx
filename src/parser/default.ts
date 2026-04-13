import { Extraction } from "@/types";
import { Readability } from "@mozilla/readability";

export function normalizeText(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
export function isGoodText(text: string): boolean {
    const normalized = normalizeText(text);
    return normalized.length >= 200;
}
export function removeNoise(root: ParentNode) {
    const selectors = [
        "script",
        "style",
        "noscript",
        "svg",
        "canvas",
        "iframe",
        "footer",
        "nav",
        "aside",
        "form",
        "button",
        "dialog",
        "[aria-hidden='true']",
        "[hidden]"
    ];
    root.querySelectorAll(selectors.join(",")).forEach((el) => el.remove());
}

export function extractFallbackText(
    doc: Document
): { title: string; text: string } | null {
    const clone = doc.cloneNode(true) as Document;
    removeNoise(clone);
    const containerSelectors = [
        "article",
        "[role='main']",
        "main",
        ".article-content",
        ".post-content",
        ".entry-content",
        ".markdown-body",
        ".content",
        "body"
    ];
    let container: Element | null = null;
    for (const selector of containerSelectors) {
        const el = clone.querySelector(selector);
        if (
            el &&
            el.textContent &&
            normalizeText(el.textContent).length >= 200
        ) {
            container = el;
            break;
        }
    }
    if (!container) {
        return null;
    }
    const text = normalizeText(container.textContent || "");
    if (!isGoodText(text)) {
        return null;
    }
    const title = normalizeText(clone.title || document.title || "");
    return {
        title,
        text
    };
}

export function tryReadabilityExtraction(doc: Document): Extraction {
    // TODO: add an option
    const domClone = doc.cloneNode(true) as Document;
    const article: any = new Readability(domClone).parse();

    if (!article)
        return {
            ok: false,
            reason: "Readability parsing returns null or undefined."
        };

    const text = normalizeText(article?.textContent || "");

    if (!isGoodText(text))
        return {
            ok: false,
            reason: "Bad text content in extraction result."
        };

    return {
        ok: true,
        title: article.title,
        text,
        content: article.content,
        byline: article.byline,
        siteName: article.siteName,
        parser: "readability"
    };
}

export function tryFallbackExtraction(doc: Document): Extraction {
    const fallback = extractFallbackText(doc);
    if (!fallback)
        return {
            ok: false,
            reason: "Fallback parser failed."
        };

    return {
        ok: true,
        title: fallback.title,
        text: fallback.text,
        content: fallback.text,
        parser: "fallback"
    };
}
