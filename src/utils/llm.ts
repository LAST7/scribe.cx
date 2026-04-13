import OpenAI from "openai";

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { CallLLMParams } from "@/types";

import { logger } from "@/utils/logger";
import { getLatestTabContent } from "@/stores/tabContent.svelte";

export async function callLLM(params: CallLLMParams) {
    // TODO: params validation
    const client = new OpenAI({
        baseURL: params.endpoint,
        apiKey: params.apiKey,
        dangerouslyAllowBrowser: true
    });

    // Construct complete context including former user & LLM messages

    // UGLY: Should maintain a simpler array of messages without unnecessary attributes?
    const messages: Array<ChatCompletionMessageParam> = params.chatHistory.map(
        (m) =>
            ({
                role: m.role,
                content: m.content
            }) as ChatCompletionMessageParam
    );

    const tabContentExtraction = await getLatestTabContent();
    const extractionSuccess = tabContentExtraction.ok;

    if (!extractionSuccess) {
        logger.error(
            "callLLM: Fail to extract tab content, chatting without context.\n",
            "reason: ",
            tabContentExtraction.reason
        );
    }

    const tabTitle = extractionSuccess
        ? tabContentExtraction.title
        : "Failed to extract tab title";
    const tabContent = extractionSuccess
        ? tabContentExtraction.content
        : "Failed to extract tab content: " + tabContentExtraction.reason;

    const completeContext: Array<ChatCompletionMessageParam> = [
        // TODO: make it optional
        {
            role: "developer",
            content: `Tab Content: \n${tabContent}`
        },
        ...messages,
        { role: "user", content: params.userPrompt }
    ];

    logger.debug(
        `Calling LLM API: ${params.endpoint}, tab title of ${extractionSuccess ? tabTitle : "(null)"}`
    );

    // LLM API integration
    try {
        const stream = await client.chat.completions.create({
            model: params.modelName,
            messages: completeContext,
            stream: true
        });

        // update message with LLM stream response
        for await (const chunk of stream) {
            const chunkContent = chunk.choices[0]?.delta?.content || "";
            if (chunkContent) params.callback.onStream(chunkContent);
        }

        params.callback.onDone();
    } catch (error) {
        params.callback.onError(String(error));
        throw error;
    }
}
