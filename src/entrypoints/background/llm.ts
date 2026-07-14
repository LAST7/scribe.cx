import { LLMConfig, MessageFeed, UUID } from "@/types";
import { ChatPortMsgToBG, ChatPortMsgToFT } from "@/types/portmessage";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

import { readLLMConfig } from "./llmconfig";
import { getLatestTabContent } from "@/stores/tabContent.svelte";

/**
 * Type guard for chat messages. Verifies that payload is of type `ChatMsg`
 */
function isChatPortMsg(msg: unknown): msg is ChatPortMsgToBG {
    if (!msg || typeof msg !== "object") return false;

    const candidate = msg as Partial<ChatPortMsgToBG>;

    switch (candidate.type) {
        case "CHAT_SUBMIT":
            return (
                typeof candidate.messageId === "string" &&
                typeof candidate.userPrompt === "string" &&
                Array.isArray(candidate.chatHistory)
            );
        case "CHAT_CANCEL":
            return typeof candidate.messageId === "string";

        default:
            return false;
    }
}

async function callLLM(
    p: browser.runtime.Port,
    messageId: UUID,
    userPrompt: string,
    chatHistory: Array<MessageFeed>
) {
    const llmConfig: LLMConfig | null = await readLLMConfig();

    if (!llmConfig) {
        const errorMsg = "llmConfig is null.";
        logger.error(errorMsg);
        const msg: ChatPortMsgToFT = {
            type: "CHAT_ERROR",
            messageId,
            error: errorMsg
        };
        p.postMessage(msg);
        return;
    }

    // TODO: cached page content
    const tabId = (
        await browser.tabs.query({ active: true, currentWindow: true })
    )[0]?.id;
    const tabContent = await getLatestTabContent(tabId);

    // UGLY: Should maintain a simpler array of messages without unnecessary attributes?
    const messages: Array<ChatCompletionMessageParam> = chatHistory.map(
        (m) => ({
            role: m.role,
            content: m.content
        })
    );

    const completeContext: Array<ChatCompletionMessageParam> = [
        // TODO: make this optional
        {
            // role: "developer",
            // QUESTION: What should this role be? It seems okay for openai to accetpt 'developer' while not for deepseek
            role: "system",
            content: `Tab Content: \n${tabContent?.ok ? tabContent.content : "Tab extraction failed, possible reason: " + tabContent?.reason}`
        },
        ...messages,
        { role: "user", content: userPrompt }
    ];

    logger.debug(
        `Calling LLM API ${llmConfig?.endpoint}(${llmConfig.provider}), tab title of ${tabContent?.ok ? tabContent.title : "Tab extraction failed."}`
    );

    try {
        // FIXME: This will fail in Firefox background environment.
        // TODO: Self implement LLM provider
        const client = new OpenAI({
            baseURL: llmConfig?.endpoint,
            apiKey: llmConfig?.apiKey
        });

        const stream = await client.chat.completions.create({
            model: llmConfig.modelName,
            messages: completeContext,
            stream: true
        });

        const startMsg: ChatPortMsgToFT = {
            type: "CHAT_STARTED",
            messageId
        };
        p.postMessage(startMsg);

        for await (const chunk of stream) {
            const chunkContent = chunk.choices[0]?.delta?.content || "";
            if (chunkContent) {
                const chunkMsg: ChatPortMsgToFT = {
                    type: "CHAT_CHUNK",
                    messageId,
                    chunk: chunkContent
                };
                p.postMessage(chunkMsg);
            }
        }
        const doneMsg: ChatPortMsgToFT = {
            type: "CHAT_DONE",
            messageId
        };
        p.postMessage(doneMsg);
        // TODO: store conversation when done
    } catch (error: unknown) {
        const msg: ChatPortMsgToFT = {
            type: "CHAT_ERROR",
            messageId,
            error: String(error)
        };
        p.postMessage(msg);
        // TODO: handle error in frontend
        logger.error("Error when streaming LLM response: ", error);
    }
}

export function setBGChatPortListener(p: browser.runtime.Port) {
    p.onMessage.addListener((msg: unknown) => {
        if (!isChatPortMsg(msg)) {
            logger.error("Invalid chat port message: ", msg);
            return;
        }

        // TEST: debug
        logger.debug(
            `Port(${p.name}) message from Client to Background recieved: ${(msg as ChatPortMsgToBG).type}`
        );

        switch (msg.type) {
            case "CHAT_SUBMIT":
                callLLM(p, msg.messageId, msg.userPrompt, msg.chatHistory);
                break;
            case "CHAT_CANCEL":
                // TODO: cancel llm streaming
                break;
            default:
                logger.error(`Unsupported message type: ${msg}`);
                break;
        }
    });
}
