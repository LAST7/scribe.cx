import { CRWScrapeResult, Extraction } from "@/types";

function CRWtoExtraction(crwResult: CRWScrapeResult): Extraction {
    // TEST: log
    logger.debug(crwResult);

    if (!crwResult.success) {
        return {
            ok: false,
            reason: "CRW extraction failed. No usable content found on this page."
        };
    }

    return {
        // TODO: description? what about other unused property in Extraction?
        ok: true,
        title: crwResult.data.metadata.title,
        content: crwResult.data.markdown ?? "",
        parser: "crw"
    };
}

export async function CRWExtraction(url: string): Promise<Extraction> {
    // TODO: custom crw endpoint
    const response = await fetch("https://crw.imlast.top/v1/scrape", {
        method: "POST",
        // TODO: read crw api key from storage
        headers: {
            Authorization: `Bearer sk-GbIgzZMtFX9KTpg63jHRxe5EcjFnxqsSD6`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url,
            formats: ["markdown"]
        })
    });

    if (!response.ok) {
        logger.error(
            "CRW processing failed with status code: ",
            response.status
        );
        return {
            ok: false,
            reason: await response.json()
        };
    }

    const data: CRWScrapeResult = await response.json();
    return CRWtoExtraction(data);
}
