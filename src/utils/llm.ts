import OpenAI from "openai";

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { MessageFeed } from "@/types";
import {
    CurrentConversationStorage,
    LLMKeyStorage,
    LLMProviderEndpoint
} from "@/utils/storage";
import { logger } from "./logger";

export async function callLLM(
    userPrompt: string,
    streamMessage: (chunk: string) => void
) {
    // TODO: should validate data
    // Q: should these data be passed in as parameters rather than getting them from WXT-Storage?
    const apiKey: string = await LLMKeyStorage.getValue();
    const chatHistory: Array<MessageFeed> =
        await CurrentConversationStorage.getValue();
    const endPoint: string = await LLMProviderEndpoint.getValue();

    const client = new OpenAI({
        baseURL: endPoint,
        apiKey,
        // Q: wtf is this? why is it needed?
        dangerouslyAllowBrowser: true
    });

    // Construct complete context including former user & LLM messages

    // SHIT: This is shit.
    // Should maintain a simpler array of messages without unnecessary attributes.
    const messages: Array<ChatCompletionMessageParam> = chatHistory.map(
        (m) =>
            ({
                role: m.role,
                content: m.content
            }) as ChatCompletionMessageParam
    );

    const completeContext: Array<ChatCompletionMessageParam> = [
        ...messages,
        { role: "user", content: userPrompt }
    ];

    logger.debug(`Calling LLM API: ${endPoint} with key: ${apiKey}`);

    // LLM API integration
    const stream = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: completeContext,
        stream: true
    });

    // update message with LLM stream response
    for await (const chunk of stream) {
        const chunkContent = chunk.choices[0]?.delta?.content || "";
        if (chunkContent) streamMessage(chunkContent);
    }
}
