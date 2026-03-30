import OpenAI from "openai";

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { CallLLMParams } from "@/types";

import { logger } from "./logger";

export async function callLLM(params: CallLLMParams) {
    // TODO: params validation
    const client = new OpenAI({
        baseURL: params.endpoint,
        apiKey: params.apiKey,
        // Q: wtf is this? why is it needed?
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

    const completeContext: Array<ChatCompletionMessageParam> = [
        ...messages,
        { role: "user", content: params.userPrompt }
    ];

    logger.debug(
        `Calling LLM API: ${params.endpoint} with key: ${params.apiKey}`
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
